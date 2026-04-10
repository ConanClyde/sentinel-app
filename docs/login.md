# Login

## Overview
The login page allows existing users to authenticate and access the system.

## Route
- **URL**: `/login`
- **Method**: GET
- **Controller**: `AuthenticatedSessionController@create`

## Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | - |

## POST Action
- **URL**: `/login`
- **Method**: POST
- **Rate Limit**: 5 attempts per minute

## Success Behavior
- Redirect to dashboard
- Start authenticated session

## Error Handling
- Invalid credentials shows error message
- Rate limiting after 5 failed attempts

## Related Routes
- `login` - Show login form
- `password.request` - Forgot password page
- `logout` - End session
