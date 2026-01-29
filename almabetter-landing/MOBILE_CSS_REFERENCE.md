# Mobile Responsive Quick Reference Guide

## Breakpoints Used

```css
/* Mobile Portrait */
@media (max-width: 600px) { }

/* Mobile Landscape / Small Tablet */
@media (max-width: 768px) { }

/* Tablet */
@media (max-width: 900px) { }

/* Desktop */
@media (max-width: 1200px) { }
```

## Key CSS Classes and Patterns

### Tables (Mobile-Friendly)
```jsx
<div style={{overflowX:'auto', WebkitOverflowScrolling:'touch'}}>
  <table style={{width:'100%', minWidth:'800px'}}>
    {/* table content */}
  </table>
</div>
```

### Responsive Buttons
```css
/* Mobile */
button {
  width: 100% !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.95rem !important;
}
```

### Responsive Cards
```css
.card {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  padding: 1rem 0.75rem !important;
}
```

### Flex Layouts
```css
/* Wrap on mobile */
.flex-container {
  flex-wrap: wrap !important;
  gap: 0.75rem !important;
}

/* Column on mobile */
.flex-container {
  flex-direction: column !important;
}
```

## Common Mobile Patterns

### 1. Full-Width Container
```css
.container {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
}
```

### 2. Touch-Friendly Spacing
```css
.element {
  padding: 0.75rem !important;
  gap: 0.75rem !important;
  margin: 0.75rem 0 !important;
}
```

### 3. Responsive Typography
```css
h1 { font-size: 1.5rem !important; }
h2 { font-size: 1.25rem !important; }
h3 { font-size: 1.1rem !important; }
p, td, th { font-size: 0.85rem - 0.95rem !important; }
```

### 4. Grid to Column
```css
.grid {
  grid-template-columns: 1fr !important;
  gap: 1rem !important;
}
```

## Component-Specific Styles

### Dashboard Hero
```css
@media (max-width: 600px) {
  .dashboard-hero {
    display: block !important;
    padding: 1rem 0.75rem !important;
    border-radius: 10px !important;
  }
}
```

### Stats Grid
```css
@media (max-width: 600px) {
  .stats-grid {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.75rem !important;
  }
}
```

### Form Controls
```css
@media (max-width: 600px) {
  .assign-controls {
    flex-direction: column !important;
    gap: 0.75rem !important;
  }
  
  select, input, button {
    width: 100% !important;
    padding: 0.75rem !important;
  }
}
```

### Tabs Navigation
```css
@media (max-width: 600px) {
  .tabs-nav {
    flex-wrap: wrap !important;
    gap: 0.5rem !important;
  }
  
  .tabs-nav button {
    flex: 1 1 auto;
    padding: 0.5rem 0.75rem !important;
    font-size: 0.85rem !important;
  }
}
```

## Testing Checklist

### Visual Testing
- [ ] Text is readable (min 14px / 0.875rem)
- [ ] Buttons are tappable (min 44x44px)
- [ ] No horizontal overflow
- [ ] Proper spacing between elements
- [ ] Images scale properly

### Interaction Testing
- [ ] Forms are easy to fill
- [ ] Buttons respond to touch
- [ ] Tables scroll smoothly
- [ ] Dropdowns work correctly
- [ ] Navigation is accessible

### Performance Testing
- [ ] Page loads quickly
- [ ] Smooth scrolling
- [ ] No layout shifts
- [ ] Touch gestures work
- [ ] Animations are smooth

## Common Issues and Fixes

### Issue: Horizontal Overflow
```css
/* Fix */
* {
  box-sizing: border-box !important;
  overflow-x: hidden !important;
}
```

### Issue: Text Too Small
```css
/* Fix */
@media (max-width: 600px) {
  body { font-size: 16px; }
  p, td, th { font-size: 0.9rem !important; }
}
```

### Issue: Buttons Too Small
```css
/* Fix */
@media (max-width: 600px) {
  button {
    min-height: 44px !important;
    padding: 0.75rem 1rem !important;
  }
}
```

### Issue: Table Not Scrolling
```css
/* Fix */
.table-container {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch !important;
}
table {
  min-width: 800px !important;
}
```

## Best Practices

1. **Mobile-First Approach:** Start with mobile styles, then add desktop
2. **Touch Targets:** Minimum 44x44px for interactive elements
3. **Readable Text:** Minimum 14px (0.875rem) font size
4. **Adequate Spacing:** Use 0.75rem - 1rem gaps
5. **Prevent Overflow:** Use box-sizing: border-box
6. **Test on Real Devices:** Emulators don't catch everything
7. **Use Relative Units:** rem, em, % instead of px
8. **Optimize Images:** Use responsive images
9. **Minimize Animations:** Keep them simple on mobile
10. **Test Touch Gestures:** Ensure swipe, pinch work correctly

## Resources

- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Google: Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
- [Can I Use: CSS Features](https://caniuse.com/)
- [WebAIM: Mobile Accessibility](https://webaim.org/articles/mobile/)
