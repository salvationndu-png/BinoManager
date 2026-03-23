<?php

namespace App\Http\Requests;

use Laravel\Fortify\Http\Requests\LoginRequest;

class CustomLoginRequest extends LoginRequest
{
    public function rules(): array
    {
        return [
            'email'    => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function credentials(): array
    {
        return [
            'email'    => $this->input('email'),
            'password' => $this->input('password'),
        ];
    }
}
