<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;

/**
 * Serves the React SPA shell for the super admin dashboard.
 * All actual data is fetched via JSON API (SuperAdminApiController).
 */
class SuperAdminShellController extends Controller
{
    public function show()
    {
        return view('superadmin-react.shell');
    }
}
