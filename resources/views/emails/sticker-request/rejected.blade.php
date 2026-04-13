<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sticker Request Update</title>
</head>
<body style="background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px;">
                <div style="margin-bottom: 24px;">
                    <span style="font-weight: 700; font-size: 20px; letter-spacing: -0.025em; color: #09090b;">SENTINEL</span>
                </div>

                <h1 style="font-size: 24px; font-weight: 600; color: #09090b; letter-spacing: -0.025em; margin: 0 0 16px 0;">Sticker Request Update - Action Required</h1>

                <p style="font-size: 16px; line-height: 24px; color: #71717a; margin: 0 0 24px 0;">
                    Dear {{ $stickerRequest->user->full_name ?? 'Applicant' }}, we regret to inform you that your sticker {{ $stickerRequest->type }} request has been rejected.
                </p>

                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #09090b; font-weight: 500;">Request Details</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Request ID:</span> #{{ $stickerRequest->id }}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Request Type:</span> {{ ucfirst($stickerRequest->type) }}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Vehicle:</span> {{ $stickerRequest->vehicle->plate_number ?? 'N/A' }}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Sticker Number:</span> {{ $stickerRequest->vehicle->sticker_number ?? 'N/A' }}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Submitted:</span> {{ $stickerRequest->created_at->format('F j, Y \a\t g:i A') }}
                    </p>
                </div>

                @if($stickerRequest->notes)
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: #b91c1c; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Reason for Rejection</p>
                    <p style="margin: 0; font-size: 15px; color: #991b1b; line-height: 22px;">{{ $stickerRequest->notes }}</p>
                </div>
                @endif

                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #09090b; font-weight: 500;">What You Can Do</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#128221; <strong>Review the reason</strong> provided above</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#10004; <strong>Address any issues</strong> mentioned in the rejection</p>
                    @if($stickerRequest->type === 'renewal')
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#128260; <strong>Submit a renewal request</strong> after resolving the issues</p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">&#9888; <strong>Renew before expiration</strong> to avoid penalties</p>
                    @else
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">&#128260; <strong>Submit a replacement request</strong> after resolving the issues</p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">&#128222; <strong>Contact us</strong> if your sticker is damaged/lost</p>
                    @endif
                </div>

                <div style="margin-bottom: 32px;">
                    <a href="{{ route('dashboard') }}" style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px; text-align: center;">
                        View Dashboard
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 32px 0;">

                <p style="font-size: 12px; color: #a1a1aa; line-height: 18px; margin: 0;">
                    If you need assistance or have questions about this decision, please contact our office.
                </p>

                <p style="font-size: 12px; font-weight: 500; color: #09090b; margin: 16px 0 0 0;">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
