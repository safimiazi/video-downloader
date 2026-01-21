# Backend Integration Guide

## Overview

This document explains how the Next.js frontend has been integrated with the new NestJS backend for video downloading functionality.

## Architecture Changes

### Before (Monolithic)
```
Next.js App
├── Frontend Pages
└── API Routes (/api/youtube-download)
    └── yt-dlp integration
```

### After (Microservices)
```
Next.js Frontend (Port 3000)
├── Frontend Pages
└── API calls to backend

NestJS Backend (Port 3001)
├── Modular Architecture
├── YouTube Download Feature
└── yt-dlp integration
```

## Integration Details

### Environment Configuration

The frontend now uses environment variables to connect to the backend:

**File**: `.env.local`
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### API Endpoint Changes

**Before**:
```typescript
const response = await fetch('/api/youtube-download?url=' + encodeURIComponent(url));
```

**After**:
```typescript
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const response = await fetch(`${backendUrl}/api/youtube-download?url=${encodeURIComponent(url)}`);
```

### Updated Files

1. **video-downloader/app/youtube-video-downloader/page.tsx**
   - Updated API calls to use backend URL
   - Added environment variable support
   - Maintained all existing functionality

2. **video-downloader/.env.local** (New)
   - Backend URL configuration

3. **video-downloader/app/api/youtube-download/route.ts** (Removed)
   - Old API route deleted
   - Functionality moved to NestJS backend

## Running Both Services

### 1. Start the Backend
```bash
cd video-downloader-backend
npm run start:dev
```
Backend will run on: http://localhost:3001

### 2. Start the Frontend
```bash
cd video-downloader
npm run dev
```
Frontend will run on: http://localhost:3000

## API Compatibility

The NestJS backend maintains 100% API compatibility with the original Next.js API route:

### Endpoints
- `GET /api/youtube-download` - Download videos/audio

### Parameters
- `url` (required) - YouTube video URL
- `quality` (optional) - Video quality (144-2160)
- `audioOnly` (optional) - Download audio only
- `progress` (optional) - Enable real-time progress

### Response Types
- File stream (direct download)
- JSON (fallback URLs)
- Server-Sent Events (progress updates)
- JSON (error responses)

## Benefits of Separation

### 1. **Scalability**
- Backend can be scaled independently
- Multiple frontend instances can use same backend
- Backend can serve multiple applications

### 2. **Maintainability**
- Clear separation of concerns
- Modular architecture in backend
- Independent deployment cycles

### 3. **Performance**
- Backend optimized for video processing
- Frontend optimized for user experience
- Better resource utilization

### 4. **Development**
- Teams can work independently
- Different technology stacks
- Easier testing and debugging

## Deployment Considerations

### Development
- Both services run locally
- CORS configured for localhost
- Environment variables for configuration

### Production
- Backend deployed separately (e.g., different server/container)
- Frontend updated with production backend URL
- CORS configured for production domains
- Environment variables updated accordingly

### Example Production Configuration

**Frontend (.env.production)**:
```env
NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
```

**Backend (production environment)**:
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for frontend URL
   - Check that both services are running
   - Verify environment variables

2. **Connection Refused**
   - Ensure backend is running on correct port
   - Check firewall settings
   - Verify backend URL in frontend environment

3. **API Not Found**
   - Ensure backend is built and running
   - Check API endpoint paths
   - Verify NestJS routes are registered

### Debugging Steps

1. **Check Backend Status**
   ```bash
   curl http://localhost:3001/api/youtube-download?url=test
   ```

2. **Check Frontend Environment**
   ```javascript
   console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
   ```

3. **Monitor Network Requests**
   - Open browser developer tools
   - Check Network tab for API calls
   - Verify request URLs and responses

## Future Enhancements

### Planned Improvements
1. **Authentication**: Add user authentication to backend
2. **Rate Limiting**: Implement per-user rate limiting
3. **Caching**: Add Redis caching for video metadata
4. **Monitoring**: Add logging and monitoring services
5. **Load Balancing**: Multiple backend instances

### Additional Platforms
The modular backend architecture makes it easy to add support for:
- TikTok downloads
- Facebook video downloads
- Instagram video downloads
- Twitter video downloads

Each platform will be a separate feature module following the same patterns as the YouTube download feature.

## Security Considerations

### Current Implementation
- CORS configured for specific origins
- Input validation on all parameters
- No persistent file storage
- Automatic cleanup of temporary files

### Production Recommendations
- Add rate limiting per IP
- Implement user authentication
- Add request logging and monitoring
- Use HTTPS for all communications
- Regular security updates for dependencies

## Performance Monitoring

### Key Metrics to Monitor
- Download success rate
- Average download time
- Server response times
- Error rates by type
- Concurrent download capacity

### Logging
Both services provide comprehensive logging:
- Request/response details
- Download progress and completion
- Error details with stack traces
- Performance metrics

## Support

For issues related to the integration:
1. Check this documentation
2. Review backend logs
3. Check frontend console for errors
4. Verify environment configuration
5. Test API endpoints directly