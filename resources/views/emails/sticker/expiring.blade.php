<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sticker Expiring Soon</title>
</head>
<body style="background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px;">
                <!-- Logo/Header Area -->
                <div style="margin-bottom: 24px;">
                    <span style="font-weight: 700; font-size: 20px; letter-spacing: -0.025em; color: #09090b;">SENTINEL</span>
                </div>

                <h1 style="font-size: 24px; font-weight: 600; color: #09090b; letter-spacing: -0.025em; margin: 0 0 16px 0;">Sticker Expiring Soon</h1>

                <p style="font-size: 16px; line-height: 24px; color: #71717a; margin: 0 0 24px 0;">
                    Hi {{ $vehicle->user?->first_name ?? 'there' }}, your vehicle sticker for
                    <strong style="color: #09090b;">{{ $vehicle->plate_number }}</strong>
                    (Sticker #{{ $vehicle->sticker_number }}) is expiring on
                    <strong style="color: #09090b;">{{ $vehicle->expires_at?->format('F j, Y') ?? 'N/A' }}</strong>.
                    Please log in and submit a renewal request before it expires to avoid any disruption to your campus access.
                </p>

                <!-- Amber Expiry Warning Box -->
                <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Expiry Date</p>
                    <p style="margin: 0; font-size: 15px; color: #78350f; line-height: 22px;">
                        Your sticker expires on <strong>{{ $vehicle->expires_at?->format('l, F j, Y') ?? 'N/A' }}</strong>.
                        Renewal requests open 14 days before expiration. Act now to ensure uninterrupted campus access.
                    </p>
                </div>

                <!-- Vehicle Details Box -->
                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #09090b; font-weight: 500;">Vehicle Details</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Plate Number:</span> {{ $vehicle->plate_number }}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Sticker Number:</span> {{ $vehicle->sticker_number }}
                    </p>
                </div>

                <!-- CTA Button -->
                <div style="margin-bottom: 32px;">
                    <a href="{{ route('shared.sticker-requests') }}" style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px; text-align: center;">
                        Request Renewal
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 32px 0;">

                <p style="font-size: 12px; color: #a1a1aa; line-height: 18px; margin: 0;">
                    This is an automated reminder from the Sentinel Security Administration. If you believe you received this in error or your sticker details are incorrect, please contact our support team.
                </p>

                <p style="font-size: 12px; font-weight: 500; color: #09090b; margin: 16px 0 0 0;">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
