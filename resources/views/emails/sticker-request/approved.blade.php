<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sticker Request Approved</title>
</head>
<body style="background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px;">
                <div style="margin-bottom: 24px;">
                    <span style="font-weight: 700; font-size: 20px; letter-spacing: -0.025em; color: #09090b;">SENTINEL</span>
                </div>

                <h1 style="font-size: 24px; font-weight: 600; color: #09090b; letter-spacing: -0.025em; margin: 0 0 16px 0;">
                    @if($stickerRequest->type === 'renewal')
                    Sticker Renewal Approved - Your New Sticker is Ready!
                    @else
                    Sticker Replacement Approved - Download Your Sticker
                    @endif
                </h1>

                <p style="font-size: 16px; line-height: 24px; color: #71717a; margin: 0 0 24px 0;">
                    Dear {{ $stickerRequest->user->full_name ?? 'Vehicle Owner' }},
                    @if($stickerRequest->type === 'renewal')
                    your sticker renewal request has been approved.
                    @else
                    your sticker replacement request has been approved.
                    @endif
                </p>

                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: #15803d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Request Details</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Request Type:</span> {{ ucfirst($stickerRequest->type) }}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Vehicle:</span> {{ $stickerRequest->vehicle->plate_number ?? 'N/A' }}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Sticker Number:</span> {{ $stickerRequest->vehicle->sticker_number ?? 'N/A' }}
                    </p>
                    @if($stickerRequest->vehicle->expires_at)
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">New Expiration:</span> {{ $stickerRequest->vehicle->expires_at->format('F j, Y') }}
                    </p>
                    @endif
                </div>

                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #09090b; font-weight: 500;">Your Updated Sticker</p>
                    <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 22px;">
                        Your new/replacement sticker is attached to this email.
                        @if($stickerRequest->type === 'renewal')
                        Please remove the old sticker and display the new one immediately.
                        @else
                        Please discard the damaged/lost sticker and display this replacement.
                        @endif
                    </p>
                </div>

                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #09090b; font-weight: 500;">Important Notes</p>
                    @if($stickerRequest->type === 'renewal')
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#10004; Your sticker has been <strong>renewed</strong> successfully</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#128197; New expiration date: <strong>{{ $stickerRequest->vehicle->expires_at->format('F j, Y') }}</strong></p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#128260; Remove old sticker and apply the new one</p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">&#128664; Continue using designated parking areas</p>
                    @else
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#10004; Your <strong>replacement</strong> sticker is ready</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#128203; Same sticker number, new physical sticker</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#128465; Dispose of old/damaged sticker properly</p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">&#128664; Display new sticker immediately</p>
                    @endif
                </div>

                <div style="margin-bottom: 32px;">
                    <a href="{{ route('dashboard') }}" style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px; text-align: center;">
                        View My Vehicle
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 32px 0;">

                <p style="font-size: 12px; color: #a1a1aa; line-height: 18px; margin: 0;">
                    If you have any questions, please contact the administration office.
                </p>

                <p style="font-size: 12px; font-weight: 500; color: #09090b; margin: 16px 0 0 0;">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
