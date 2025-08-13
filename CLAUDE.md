# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DanNicCos Portfolio - A modern, interactive portfolio website built with vanilla JavaScript, HTML, and CSS. The project features a terminal animation system, content panels, project showcases, and video integration.

## Architecture

### Core Module System (`scripts/js/core/`)
The application uses a modular architecture with ES6 modules:

- **`app-manager.js`**: Application lifecycle management and component orchestration
- **`base-component.js`**: Base class providing shared lifecycle, error handling, and state management patterns for all components
- **`config.js`**: Centralized configuration for constants, selectors, and feature flags
- **`event-bus.js`**: Decoupled communication system using observer pattern with wildcard support
- **`navigation-manager.js`**: Handles navigation, smooth scrolling, and UI interactions
- **`state-store.js`**: Centralized state management with path-based access and reactivity
- **`utils.js`**: Shared utilities for DOM manipulation, async operations, animations, and storage

### Component Architecture Pattern
All components extend `BaseComponent` or `BaseController` and follow this lifecycle:
1. Constructor: Super call with component name and container selector
2. `setup()`: Initialize DOM elements and state
3. `bindEvents()`: Set up event listeners
4. Component-specific methods
5. Automatic cleanup on destroy

### Entry Points
- **`index.html`**: Main HTML file with inline styles and module loading
- **`scripts/js/main-refactored.js`**: Modern ES6 module entry point
- **`scripts/js/main-legacy-backup.js`**: Legacy fallback for older browsers

## Development Commands

Since this is a static site with no build system:

```bash
# Open the site locally
open index.html

# For debugging, append query parameter
open "index.html?debug=true"

# Watch for file changes (if using a local server)
python3 -m http.server 8000
# or
npx serve .
```

## Key Development Patterns

### Adding New Components
1. Create component extending `BaseComponent` or `BaseController`
2. Register in `AppManager` if needed for lifecycle management
3. Use `eventBus` for cross-component communication
4. Store shared state in `state-store`

### State Management
- Access state: `store.get('path.to.value')`
- Update state: `actions.setState({ key: value })`
- Subscribe to changes: `store.subscribe('path.*', callback)`

### Event Communication
- Emit events: `eventBus.emit('component:action', data)`
- Listen to events: `eventBus.on('component:action', handler)`
- Use namespaced events: `terminal:*`, `content:*`, `projects:*`

### Error Handling
- Components automatically catch and log errors
- Use `this.handleError()` in component methods
- Check `this.debugMode` for development-specific logging

## File Organization

### Scripts (`scripts/js/`)
- `core/`: Core infrastructure modules
- `terminal/`: Terminal animation system (controller, typing engine, sound manager, code snippets)
- `projects-controller.js` & `projects-data.js`: Project showcase functionality
- `video-controller.js`: Video playback management
- `content-panel-*.js`: Content panel implementations (legacy and refactored)

### Styles (`styles/css/`)
- `variables.css`: CSS custom properties and theme variables
- `reset.css`: CSS reset and base styles
- `layout.css`: Layout and grid systems
- `components.css`: Component-specific styles
- `animations.css`: Animation keyframes and transitions
- `responsive.css`: Media queries and responsive adjustments
- `terminal/`: Terminal-specific styles (cursor animations, syntax themes)
- `projects.css`: Project showcase styles

### Assets
- `assets/icons/`: SVG icons
- `assets/videos/`: Video content

## Important Notes

1. **No Package Manager**: This is a vanilla JavaScript project without npm/yarn
2. **Module Loading**: Uses native ES6 modules with fallback for legacy browsers
3. **Debug Mode**: Append `?debug=true` to URL for development features
4. **Browser Compatibility**: Modern browsers load ES6 modules, older browsers use legacy fallback
5. **Refactoring Status**: The codebase is transitioning from monolithic to modular architecture. Both legacy and refactored versions exist for compatibility.

## Terminal System

The terminal animation system (`scripts/js/terminal/`) is a key feature:
- **`terminal-controller.js`**: Main controller managing typing animations and rotations
- **`typing-engine.js`**: Handles character-by-character typing with syntax highlighting
- **`code-snippets.js`**: Contains the code examples displayed in terminal
- **`sound-manager.js`**: Optional typing sound effects
- Auto-rotation interval: 30 seconds
- Typing speed: 60 characters per second

## CSS Architecture

- Uses CSS custom properties for theming
- Glassmorphic design with backdrop filters
- Gradient backgrounds and neon accents
- Mobile-first responsive design
- Dark theme optimized with high contrast