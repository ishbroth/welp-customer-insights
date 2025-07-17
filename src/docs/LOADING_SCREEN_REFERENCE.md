
# Loading Screen Reference & Troubleshooting Guide

## Overview
This document serves as a reference for the loading screen implementation to prevent recurring issues.

## Architecture
- **LoadingProvider**: Manages global loading state
- **LoadingRoute**: Triggers page transition loading
- **LoadingScreen**: Displays the loading UI

## Common Issues & Solutions

### Issue 1: Loading Screen Never Goes Away
**Symptoms**: Loading screen stays visible indefinitely
**Cause**: Multiple LoadingRoute components mounting simultaneously or timeout not clearing
**Solution**: 
- Add `isPageLoadingRef` to prevent multiple simultaneous loads
- Check that timeouts are properly cleared
- Ensure `setIsLoading(false)` is called in timeout

### Issue 2: Loading Screen Flashing/Flickering
**Symptoms**: Loading screen appears and disappears rapidly
**Cause**: LoadingRoute triggering on every component mount instead of route change
**Solution**:
- Use `useLocation` to detect actual route changes
- Compare previous location with current location
- Only trigger loading on actual navigation

### Issue 3: Loading Screen Triggering Too Often
**Symptoms**: Loading appears on every component re-render
**Cause**: LoadingRoute not properly tracking route changes
**Solution**:
- Use `useRef` to store previous location
- Only trigger when location actually changes
- Add guards to prevent duplicate loading calls

## Key Implementation Details

### LoadingContext Guards
```typescript
// Prevent multiple simultaneous page loads
const isPageLoadingRef = useRef(false);

// Only show if not already loading
if (hasInitiallyLoaded && !isPageLoadingRef.current && !isLoading) {
  // ... trigger loading
}
```

### LoadingRoute Location Tracking
```typescript
// Track actual route changes, not component mounts
const location = useLocation();
const previousLocationRef = useRef<string>('');

useEffect(() => {
  const currentPath = location.pathname + location.search;
  if (previousLocationRef.current !== currentPath && previousLocationRef.current !== '') {
    // Only trigger on actual navigation
    showPageLoading();
  }
  previousLocationRef.current = currentPath;
}, [location.pathname, location.search, showPageLoading]);
```

## Debugging Tips
1. Check console logs for loading state changes
2. Look for multiple "📍 LoadingRoute mounted" messages (indicates rapid re-mounting)
3. Ensure timeouts are clearing properly
4. Verify location tracking is working correctly

## Testing Checklist
- [ ] Initial app load shows loading for 2 seconds
- [ ] Page transitions show loading for 0.5 seconds
- [ ] No flickering or rapid toggling
- [ ] Loading screen disappears after timeout
- [ ] Multiple rapid navigation doesn't break loading state
