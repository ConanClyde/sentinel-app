<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Registration Update</title>
</head>
<body style="background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px;">
                <!-- Logo/Header Area -->
                <div style="margin-bottom: 24px;">
                    <span style="font-weight: 700; font-size: 20px; letter-spacing: -0.025em; color: #09090b;">SENTINEL</span>
                </div>

                <h1 style="font-size: 24px; font-weight: 600; color: #09090b; letter-spacing: -0.025em; margin: 0 0 16px 0;">Registration Update</h1>
                
                <p style="font-size: 16px; line-height: 24px; color: #71717a; margin: 0 0 24px 0;">
                    Hi {{ $pending->first_name }}, thank you for your interest in registering for Sentinel. After reviewing your application, we are unable to approve it at this time.
                </p>

                <div style="background-color: #fef2f2; border-radius: 6px; padding: 20px; margin-bottom: 24px; border: 1px solid #fecaca;">
                    <p style="margin: 0; font-size: 13px; color: #b91c1c; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Reason for Denial</p>
                    <p style="margin: 0; font-size: 15px; color: #991b1b; line-height: 22px;">{{ $pending->notes }}</p>
                </div>

                <p style="font-size: 15px; line-height: 24px; color: #71717a; margin: 0 0 32px 0;">
                    If you can address the reason above, you are welcome to submit a new registration request with the corrected information and documents.
                </p>

                <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 32px 0;">

                <p style="font-size: 12px; color: #a1a1aa; line-height: 18px; margin: 0;">
                    This is an automated notification from the Sentinel Security Team. Replies to this email are not monitored.
                </p>
                
                <p style="font-size: 12px; font-weight: 500; color: #09090b; margin: 16px 0 0 0;">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
