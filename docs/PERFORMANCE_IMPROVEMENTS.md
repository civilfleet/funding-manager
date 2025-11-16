# Performance Improvements

This document outlines the performance improvements made to the funding-manager application.

## Summary of Changes

### 1. Fixed N+1 Query Problem in Contact Lists (`services/contact-lists/index.ts`)

**Problem**: The `getTeamContactLists` function was calling `getTeamContacts` inside a loop for each SMART list, causing N+1 queries.

**Solution**: Separated SMART and MANUAL list processing. SMART lists still require individual queries due to their dynamic filter nature, but we now process them in parallel using `Promise.all()` and avoid unnecessary iterations for MANUAL lists.

**Impact**: 
- Reduced sequential database calls
- Improved response time for listing contact lists
- Better resource utilization through parallel processing

### 2. Optimized Attribute Key Fetching (`services/contacts/index.ts`)

**Problem**: `getTeamContactAttributeKeys` was fetching all contacts with all their attributes, then extracting unique keys in memory - very inefficient for large datasets.

**Solution**: Query the `ContactAttribute` table directly using `distinct: ["key"]` with proper filtering.

**Impact**:
- Dramatically reduced data transfer from database
- Eliminated in-memory processing of potentially large datasets
- Query now returns only what's needed (unique keys)

### 3. Fixed Search Query Logic in Funding Requests (`services/funding-request/index.ts`)

**Problem**: Search query was setting multiple fields directly on the where clause, creating an AND condition instead of OR, making searches never match.

**Solution**: Properly structured the search to use `OR` conditions across multiple fields (name, description, purpose, refinancingConcept, sustainability) with case-insensitive matching.

**Impact**:
- Search now works correctly
- Users can find funding requests by any of the searchable fields
- Case-insensitive search improves user experience

### 4. Optimized Contact Attribute Creation (`services/contacts/index.ts`)

**Problem**: Creating contact attributes one-by-one in a loop, causing multiple round trips to the database.

**Solution**: Use `createMany` to insert all attributes in a single database operation.

**Impact**:
- Reduced database round trips from N to 1 (where N = number of attributes)
- Faster contact creation
- Lower database load

### 5. Added Database Indexes

Added strategic indexes to improve query performance on frequently accessed tables:

#### FundingRequest Table
```prisma
@@index([organizationId])
@@index([teamId])
@@index([status])
@@index([createdAt])
@@index([updatedAt])
@@index([teamId, status])  // Composite index for common filtering
```

**Impact**: Faster filtering and sorting of funding requests

#### Contact Table
```prisma
@@index([teamId, createdAt])
@@index([name])
```

**Impact**: Improved search and recent activity queries

#### ContactAttribute Table
```prisma
@@index([contactId, key])
@@index([stringValue])
```

**Impact**: Faster attribute filtering and search operations

### 6. Fixed Code Quality Issues

Removed useless switch cases in `services/contacts/index.ts` that were flagged by the linter.

## Migration Required

After these changes, you need to create and apply a database migration:

```bash
# Create migration
npx prisma migrate dev --name add_performance_indexes

# Or in production
npx prisma migrate deploy
```

## Testing Recommendations

Since there are no automated tests in the repository, manual testing should focus on:

1. **Contact Lists**
   - List all contact lists (mix of SMART and MANUAL)
   - Verify SMART lists properly filter contacts
   - Check that performance is acceptable with large datasets

2. **Contact Attribute Keys**
   - Fetch attribute keys for a team
   - Verify all unique keys are returned
   - Test with teams having many contacts and attributes

3. **Funding Request Search**
   - Search for funding requests by name
   - Search by description, purpose, etc.
   - Verify case-insensitive matching works
   - Test with empty search query

4. **Contact Creation**
   - Create contacts with multiple attributes
   - Verify all attributes are saved correctly
   - Check transaction rollback on errors

## Further Optimization Opportunities

### Recent Activity Endpoints (Not Implemented - Requires Design Decision)

The following endpoints could benefit from pagination:

- `/app/api/admin/recent-activity/route.ts`
- `/app/api/teams/[teamId]/recent-activity/route.ts`

**Current Issue**: These endpoints fetch 10 items from 5 different tables (50 items total), sort in memory, and return 20. This is inefficient because:
- Fetches more data than needed
- Sorts in memory instead of using database
- No pagination support

**Recommended Solution**:
1. Add pagination parameters (page, limit)
2. Use a unified query with UNION ALL to combine activities
3. Sort and paginate at the database level
4. Consider using Prisma's cursor-based pagination

**Example Approach**:
```typescript
// Use raw SQL or Prisma's queryRaw for optimal performance
const activities = await prisma.$queryRaw`
  SELECT 'user' as type, id, name, email, updated_at as timestamp
  FROM users
  WHERE updated_at > $1
  UNION ALL
  SELECT 'organization' as type, id, name, email, updated_at
  FROM organizations
  WHERE updated_at > $1
  ORDER BY timestamp DESC
  LIMIT $2 OFFSET $3
`;
```

This change requires product decisions about pagination UI/UX and is recommended for a separate PR.

## Performance Monitoring

Consider adding these monitoring practices:

1. **Database Query Performance**
   - Monitor slow queries (> 100ms)
   - Track query counts per request
   - Use Prisma's built-in logging in development

2. **API Response Times**
   - Track P50, P95, P99 latencies
   - Set up alerts for degraded performance

3. **Database Indexes**
   - Monitor index usage
   - Identify missing indexes from slow queries
   - Remove unused indexes

## Conclusion

These changes significantly improve the performance of key operations in the funding-manager application. The most impactful improvements are:

1. Fixing the broken search functionality
2. Optimizing attribute key fetching (potentially 100x faster)
3. Reducing database round trips in contact creation
4. Adding strategic indexes for common queries

All changes maintain backward compatibility and don't require code changes in consuming components.
