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