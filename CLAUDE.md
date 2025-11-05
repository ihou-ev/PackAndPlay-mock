# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pack&Play is a Progressive Web App (PWA) static HTML mockup for a VTuber/streamer card pack sales platform. Viewers purchase card packs, and when cards are used, effects display on the streamer's OBS overlay. This is a **demonstration-only** mockup with no backend, database, or real payment processing.

The application is installable as a PWA and supports offline functionality through service workers.

## Development Commands

### Starting the Development Server

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000
```

Then open `http://localhost:8000` in a browser.

### Quick Testing (No Server)

Drag and drop `index.html` directly into a browser. Note that some features may not work properly due to CORS restrictions.

## Architecture

### Data Flow and State Management

The application uses **localStorage** as its primary data persistence mechanism with the following keys:

- `session` - Login session info (role, user data, login time)
- `inventory` - User's owned cards
- `creatorCards` - Creator's card library
- `creatorPacks` - Creator's packs
- `redemptions` - Approval queue for card usage
- `overlayEvent` - Single-event queue for triggering OBS overlay effects

**Important**: The overlay communication pattern uses localStorage events. When a card is approved:
1. Write to `localStorage.overlayEvent` with card data
2. The overlay listens via `window.addEventListener('storage')`
3. Also polls `localStorage.overlayEvent` every 1000ms as fallback
4. After display, the overlay removes the event key

### Role-Based Access Control

The application has two distinct user roles with different navigation flows:

**Viewer Role** (`role: 'viewer'`):
- Can browse creators (`discover.html`)
- Can view inventory (`inventory.html`)
- Can purchase and open packs
- Can use cards (requires approval for message type)

**Creator Role** (`role: 'creator'`):
- Has all viewer permissions
- Can access dashboard (`dashboard/index.html`)
- Can manage cards (`dashboard/cards.html`)
- Can manage packs (`dashboard/packs.html`)
- Can approve redemptions (`dashboard/redemptions.html`)

Role checking is enforced via:
- `requireLogin()` - Redirects to login if not authenticated
- `requireCreatorRole()` - Redirects if not creator role
- `updateNavbar()` - Dynamically renders role-appropriate navigation

### Session Management Pattern

Session structure stored in localStorage:
```javascript
{
  isLoggedIn: true,
  role: 'viewer' | 'creator',
  email: 'demo-youtube@packandplay.com',
  name: 'Display Name',
  creatorSlug: 'tanaka', // only for creators
  loginMethod: 'youtube' | 'twitch' | 'x',
  loginPlatform: 'YouTube' | 'Twitch' | 'X (Twitter)',
  loginTime: '2025-11-04T12:00:00Z'
}
```

### Social Login Support

The login page supports social authentication only (no email/password):
- **YouTube** - Available for both viewers and creators
- **Twitch** - Available for both viewers and creators
- **X (Twitter)** - Available for viewers only (automatically hidden for creators)

When the user selects the "配信者" (Creator) role, the X login button is automatically hidden via JavaScript. This is implemented in the `selectRole()` function which dynamically shows/hides the X button based on the selected role.

### File Organization

**Core JavaScript Files**:
- `js/main.js` - Shared utilities (modals, toasts, session management, navbar)
- `js/mock-data.js` - All mock data and helper functions
- `sw.js` - Service Worker for PWA offline support

**PWA Configuration**:
- `manifest.json` - PWA manifest with app metadata, icons, and shortcuts

**HTML Pages**:
- `index.html` - **Landing page with LP design (entry point)**
  - Hero section with catchphrase: "Pack&Play｜引いて、使って、配信が動く。"
  - Description section with 30-second pitch
  - Login section with role selection and social authentication
- `discover.html` - Creator discovery page (formerly index.html)
- `auth/login.html` - Legacy login page (kept for compatibility)
- `inventory.html` - Viewer's card inventory
- `creator/tanaka.html` - Creator profile page (hardcoded for demo)
- `creator/packs/pack-detail.html` - Pack details with drop rates
- `creator/packs/pack-open.html` - Pack opening animation
- `dashboard/*.html` - Creator management pages
- `overlay/index.html` - OBS browser source overlay

**CSS**:
- `css/style.css` - Single global stylesheet with CSS custom properties

**Important**: The entry point is now a landing page (LP) with three sections:
1. **Hero Section**: Full-screen catchphrase with animated icon, quick login buttons, and scroll indicator
   - Two prominent CTA buttons: "👤 視聴者として始める" and "🎬 配信者として始める"
   - Clicking these buttons logs the user in immediately with YouTube (default)
2. **Description Section**: 30-second explanation for streamers with feature cards
3. **Login Section**: Simplified social login buttons (YouTube, Twitch, X)
   - Role selection removed from UI - determined by which hero button was clicked
   - Users can still log in from this section if they scrolled past the hero

All navigation links have been updated to use `discover.html` for the creator list.

### Relative Path Handling

The codebase uses a custom `getRelativePath()` function in `js/main.js` to calculate relative paths based on current directory depth. This is critical for navigation links to work from any page depth:

```javascript
// From main.js
function getRelativePath(targetPath) {
  const currentPath = window.location.pathname;
  const depth = (currentPath.match(/\//g) || []).length - 1;
  const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
  return prefix + targetPath;
}
```

Always use `getRelativePath('path/to/file.html')` for internal navigation links, not hardcoded relative paths.

