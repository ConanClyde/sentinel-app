# Requirements Document

## Introduction

The Patrol Scanning System enables Security Personnel to check in at designated patrol points throughout the MLUC campus by scanning QR codes. The system records check-in timestamps, locations, and optional notes, providing accountability and tracking for security patrols. This feature integrates with the existing Laravel + React (Inertia.js) application and leverages existing MapLocation infrastructure.

## Glossary

- **Patrol_System**: The patrol scanning and tracking system
- **Security_Personnel**: Users with the Security Personnel role who perform campus patrols
- **Patrol_Point**: A MapLocation designated as a patrol checkpoint with an associated QR code
- **Check_In**: A recorded event when Security Personnel scan a QR code at a Patrol Point
- **Patrol_Log**: Database record of a Check_In event
- **QR_Code**: Quick Response code displayed at Patrol Points containing the map_location_id
- **Scan_Interface**: The /patrol-scan page where Security Personnel scan QR codes
- **History_Interface**: The /patrol-history page displaying past Check_In records
- **Administrator**: Users with the Administrator role who can view all patrol logs

## Requirements

### Requirement 1: Database Schema and Models

**User Story:** As a developer, I want a proper database schema and Eloquent models, so that patrol check-ins can be stored and retrieved efficiently.

#### Acceptance Criteria

1. THE Patrol_System SHALL create a patrol_logs table with columns: id (bigint PK auto-increment), security_user_id (bigint FK to users), map_location_id (bigint FK to map_locations), checked_in_at (datetime), notes (text nullable), created_at (timestamp), updated_at (timestamp)
2. THE Patrol_System SHALL create a PatrolLog Eloquent model with fillable attributes: security_user_id, map_location_id, checked_in_at, notes
3. THE PatrolLog model SHALL define a belongsTo relationship to User named securityUser
4. THE PatrolLog model SHALL define a belongsTo relationship to MapLocation named location
5. THE User model SHALL define a hasMany relationship to PatrolLog named patrolLogs
6. THE MapLocation model SHALL define a hasMany relationship to PatrolLog named patrolLogs
7. THE PatrolLog model SHALL cast checked_in_at as datetime

### Requirement 2: QR Code Check-In Recording

**User Story:** As Security Personnel, I want to scan QR codes at patrol points, so that my check-ins are recorded with timestamps.

#### Acceptance Criteria

1. WHEN Security Personnel scan a QR code containing a map_location_id, THE Patrol_System SHALL create a Patrol_Log record with the authenticated user's ID, the map_location_id, and the current timestamp
2. WHEN a Check_In is recorded, THE Patrol_System SHALL automatically set checked_in_at to the current datetime
3. WHERE Security Personnel provide optional notes during Check_In, THE Patrol_System SHALL store the notes in the Patrol_Log record
4. WHEN a Check_In is successfully recorded, THE Patrol_System SHALL return a success response with the created Patrol_Log data
5. IF the map_location_id from the QR code does not exist in the database, THEN THE Patrol_System SHALL return a validation error indicating invalid patrol point
6. IF the map_location is_active flag is false, THEN THE Patrol_System SHALL return a validation error indicating inactive patrol point
7. IF the authenticated user does not have the Security Personnel role, THEN THE Patrol_System SHALL return a 403 Forbidden error

### Requirement 3: QR Code Format and Parsing

**User Story:** As a developer, I want a standardized QR code format, so that patrol points can be reliably identified.

#### Acceptance Criteria

1. THE Patrol_System SHALL accept QR codes in the format "PATROL_POINT:{map_location_id}" where map_location_id is a numeric identifier
2. THE Patrol_System SHALL accept QR codes containing only a numeric map_location_id
3. WHEN parsing a QR code with "PATROL_POINT:" prefix, THE Patrol_System SHALL extract the numeric map_location_id following the colon
4. WHEN parsing a QR code containing only digits, THE Patrol_System SHALL treat the entire value as the map_location_id
5. IF the QR code format is invalid or cannot be parsed, THEN THE Patrol_System SHALL return a validation error indicating invalid QR code format

### Requirement 4: Patrol History Retrieval

**User Story:** As Security Personnel, I want to view my patrol history, so that I can review my past check-ins.

#### Acceptance Criteria

1. WHEN Security Personnel request their patrol history, THE Patrol_System SHALL return only Patrol_Log records where security_user_id matches the authenticated user's ID
2. THE Patrol_System SHALL order patrol history by checked_in_at in descending order (most recent first)
3. THE Patrol_System SHALL include the related MapLocation name in each Patrol_Log record
4. THE Patrol_System SHALL include the checked_in_at timestamp in each Patrol_Log record
5. THE Patrol_System SHALL include the notes field in each Patrol_Log record
6. THE Patrol_System SHALL paginate patrol history results with 15 records per page
7. WHEN no patrol history exists for the user, THE Patrol_System SHALL return an empty result set

### Requirement 5: API Endpoints

**User Story:** As a frontend developer, I want RESTful API endpoints, so that the React interface can interact with the patrol system.

#### Acceptance Criteria

