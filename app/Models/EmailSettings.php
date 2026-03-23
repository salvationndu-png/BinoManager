<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class EmailSettings extends Model
{
    protected $fillable = [
        'driver',
        'host',
        'port',
        'encryption',
        'username',
        'password',
        'from_address',
        'from_name',
        'mailgun_domain',
        'mailgun_secret',
        'mailgun_endpoint',
        'ses_key',
        'ses_secret',
        'ses_region',
        'is_active',
        'last_tested_at',
        'test_result',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_tested_at' => 'datetime',
        'port' => 'integer',
    ];

    protected $hidden = [
        'password',
        'mailgun_secret',
        'ses_key',
        'ses_secret',
    ];

    /**
     * Get the active email configuration
     */
    public static function getActive()
    {
        return static::where('is_active', true)->first();
    }

    /**
     * Encrypt password before saving
     */
    public function setPasswordAttribute($value)
    {
        if ($value) {
            $this->attributes['password'] = Crypt::encryptString($value);
        }
    }

    /**
     * Decrypt password when retrieving
     */
    public function getPasswordAttribute($value)
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Encrypt mailgun secret before saving
     */
    public function setMailgunSecretAttribute($value)
    {
        if ($value) {
            $this->attributes['mailgun_secret'] = Crypt::encryptString($value);
        }
    }

    /**
     * Decrypt mailgun secret when retrieving
     */
    public function getMailgunSecretAttribute($value)
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Encrypt SES key before saving
     */
    public function setSesKeyAttribute($value)
    {
        if ($value) {
            $this->attributes['ses_key'] = Crypt::encryptString($value);
        }
    }

    /**
     * Decrypt SES key when retrieving
     */
    public function getSesKeyAttribute($value)
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Encrypt SES secret before saving
     */
    public function setSesSecretAttribute($value)
    {
        if ($value) {
            $this->attributes['ses_secret'] = Crypt::encryptString($value);
        }
    }

    /**
     * Decrypt SES secret when retrieving
     */
    public function getSesSecretAttribute($value)
    {
        if ($value) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Get configuration array for Laravel mailer
     */
    public function toMailConfig(): array
    {
        $config = [
            'transport' => $this->driver,
        ];

        switch ($this->driver) {
            case 'smtp':
                $config['host'] = $this->host;
                $config['port'] = $this->port;
                $config['encryption'] = $this->encryption;
                $config['username'] = $this->username;
                $config['password'] = $this->password;
                break;

            case 'mailgun':
                $config['domain'] = $this->mailgun_domain;
                $config['secret'] = $this->mailgun_secret;
                $config['endpoint'] = $this->mailgun_endpoint;
                break;

            case 'ses':
                $config['key'] = $this->ses_key;
                $config['secret'] = $this->ses_secret;
                $config['region'] = $this->ses_region;
                break;
        }

        return $config;
    }
}
