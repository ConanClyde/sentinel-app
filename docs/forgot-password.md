# Forgot Password

## Overview
Allows users to reset their password by requesting a verification code sent to their email.

## Flow
1. User enters email address
2. System sends 6-digit verification code
3. User enters verification code
4. User sets new password

## Step 1: Request Reset Link

### Route
- **URL**: `/forgot-password`
- **Method**: GET
- **Controller**: `PasswordResetLinkController@create`

### POST Action
- **URL**: `/forgot-password`
- **Method**: POST
- **Rate Limit**: 3 requests per minute

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email, must exist in system |

### Success Behavior
- Show success message "If an account exists, a verification code has been sent"
- Redirect to reset-password page

---

## Step 2: Verify Code

### Route
- **URL**: `/reset-password`
- **Method**: GET
- **Controller**: `NewPasswordController@create`

### Verify Code POST
- **URL**: `/reset-password/verify`
- **Method**: POST
- **Rate Limit**: 10 attempts per minute

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email |
| code | string | Yes | 6-digit code |

### Success Behavior
- Store verified email in session
- Redirect to new password form

### Resend Code
- **URL**: `/reset-password/resend-code`
- **Method**: POST
- **Rate Limit**: 3 requests per minute

---

## Step 3: Set New Password

### Route
- **URL**: `/reset-password/new`
- **Method**: GET
- **Controller**: `NewPasswordController@showPasswordForm`

### Store New Password
- **URL**: `/reset-password/new`
- **Method**: POST

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| password | string | Yes | Min 8 chars, 1 uppercase, 1 number |
| password_confirmation | string | Yes | Must match password |

### Success Behavior
- Update user password
- Redirect to login with success message

## Related Routes
- `password.request` - Request reset link
- `password.email` - Send reset email
- `password.reset` - Verify code form
- `password.verify-code` - Verify code
- `password.reset-password` - New password form
- `password.store` - Store new password