### Pack Opening Simulation

Pack opening uses weighted random selection in `js/mock-data.js`:

```javascript
function simulatePackOpening(packId) {
  // Each card has dropRate percentage
  // Cumulative probability selection
  // Returns single card object
}
```

Cards in packs have `dropRate` values that must sum to 100 for proper probability distribution.

### Card Types and Rarities

**Card Types**:
- `message` - Displays viewer message (requires approval)
- `action` - Triggers action effect (auto-approved)
- `visual` - Visual effect only (auto-approved)

**Rarities** (with color codes in `js/mock-data.js`):
- `N` (Normal) - `#9ca3af` gray
- `R` (Rare) - `#3b82f6` blue
- `SR` (Super Rare) - `#8b5cf6` purple
- `UR` (Ultra Rare) - `#f59e0b` gold

## Common Development Patterns

### Adding a New Page

1. Copy an existing HTML template (e.g., `index.html`)
2. Update `<title>` and main content
3. Keep the header/footer structure with `nav-links` class for dynamic navbar
4. Include both scripts at bottom:
   ```html
   <script src="[relative-path]/js/mock-data.js"></script>
   <script src="[relative-path]/js/main.js"></script>
   ```
5. Add role checking if needed:
   ```javascript
   if (!requireCreatorRole()) {
     // Handled by function
   }
   ```

### Adding New Mock Data

Edit `js/mock-data.js`:
- Add to appropriate array (`creators`, `packs`, `cards`, etc.)
- Update helper functions if needed
- Ensure ID uniqueness
- For packs, ensure `dropRate` values sum to 100

### Creating New Modal Dialogs

Use the pattern from existing pages:
```html
<div id="myModal" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3>Title</h3>
      <button data-close-modal="myModal">&times;</button>
    </div>
    <div class="modal-body">
      <!-- Content -->
    </div>
  </div>
</div>
```

Open/close with: `openModal('myModal')` / `closeModal('myModal')`

### Using Toast Notifications

```javascript
showToast('Message text', 'success' | 'error' | 'info');
```

## Progressive Web App (PWA) Features

The application is configured as a PWA with the following features:

### Installation
- Users can install the app to their home screen/desktop
- Manifest at `manifest.json` defines app metadata, icons, and shortcuts
- App shortcuts provide quick access to key pages (Discover, Inventory, Dashboard)

### Service Worker (`sw.js`)
- **Cache Strategy**: Network-first with cache fallback
- Caches core HTML, CSS, and JS files for offline access
- Automatically updates cache on new service worker activation
- Falls back to cached version when offline

### Offline Support
- Core pages and assets are available offline
- localStorage data persists offline
- Network requests fail gracefully with cached alternatives

### Meta Tags
All major HTML pages include PWA-required meta tags:
- `theme-color` for browser UI customization
- Apple-specific meta tags for iOS PWA support
- Manifest link for app metadata
- Icon references for home screen and app icons

### Testing PWA
1. Serve the app via HTTPS (required for service workers)
2. Open in Chrome/Edge and check DevTools > Application > Manifest
3. Install app via browser's "Install" button
4. Test offline by enabling "Offline" mode in DevTools > Network tab

## OBS Overlay Integration

The overlay at `overlay/index.html` is designed for OBS Browser Source:
- **Dimensions**: 1920x1080 (hardcoded in CSS)
- **Background**: Transparent
- **URL Pattern**: `http://localhost:8000/overlay/index.html`

Test controls are visible in top-right for development. In production OBS, these can be ignored or removed by deleting the `.test-controls` div.

## Key Constraints and Limitations

- No real authentication - session is purely localStorage based
- No backend API - all data is client-side
- No real payment processing - purchase buttons are simulated
- localStorage is cleared when browser cache is cleared
- Single creator demo (tanaka) is hardcoded in many places
- No responsive mobile design - optimized for desktop only
- Browser security may block some features when using `file://` protocol

## Testing User Flows

**Viewer Flow**:
1. Open app at `index.html` (landing page)
2. Click "👤 視聴者として始める" button in hero section → Auto-logs in with YouTube
3. OR scroll down and click any social login button (YouTube, Twitch, or X)
4. Browse creators at `discover.html`
5. Click creator → view packs → purchase → open pack
6. Go to inventory → use card
7. Card enters approval queue (if message type)

**Creator Flow**:
1. Open app at `index.html` (landing page)
2. Click "🎬 配信者として始める" button in hero section → Auto-logs in with YouTube
3. OR scroll down and click any social login button (YouTube or Twitch)
4. Dashboard shows stats
5. Create cards at `dashboard/cards.html`
6. Create packs at `dashboard/packs.html`
7. Approve card usage at `dashboard/redemptions.html`
8. Test overlay at `overlay/index.html`

**Testing Overlay**:
- Open `overlay/index.html`
- Click test buttons in top-right
- Or trigger from redemptions page after approving a card

## Important Notes for Future Development

- When converting to production (Next.js + Supabase + Stripe), the localStorage patterns will need to be replaced with real database operations
- The role-based navigation in `updateNavbar()` will need server-side session validation
- Pack opening simulation should move to server-side to prevent client manipulation
- OBS overlay will need WebSocket/Realtime connection instead of localStorage polling
- All payment flows need Stripe integration
-景表法 (Japanese gaming law) compliance requires accurate drop rate display - this is shown in `pack-detail.html`
