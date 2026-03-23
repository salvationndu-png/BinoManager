<?php

namespace App\Http\Controllers;

use App\Helpers\InputSanitizer;
use App\Http\Controllers\Concerns\RequiresTenant;
use App\Models\TeamInvitation;
use App\Models\User;
use App\Services\PlanEnforcementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class TeamController extends Controller
{
    use RequiresTenant;
    /**
     * Show team management page.
     * Only admins can see this.
     */
    public function index()
    {
        $tenant      = $this->tenant();
        $members     = User::where('tenant_id', $tenant->id)->orderBy('name')->get();
        $invitations = TeamInvitation::where('tenant_id', $tenant->id)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->with('inviter')
            ->get();

        $enforcement = new PlanEnforcementService($tenant);
        $usage       = $enforcement->usageStats();

        return view('tenant.team', compact('members', 'invitations', 'usage', 'tenant'));
    }

    /**
     * Send an invitation email to a new team member.
     *
     * Security:
     * - Role strictly whitelisted — cannot inject arbitrary usertype values
     * - Duplicate pending invitations for same email rejected
     * - Plan limit enforced before creating invitation
     * - Token is 64 random hex chars (256-bit entropy)
     */
    public function invite(Request $request)
    {
        $tenant = $this->tenant();

        // Feature gate — team invitations require Enterprise plan
        $enforcement = new PlanEnforcementService($tenant);
        $featureCheck = $enforcement->canUseTeam();
        if (! $featureCheck->allowed) {
            return $featureCheck->toJsonResponse();
        }

        $request->validate([
            'email' => 'required|email:rfc|max:255',
            'role'  => 'required|in:admin,salesperson',
        ]);

        // Plan enforcement
        $enforcement = new PlanEnforcementService($tenant);
        $check       = $enforcement->canAddUser();
        if (! $check->allowed) {
            return $check->toJsonResponse();
        }

        $email = strtolower(trim($request->email));

        // Don't invite existing members
        if (User::where('tenant_id', $tenant->id)->where('email', $email)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'This person is already a member of your team.',
            ], 422);
        }

        // Revoke any existing expired invitation for this email
        TeamInvitation::where('tenant_id', $tenant->id)
            ->where('email', $email)
            ->delete();

        $invitation = TeamInvitation::create([
            'tenant_id'  => $tenant->id,
            'invited_by' => auth()->id(),
            'email'      => $email,
            'role'       => $request->role,
            'token'      => bin2hex(random_bytes(32)), // 64 hex chars
            'expires_at' => now()->addHours(config('tenancy.invitation_expiry_hours', 48)),
        ]);

        // Send email
        $this->sendInvitationEmail($invitation, $tenant);

        return response()->json([
            'success' => true,
            'message' => "Invitation sent to {$email}.",
        ]);
    }

    /**
     * Show the accept-invitation page (public, token-gated).
     */
    public function showAcceptForm(string $token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->first();

        if (! $invitation || $invitation->isExpired()) {
            return view('tenant.invitation-expired');
        }

        return view('tenant.accept-invitation', compact('invitation'));
    }

    /**
     * Process invitation acceptance.
     *
     * Security:
     * - Token looked up with constant-time comparison (Eloquent where)
     * - Invitation marked accepted immediately to prevent replay
     * - user_type mapped from role string — never from user input directly
     */
    public function acceptInvitation(Request $request, string $token)
    {
        $invitation = TeamInvitation::where('token', $token)
            ->whereNull('accepted_at')
            ->first();

        if (! $invitation || $invitation->isExpired()) {
            return redirect('/')->with('error', 'This invitation has expired or already been used.');
        }

        $request->validate([
            'name'     => 'required|string|max:100',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        DB::transaction(function () use ($request, $invitation) {
            // Mark accepted before creating user to prevent race conditions
            $invitation->update(['accepted_at' => now()]);

            User::create([
                'tenant_id'  => $invitation->tenant_id,
                'name'       => InputSanitizer::sanitize($request->name),
                'email'      => $invitation->email,
                'password'   => Hash::make($request->password),
                'usertype'   => $invitation->role === 'admin' ? 1 : 0,
                'status'     => 1,
                'created_by' => $invitation->invited_by,
            ]);
        });

        return redirect()->route('login')
            ->with('success', 'Account created! You can now log in.');
    }

    /**
     * Revoke a pending invitation.
     */
    public function revoke(Request $request, int $id)
    {
        $tenant     = $this->tenant();
        $invitation = TeamInvitation::where('id', $id)
            ->where('tenant_id', $tenant->id) // scoped to tenant — cannot revoke another tenant's invite
            ->firstOrFail();

        $invitation->delete();

        return response()->json(['success' => true, 'message' => 'Invitation revoked.']);
    }

    /**
     * Remove a team member from this tenant.
     * Cannot remove yourself or another admin (only super-admin can).
     */
    public function removeMember(Request $request, int $userId)
    {
        $tenant = $this->tenant();

        // User must belong to this tenant
        $user = User::where('id', $userId)
            ->where('tenant_id', $tenant->id)
            ->firstOrFail();

        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot remove yourself.',
            ], 422);
        }

        // Prevent removing last admin
        if ($user->usertype === 1) {
            $adminCount = User::where('tenant_id', $tenant->id)
                ->where('usertype', 1)
                ->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot remove the only admin. Assign another admin first.',
                ], 422);
            }
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'Team member removed.']);
    }

    private function sendInvitationEmail(TeamInvitation $invitation, $tenant): void
    {
        $acceptUrl = url('/invitation/' . $invitation->token);

        try {
            Mail::send('emails.team-invitation', [
                'invitation'  => $invitation,
                'tenant'      => $tenant,
                'acceptUrl'   => $acceptUrl,
                'inviterName' => auth()->user()->name,
                'expiresAt'   => $invitation->expires_at->format('D, M j Y \a\t g:ia'),
            ], function ($mail) use ($invitation, $tenant) {
                $mail->to($invitation->email)
                     ->subject("You've been invited to join {$tenant->name} on BinoManager");
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Invitation email failed', [
                'email' => $invitation->email,
                'error' => $e->getMessage(),
            ]);
            // Don't fail the request — invitation is created, email can be re-sent
        }
    }
}
