
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

## CRITICAL: Correct Loading Screen Animation

### The Working Animation Specification
The loading screen MUST display:
1. **Static asterisk** - positioned at 12-degree tilt (same as app icon)
2. **Blue highlighting arms** - animate clockwise around the asterisk
3. **Size**: 200x200 viewport
4. **Position**: Fixed center of screen with red background
5. **Arms**: 4 arms + 1 period, each with individual blue highlighting

### Correct SVG Structure
```jsx
<svg width="200" height="200" viewBox="0 0 200 200">
  <g transform="translate(100, 100) rotate(12)">
    {/* Right arm (0 degrees) */}
    <path d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" fill="white" className="arm-right" />
    
    {/* Bottom-right diagonal arm (72 degrees) */}
    <g transform="rotate(72)">
      <path d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" fill="white" className="arm-bottom-right" />
    </g>
    
    {/* Bottom-left diagonal arm (144 degrees) */}
    <g transform="rotate(144)">
      <path d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" fill="white" className="arm-bottom-left" />
    </g>
    
    {/* Top-left diagonal arm (216 degrees) */}
    <g transform="rotate(216)">
      <path d="M 2 0 Q 18 -10 34 -5 Q 38 0 34 5 Q 18 10 2 0" fill="white" className="arm-top-left" />
    </g>
    
    {/* Period positioned at 288 degrees */}
    <circle cx="7.5" cy="-20" r="8" fill="white" className="period" />
  </g>
</svg>
```

### CSS Animation Classes
```css
/* Each arm highlights in sequence - clockwise */
.arm-right { animation: highlight 2s infinite 0s; }
.arm-bottom-right { animation: highlight 2s infinite 0.4s; }
.arm-bottom-left { animation: highlight 2s infinite 0.8s; }
.arm-top-left { animation: highlight 2s infinite 1.2s; }
.period { animation: highlight 2s infinite 1.6s; }

@keyframes highlight {
  0%, 80% { fill: white; }
  20%, 60% { fill: #3b82f6; }
}
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
- [ ] Animation shows clockwise blue highlighting
- [ ] Asterisk remains stationary at 12-degree tilt
- [ ] Size is 200x200 viewport
