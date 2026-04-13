<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Account Approved</title>
</head>
<body style="background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px;">
                <!-- Logo/Header Area -->
                <div style="margin-bottom: 24px;">
                    <span style="font-weight: 700; font-size: 20px; letter-spacing: -0.025em; color: #09090b;">SENTINEL</span>
                </div>

                <h1 style="font-size: 24px; font-weight: 600; color: #09090b; letter-spacing: -0.025em; margin: 0 0 16px 0;">Registration Approved</h1>
                
                <p style="font-size: 16px; line-height: 24px; color: #71717a; margin: 0 0 24px 0;">
                    Hi {{ $pending->first_name }}, great news! Your registration has been reviewed and approved. You now have full access to the Sentinel platform.
                </p>

                <!-- Shadcn Success Box -->
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: #15803d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Status: Active</p>
                    <p style="margin: 0; font-size: 15px; color: #166534; line-height: 22px;">Your account has been successfully verified by our security team. You may now log in to manage your vehicles and view campus security data.</p>
                </div>

                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0; font-size: 14px; color: #09090b; font-weight: 500;">Login Email:</p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #71717a;">{{ $pending->email }}</p>
                </div>

                <div style="margin-bottom: 32px;">
                    <a href="{{ route('login') }}" style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px; text-align: center;">
                        Access Dashboard
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 32px 0;">

                <p style="font-size: 12px; color: #a1a1aa; line-height: 18px; margin: 0;">
                    This registration was verified by the official Sentinel Security Administration. If you did not expect this email, please ignore it or contact our support team.
                </p>
                
                <p style="font-size: 12px; font-weight: 500; color: #09090b; margin: 16px 0 0 0;">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
