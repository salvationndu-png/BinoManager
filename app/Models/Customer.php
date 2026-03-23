<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\BelongsToTenant;

class Customer extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id', 'name', 'phone', 'email',
        'business_name', 'address', 'credit_limit', 'outstanding_balance',
    ];

    public function sales()
    {
        return $this->hasMany(Sales::class);
    }

    public function payments()
    {
        return $this->hasMany(CustomerPayment::class);
    }
}
