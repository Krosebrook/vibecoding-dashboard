# Visual Pattern Builder

## Overview

The Visual Pattern Builder is a comprehensive drag-and-drop interface for creating custom visual patterns and design systems for dashboard backgrounds, textures, and decorative elements.

## Features

### 🎨 AI-Powered Pattern Generation
- Describe patterns in natural language
- GPT-4o generates patterns based on your descriptions
- Automatically creates optimized element compositions
- Examples:
  - "Futuristic circuit board pattern with neon blue lines"
  - "Organic flowing waves with sunset gradient colors"
  - "Geometric hexagon grid with subtle glow effects"

### 🧩 14 Pattern Element Types

1. **Rectangle** - Basic rectangular shapes with adjustable corner radius
2. **Circle** - Perfect circles for dots and organic patterns
3. **Triangle** - Geometric triangular elements
4. **Line** - Straight lines with customizable thickness
5. **Grid** - Regular grid patterns with adjustable spacing
6. **Dots** - Dot matrix patterns with density control
7. **Waves** - Smooth wave patterns with amplitude and frequency controls
8. **Gradient** - Linear and radial gradients with multiple color stops
9. **Noise** - Procedural noise textures for depth
10. **Stripes** - Diagonal stripe patterns
11. **Chevron** - Zigzag chevron designs
12. **Hexagon** - Honeycomb hexagonal grids
13. **Star** - Scattered star fields
14. **Spiral** - Hypnotic spiral vortex patterns

### 🎛️ Advanced Controls

Each element supports:
- **Position** (X, Y coordinates)
- **Size** (Width & Height)
- **Rotation** (0-360°)
- **Opacity** (0-100%)
- **Color** (oklch format support)
- **Blend Mode** (12 modes: normal, multiply, screen, overlay, etc.)
- **Z-Index** (layer ordering)
- **Scale** (10-200%)
- **Type-Specific Properties** (spacing, amplitude, frequency, etc.)

### 📐 Pattern Templates

10 pre-configured templates to start from:
- Geometric Grid
- Dot Matrix
- Wave Flow
- Gradient Mesh
- Diagonal Stripes
- Hexagon Grid
- Starfield
- Noise Texture
- Chevron Pattern
- Spiral Vortex

### 💾 Data Persistence
- Save unlimited patterns locally
- Load saved patterns instantly
- Pattern history with undo/redo
- Export patterns as:
  - **CSS** - Ready-to-use CSS with base64-encoded background
  - **JSON** - Full pattern configuration for backup/sharing

### 🎯 Real-Time Preview
- Live canvas rendering
- Instant updates as you adjust properties
- Visual layer management
- Element stacking visualization

## Usage

### Creating a New Pattern

1. Click "Create New Pattern" or select a template
2. Add elements using the element picker
3. Adjust properties in the element editor
4. Arrange layers with move up/down controls
5. Fine-tune with sliders and color pickers

### Using AI Generation

1. Enter a natural language description
2. Click "Generate with AI"
3. Review and refine the generated pattern
4. Customize elements as needed

### Exporting Patterns

**Export as CSS:**
```css
/* Your Pattern Name */
.pattern-your-pattern {
  background-color: oklch(0.15 0.01 260);
  background-image: url('data:image/png;base64,...');
  background-repeat: repeat;
  background-size: 400px 400px;
}
```

**Export as JSON:**
```json
{
  "id": "pattern-1234567890",
  "name": "My Custom Pattern",
  "description": "A beautiful geometric pattern",
  "width": 400,
  "height": 400,
  "backgroundColor": "oklch(0.15 0.01 260)",
  "elements": [...]
}
```

## Element Type Reference

### Grid
- **spacing**: Distance between grid lines (5-100px)
- **lineWidth**: Thickness of grid lines (1-10px)

### Dots
- **spacing**: Distance between dots (5-100px)
- **dotSize**: Radius of each dot (1-20px)

### Waves
- **amplitude**: Wave height (5-100px)
- **frequency**: Number of wave cycles (1-10)
- **phase**: Wave offset angle (0-360°)

### Stripes
- **spacing**: Distance between stripes (10-100px)
- **thickness**: Width of each stripe (1-50px)

### Hexagon
- **size**: Hexagon radius (10-100px)
- **spacing**: Gap between hexagons (0-30px)
- **strokeWidth**: Line thickness (1-10px)

### Star
- **count**: Number of stars (5-100)
- **minSize**: Minimum star size (1-20px)
- **maxSize**: Maximum star size (1-30px)

### Spiral
- **turns**: Number of spiral rotations (1-20)
- **lineWidth**: Spiral line thickness (1-10px)

### Noise
- **scale**: Noise intensity (0.1-1.0)

## Blend Modes

- **normal**: Standard blending
- **multiply**: Darkens by multiplying colors
- **screen**: Lightens by inverting and multiplying
- **overlay**: Combines multiply and screen
- **darken**: Keeps darker of two colors
- **lighten**: Keeps lighter of two colors
- **color-dodge**: Brightens colors
- **color-burn**: Darkens colors
- **hard-light**: Strong overlay effect
- **soft-light**: Gentle overlay effect
- **difference**: Subtracts colors
- **exclusion**: Similar to difference but softer

## Tips & Best Practices

### Performance
- Keep element count under 20 for optimal performance
- Use blend modes sparingly (they're computationally expensive)
- Noise textures should use low opacity (10-20%)

### Design
- Start with a template and customize
- Layer elements with different opacities for depth
- Use complementary blend modes for interesting effects
- Combine gradients with geometric patterns
- Test patterns at different scales

### Color Selection
- Use oklch color format for perceptual uniformity
- Maintain contrast between background and elements
- Consider color blindness accessibility
- Test patterns in both light and dark contexts

### Composition
- Balance busy patterns with simple elements
- Use the rule of thirds for element placement
- Vary element sizes for visual interest
- Group related elements by z-index

## Integration with Dashboards

Patterns created in the Visual Pattern Builder can be:
1. **Exported as CSS** and applied to dashboard backgrounds
2. **Used as card backgrounds** for visual hierarchy
3. **Applied to sections** for content separation
4. **Layered behind charts** for subtle branding
5. **Used as loading states** with animation

## Keyboard Shortcuts

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z`: Redo
- `Delete`: Delete selected element
- `Ctrl/Cmd + D`: Duplicate selected element
- `Ctrl/Cmd + S`: Save pattern

## API Integration

Patterns are stored using the Spark KV persistence API:
- `current-pattern`: Active pattern being edited
- `saved-patterns`: Array of saved pattern configs

## Future Enhancements

- SVG pattern export
- Pattern animation timeline
- Gradient editor UI
- Pattern marketplace/sharing
- Real-time collaboration
- More element types (polygons, bezier curves)
- Pattern tiling preview modes
- Accessibility contrast checker
