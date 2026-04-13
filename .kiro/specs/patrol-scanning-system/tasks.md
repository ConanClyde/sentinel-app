# Implementation Plan: Patrol Scanning System

## Overview

This implementation plan converts the Patrol Scanning System design into actionable coding tasks. The system enables Security Personnel to check in at patrol points by scanning QR codes, with check-ins recorded in the database and displayed in a history interface. The implementation follows the existing Laravel + React (Inertia.js) architecture and leverages the established MapLocation infrastructure.

## Tasks

- [x] 1. Create database migration and PatrolLog model
  - [x] 1.1 Create patrol_logs table migration
    - Create migration file with `php artisan make:migration create_patrol_logs_table`
    - Define table schema with columns: id, security_user_id, map_location_id, checked_in_at, notes, timestamps
    - Add foreign key constraints for security_user_id (references users.id) and map_location_id (references map_locations.id) with CASCADE on delete
    - Add indexes on security_user_id, map_location_id, and checked_in_at for query performance
    - Run migration with `php artisan migrate`
    - _Requirements: 1.1, 1.7_

  - [x] 1.2 Create PatrolLog Eloquent model
    - Create model file at `app/Models/PatrolLog.php`
    - Define fillable attributes: security_user_id, map_location_id, checked_in_at, notes
    - Add datetime cast for checked_in_at field
    - Define belongsTo relationship to User named securityUser (foreign key: security_user_id)
    - Define belongsTo relationship to MapLocation named location (foreign key: map_location_id)
    - _Requirements: 1.2, 1.3, 1.4, 1.7_

  - [x] 1.3 Write unit tests for PatrolLog model
    - Test fillable attributes are correctly defined
    - Test checked_in_at datetime casting
    - Test securityUser relationship returns User instance
    - Test location relationship returns MapLocation instance
    - _Requirements: 1.2, 1.3, 1.4_

- [x] 2. Update User and MapLocation models with relationships
  - [x] 2.1 Add patrolLogs relationship to User model
    - Open `app/Models/User.php`
    - Add hasMany relationship method named patrolLogs returning PatrolLog collection (foreign key: security_user_id)
    - _Requirements: 1.5_

  - [x] 2.2 Add patrolLogs relationship to MapLocation model
    - Open `app/Models/MapLocation.php`
    - Add hasMany relationship method named patrolLogs returning PatrolLog collection
    - _Requirements: 1.6_

  - [x] 2.3 Write unit tests for model relationships
    - Test User->patrolLogs returns PatrolLog collection
    - Test MapLocation->patrolLogs returns PatrolLog collection
    - Test relationship queries work correctly
    - _Requirements: 1.5, 1.6_

- [x] 3. Implement backend API endpoints for check-in
  - [x] 3.1 Add checkIn method to SecurityController
    - Open `app/Http/Controllers/Security/SecurityController.php`
    - Create checkIn(Request $request) method returning JsonResponse
    - Validate request: map_location_id (required, numeric, exists in map_locations), notes (nullable, string, max 1000 chars)
    - Query MapLocation by map_location_id and verify is_active is true
    - If location is inactive, return 422 error with message "This patrol point is no longer active. Please contact administration."
    - Create PatrolLog record with security_user_id (auth()->id()), map_location_id, checked_in_at (now()), and notes
    - Eager load location relationship on created PatrolLog
    - Return 201 status with success message and PatrolLog data
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 3.2 Write unit tests for checkIn method
    - Test successful check-in with valid map_location_id returns 201
    - Test check-in with invalid map_location_id returns 422 validation error
    - Test check-in with inactive location returns 422 with specific error message
    - Test check-in with notes exceeding 1000 characters returns 422
    - Test check-in without authentication returns 401
    - Test check-in by non-Security Personnel user returns 403
    - Test created PatrolLog has correct security_user_id, map_location_id, and timestamp
    - Test notes are stored correctly when provided
    - _Requirements: 2.1, 2.5, 2.6, 2.7, 9.1, 9.2, 9.3, 9.4, 10.1, 10.2, 10.3, 10.5_

- [x] 4. Implement backend API endpoint for patrol history
  - [x] 4.1 Add getHistory method to SecurityController
    - Open `app/Http/Controllers/Security/SecurityController.php`
    - Create getHistory(Request $request) method returning JsonResponse
    - Query PatrolLog where security_user_id equals auth()->id()
    - Eager load location relationship with with('location')
    - Order results by checked_in_at descending (most recent first)
    - Paginate results with 15 records per page
    - Return 200 status with paginated JSON response
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 5.2, 5.6_

  - [x] 4.2 Write unit tests for getHistory method
    - Test getHistory returns only logs for authenticated user
    - Test getHistory orders logs by checked_in_at descending
    - Test getHistory includes location relationship data
    - Test getHistory paginates with 15 records per page
    - Test getHistory returns empty array when no logs exist
    - Test getHistory without authentication returns 401
    - Test getHistory by non-Security Personnel returns 403
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 5. Add API routes with authentication and authorization
  - [x] 5.1 Register patrol API routes in routes/web.php
    - Open `routes/web.php`
    - Locate the Security Operations middleware group (role:Security Personnel)
    - Add POST route for /api/patrol/check-in pointing to SecurityController@checkIn with name 'api.patrol.check-in'
    - Add GET route for /api/patrol/history pointing to SecurityController@getHistory with name 'api.patrol.history'
    - Ensure routes are within auth and role:Security Personnel middleware groups
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.1, 8.2, 8.4_

  - [x] 5.2 Write integration tests for route authorization
    - Test unauthenticated requests to patrol endpoints return 401
    - Test non-Security Personnel requests return 403
    - Test Security Personnel can access both endpoints
    - Test routes are correctly named and accessible via route() helper
    - _Requirements: 5.3, 5.4, 8.1, 8.2, 8.4_

