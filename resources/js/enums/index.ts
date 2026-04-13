// Must match app/Enums/UserRole.php - update both when changing
export const UserRole = {
    ADMINISTRATOR: 'Administrator',
    STUDENT: 'Student',
    STAFF: 'Staff',
    STAKEHOLDER: 'Stakeholder',
    SECURITY_PERSONNEL: 'Security Personnel',
    REPORTER: 'Reporter',
    DEPARTMENT_OFFICER: 'Department Officer',
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
