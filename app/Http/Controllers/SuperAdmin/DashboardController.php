<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\PaymentEvent;
use App\Models\Subscription;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return view('superadmin.dashboard');
    }

    private function fillMonthGaps($rows, int $months): array
    {
        $now    = now();
        $keyed  = $rows->keyBy('month');
        $result = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $month = $now->copy()->subMonths($i)->format('Y-m');
            $row   = $keyed[$month] ?? null;
            $result[] = [
                'month'    => Carbon::createFromFormat('Y-m', $month)->format('M Y'),
                'revenue'  => $row ? round(((int)$row->total_kobo) / 100, 2) : 0,
                'payments' => $row?->payments ?? 0,
            ];
        }

        return $result;
    }
}
