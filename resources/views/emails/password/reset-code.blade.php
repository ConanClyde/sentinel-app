<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Reset Your Password</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Reset Your Password</h1>

    <p style="margin-bottom: 20px;">You are receiving this email because we received a password reset request for your account.</p>

    <p style="font-size: 32px; font-weight: bold; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin-bottom: 20px;">
        {{ $code }}
    </p>

    <p style="margin-bottom: 20px;">This code will expire in <strong>60 minutes</strong>.</p>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you did not request a password reset, no further action is required.
    </p>

    <p style="margin-top: 30px;">
        Thanks,<br>
        <strong>{{ config('app.name') }}</strong>
    </p>
</body>
</html>