1. THE Patrol_System SHALL provide a POST endpoint at /api/patrol/check-in that accepts map_location_id and optional notes
2. THE Patrol_System SHALL provide a GET endpoint at /api/patrol/history that returns paginated patrol history for the authenticated user
3. THE Patrol_System SHALL require authentication for all patrol API endpoints
4. THE Patrol_System SHALL apply the Security Personnel role middleware to all patrol API endpoints
5. WHEN a POST request to /api/patrol/check-in is successful, THE Patrol_System SHALL return HTTP 201 status with the created Patrol_Log
6. WHEN a GET request to /api/patrol/history is successful, THE Patrol_System SHALL return HTTP 200 status with paginated results
7. IF validation fails on any endpoint, THEN THE Patrol_System SHALL return HTTP 422 status with validation error messages

### Requirement 6: Frontend Integration - Scan Interface

**User Story:** As Security Personnel, I want the scan interface to save my check-ins to the database, so that my patrols are tracked.

#### Acceptance Criteria

1. WHEN Security Personnel scan a QR code on the Scan_Interface, THE Patrol_System SHALL send a POST request to /api/patrol/check-in with the extracted map_location_id
2. WHEN a Check_In is successfully saved, THE Scan_Interface SHALL display a success message showing the patrol point name and timestamp
3. IF a Check_In fails due to validation errors, THEN THE Scan_Interface SHALL display the error message to the user
4. IF a Check_In fails due to network errors, THEN THE Scan_Interface SHALL display a generic error message
5. WHERE Security Personnel enter notes before scanning, THE Scan_Interface SHALL include the notes in the POST request
6. WHEN a success message is displayed, THE Scan_Interface SHALL clear the notes field for the next scan

### Requirement 7: Frontend Integration - History Interface

**User Story:** As Security Personnel, I want to see my real patrol history from the database, so that I can verify my check-ins.

#### Acceptance Criteria

1. WHEN Security Personnel navigate to the History_Interface, THE Patrol_System SHALL fetch patrol history from /api/patrol/history
2. THE History_Interface SHALL display each Patrol_Log with the patrol point name, check-in timestamp, and notes
3. THE History_Interface SHALL format check-in timestamps in a human-readable format (e.g., "Jan 15, 2024 2:30 PM")
4. THE History_Interface SHALL display patrol logs in descending chronological order (most recent first)
5. THE History_Interface SHALL implement pagination controls for navigating through patrol history
6. WHEN no patrol history exists, THE History_Interface SHALL display a message indicating no check-ins have been recorded
7. WHEN patrol history is loading, THE History_Interface SHALL display a loading indicator

### Requirement 8: Authorization and Security

**User Story:** As a system administrator, I want proper authorization controls, so that only authorized users can access patrol features.

#### Acceptance Criteria

1. THE Patrol_System SHALL verify the authenticated user has the Security Personnel role before allowing Check_In operations
2. THE Patrol_System SHALL verify the authenticated user has the Security Personnel role before returning patrol history
3. THE Patrol_System SHALL ensure Security Personnel can only view their own patrol history
4. THE Patrol_System SHALL prevent users without the Security Personnel role from accessing /patrol-scan and /patrol-history routes
5. THE Patrol_System SHALL validate that security_user_id in Patrol_Log records matches the authenticated user's ID
6. WHERE an Administrator views patrol logs, THE Patrol_System SHALL allow access to all Patrol_Log records (future enhancement placeholder)

### Requirement 9: Data Validation

**User Story:** As a developer, I want comprehensive input validation, so that invalid data cannot be stored in the database.

#### Acceptance Criteria

1. WHEN receiving a Check_In request, THE Patrol_System SHALL validate that map_location_id is required and numeric
2. WHEN receiving a Check_In request, THE Patrol_System SHALL validate that map_location_id exists in the map_locations table
3. WHEN receiving a Check_In request, THE Patrol_System SHALL validate that the referenced MapLocation has is_active set to true
4. WHERE notes are provided in a Check_In request, THE Patrol_System SHALL validate that notes do not exceed 1000 characters
5. THE Patrol_System SHALL validate that security_user_id references a valid user in the users table (enforced by foreign key constraint)
6. THE Patrol_System SHALL validate that checked_in_at is a valid datetime value

### Requirement 10: Error Handling and User Feedback

**User Story:** As Security Personnel, I want clear error messages, so that I understand what went wrong when a check-in fails.

#### Acceptance Criteria

1. IF a QR code contains an invalid map_location_id, THEN THE Patrol_System SHALL return the error message "Invalid patrol point. Please scan a valid QR code."
2. IF a QR code references an inactive patrol point, THEN THE Patrol_System SHALL return the error message "This patrol point is no longer active. Please contact administration."
3. IF a user without Security Personnel role attempts a Check_In, THEN THE Patrol_System SHALL return the error message "Unauthorized. Only Security Personnel can check in at patrol points."
4. IF the QR code format cannot be parsed, THEN THE Patrol_System SHALL return the error message "Invalid QR code format. Please scan a patrol point QR code."
5. IF notes exceed the maximum length, THEN THE Patrol_System SHALL return the error message "Notes cannot exceed 1000 characters."
6. IF a database error occurs during Check_In, THEN THE Patrol_System SHALL log the error and return a generic error message "An error occurred while recording your check-in. Please try again."
