<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\BelongsToTenant;

class Stocks extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'product_id',
        'quantity',
        'date',
    ];

    /**
     * Each stock belongs to a product.
     */
    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id', 'id');
    }
}
