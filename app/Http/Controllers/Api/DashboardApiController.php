<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Products;
use App\Models\Sales;
use App\Models\Customer;
use App\Models\Stocks;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use DB;
class DashboardApiController extends Controller
{
    public function index()
    {
        $tid = app('current.tenant.id');
        if (!$tid) abort(403);
        $cp = "tenant.{$tid}.dashboard";
        $isAdmin = Auth::user()->usertype == 1;
        $totalProducts = Cache::remember("{$cp}.total_products",60,fn()=>Products::count());
        $totalStock    = Cache::remember("{$cp}.total_stock",60,fn()=>Stocks::sum('quantity'));
        $lowStockCount = Cache::remember("{$cp}.low_stock_count",60,fn()=>Products::where('quantity','<',10)->where('quantity','>',0)->count());
        $totalCustomers= Cache::remember("{$cp}.total_customers",60,fn()=>Customer::count());
        $outstanding   = Cache::remember("{$cp}.outstanding",60,fn()=>Customer::sum('outstanding_balance'));
        $lastMonthProducts = Cache::remember("{$cp}.last_month_products",60,fn()=>Products::where('created_at','<',Carbon::now()->subMonth())->count());
        $productsChange = $lastMonthProducts>0?(($totalProducts-$lastMonthProducts)/$lastMonthProducts)*100:0;
        $todaysSales    = Sales::whereDate('sale_date',Carbon::today())->sum('total');
        $yesterdaySales = Sales::whereDate('sale_date',Carbon::yesterday())->sum('total');
        $salesChange    = $yesterdaySales>0?(($todaysSales-$yesterdaySales)/$yesterdaySales)*100:0;

        $revRaw = Cache::remember("{$cp}.revenue_30d",120,fn()=>Sales::select(DB::raw('DATE(sale_date) as date'),DB::raw('SUM(total) as revenue'))->where('sale_date','>=',Carbon::now()->subDays(29))->groupBy('date')->orderBy('date')->get());
        $revTrend=['labels'=>[],'data'=>[]];
        for($i=29;$i>=0;$i--){$date=Carbon::today()->subDays($i)->toDateString();$entry=$revRaw->firstWhere('date',$date);$revTrend['labels'][]=Carbon::parse($date)->format('M j');$revTrend['data'][]=$entry?(float)$entry->revenue:0;}
        $topRaw = Cache::remember("{$cp}.top_products",120,fn()=>Sales::select('product_id',DB::raw('SUM(total) as total_rev'))->with('product')->whereMonth('sale_date',now()->month)->groupBy('product_id')->orderByDesc('total_rev')->take(6)->get());
        $topProducts=['labels'=>[],'rev'=>[]];
        foreach($topRaw as $r){$topProducts['labels'][]=$r->product?$r->product->name:'Unknown';$topProducts['rev'][]=(float)$r->total_rev;}
        $recentSales=Sales::with(['product','user'])->orderBy('created_at','desc')->take(8)->get()->map(fn($s)=>['product'=>$s->product?$s->product->name:'Unknown','customer'=>$s->customer_name??$s->customer?->name??'Walk-in','amount'=>(float)$s->total,'method'=>$s->payment_type??'Cash','ago'=>$s->created_at->diffForHumans(null,true).' ago']);
        $lowStockItems=Cache::remember("{$cp}.low_stock_items",60,fn()=>Products::where('quantity','<',10)->where('quantity','>',0)->orderBy('quantity')->take(6)->get(['name','quantity']))->map(fn($p)=>['name'=>$p->name,'quantity'=>$p->quantity]);
        $staffLeaderboard=[];
        if($isAdmin)$staffLeaderboard=Cache::remember("{$cp}.staff_today",60,fn()=>Sales::select('user_id',DB::raw('SUM(total) as total_sales'),DB::raw('COUNT(*) as sales_count'))->with('user')->whereDate('sale_date',Carbon::today())->whereNotNull('user_id')->groupBy('user_id')->orderByDesc('total_sales')->take(5)->get())->map(fn($e)=>['name'=>$e->user?->name??'Unknown','sales'=>(float)$e->total_sales,'count'=>(int)$e->sales_count]);
        return response()->json(['todaysSales'=>(float)$todaysSales,'salesChange'=>$salesChange,'totalProducts'=>(int)$totalProducts,'totalStock'=>(int)$totalStock,'totalCustomers'=>(int)$totalCustomers,'outstandingBalance'=>(float)$outstanding,'lowStockCount'=>(int)$lowStockCount,'revenueTrend'=>$revTrend,'topProducts'=>$topProducts,'recentSales'=>$recentSales,'lowStockItems'=>$lowStockItems,'staffLeaderboard'=>$staffLeaderboard]);
    }
}
