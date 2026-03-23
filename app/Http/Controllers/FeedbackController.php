<?php

namespace App\Http\Controllers;

use App\Helpers\InputSanitizer;
use App\Models\FeedbackTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    // ── Tenant: submit a ticket ────────────────────────────────────────────

    public function store(Request $request)
    {
        $data = $request->validate([
            'type'    => 'required|in:support,feedback,bug',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:5000',
        ]);

        $tenant = app('current.tenant');

        $ticket = FeedbackTicket::create([
            'type'      => $data['type'],
            'subject'   => InputSanitizer::sanitize($data['subject']),
            'message'   => InputSanitizer::sanitize($data['message']),
            'tenant_id' => $tenant->id,
            'user_id'   => Auth::id(),
        ]);

        return response()->json($ticket, 201);
    }

    // ── Tenant: list own tickets ───────────────────────────────────────────

    public function index()
    {
        $tenant  = app('current.tenant');
        $tickets = FeedbackTicket::where('tenant_id', $tenant->id)
            ->orderByDesc('created_at')
            ->get(['id', 'type', 'subject', 'status', 'admin_reply', 'replied_at', 'created_at']);

        return response()->json($tickets);
    }

    // ── SuperAdmin: list all tickets ───────────────────────────────────────

    public function adminIndex(Request $request)
    {
        $query = FeedbackTicket::with(['tenant:id,name,slug', 'user:id,name,email'])
            ->orderByDesc('created_at');

        if ($request->status && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(30));
    }

    // ── SuperAdmin: reply + change status ─────────────────────────────────

    public function adminReply(Request $request, FeedbackTicket $ticket)
    {
        $data = $request->validate([
            'admin_reply' => 'required|string|max:5000',
            'status'      => 'required|in:open,in_progress,closed',
        ]);

        $ticket->update([
            'admin_reply' => InputSanitizer::sanitize($data['admin_reply']),
            'status'      => $data['status'],
            'replied_at'  => now(),
        ]);

        return response()->json($ticket->fresh(['tenant:id,name,slug', 'user:id,name,email']));
    }
}
