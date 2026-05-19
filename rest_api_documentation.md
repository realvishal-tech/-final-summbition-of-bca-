# REST API Documentation - BCA Study Hub

## Overview

Complete REST API specification for BCA Study Hub platform, including authentication, attendance, AI chat, and content management endpoints.

**Base URL**: `https://api.bcastudy.hub/api/v1`  
**Content-Type**: `application/json`  
**Authentication**: Bearer Token (JWT)

---

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "status": 200,
  "message": "Success",
  "data": {},
  "timestamp": "2026-05-12T10:30:00Z"
}
```

### Response Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 408 | Timeout - Request took too long |
| 500 | Internal Error - Server error |
| 503 | Service Unavailable - Server down |

---

## Authentication Endpoints

### Login
```
POST /auth/login
```

**Request**:
```json
{
  "email": "student@example.com",
  "password": "secure_password"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "userId": "user_123",
    "email": "student@example.com",
    "role": "student",
    "expiresIn": 3600
  }
}
```

---

### Register
```
POST /auth/register
```

**Request**:
```json
{
  "email": "newstudent@example.com",
  "password": "secure_password",
  "fullName": "John Doe",
  "rollNumber": "BCA001",
  "semester": 5
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "userId": "user_456",
    "email": "newstudent@example.com",
    "message": "Registration successful. Please verify your email."
  }
}
```

---

### Logout
```
POST /auth/logout
```

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Get Profile
```
GET /auth/profile
```

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "email": "student@example.com",
    "fullName": "John Doe",
    "rollNumber": "BCA001",
    "semester": 5,
    "joinedAt": "2026-01-15T00:00:00Z",
    "avatar": "https://..."
  }
}
```

---

### Update Profile
```
PUT /auth/profile
```

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "fullName": "John Updated",
  "avatar": "https://..."
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully"
  }
}
```

---

## Attendance Endpoints

### Create Session
```
POST /attendance/sessions
```

**Headers**: `Authorization: Bearer {token}` (Admin only)

**Request**:
```json
{
  "subject": "Web Development",
  "teacher": "Dr. Smith",
  "batch": "Batch A",
  "semester": 5,
  "durationMinutes": 15
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "sessionId": "sess_abc123",
    "subject": "Web Development",
    "status": "active",
    "expiresAt": "2026-05-12T11:15:00Z",
    "qrCode": "https://api.../qr/sess_abc123",
    "attendanceLink": "https://bcastudy.hub/attendance/live/sess_abc123"
  }
}
```

---

### Get Sessions
```
GET /attendance/sessions?status=active&limit=10&offset=0
```

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | `active`, `expired`, or `all` |
| limit | integer | Results per page (default: 20) |
| offset | integer | Pagination offset (default: 0) |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "sess_abc123",
        "subject": "Web Development",
        "status": "active",
        "submissionCount": 35,
        "expiresAt": "2026-05-12T11:15:00Z"
      }
    ],
    "total": 50,
    "limit": 10,
    "offset": 0
  }
}
```

---

### Get Specific Session
```
GET /attendance/sessions/{sessionId}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "sess_abc123",
    "subject": "Web Development",
    "teacher": "Dr. Smith",
    "batch": "Batch A",
    "semester": 5,
    "status": "active",
    "createdAt": "2026-05-12T10:00:00Z",
    "expiresAt": "2026-05-12T11:15:00Z",
    "submissions": 35,
    "attendancePercentage": 87.5
  }
}
```

---

### Submit Attendance
```
POST /attendance/submit
```

**Request**:
```json
{
  "sessionId": "sess_abc123",
  "fullName": "John Doe",
  "rollNumber": "BCA001",
  "registrationNumber": "123456",
  "semester": 5
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "submissionId": "sub_xyz789",
    "sessionId": "sess_abc123",
    "message": "Attendance marked successfully",
    "submittedAt": "2026-05-12T10:05:30Z"
  }
}
```

---

### Get Session Submissions
```
GET /attendance/sessions/{sessionId}/submissions?limit=100
```

**Headers**: `Authorization: Bearer {token}` (Admin or session creator)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "rollNumber": "BCA001",
        "fullName": "John Doe",
        "submittedAt": "2026-05-12T10:05:30Z",
        "device": "Chrome Mobile"
      }
    ],
    "total": 35,
    "attendancePercentage": 87.5
  }
}
```

---

### Get Session Analytics
```
GET /attendance/sessions/{sessionId}/analytics
```

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "sess_abc123",
    "totalSubmissions": 35,
    "expectedAttendees": 40,
    "attendancePercentage": 87.5,
    "deviceDistribution": {
      "mobile": 28,
      "desktop": 7
    },
    "submissionTimeline": [
      { "minute": 0, "count": 12 },
      { "minute": 5, "count": 18 }
    ]
  }
}
```

---

### End Session
```
POST /attendance/sessions/{sessionId}/end
```

