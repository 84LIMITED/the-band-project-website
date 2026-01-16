# Next.js 15 Upgrade Notes

## Changes Made

### 1. Package Updates
- **Next.js**: `14.2.0` → `15.1.0`
- **React**: `18.3.0` → `19.0.0`
- **React DOM**: `18.3.0` → `19.0.0`
- **TypeScript**: `5.3.0` → `5.6.0`
- **ESLint Config**: `14.2.0` → `15.1.0`

### 2. Breaking Changes Addressed

#### React 19 Compatibility
- All components using hooks are properly marked with `'use client'`
- Server components (layout, pages without client features) remain server components
- No React 19-specific API changes needed for this codebase

#### Next.js 15 Changes
- **Metadata API**: Already using the correct format (no changes needed)
- **Route Handlers**: Already using async/await correctly
- **Image Optimization**: Not using Next.js Image component (using native HTML5 video)
- **Turbopack**: Optional, can be enabled with `--turbo` flag

### 3. Date Handling Fixes
- Fixed invalid date parsing in `ShowCard.tsx`
- Added time format conversion (12-hour to 24-hour)
- Added date validation throughout the app
- Fixed calendar link generation to handle edge cases

### 4. Error Handling Improvements
- Added try-catch blocks around date operations
- Added validation for invalid dates in sorting
- Graceful fallbacks for calendar generation

## Testing Checklist

After upgrading, test:

- [ ] Home page loads correctly
- [ ] Shows page displays all shows
- [ ] Show cards display dates correctly
- [ ] "Add to Calendar" button works
- [ ] Contact form submits successfully
- [ ] Media drawer opens and closes
- [ ] Navigation works on mobile and desktop
- [ ] API routes return correct data
- [ ] Build completes without errors: `npm run build`
- [ ] Production build runs: `npm start`

## Known Issues

None currently. All issues have been addressed.

## Migration Path

If you encounter issues:

1. **Clear cache**: `rm -rf .next node_modules package-lock.json`
2. **Reinstall**: `npm install`
3. **Rebuild**: `npm run build`

## Next Steps

1. Test locally with `npm run dev`
2. Test production build with `npm run build && npm start`
3. Deploy to AWS Amplify when ready
