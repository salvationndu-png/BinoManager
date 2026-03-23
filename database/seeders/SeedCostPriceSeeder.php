<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Stocks;

class SeedCostPriceSeeder extends Seeder
{
    public function run()
    {
        $stocks = Stocks::whereNull('cost_price')->get();

        foreach ($stocks as $stock) {
            $sellingPrice = (float)$stock->price;
            $costPrice = $sellingPrice * 0.8; // Assume 20% profit margin
            
            $stock->cost_price = number_format($costPrice, 2, '.', '');
            $stock->save();
        }

        $this->command->info("Updated {$stocks->count()} stock records with cost prices.");
    }
}
