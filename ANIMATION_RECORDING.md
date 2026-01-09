# Animation Recording Mode

## Overview

The Animation Recording Mode is a powerful feature that captures live user interactions in real-time and allows you to replay, analyze, and export them as animation sequences. This feature bridges the gap between manual interaction testing and automated animation creation.

## Key Features

### 🎥 Real-Time Interaction Capture
- Records all user interactions with configurable event types
- Captures mouse movements, clicks, scrolls, and hover events
- Timestamps each event with millisecond precision
- Non-intrusive recording that doesn't affect normal application behavior

### ⏯️ Playback Controls
- Replay recorded interactions with adjustable speed (0.25x to 4x)
- Pause, resume, and stop playback at any time
- Visual progress indicator showing playback completion
- Animated cursor display during playback for realistic reproduction

### 💾 Recording Management
- Save unlimited recordings with custom names
- View recording details including duration and event count
- Delete recordings you no longer need
- Persistent storage using the Spark KV system

### 📤 Export Options
- **JSON Format**: Complete recording data for programmatic use
- **CSV Format**: Spreadsheet-friendly format for analysis
- **React Code**: Auto-generated Framer Motion animation code

## How to Use

### Starting a Recording

1. Navigate to the **Animation** tab in the main navigation
2. Find the **Animation Recorder** card at the top of the page
3. (Optional) Enter a custom name for your recording
4. Configure which event types to capture:
   - **Record Clicks**: Captures all mouse click events
   - **Record Mouse**: Captures mouse movement (throttled to 50ms intervals)
   - **Record Scrolls**: Captures scroll position changes
   - **Record Hovers**: Captures mouse hover events over elements
5. Click **Start Recording** to begin

### During Recording

While recording is active:
- A red "Recording" badge appears at the top of the recorder card
- A live timer shows the recording duration
- Event counts are displayed in real-time
- Use the **Pause** button to temporarily halt recording
- Click **Stop** to end and save the recording

### Playing Back Recordings

1. After stopping a recording, it appears in the **Saved Recordings** section
2. Click the **Play** button on any recording to view it
3. Switch to the **Playback** tab for advanced controls:
   - Adjust playback speed using the slider
   - Toggle cursor visibility during playback
   - View detailed recording statistics
4. The playback will automatically animate through all captured events

### Exporting Recordings

1. Click the **Download** icon on any saved recording
2. Choose your export format:
   - **JSON Format**: Full event data with timestamps
   - **CSV Format**: Tabular data for Excel/Sheets
   - **React Code**: Ready-to-use Framer Motion component
3. The file will download automatically

## Technical Details

### Event Structure

Each recorded event contains:
```typescript
{
  timestamp: number        // Time in ms from recording start
  type: 'click' | 'mousemove' | 'scroll' | 'keypress' | 'hover'
  target: string          // CSS selector path to the element
  data: {
    x?: number           // Mouse X coordinate
    y?: number           // Mouse Y coordinate
    scrollX?: number     // Horizontal scroll position
    scrollY?: number     // Vertical scroll position
    elementPath?: string // Full DOM path to element
  }
}
```

### Recording Storage

Recordings are stored using the Spark KV persistence API:
- Key: `animation-recordings`
- Data structure: Array of Recording objects
- Automatically synchronized across sessions
- No size limits (within browser storage constraints)

### Performance Optimization

- Mouse movement events are throttled to 50ms intervals
- Event listeners are properly cleaned up when recording stops
- Efficient DOM path generation for element identification
- RequestAnimationFrame used for smooth timer updates

## Use Cases

### 1. User Testing Documentation
Record user interactions to:
- Document bugs with exact reproduction steps
- Create tutorials showing how to use features
- Analyze user behavior patterns

### 2. Animation Prototyping
Capture natural interactions to:
- Extract timing and easing patterns
- Convert real gestures into code
- Create realistic animation sequences

### 3. QA and Testing
Use recordings to:
- Create repeatable test scenarios
- Verify UI responsiveness
- Measure interaction performance

### 4. Design Handoff
Export recordings to:
- Show developers intended interactions
- Communicate animation requirements
- Provide reference implementations

## Code Generation

When exporting as React Code, the system generates a Framer Motion component that includes:
- Event data embedded as a constant
- Motion components for each animation point
- Proper timing delays based on recorded timestamps
- Summary statistics in comments

Example generated code structure:
```tsx
export const MyRecordingAnimation = () => {
  const events = [/* event data */]
  
  return (
    <div className="relative">
      {events.map((event, index) => (
        <motion.div
          key={index}
          animate={{ x: event.data.x, y: event.data.y }}
          transition={{ delay: event.timestamp / 1000 }}
        />
      ))}
    </div>
  )
}
```

## Best Practices

### Recording Tips
1. **Plan Your Recording**: Know what you want to capture before starting
2. **Use Descriptive Names**: Name recordings clearly for easy identification
3. **Keep It Focused**: Record specific interactions rather than long sessions
4. **Test Playback**: Always verify recordings play back correctly

### Playback Tips
1. **Adjust Speed**: Use slower speeds to study details, faster for overview
2. **Watch Multiple Times**: Different speeds reveal different insights
3. **Compare Recordings**: Play similar recordings to spot differences

### Export Tips
1. **JSON for Processing**: Use JSON when you need to programmatically analyze events
2. **CSV for Analysis**: Use CSV for statistical analysis in spreadsheets
3. **Code for Implementation**: Use React code as a starting point for real animations

## Limitations

- Recording captures browser events only, not application state changes
- Mouse movement throttling may miss very rapid gestures
- Exported React code requires manual integration and refinement
- Very long recordings may impact browser performance
- Playback assumes the same page layout as during recording

## Future Enhancements

Potential features for future versions:
- Keyboard event recording
- Form input capture and replay
- Screenshot/video export alongside event data
- Recording comparison and diff tools
- Cloud storage for recordings
- Collaborative recording sharing
- AI-powered interaction analysis
- Automatic test case generation

## Integration with Other Features

The Animation Recorder works seamlessly with:
- **Animation Presets Library**: Export recorded interactions as preset patterns
- **Timeline Scrubber**: Import recordings into the timeline editor
- **Choreography Builder**: Use recorded events to choreograph multi-element animations
- **Pattern Builder**: Convert interaction paths into visual patterns

## Troubleshooting

### Recording not capturing events
- Ensure you've enabled the desired event types
- Check that the recorder is not paused
- Verify browser permissions are granted

### Playback looks incorrect
- The page layout may have changed since recording
- Try adjusting playback speed
- Check that scroll positions are compatible

### Export not working
- Check browser's download permissions
- Ensure sufficient disk space
- Try a different export format

### Performance issues
- Reduce recording duration
- Disable mouse movement recording for better performance
- Clear old recordings you don't need

## API Reference

### Component Props
The AnimationRecorder component is self-contained and requires no props.

### Storage Keys
- `animation-recordings`: Array of all saved recordings

### Event Types
- `click`: Mouse click events
- `mousemove`: Mouse movement events (throttled)
- `scroll`: Window scroll events
- `hover`: Element hover events
- `keypress`: Keyboard events (future)

## Support

For issues or questions about the Animation Recording Mode:
1. Check this documentation first
2. Review the generated code examples
3. Test with simple interactions before complex ones
4. Export and inspect the JSON to understand event structure
