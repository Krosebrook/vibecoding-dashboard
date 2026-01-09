# Animation Recording Mode - Quick Start Guide

## What is Animation Recording Mode?

A powerful feature that captures your live interactions with the dashboard and allows you to replay, analyze, and export them as reusable animations. Perfect for:
- 🎬 Creating interaction demos and tutorials
- 🐛 Documenting bugs with exact reproduction steps
- 🎨 Extracting timing patterns for animation design
- 📊 Analyzing user behavior and interaction flows
- 💻 Generating production-ready animation code

## Getting Started in 60 Seconds

### Step 1: Navigate to Animations
Click the **"Animations"** button in the top navigation bar (look for the ⚡ lightning icon).

### Step 2: Configure Recording
In the Animation Recorder card:
1. Enter a name (e.g., "Dashboard Navigation Flow")
2. Choose what to capture:
   - ✅ Record Clicks - Mouse clicks
   - ✅ Record Mouse - Mouse movements
   - ✅ Record Scrolls - Page scrolling
   - ⬜ Record Hovers - Element hovering

### Step 3: Record
1. Click **"Start Recording"** (red record button)
2. Interact with the page naturally
3. Watch the timer and event counter
4. Click **"Stop"** when done

### Step 4: Playback
1. Find your recording in the **"Saved Recordings"** list
2. Click the **Play** button (▶️)
3. Watch your interactions replay with an animated cursor!

### Step 5: Export (Optional)
1. Click the **Download** icon on your recording
2. Choose format:
   - **JSON** - Complete data structure
   - **CSV** - Spreadsheet format
   - **React Code** - Ready-to-use Framer Motion component

## Pro Tips

### Recording Tips
- **Keep it focused**: Record specific interactions rather than long sessions
- **Name descriptively**: Use names like "Login Flow" or "Chart Drill-Down"
- **Disable mouse tracking** for cleaner recordings if you only care about clicks
- **Use pause/resume** to skip boring parts

### Playback Tips
- **Adjust speed**: Try 0.5x for detailed analysis, 2x for quick overview
- **Toggle cursor**: Turn off cursor visualization for cleaner export videos
- **Watch multiple times**: Different speeds reveal different insights

### Export Tips
- **JSON for developers**: Full data structure for custom processing
- **CSV for analysts**: Easy to analyze in Excel or Google Sheets
- **React Code for designers**: Drop into your codebase as starting point

## Common Use Cases

### 1. Bug Documentation
```
1. Start recording
2. Reproduce the bug
3. Stop recording
4. Export as JSON
5. Attach to bug report with exact timestamps
```

### 2. User Flow Analysis
```
1. Record complete user journey
2. Export as CSV
3. Analyze timing in spreadsheet
4. Identify friction points
```

### 3. Animation Prototyping
```
1. Record desired interaction
2. Play back at different speeds
3. Extract timing values
4. Export React code as starting point
```

### 4. Tutorial Creation
```
1. Record step-by-step process
2. Play back with cursor visible
3. Screen capture the playback
4. Add voiceover later
```

## Keyboard Shortcuts

While recording:
- ⏸️ **Pause** - Temporarily halt recording
- ⏯️ **Resume** - Continue recording
- ⏹️ **Stop** - End and save recording

## Technical Details

### What Gets Recorded?
- **Clicks**: X/Y coordinates, target element path, timestamp
- **Mouse Moves**: X/Y coordinates (throttled to every 50ms), timestamp
- **Scrolls**: Scroll X/Y positions, timestamp
- **Hovers**: Element path, X/Y coordinates, timestamp

### Storage
- Recordings saved automatically to browser storage
- Persist across sessions
- No server upload required
- Private to your browser

### Performance
- Mouse movement throttled to 50ms for efficiency
- No noticeable impact on page performance
- Recordings under 10 minutes recommended
- Auto-stop at 15 minutes to prevent memory issues

## Troubleshooting

### "No events recorded"
- Check that you enabled at least one event type
- Make sure recording isn't paused
- Verify interactions are happening in the viewport

### "Playback looks wrong"
- Page layout may have changed since recording
- Try different playback speeds
- Recording may be from different screen size

### "Export not working"
- Check browser download permissions
- Ensure sufficient disk space
- Try different export format

### "Performance issues"
- Reduce recording duration
- Disable mouse movement recording
- Delete old recordings

## Next Steps

Ready to dive deeper?
1. Read the full [ANIMATION_RECORDING.md](./ANIMATION_RECORDING.md) documentation
2. Try the other animation features:
   - **Timeline Scrubber** - Frame-by-frame keyframe editing
   - **Animation Presets** - 30+ ready-to-use animations
   - **Choreography Builder** - Multi-element sequences
3. Combine recording with other features for maximum power

## Feedback & Support

Found a bug or have a feature request? Check the main README.md for support information.

---

**Happy Recording! 🎬**
