<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 16px; color: #111827; }
    .card { max-width: 500px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb; }
    .logo-icon { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #0b5e57, #10b981); display: inline-flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 14px; }
    h1 { font-size: 22px; font-weight: 800; margin: 24px 0 8px; }
    p { color: #6b7280; line-height: 1.6; margin: 0 0 16px; }
    .highlight { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 24px 0; }
    .btn { display: block; text-align: center; background: #059669; color: white !important; font-weight: 700; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-size: 15px; margin: 24px 0; }
    .expiry { font-size: 12px; color: #9ca3af; text-align: center; }
    .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #f3f4f6; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-icon">BM</div>
    <h1>You're invited! 👋</h1>
    <p><strong style="color:#111827;">{{ $inviterName }}</strong> has invited you to join <strong style="color:#111827;">{{ $tenant->name }}</strong> on BinoManager as a <strong style="color:#111827;">{{ ucfirst($invitation->role) }}</strong>.</p>
    <div class="highlight">
      <strong style="color:#065f46;">What you'll be able to do:</strong><br>
      @if($invitation->role === 'admin')
      Full access — manage products, stock, sales, customers, and team members.
      @else
      Record sales and view product information. Admins manage stock and settings.
      @endif
    </div>
    <a href="{{ $acceptUrl }}" class="btn">Accept Invitation →</a>
    <p class="expiry">This invitation expires on <strong>{{ $expiresAt }}</strong>.</p>
    <p style="font-size:13px;color:#9ca3af;">If the button doesn't work:<br>
      <a href="{{ $acceptUrl }}" style="color:#059669;word-break:break-all;">{{ $acceptUrl }}</a>
    </p>
    <div class="footer">If you weren't expecting this, you can safely ignore this email.</div>
  </div>
</body>
</html>
