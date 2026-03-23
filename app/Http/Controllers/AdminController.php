<?php

namespace App\Http\Controllers;

use App\Helpers\InputSanitizer;
use App\Http\Controllers\Concerns\RequiresTenant;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    use RequiresTenant;

    public function getUsers(Request $request)
    {
        // Validate filter inputs before they touch the query
        $request->validate([
            'search' => 'nullable|string|max:100',
            'role'   => 'nullable|in:0,1',
            'status' => 'nullable|in:0,1',
        ]);

        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        if ($request->filled('role')) {
            $query->where('usertype', (int) $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', (int) $request->status);
        }

        // Paginate — prevents bulk PII dump + protects against slow queries
        $users = $query->orderBy('created_at', 'desc')
            ->paginate(50)
            ->through(fn($user) => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'usertype'   => $user->usertype,
                'status'     => $user->status,
                'created_at' => $user->created_at->format('Y-m-d'),
            ]);

        return response()->json(['success' => true, 'users' => $users]);
    }

    public function getUserStats()
    {
        return response()->json([
            'success' => true,
            'stats'   => [
                'total'       => User::count(),
                'activeSales' => User::salesUsers()->active()->count(),
                'inactive'    => User::where('status', 0)->count(),
                'thisMonth'   => User::whereMonth('created_at', now()->month)->count(),
            ],
        ]);
    }

    public function createUser(Request $request)
    {
        try {
            $tenant = $this->tenant();

            $enforcement = new \App\Services\PlanEnforcementService($tenant);
            $check = $enforcement->canAddUser();
            if (! $check->allowed) {
                return $check->toJsonResponse();
            }

            $request->validate([
                'name'     => 'required|string|max:255',
                'email'    => [
                    'required', 'email', 'max:255',
                    \Illuminate\Validation\Rule::unique('users', 'email')
                        ->where('tenant_id', $tenant->id),
                ],
                'password' => 'required|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
                'usertype' => 'required|in:0,1',
            ], [
                'password.regex' => 'Password must contain uppercase, lowercase, and a number.',
            ]);

            $user = User::create([
                'tenant_id'  => $tenant->id,
                'name'       => InputSanitizer::sanitize($request->name),
                'email'      => $request->email,
                'password'   => Hash::make($request->password),
                'usertype'   => $request->usertype,
                'status'     => 1,
                'created_by' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully.',
                'user'    => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error creating user.'], 500);
        }
    }


    public function toggleUserStatus($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Cannot change your own status.'], 403);
        }

        $user->status = !$user->status;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User ' . ($user->status ? 'activated' : 'deactivated') . ' successfully.',
            'status'  => $user->status,
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);

            if ($user->id === Auth::id() && $request->usertype != $user->usertype) {
                return response()->json(['success' => false, 'message' => 'Cannot change your own role.'], 403);
            }
            if ($user->id === Auth::id() && $request->status != $user->status) {
                return response()->json(['success' => false, 'message' => 'Cannot change your own status.'], 403);
            }

            $rules = [
                'name'     => 'required|string|max:255',
                'email'    => 'required|email|unique:users,email,' . $id,
                'usertype' => 'required|in:0,1',
                'status'   => 'required|in:0,1',
            ];
            if ($request->filled('password')) {
                $rules['password'] = 'min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/';
            }

            $request->validate($rules, [
                'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
            ]);

            $user->name     = InputSanitizer::sanitize($request->name);
            $user->email    = $request->email;
            $user->usertype = $request->usertype;
            $user->status   = $request->status;
            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully.',
                'user'    => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email, 'usertype' => $user->usertype, 'status' => $user->status],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error updating user.'], 500);
        }
    }

    public function resetPassword(Request $request, $id)
    {
        $requestingUser = Auth::user();
        $targetUser     = User::findOrFail($id);

        // An admin cannot generate a reset link for another admin.
        // This prevents privilege escalation via "I'll just reset your password and log in as you."
        if ($targetUser->usertype == 1 && $targetUser->id !== $requestingUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot generate a reset link for another admin account.',
            ], 403);
        }

        if ($targetUser->status == 0) {
            return response()->json(['success' => false, 'message' => 'Cannot reset password for inactive user.'], 403);
        }

        $resetToken = bin2hex(random_bytes(32));
        $targetUser->password_reset_token   = Hash::make($resetToken);
        $targetUser->password_reset_expires = now()->addHours(24);
        $targetUser->save();

        \Log::info('Password reset initiated', ['user_id' => $targetUser->id, 'admin_id' => $requestingUser->id]);

        $resetLink = url('/reset-password/' . $targetUser->id . '/' . $resetToken);

        return response()->json([
            'success'    => true,
            'message'    => 'Password reset link generated.',
            'reset_link' => $resetLink,
            'expires'    => '24 hours',
            'warning'    => 'Send this link directly to the user. Do not share it publicly.',
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return response()->json(['success' => false, 'message' => 'Cannot delete your own account.'], 403);
        }

        // Prevent deleting another admin
        if ($user->usertype == 1) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete another admin account. Deactivate it instead.',
            ], 403);
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'User deleted successfully.']);
    }

    public function showResetForm($id, $token)
    {
        $user = User::findOrFail($id);

        if ($user->status == 0) {
            return view('auth.reset-password-error', ['message' => 'Account is deactivated']);
        }
        if (!$user->password_reset_token || !$user->password_reset_expires) {
            return view('auth.reset-password-error', ['message' => 'Invalid reset link']);
        }
        if (now()->greaterThan($user->password_reset_expires)) {
            $user->password_reset_token = null;
            $user->password_reset_expires = null;
            $user->save();
            return view('auth.reset-password-error', ['message' => 'Reset link has expired']);
        }
        if (!Hash::check($token, $user->password_reset_token)) {
            return view('auth.reset-password-error', ['message' => 'Invalid reset token']);
        }

        // Pass only user ID to the form — not the raw token in the view data
        return view('auth.reset-password', ['userId' => $user->id, 'token' => $token]);
    }

    public function processReset(Request $request, $id, $token)
    {
        $user = User::findOrFail($id);

        if ($user->status == 0) {
            return back()->withErrors(['error' => 'Account is deactivated']);
        }
        if (!$user->password_reset_token || !Hash::check($token, $user->password_reset_token)) {
            return back()->withErrors(['error' => 'Invalid reset token']);
        }
        if (now()->greaterThan($user->password_reset_expires)) {
            return back()->withErrors(['error' => 'Reset link has expired']);
        }

        $request->validate([
            'password' => 'required|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
        ], [
            'password.regex' => 'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
        ]);

        $user->password               = Hash::make($request->password);
        $user->password_reset_token   = null;
        $user->password_reset_expires = null;
        $user->save();

        \Log::info('Password reset completed', ['user_id' => $user->id]);

        return redirect('/')->with('status', 'Password reset successfully. You can now login.');
    }
}
