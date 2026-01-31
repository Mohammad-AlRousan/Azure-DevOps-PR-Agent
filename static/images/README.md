# Extension Images

This directory contains the images used by the Azure DevOps PR Agent extension.

## Required Images

### Extension Icons
- `logo.png` (128x128) - Main extension logo
- `logo-dev.png` (128x128) - Development version logo

### Action Icons
- `review-icon.png` (16x16) - Code review action icon
- `improve-icon.png` (16x16) - Improvement suggestions action icon
- `tests-icon.png` (16x16) - Test suggestions action icon
- `compliance-icon.png` (16x16) - Compliance check action icon
- `security-icon.png` (16x16) - Security scan action icon

### Widget Icons
- `widget-icon.png` (32x32) - Dashboard widget icon
- `widget-preview.png` (330x160) - Widget preview image

## Image Guidelines

### Format
- Use PNG format for all images
- Ensure transparency where appropriate
- Optimize file sizes for web delivery

### Design
- Follow Azure DevOps design guidelines
- Use consistent color scheme (#0078d4 primary)
- Ensure icons are readable at small sizes
- Maintain visual consistency across all icons

### Accessibility
- Provide sufficient contrast
- Ensure icons are recognizable without color
- Test at different zoom levels

## Creating Images

You can create these images using:
- Adobe Illustrator/Photoshop
- Figma
- Canva
- GIMP (free alternative)

## Placeholder Images

For development, you can use simple colored rectangles or text-based placeholders until proper icons are designed.

Example placeholder creation with CSS:
```css
.placeholder-icon {
  width: 32px;
  height: 32px;
  background: #0078d4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 4px;
}
```
