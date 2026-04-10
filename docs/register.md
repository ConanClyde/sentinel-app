# Registration

## Overview
Multi-step registration flow for students, staff, and stakeholders to create an account and register vehicles.

## Route
- **URL**: `/register`
- **Method**: GET
- **Controller**: `RegisteredUserController@show`

## Step Flow
1. Role Selection
2. Role Type (Stakeholder only)
3. Personal Info
4. Role-Specific Details
5. Vehicles
6. Credentials
7. Email Verification

---

## Step 1: Role Selection

### POST Action
- **URL**: `/register/role`
- **Method**: POST

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| main_role | string | Yes | student, staff, or stakeholder |

### Session Data
- `registration_main_role`
- `registration_requires_approval`
- `registration_step`

---

## Step 2: Role Type (Stakeholder Only)

### POST Action
- **URL**: `/register/role-type`
- **Method**: POST

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| role_type_id | integer | Yes | Must exist in role_types table |

### Session Data
- `registration_role_type_id`

---

## Step 3: Personal Info

### POST Action
- **URL**: `/register/name`
- **Method**: POST

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| first_name | string | Yes | Max 255 chars |
| middle_name | string | No | Max 255 chars |
| surname | string | Yes | Max 255 chars |
| name_extension | string | No | Jr, Sr, I, II, III, IV |

### Session Data
- `registration_name` (first_name, middle_name, surname, name_extension)

---

## Step 4: Role-Specific Details

### POST Action
- **URL**: `/register/role-specific`
- **Method**: POST

### Student Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| student_id | string | Yes | Max 50 chars |
| college_id | integer | Yes | Must exist in colleges |
| program_id | integer | Yes | Must exist in programs |
| student_id_image | file | Yes | Image, max 5MB |
| face_scan_data | file | Yes | Image, max 5MB |
| license_image | file | No | Image, max 5MB |

### Staff Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| staff_id | string | Yes | Max 50 chars |
| face_scan_data | file | Yes | Image, max 5MB |
| license_image | file | No | Image, max 5MB |

### Stakeholder Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| company_name | string | Yes | Max 255 chars |
| company_address | string | Yes | Max 500 chars |
| contact_person | string | Yes | Max 255 chars |
| contact_number | string | Yes | Max 20 chars |
| business_permit_image | file | Yes | Image, max 5MB |
| face_scan_data | file | Yes | Image, max 5MB |
| license_image | file | No | Image, max 5MB |

### Session Data
- `registration_role_specific`

---

## Step 5: Vehicles

### POST Action
- **URL**: `/register/vehicles`
- **Method**: POST

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| vehicles | array | Yes | Min 1, max 3 |
| vehicles[].vehicle_type_id | integer | Yes | Must exist |
| vehicles[].plate_number | string | No | Max 20 chars (required if vehicle type has plate number) |

### Session Data
- `registration_vehicles`

---

## Step 6: Credentials

### POST Action
- **URL**: `/register/credentials`
- **Method**: POST

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email, unique in users table |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 number |
| password_confirmation | string | Yes | Must match password |

### Partial Save (Debounced)
- **URL**: `/register/credentials/save`
- **Method**: POST
- Saves email, password, password_confirmation to session as user types

### Session Data
- `registration_email`
- `registration_password`
- `registration_password_confirmation`

### Creates Pending Registration
- Stores all collected data in `pending_registrations` table
- Generates 6-digit verification code
- Sends verification email

---

## Step 7: Email Verification

### Verify Code
- **URL**: `/register/verify`
- **Method**: POST
- **Rate Limit**: 10 attempts per minute

### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| code | string | Yes | 6-digit code |

### Success Behavior
- Mark email as verified in pending_registrations
- If approval required: redirect to pending-approval page
- If auto-approve: create user and vehicles, redirect to login

### Resend Code
- **URL**: `/register/resend-code`
- **Method**: POST
- **Rate Limit**: 3 requests per minute

---

## Image/File Security
- Files stored in private disk (`storage/app/private/registrations/`)
- Served via signed URLs with session validation
- Directory traversal prevention on file access

## Session Management
- All registration data stored in session
- Session cleared on:
  - Registration completion
  - Exiting registration flow (via ClearRegistrationSession middleware)
  - Navigating away from /register without completing
