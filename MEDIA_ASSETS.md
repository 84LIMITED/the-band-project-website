# Media Assets Guide

This guide explains where to place your images, videos, and poster files.

## 📁 Directory Structure

```
/public
  /video          # Video files (MP4 format)
  /images         # Image files (JPG, PNG, WebP)
    the-band-project-logo.png  # Header logo (REQUIRED)
  /posters        # Video poster images (JPG, PNG)
```

## 🎥 Video Files

### Required Videos

Place these files in `/public/video/`:

1. **Hero Video** (`hero.mp4`)
   - Used on the home page hero section (desktop version)
   - **Recommended specs:**
     - Resolution: 1920x1080 (1080p)
     - Format: MP4 (H.264 codec)
     - Duration: 10-30 seconds (loops automatically)
     - File size: Keep under 10MB if possible

2. **Hero Video - Mobile/Low-Res** (`hero-mobile.mp4` or `hero-low-res.mp4`)
   - Optional: Smaller version for mobile devices
   - **Recommended specs:**
     - Resolution: 1280x720 (720p) or 854x480 (480p)
     - Format: MP4 (H.264 codec)
     - Duration: Same as desktop version
     - File size: Keep under 5MB
   - **Naming:** Use `hero-mobile.mp4` or `hero-low-res.mp4` (both work)
   - **Note:** If not provided, the desktop version will be used for all devices

3. **Highlight Videos** (Multiple videos)
   - Used in the highlights carousel on the home page
   - **Naming options:**
     - **Option 1 (Simple):** `highlights-1.mp4`, `highlights-2.mp4`, `highlights-3.mp4`, etc.
     - **Option 2 (Descriptive):** `live-performance.mp4`, `studio-session.mp4`, `behind-scenes.mp4`, etc.
   - **Recommended specs:**
     - Resolution: 1280x720 (720p)
     - Format: MP4 (H.264 codec)
     - Duration: 30-60 seconds each
     - File size: Keep under 15MB each
   - **Important:** After adding videos, update `/content/media.json` to reference them (see "Updating Content Files" section below)

4. **Additional Videos**
   - Add any other videos you want in the media drawer
   - Update `/content/media.json` with video metadata

### Video Optimization Tips

- **Compress videos** before uploading:
  - Use tools like HandBrake, FFmpeg, or online compressors
  - Target: 2-5 Mbps bitrate for good quality/size balance
- **Multiple resolutions** (optional):
  - Create desktop (1080p), tablet (720p), and mobile (480p) versions
  - Update code to use responsive video sources
- **Poster images** are required for each video (see below)

## 🖼️ Poster Images

### Required Posters

Place these files in `/public/posters/`:

1. **Hero Poster** (`hero-poster.jpg`)
   - Shown before hero video loads
   - **Recommended specs:**
     - Resolution: 1920x1080 (matches video aspect ratio)
     - Format: JPG or WebP
     - File size: Under 500KB
     - **Important:** This is the first image users see - make it impactful!

2. **Video Posters**
   - Create a poster for each video
   - **Recommended specs:**
     - Resolution: 1280x720 (16:9 aspect ratio)
     - Format: JPG or WebP
     - File size: Under 300KB

### Poster Image Tips

- Use a **frame from the video** that represents the content well
- Ensure **high contrast** for text readability if text overlays are used
- **Optimize images** using tools like:
  - ImageOptim (Mac)
  - TinyPNG / TinyJPG (online)
  - Squoosh (Google)

## 📸 Image Files

### Required Images

Place these files in `/public/images/`:

1. **Logo** (`the-band-project-logo.png`)
   - Used in the header navigation
   - **Recommended specs:**
     - Format: PNG with transparent background (or white logo on transparent)
     - Resolution: 400x120px minimum (2x for retina: 800x240px)
     - Aspect ratio: Approximately 3:1 (width:height)
     - File size: Under 100KB
   - **Important:** This file is required for the header to display correctly
   - The logo should be white text on transparent background (or black background) to match the site's black/white theme

