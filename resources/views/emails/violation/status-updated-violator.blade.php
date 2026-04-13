<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Violation Status Update</title>
</head>
<body style="background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <tr>
            <td style="padding: 40px;">
                <div style="margin-bottom: 24px;">
                    <span style="font-weight: 700; font-size: 20px; letter-spacing: -0.025em; color: #09090b;">SENTINEL</span>
                </div>

                <h1 style="font-size: 24px; font-weight: 600; color: #09090b; letter-spacing: -0.025em; margin: 0 0 16px 0;">Violation Status Update</h1>

                <p style="font-size: 16px; line-height: 24px; color: #71717a; margin: 0 0 24px 0;">
                    Dear {{ $violation->vehicle->user->full_name ?? 'Vehicle Owner' }}, the status of your violation case has been updated.
                </p>

                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #09090b; font-weight: 500;">Case Details</p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Violation ID:</span> #{{ $violation->id }}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Vehicle:</span> {{ $violation->vehicle->plate_number ?? $violation->violator_sticker_number }}
                    </p>
                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Sticker Number:</span> {{ $violation->vehicle->sticker_number ?? 'N/A' }}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Violation Type:</span> {{ $violation->violationType->name ?? 'N/A' }}
                    </p>
                </div>

                @php
                    $statusColor = match($violation->status) {
                        'approved' => ['bg' => '#fef2f2', 'border' => '#fecaca', 'text' => '#b91c1c', 'label' => 'Action Required'],
                        'resolved' => ['bg' => '#f0fdf4', 'border' => '#bbf7d0', 'text' => '#15803d', 'label' => 'Case Resolved'],
                        'rejected' => ['bg' => '#f9f9f9', 'border' => '#f1f1f1', 'text' => '#71717a', 'label' => 'Report Rejected'],
                        default => ['bg' => '#fffbeb', 'border' => '#fde68a', 'text' => '#92400e', 'label' => 'Pending']
                    };
                @endphp
                <div style="background-color: {{ $statusColor['bg'] }}; border: 1px solid {{ $statusColor['border'] }}; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: {{ $statusColor['text'] }}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">{{ $statusColor['label'] }}</p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Previous Status:</span> {{ ucfirst($violation->getOriginal('status')) }}
                    </p>
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Current Status:</span> {{ ucfirst($violation->status) }}
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #71717a;">
                        <span style="color: #09090b; font-weight: 500;">Updated:</span> {{ $violation->status_updated_at->format('F j, Y \a\t g:i A') }}
                    </p>
                </div>

                @if($violation->remarks)
                <div style="background-color: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #f1f1f1;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #09090b; font-weight: 500;">Remarks from Administration</p>
                    <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 22px;">{{ $violation->remarks }}</p>
                </div>
                @endif

                @if($violation->status === 'rejected')
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: #b91c1c; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Why Was This Rejected?</p>
                    <p style="margin: 0; font-size: 15px; color: #991b1b; line-height: 22px;">{{ $violation->rejection_reason ?? 'No reason provided.' }}</p>
                </div>
                @endif

                @if($violation->status === 'resolved')
                <p style="font-size: 15px; line-height: 24px; color: #71717a; margin: 0 0 24px 0;">
                    This violation case has been marked as resolved. Please ensure compliance with campus vehicle regulations to avoid future violations.
                </p>
                @elseif($violation->status === 'approved')
                <p style="font-size: 15px; line-height: 24px; color: #71717a; margin: 0 0 24px 0;">
                    Please review the remarks above and take appropriate action. Failure to comply may result in further administrative action.
                </p>
                @endif

                <div style="margin-bottom: 32px;">
                    <a href="{{ route('dashboard') }}" style="display: inline-block; background-color: #15803d; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px; text-align: center;">
                        View Dashboard
                    </a>
                </div>

                <hr style="border: 0; border-top: 1px solid #e5e5e5; margin: 32px 0;">

                <p style="font-size: 12px; color: #a1a1aa; line-height: 18px; margin: 0;">
                    This is an automated notification. If you have any questions about this update, please contact our support team.
                </p>

                <p style="font-size: 12px; font-weight: 500; color: #09090b; margin: 16px 0 0 0;">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
