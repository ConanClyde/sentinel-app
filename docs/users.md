# Users

## User Roles

The system supports 7 user roles:

| Role | Value | Requires Approval | Has Vehicles | Description |
|------|-------|-------------------|--------------|-------------|
| Administrator | `Administrator` | No | No | System administrator |
| Department | `Department` | No | No | Department staff |
| Student | `Student` | Yes | Yes | Registered student |
| Staff | `Staff` | Yes | Yes | Registered staff |
| Security | `Security` | No | No | Security personnel |
| Reporter | `Reporter` | No | No | Report generator |
| Stakeholder | `Stakeholder` | Yes | Yes | External stakeholder |

**Note:** Only Student, Staff, and Stakeholder roles go through vehicle registration during signup.

---

## Role Sub-types (Role Types)

### Department
| Name | Description |
|------|-------------|
| Chancellor | Chancellor of the institution |
| SAS | Student Affairs & Services |
| Security Department | Security Department |
| Marketing Department | Marketing Department |
| DRRM | Disaster Risk Reduction and Management |
| Planning Department | Planning Department |
| Auxiliary Services | Auxiliary Services |

### Reporter
| Name | Has Vehicles | Description |
|------|--------------|-------------|
| SBO | No | Student Body Organization |
| DRRM Facilitator | No | DRRM Facilitator |
| SAS Facilitator | No | SAS Facilitator |
| Security Personnel | Yes | Security Personnel Reporter |

**Note:** Reporter is the only main role that has sub-types (4 types above). Other main roles (Department, Stakeholder) also have their own sub-types. Only Security Personnel (Reporter) has vehicles among the reporter sub-types.

### Stakeholder
| Name | Description |
|------|-------------|
| Guardian | Parent/Guardian of student |
| Service Provider | External service provider |
| Visitor | Visitor to campus |

---

## User Fields

### Common Fields (All Roles)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| first_name | string | Yes | First name |
| middle_name | string | No | Middle name |
| surname | string | Yes | Last name |
| name_extension | string | No | Jr, Sr, I, II, III, IV |
| name | string | No | Full name (computed) |
| email | string | Yes | Email address (unique) |
| password | string | Yes | Hashed password |
| role | string | Yes | User role (UserRole enum) |
| role_type_id | integer | No | Reference to role_types table |
| face_scan_data | string | No | Path to face scan image |
| license_image | string | No | Path to license image |

### Student Specific
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| college_id | integer | No | Reference to colleges |
| program_id | integer | No | Reference to programs |
| student_id | string | No | Student ID number |
| student_id_image | string | No | Path to student ID image |

### Staff Specific
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| staff_id | string | No | Staff ID number |

### Stakeholder Specific
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| stakeholder_type | string | No | Type of stakeholder |

### Common Optional
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| license_number | string | No | Driver's license number |

---

## User Model Relationships

### BelongsTo
- `roleType` - RoleType (via role_type_id)
- `college` - College (for students)
- `program` - Program (for students)
- `approvedBy` - User (who approved this user)

### HasMany
- `vehicles` - Vehicle (registered vehicles)
- `reports` - Report (reports created by user)

---

## User Helper Methods

```php
$user->isAdministrator()
$user->isStudent()
$user->isStaff()
$user->isStakeholder()
$user->isGuardian()
$user->isSecurity()
$user->isReporter()
$user->isDepartment()
$user->role         // Returns UserRole enum
$user->roleName     // Returns role display name
```

---

## Registration Flow by Role

### Self-Registering (Requires Approval)
- **Student**: Register + vehicles + email verification + admin approval
- **Staff**: Register + vehicles + email verification + admin approval
- **Stakeholder**: Register + vehicles + email verification + admin approval

### Admin-Created (No Approval Needed)
- Administrator
- Department
- Security
- Reporter