- [x] 6. Checkpoint - Ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement QR code parsing logic for frontend
  - [x] 7.1 Create parsePatrolQR utility function
    - Create or update utility file in `resources/js/lib/` or `resources/js/utils/`
    - Implement parsePatrolQR(rawValue: string): number | null function
    - Parse numeric ID directly (e.g., "123" returns 123)
    - Parse "PATROL_POINT:123" format by splitting on colon and extracting numeric ID
    - Return null for invalid formats or non-numeric values
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 7.2 Write unit tests for parsePatrolQR function
    - Test parsing numeric string "123" returns 123
    - Test parsing "PATROL_POINT:456" returns 456
    - Test invalid format "INVALID:ABC" returns null
    - Test non-numeric string "abc" returns null
    - Test empty string returns null
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 8. Update scan page to save check-ins to database
  - [x] 8.1 Integrate API call in scan page handleScan function
    - Open `resources/js/pages/security/scan.tsx`
    - Import parsePatrolQR utility function
    - In handleScan function, extract rawValue from QR scan result
    - Call parsePatrolQR to extract map_location_id
    - If parsing fails, display error toast "Invalid QR code format. Please scan a patrol point QR code." and return
    - Make POST request to route('api.patrol.check-in') with map_location_id and notes
    - On success (201), display success toast with location name from response.data.data.location.name
    - Clear notes field after successful check-in
    - On 422 validation error, display error message from response.data.message
    - On network error, display generic error "An error occurred while recording your check-in. Please try again."
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 10.1, 10.2, 10.4, 10.6_

  - [x] 8.2 Write integration tests for scan page check-in flow
    - Test successful QR scan triggers API call with correct map_location_id
    - Test success response displays toast with location name
    - Test notes field is cleared after successful check-in
    - Test validation error displays error message from API
    - Test network error displays generic error message
    - Test invalid QR format displays appropriate error
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 9. Update history page to display real patrol data
  - [x] 9.1 Implement data fetching in history page
    - Open `resources/js/pages/security/history.tsx`
    - Define PatrolLog TypeScript interface with id, security_user_id, map_location_id, checked_in_at, notes, and location (nested object with id, name, short_code)
    - Add state for patrol logs array, loading boolean, and pagination data
    - Create useEffect hook to fetch data on component mount
    - Make GET request to route('api.patrol.history')
    - Set loading state to true before request, false after completion
    - Store response data in patrol logs state
    - Handle pagination data from response (current_page, last_page, etc.)
    - Display loading indicator while loading is true
    - Display "No check-ins have been recorded" message when logs array is empty
    - _Requirements: 7.1, 7.2, 7.6, 7.7_

  - [x] 9.2 Render patrol logs in history interface
    - Map over patrol logs array to render each log
    - Display location.name for each patrol log
    - Format checked_in_at timestamp using date formatting library (e.g., date-fns format function) to human-readable format like "Jan 15, 2024 2:30 PM"
    - Display notes field if present, or show "No notes" placeholder
    - Ensure logs are displayed in descending chronological order (most recent first, already sorted by API)
    - _Requirements: 7.2, 7.3, 7.4_

  - [x] 9.3 Implement pagination controls
    - Add pagination UI component (buttons or page numbers)
    - Track current page in state
    - On page change, make GET request to route('api.patrol.history') with page query parameter
    - Update patrol logs state with new page data
    - Disable previous button on first page, disable next button on last page
    - _Requirements: 7.5_

  - [x] 9.4 Write integration tests for history page
    - Test data fetching on component mount
    - Test loading indicator displays while fetching
    - Test patrol logs render correctly with location name and formatted timestamp
    - Test empty state displays when no logs exist
    - Test pagination controls navigate between pages
    - Test notes display correctly when present
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 10. Final checkpoint - Ensure all tests pass and integration works
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The implementation follows existing Laravel and React patterns in the codebase
- QR code format matches the existing vehicle QR code pattern (numeric ID only)
- All API endpoints require authentication and Security Personnel role
- Frontend uses existing toast notification system (sonner) for user feedback
- Database migration should be run before model creation
- Foreign key constraints ensure data integrity and cascade deletes
