<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\BelongsToTenant;

class Products extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'barcode',
        'quantity',
        'price',
        'cost_price',
    ];

    /**
     * A product has MANY stock rows — required for FIFO.
     * Multiple purchases at different prices each create a new row.
     */
    public function stocks()
    {
        return $this->hasMany(Stocks::class, 'product_id', 'id');
    }

    /**
     * Convenience: the most recent stock row (for current price display).
     */
    public function latestStock()
    {
        return $this->hasOne(Stocks::class, 'product_id', 'id')
                    ->latestOfMany();
    }

    public function sales()
    {
        return $this->hasMany(Sales::class);
    }
}
