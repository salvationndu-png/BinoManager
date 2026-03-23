<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedbackTicket extends Model
{
    protected $fillable = [
        'tenant_id', 'user_id', 'type', 'subject', 'message',
        'status', 'admin_reply', 'replied_at',
    ];

    protected $casts = [
        'replied_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
