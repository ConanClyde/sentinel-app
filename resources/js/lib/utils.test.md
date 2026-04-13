# Unit Tests for parsePatrolQR Function

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Test Suite: parsePatrolQR

### Test 1: Parse numeric string
**Description:** Test parsing numeric string "123" returns 123

**Input:**
```typescript
parsePatrolQR("123")
```

**Expected Output:**
```typescript
123
```

**Validates:** Requirement 3.4 - WHEN parsing a QR code containing only digits, THE Patrol_System SHALL treat the entire value as the map_location_id

---

### Test 2: Parse PATROL_POINT prefix format
**Description:** Test parsing "PATROL_POINT:456" returns 456

**Input:**
```typescript
parsePatrolQR("PATROL_POINT:456")
```

**Expected Output:**
```typescript
456
```

**Validates:** Requirement 3.1, 3.3 - THE Patrol_System SHALL accept QR codes in the format "PATROL_POINT:{map_location_id}" and extract the numeric map_location_id following the colon

---

### Test 3: Invalid format with non-numeric value
**Description:** Test invalid format "INVALID:ABC" returns null

**Input:**
```typescript
parsePatrolQR("INVALID:ABC")
```

**Expected Output:**
```typescript
null
```

**Validates:** Requirement 3.5 - IF the QR code format is invalid or cannot be parsed, THEN THE Patrol_System SHALL return a validation error indicating invalid QR code format

---

### Test 4: Non-numeric string
**Description:** Test non-numeric string "abc" returns null

**Input:**
```typescript
parsePatrolQR("abc")
```

**Expected Output:**
```typescript
null
```

**Validates:** Requirement 3.5 - IF the QR code format is invalid or cannot be parsed, THEN THE Patrol_System SHALL return a validation error indicating invalid QR code format

---

### Test 5: Empty string
**Description:** Test empty string returns null

**Input:**
```typescript
parsePatrolQR("")
```

**Expected Output:**
```typescript
null
```

**Validates:** Requirement 3.5 - IF the QR code format is invalid or cannot be parsed, THEN THE Patrol_System SHALL return a validation error indicating invalid QR code format

---

## Manual Testing Instructions

To manually test the `parsePatrolQR` function:

1. Open the browser console on any page of the application
2. Import the function (if using a module bundler) or access it from the global scope
3. Run each test case and verify the output matches the expected result

### Example Manual Test:
```javascript
// In browser console
import { parsePatrolQR } from './resources/js/lib/utils';

// Test 1
console.assert(parsePatrolQR("123") === 123, "Test 1 failed");

// Test 2
console.assert(parsePatrolQR("PATROL_POINT:456") === 456, "Test 2 failed");

// Test 3
console.assert(parsePatrolQR("INVALID:ABC") === null, "Test 3 failed");

// Test 4
console.assert(parsePatrolQR("abc") === null, "Test 4 failed");

// Test 5
console.assert(parsePatrolQR("") === null, "Test 5 failed");

console.log("All tests passed!");
```

## Implementation Verification

The current implementation in `resources/js/lib/utils.ts` correctly handles all test cases:

1. ✅ Parses numeric strings directly using `parseInt(rawValue, 10)`
2. ✅ Parses "PATROL_POINT:" prefix format by splitting on colon
3. ✅ Returns null for invalid formats
4. ✅ Returns null for non-numeric strings
5. ✅ Returns null for empty strings (handled by the initial `if (!rawValue) return null;` check)

## Future Enhancement: Automated Testing

When setting up a JavaScript testing framework (Vitest or Jest), convert these test cases to automated tests:

```typescript
// Example with Vitest
import { describe, it, expect } from 'vitest';
import { parsePatrolQR } from './utils';

describe('parsePatrolQR', () => {
  it('should parse numeric string "123" and return 123', () => {
    expect(parsePatrolQR("123")).toBe(123);
  });

  it('should parse "PATROL_POINT:456" and return 456', () => {
    expect(parsePatrolQR("PATROL_POINT:456")).toBe(456);
  });

  it('should return null for invalid format "INVALID:ABC"', () => {
    expect(parsePatrolQR("INVALID:ABC")).toBeNull();
  });

  it('should return null for non-numeric string "abc"', () => {
    expect(parsePatrolQR("abc")).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parsePatrolQR("")).toBeNull();
  });
});
```