**Headers**: `Authorization: Bearer {token}` (Admin only)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "sess_abc123",
    "status": "expired",
    "message": "Session ended successfully"
  }
}
```

---

## AI Endpoints

### Send Message
```
POST /ai/chat
```

**Headers**: `Authorization: Bearer {token}` (optional)

**Request**:
```json
{
  "message": "Explain closures in JavaScript",
  "context": {
    "language": "javascript",
    "level": "intermediate"
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "response": "Closures are functions that have access to variables from their outer scope...",
    "type": "explanation",
    "sources": ["mdn", "javascript.info"]
  }
}
```

---

### Get Suggestions
```
GET /ai/suggestions?topic=closures&language=javascript
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| topic | string | Topic to get suggestions for |
| language | string | Programming language (optional) |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "Learn about scope chains",
      "Practice with callback functions",
      "Study lexical environment"
    ]
  }
}
```

---

### Code Review
```
POST /ai/code-review
```

**Request**:
```json
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "review": "Good function, consider adding type hints or JSDoc comments",
    "issues": [],
    "suggestions": ["Add JSDoc", "Consider error handling"]
  }
}
```

---

### Get Chat History
```
GET /ai/history?limit=50
```

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "type": "user",
        "text": "Explain closures",
        "timestamp": "2026-05-12T10:00:00Z"
      },
      {
        "id": "msg_124",
        "type": "assistant",
        "text": "Closures are...",
        "timestamp": "2026-05-12T10:00:05Z"
      }
    ],
    "total": 50
  }
}
```

---

## Content Endpoints

### Get Subjects
```
GET /content/subjects
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "subjects": [
      {
        "subjectId": "subj_001",
        "name": "Web Development",
        "chapters": 12,
        "progress": 45
      }
    ]
  }
}
```

---

### Get Chapters
```
GET /content/subjects/{subjectId}/chapters
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "chapters": [
      {
        "chapterId": "ch_001",
        "title": "HTML Basics",
        "lessons": 8,
        "completed": 5
      }
    ]
  }
}
```

---

### Search Content
```
GET /content/search?query=closures&type=lesson
```

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | Search query |
| type | string | `lesson`, `note`, or `all` |
| subject | string | Filter by subject (optional) |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "lesson_123",
        "title": "Understanding Closures",
        "type": "lesson",
        "subject": "JavaScript Fundamentals"
      }
    ],
    "total": 5
  }
}
```

---

## Admin Endpoints

### Get All Users
```
GET /admin/users?role=student&semester=5&limit=20
```

**Headers**: `Authorization: Bearer {admin_token}`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| role | string | `student`, `teacher`, or `admin` |
| semester | integer | Filter by semester |
| limit | integer | Results per page |
| offset | integer | Pagination offset |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "user_001",
        "email": "student@example.com",
        "role": "student",
        "semester": 5,
        "joinedAt": "2026-01-15T00:00:00Z"
      }
    ],
    "total": 150
  }
}
```

---

### Get Analytics
```
GET /admin/analytics?startDate=2026-05-01&endDate=2026-05-12
```

**Headers**: `Authorization: Bearer {admin_token}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalUsers": 500,
    "activeUsers": 350,
    "sessionsCreated": 45,
    "totalAttendance": 1250,
    "averageAttendanceRate": 82.5,
    "dailyData": [
      {
        "date": "2026-05-12",
        "sessions": 5,
        "submissions": 85
      }
    ]
  }
}
```

---

## Error Handling

All errors follow the same format:

```json
{
  "success": false,
  "status": 400,
  "message": "Invalid email format",
  "data": null,
  "timestamp": "2026-05-12T10:30:00Z"
}
```

### Common Errors

| Status | Message | Cause |
|--------|---------|-------|
| 400 | Invalid email format | Malformed email in request |
| 401 | Missing authentication token | No Bearer token provided |
| 403 | Insufficient permissions | Token doesn't have required role |
| 404 | Session not found | Invalid sessionId |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Internal server error | Server error |

---

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Webhooks

Optional webhook support for real-time events:

```
POST {your_webhook_url}
```

**Webhook Types**:
- `attendance.submitted`
- `session.created`
- `session.ended`
- `user.registered`

---

## Code Examples

### JavaScript/Fetch

```javascript
async function submitAttendance(sessionId, data) {
  const response = await fetch('/api/v1/attendance/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      sessionId,
      ...data
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Attendance submitted:', result.data);
  } else {
    console.error('Error:', result.message);
  }
}
```

### Using REST API Client

```javascript
const response = await AttendanceEndpoints.submitAttendance(apiClient, {
  sessionId: 'sess_abc123',
  fullName: 'John Doe',
  rollNumber: 'BCA001',
  registrationNumber: '123456',
  semester: 5
});

if (response.success) {
  console.log('Success:', response.data);
}
```

---

## Status and Health Endpoints

### Health Check
```
GET /health
```

**Response** (200):
```json
{
  "status": "healthy",
  "uptime": 99.95,
  "timestamp": "2026-05-12T10:30:00Z"
}
```

### API Status
```
GET /status
```

**Response** (200):
```json
{
  "status": "operational",
  "version": "1.0.0",
  "lastUpdate": "2026-05-12T10:00:00Z"
}
```

---

## Changelog

### v1.0.0 (Current)
- Initial REST API release
- Authentication endpoints
- Attendance management
- AI chat integration
- Content management
- Admin analytics
- User management

---

## Support & Contact

- **Documentation**: https://docs.bcastudy.hub
- **Status Page**: https://status.bcastudy.hub
- **Support Email**: api-support@bcastudy.hub
- **Issues**: https://github.com/bcastudy/api-issues

---

**Last Updated**: May 12, 2026  
**API Version**: 1.0.0  
**Status**: Production Ready ✅
