# Video Downloader

A production-ready web application for downloading videos from multiple platforms including YouTube, TikTok, Facebook, Instagram, and Twitter.

## Features

- ✅ **Multi-Platform Support**: YouTube, TikTok, Facebook, Instagram, and Twitter
- ✅ **Full Download Support**: YouTube (full), Facebook (direct), TikTok (direct), Instagram (limited), Twitter (limited)
- ✅ **Multiple Quality Options**: Choose from available video qualities
- ✅ **Modern UI**: Beautiful, responsive design with dark mode support
- ✅ **Fast & Efficient**: Built with Next.js 14+ and optimized for performance
- ✅ **Production Ready**: Error handling, validation, and security measures included
- ✅ **Universal Streaming**: Handles different video formats and platforms

## Tech Stack

- **Frontend**: Next.js 14+, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Video Processing**: ytdl-core, axios, cheerio
- **Deployment**: Vercel, Netlify, or any Node.js hosting

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd video-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

Add this to `.env.local`:
```env
YTDL_NO_UPDATE=1
NODE_ENV=development
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Testing

Test the YouTube API functionality:
```bash
# Visit http://localhost:3000/api/test-youtube
# This will test if YouTube downloads are working
```

Test other platforms:
```bash
# Test Facebook
# Visit http://localhost:3000/api/test-platforms?platform=facebook&url=YOUR_FACEBOOK_URL

# Test TikTok  
# Visit http://localhost:3000/api/test-platforms?platform=tiktok&url=YOUR_TIKTOK_URL
```

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## Usage

1. Paste a video URL from supported platforms
2. Click "Get Video" to fetch video information
3. Choose your preferred quality
4. Click download button to save the video

## Supported Platforms

- **YouTube**: Full support with multiple quality options ✅
- **Facebook**: Direct video download support ✅
- **TikTok**: Direct video download support ✅
- **Instagram**: Limited support (some videos may require login) ⚠️
- **Twitter**: Limited support (API restrictions) ⚠️

## API Endpoints

### POST /api/download
Fetch video information and metadata

**Request:**
```json
{
  "url": "https://youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Video Title",
    "thumbnail": "https://...",
    "duration": "180",
    "author": "Channel Name",
    "formats": [...]
  }
}
```

### GET /api/stream
Stream and download video

**Query Parameters:**
- `url`: Video URL (required)
- `quality`: Quality preference (default: "highest")

## Important Notes

### Legal Compliance

- This tool is for personal use only
- Respect copyright laws and platform terms of service
- Do not use for commercial purposes without proper authorization
- Users are responsible for their usage

### Platform Limitations

- **YouTube**: Fully functional with ytdl-core
- **Other Platforms**: Require additional API integrations or third-party services
- Some platforms have rate limiting and anti-scraping measures

### Enhancing Other Platforms

To add full download support for TikTok, Facebook, etc., you can:

1. Use RapidAPI services (e.g., TikTok Downloader API)
2. Implement platform-specific APIs
3. Use third-party download services

Example integration in `app/api/download/route.ts`:

```typescript
// Add RapidAPI integration
const options = {
  method: 'GET',
  url: 'https://tiktok-downloader.p.rapidapi.com/',
  params: { url: videoUrl },
  headers: {
    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
    'X-RapidAPI-Host': 'tiktok-downloader.p.rapidapi.com'
  }
};
```

## Performance Optimization

- Video streaming instead of full download
- Efficient caching strategies
- CDN integration for static assets
- Rate limiting to prevent abuse

## Security Features

- URL validation
- CORS configuration
- Error handling
- Input sanitization

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API endpoint specifications

## Roadmap

- [ ] Add batch download support
- [ ] Implement download history
- [ ] Add playlist support for YouTube
- [ ] Integrate more platforms
- [ ] Add video format conversion
- [ ] Implement user accounts
- [ ] Add download queue management

---

Built with ❤️ using Next.js and TypeScript