1. **Gallery Images** (for Background page)
   - Add 6+ images for the photo gallery
   - **Recommended specs:**
     - Resolution: 1200x1200 (square) or 1920x1080 (landscape)
     - Format: JPG or WebP
     - File size: Under 500KB each
   - **Update code:** Edit `/app/background/page.tsx` to reference your images

2. **Thumbnail Images** (for media carousel)
   - Create thumbnails for videos
   - **Recommended specs:**
     - Resolution: 640x360 (16:9 aspect ratio)
     - Format: JPG or WebP
     - File size: Under 100KB

3. **Gear Images** (optional, for Gear page)
   - Images of instruments, equipment, merchandise
   - **Recommended specs:**
     - Resolution: 800x800 (square) or 1200x800 (landscape)
     - Format: JPG or WebP
     - File size: Under 300KB each

### Image Optimization Tips

- **Use WebP format** for better compression (browsers that support it)
- **Responsive images:** Consider creating multiple sizes:
  - Thumbnail: 400x400
  - Medium: 800x800
  - Large: 1200x1200
- **Alt text:** Always add descriptive alt text in code for accessibility

## 📝 Updating Content Files

### Update Media JSON

Edit `/content/media.json` to add your highlight videos. Each video needs an entry with:
- `id`: Unique identifier (e.g., "media-1", "media-2")
- `title`: Display title for the video
- `type`: "video" or "image"
- `url`: Path to your video file (e.g., "/video/highlights-1.mp4")
- `thumbnail`: Path to thumbnail image (e.g., "/images/highlights-1-thumb.jpg")
- `description`: Optional description text

**Example with numbered naming:**
```json
[
  {
    "id": "media-1",
    "title": "Live Performance Highlights",
    "type": "video",
    "url": "/video/highlights-1.mp4",
    "thumbnail": "/images/highlights-1-thumb.jpg",
    "description": "Highlights from recent live performances"
  },
  {
    "id": "media-2",
    "title": "Studio Session",
    "type": "video",
    "url": "/video/highlights-2.mp4",
    "thumbnail": "/images/highlights-2-thumb.jpg",
    "description": "Behind the scenes studio recording"
  }
]
```

**Example with descriptive naming:**
```json
[
  {
    "id": "media-1",
    "title": "Live Performance Highlights",
    "type": "video",
    "url": "/video/live-performance.mp4",
    "thumbnail": "/images/live-performance-thumb.jpg",
    "description": "Highlights from recent live performances"
  },
  {
    "id": "media-2",
    "title": "Studio Session",
    "type": "video",
    "url": "/video/studio-session.mp4",
    "thumbnail": "/images/studio-session-thumb.jpg",
    "description": "Behind the scenes studio recording"
  }
]
```

### Update Shows JSON

Edit `/content/shows.json` with your actual show data (or use DynamoDB in production).

## ✅ Checklist

Before deploying, ensure:

- [ ] Logo (`/public/images/the-band-project-logo.png`) exists
- [ ] Hero video (`/public/video/hero.mp4`) exists
- [ ] Hero poster (`/public/posters/hero-poster.jpg`) exists
- [ ] All videos have corresponding poster images
- [ ] Images are optimized (reasonable file sizes)
- [ ] `/content/media.json` is updated with your media
- [ ] Gallery images are added to `/public/images/`
- [ ] All image paths in code match your file names

## 🚀 Performance Tips

1. **Lazy loading:** Videos (except hero) are lazy-loaded automatically
2. **CDN:** In production, serve media from CloudFront CDN for faster delivery
3. **Compression:** Always compress media before uploading
4. **Format:** Use MP4 for videos, WebP for images (with JPG fallback)

## 📦 File Size Guidelines

| Asset Type | Recommended Size | Max Size |
|------------|------------------|----------|
| Hero Video | 5-10 MB | 15 MB |
| Other Videos | 10-20 MB | 30 MB |
| Hero Poster | 200-500 KB | 1 MB |
| Gallery Images | 200-400 KB | 800 KB |
| Thumbnails | 50-100 KB | 200 KB |

**Note:** Smaller file sizes = faster page loads = better user experience!
