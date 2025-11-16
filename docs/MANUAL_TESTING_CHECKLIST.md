# Manual Testing Checklist

This checklist outlines manual testing steps to validate the performance improvements.

## Prerequisites

1. Database must be running with proper migrations applied:
   ```bash
   npx prisma migrate dev --name add_performance_indexes
   ```

2. Application should be running:
   ```bash
   yarn dev
   ```

## Test Cases

### 1. Contact Lists (services/contact-lists/index.ts)

#### Test 1.1: List all contact lists
- **Action**: Navigate to contact lists page
- **Expected**: All contact lists (both SMART and MANUAL) are displayed
- **Verify**: Response time is reasonable (< 2 seconds for typical dataset)

#### Test 1.2: SMART list filtering
- **Action**: View a SMART list with filters
- **Expected**: Only contacts matching the filters are shown
- **Verify**: Contacts are filtered correctly based on list criteria

#### Test 1.3: Mixed list types
- **Setup**: Create both SMART and MANUAL lists
- **Action**: List all contact lists
- **Expected**: Both types render correctly with proper counts
- **Verify**: Manual lists don't trigger extra queries

### 2. Contact Attribute Keys (services/contacts/index.ts)

#### Test 2.1: Fetch attribute keys
- **Action**: Access any feature that lists available contact attribute keys
- **Expected**: All unique attribute keys are returned
- **Verify**: No duplicate keys, sorted alphabetically

#### Test 2.2: Large dataset performance
- **Setup**: Create contacts with various attributes
- **Action**: Fetch attribute keys multiple times
- **Expected**: Response time should be fast (< 500ms)
- **Verify**: Check browser network tab - response should be small

### 3. Funding Request Search (services/funding-request/index.ts)

#### Test 3.1: Search by name
- **Setup**: Create funding requests with distinct names
- **Action**: Search for a funding request by name
- **Expected**: Matching requests are returned
- **Verify**: Case-insensitive search works (e.g., "test" finds "Test")

#### Test 3.2: Search by description
- **Action**: Search using text from description field
- **Expected**: Requests with matching description are found
- **Verify**: Partial matches work

#### Test 3.3: Search by other fields
- **Action**: Search using text from purpose, refinancingConcept, or sustainability
- **Expected**: Requests are found when any field matches
- **Verify**: All searchable fields are working

#### Test 3.4: Case sensitivity
- **Action**: Search with mixed case (e.g., "TeSt")
- **Expected**: Results match regardless of case
- **Verify**: Case-insensitive search is working

#### Test 3.5: Empty search
- **Action**: Submit empty search query
- **Expected**: All funding requests are returned (or filtered by other criteria)
- **Verify**: No errors occur

### 4. Contact Creation (services/contacts/index.ts)

#### Test 4.1: Create contact with attributes
- **Setup**: Prepare contact data with multiple attributes (3-5)
- **Action**: Create the contact
- **Expected**: Contact is created successfully with all attributes
- **Verify**: 
  - All attributes are saved
  - Single database transaction is used
  - Check database logs for createMany call

#### Test 4.2: Create contact with many attributes
- **Setup**: Prepare contact with 10+ attributes
- **Action**: Create the contact
- **Expected**: Contact creation is fast (< 1 second)
- **Verify**: Performance improvement over sequential creates

#### Test 4.3: Transaction rollback
- **Setup**: Create contact with invalid attribute data
- **Action**: Attempt to create contact
- **Expected**: Entire transaction rolls back, no partial data saved
- **Verify**: Database consistency is maintained

### 5. Database Indexes

#### Test 5.1: Funding request filtering
- **Action**: Filter funding requests by status and teamId
- **Expected**: Fast query execution
- **Verify**: Check query plan or logs to confirm index usage

#### Test 5.2: Contact search
- **Action**: Search contacts by name
- **Expected**: Fast search results
- **Verify**: Name index is being used

#### Test 5.3: Recent activity
- **Action**: Load recent funding requests (by updatedAt)
- **Expected**: Fast loading
- **Verify**: updatedAt index is being used

## Performance Metrics to Track

### Response Times (Target)
- Contact lists: < 2 seconds
- Attribute keys: < 500ms
- Funding request search: < 1 second
- Contact creation: < 1 second

### Database Queries
- Contact lists: Should see reduction in sequential queries
- Attribute keys: Single query instead of full contact fetch
- Contact creation: Single createMany instead of N creates

## Regression Testing

Ensure no existing functionality is broken:

1. **Contact Management**
   - Create, read, update, delete contacts
   - Contact attributes work correctly
   - Group permissions are respected

2. **Funding Requests**
   - Create, read, update funding requests
   - Status transitions work
   - File uploads work

3. **Contact Lists**
   - Create, update, delete lists
   - Add/remove contacts from lists
   - SMART list filters work

4. **Authentication & Authorization**
   - User permissions are respected
   - Team-based access control works
   - Group-based contact visibility works

## Known Limitations

1. **Recent Activity Endpoints**: These were NOT optimized in this PR as they require pagination strategy decisions. They still work but could be improved in a future PR.

## Reporting Issues

If you find any issues during testing:

1. Note the exact steps to reproduce
2. Include error messages or unexpected behavior
3. Check browser console and server logs
4. Document expected vs actual results

## Database Migration Notes

After applying the schema changes, you may want to:

1. **Analyze Index Usage** (PostgreSQL):
   ```sql
   SELECT * FROM pg_stat_user_indexes 
   WHERE schemaname = 'public' 
   ORDER BY idx_scan DESC;
   ```

2. **Check Index Size**:
   ```sql
   SELECT indexrelname, pg_size_pretty(pg_relation_size(indexrelid))
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public'
   ORDER BY pg_relation_size(indexrelid) DESC;
   ```

3. **Monitor Slow Queries**:
   Enable slow query logging to identify any remaining performance issues.
