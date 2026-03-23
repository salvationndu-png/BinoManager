<?php

namespace App\Http\Controllers\Auth; // ✅ Must match folder

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class CustomLoginController extends Controller
{
    public function showLoginForm()
    {
        return view('auth.custom-login');
    }
 public function login(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        // Find the single account allowed to log in
        $user = User::where('id', 1)->first(); // Change ID to the admin user

        if ($user && Hash::check($request->password, $user->password)) {
            Auth::login($user);
            $request->session()->regenerate();
            return redirect()->route('user.home');
        }

        return back()->withErrors([
            'password' => 'Invalid password.',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        return redirect('/login');
    }
}
