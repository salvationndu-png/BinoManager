<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use HasProfilePhoto;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'tenant_id',
        'name',
        'email',
        'password',
        'usertype',
        'status',
        'created_by',
        'password_reset_token',
        'password_reset_expires',
        'email_verified_at',
        'verification_code',
        'verification_code_expires_at',
        'verification_attempts',
        'pending_email',
        'email_change_code',
        'email_change_code_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
        'password_reset_token',
        'verification_code',
        'email_change_code',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'status' => 'boolean',
        'password_reset_expires' => 'datetime',
        'verification_code_expires_at' => 'datetime',
        'email_change_code_expires_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    public function scopeAdmins($query)
    {
        return $query->where('usertype', 1);
    }

    public function scopeSalesUsers($query)
    {
        return $query->where('usertype', 0);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
