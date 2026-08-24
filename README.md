## YouTube API Integration

CreatorIQ now supports real YouTube API integration for synchronizing
public YouTube video analytics into the PostgreSQL database.

### YouTube Integration Workflow

YouTube API
↓
YouTube Service
↓
Data Transformation
↓
Duplicate Check
↓
PostgreSQL
↓
Analytics Service
↓
FastAPI Analytics APIs

### YouTube Data Synchronization

The application provides:

POST /social/youtube/sync

The API accepts a YouTube video ID and creator ID, fetches the video
information using the YouTube Data API v3, transforms the response into
the common CreatorIQ content format, and stores the data in PostgreSQL.

### Common CreatorIQ Data Format

YouTube data is transformed into:

- Platform
- External content ID
- Content title
- Views
- Likes
- Comments
- Shares
- Saves
- Watch time
- Reach
- Published date

### Duplicate Synchronization

Duplicate YouTube content is prevented using:

platform + external_content_id

If the content already exists, the existing PostgreSQL record is updated
instead of creating a duplicate record.

### Error Handling

The YouTube integration handles:

- Invalid video IDs
- Missing API credentials
- API request failures
- API quota or permission errors
- Empty API responses
- Unexpected API errors

### Analytics Integration

After synchronization, YouTube data is available to the existing
analytics APIs.

The application uses the same analytics service for YouTube data rather
than implementing separate YouTube-specific analytics logic.

Available analytics APIs include:

- GET /analytics/summary
- GET /analytics/top-content
- GET /analytics/platform-comparison
- GET /analytics/chart/engagement
- GET /analytics/chart/followers

### Testing

The YouTube synchronization workflow was tested using Swagger.

Testing verified:

1. YouTube data can be fetched successfully.
2. Data is stored in PostgreSQL.
3. Existing YouTube records are updated during repeated synchronization.
4. Duplicate records are not created.
5. Analytics APIs reflect the synchronized YouTube data.
6. PostgreSQL records were verified using pgAdmin.

### Security

YouTube API credentials are stored in the local `.env` file.

API keys, passwords, tokens, and other confidential credentials are not
committed to GitHub.

The `.env` file is excluded through `.gitignore`.
## Sprint 6 – Revenue Analytics & Sponsorship Tracking

CreatorIQ now supports revenue management, sponsorship tracking, and
revenue analytics for creators.

### Revenue Management

The application provides CRUD APIs for creator revenue records.

Supported revenue sources include:

- Sponsorships
- Ad Revenue
- Affiliate Marketing
- Brand Collaborations
- Subscription Revenue

Revenue records contain:

- Creator ID
- Revenue source
- Amount
- Description
- Revenue date

### Revenue APIs

Available Revenue APIs include:

- POST /revenue/
- GET /revenue/
- GET /revenue/{revenue_id}
- PUT /revenue/{revenue_id}
- DELETE /revenue/{revenue_id}

### Revenue Analytics

The application provides revenue analytics APIs for:

- Total revenue
- Revenue by source
- Monthly revenue
- Revenue trends

These APIs provide dashboard-ready revenue information for creators.

### Sponsorship Management

CreatorIQ supports complete sponsorship record management.

Sponsorship records contain:

- Creator ID
- Brand name
- Campaign
- Contract value
- Start date
- End date
- Status
- Payment status

### Sponsorship APIs

Available Sponsorship APIs include:

- POST /sponsorships/
- GET /sponsorships/
- GET /sponsorships/{sponsorship_id}
- PUT /sponsorships/{sponsorship_id}
- DELETE /sponsorships/{sponsorship_id}

### Creator Data Ownership

Revenue and sponsorship APIs verify creator ownership before
allowing access to individual creator records.

Creators can access only their own revenue and sponsorship data.

Unauthorized access attempts are rejected by the API.

### Database Integration

Revenue and sponsorship data are stored in PostgreSQL.

The following tables are available:

- revenue
- sponsorships

Alembic is used for database schema migration and version tracking.

Current Alembic revision:

18bb2b761651

The database was verified using pgAdmin.

### API Validation and Testing

The Revenue and Sponsorship APIs were tested using Swagger.

Testing covered:

1. Successful revenue creation.
2. Revenue retrieval.
3. Revenue update.
4. Revenue deletion.
5. Successful sponsorship creation.
6. Sponsorship retrieval.
7. Sponsorship update.
8. Sponsorship deletion.
9. Invalid revenue amounts.
10. Invalid creator IDs.
11. Invalid sponsorship contract values.
12. Missing required sponsorship fields.
13. Creator ownership validation.
14. PostgreSQL data verification.

All tested operations returned the expected results.

### Alembic Migration

Sprint 6 includes Alembic database migrations for revenue,
sponsorship, and related schema changes.

Migration revisions:

- 4adf27b62789 – add revenue and sponsorship tables
- 18bb2b761651 – add content external content ID index

Alembic verification confirmed:

```text
18bb2b761651 (head)
No new upgrade operations detected.