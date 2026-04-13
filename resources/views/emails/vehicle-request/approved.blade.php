<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vehicle Request Approved</title>
</head>
<body style="background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px;">
                <div style="margin-bottom: 24px;">
                    <span style="font-weight: 700; font-size: 20px; letter-spacing: -0.025em; color: #09090b;">SENTINEL</span>
                </div>

                <h1 style="font-size: 24px; font-weight: 600; color: #09090b; letter-spacing: -0.025em; margin: 0 0 16px 0;">Vehicle Request Approved - Your Sticker is Ready!</h1>

                <p style="font-size: 16px; line-height: 24px; color: #71717a; margin: 0 0 24px 0;">
                    Dear {{ $vehicleRequest->user->full_name ?? 'Vehicle Owner' }}, great news! Your vehicle registration request has been approved.
                </p>

                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: #15803d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Vehicle Details</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Plate Number:</span> {{ $vehicleRequest->plate_number }}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Vehicle Type:</span> {{ $vehicleRequest->vehicleType->name ?? 'N/A' }}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Sticker Number:</span> {{ $vehicleRequest->vehicle->sticker_number ?? 'Pending' }}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Expiration Date:</span> {{ $vehicleRequest->vehicle->expires_at?->format('F j, Y') ?? 'N/A' }}
                    </p>
                </div>

                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #09090b; font-weight: 500;">Your Vehicle Sticker</p>
                    <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 22px;">Your vehicle sticker is attached to this email. Please download and print it. Display it clearly on your vehicle as required by campus regulations.</p>
                </div>

                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #09090b; font-weight: 500;">Important Reminders</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#10004; Your sticker is now <strong>active</strong> and valid</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#128203; Display the sticker on your vehicle immediately</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#128197; Note the expiration date and renew before it expires</p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">&#128664; You may now park in designated areas</p>
                </div>

                <div style="margin-bottom: 32px;">
                    <a href="{{ route('dashboard') }}" style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px; text-align: center;">
                        View My Vehicle
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 32px 0;">

                <p style="font-size: 12px; color: #a1a1aa; line-height: 18px; margin: 0;">
                    If you have any questions or need assistance, please contact the administration office. Congratulations and welcome to the campus vehicle registry!
                </p>

                <p style="font-size: 12px; font-weight: 500; color: #09090b; margin: 16px 0 0 0;">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
