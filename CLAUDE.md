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
2. The overlay listens via `window.addEventListener('storage')` for cross-tab communication
3. Also polls `localStorage.overlayEvent` every 1000ms as fallback (critical for same-tab scenarios)
4. After display, the overlay removes the event key to prevent re-triggering

**Data Helpers** (`js/mock-data.js`):
- `saveToStorage(key, data)` / `loadFromStorage(key, defaultValue)` - localStorage wrappers with JSON serialization
- `getCreatorBySlug(slug)` - Find creator by URL slug
- `getPackById(packId)` - Find pack by ID
- `simulatePackOpening(packId)` - Weighted random card selection based on `dropRate`

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

Role checking is enforced via (`js/main.js`):
- `requireLogin()` - Redirects to login if not authenticated, returns boolean
- `requireCreatorRole()` - Redirects if not creator role, returns boolean
- `getCurrentSession()` - Returns session object from localStorage or null
- `isLoggedIn()` - Returns boolean for authentication status
- `logout()` - Clears session and redirects to index.html
- `updateNavbar()` - Dynamically renders role-appropriate navigation based on session role

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

When the user selects the "ストリーマー" (Creator) role, the X login button is automatically hidden via JavaScript. This is implemented in the `selectRole()` function which dynamically shows/hides the X button based on the selected role.

### File Organization

**Core JavaScript Files**:
- `js/main.js` - Shared utilities (modals, toasts, session management, navbar)
- `js/mock-data.js` - All mock data and helper functions
- `js/services/storage.js` - localStorage wrappers
- `js/app.js` - Application initialization
- `sw.js` - Service Worker for PWA offline support

**PWA Configuration**:
- `manifest.json` - PWA manifest with app metadata, icons, and shortcuts

**HTML Pages**:
- `index.html` - **Landing page with LP design (entry point)**
  - Hero section with catchphrase: "Pack&Play 引いて、使って、配信が動く。"
  - Description section with 30-second pitch
  - Login section with role selection and social authentication
- `discover.html` - Creator discovery page (formerly index.html)
- `auth/login.html` - Legacy login page (kept for compatibility)
- `inventory.html` - Viewer's card inventory
- `creator/tanaka.html` - Creator profile page (hardcoded for demo)
- `creator/packs/pack-detail.html` - Pack details with drop rates
- `creator/packs/pack-open.html` - Pack opening animation
- `dashboard/*.html` - Creator management pages
  - `dashboard/index.html` - Dashboard overview
  - `dashboard/cards.html` - Card management
  - `dashboard/packs.html` - Pack management
  - `dashboard/redemptions.html` - Card approval queue
  - `dashboard/settings.html` - Streaming settings (OBS overlay URL, platform connections)
- `overlay/index.html` - OBS browser source overlay

**CSS Architecture**:
- `css/app.css` - Main entry point that imports all component CSS
- `css/base/` - CSS variables and reset styles
- `css/layouts/` - Container and grid layouts
- `css/components/` - Reusable UI components (buttons, cards, modals, etc.)
- `css/pages/` - Page-specific styles organized by directory structure

**Important**: The CSS architecture uses a component-based approach with `@import` statements. The entry point is now a landing page (LP) with three sections:
1. **Hero Section**: Full-screen catchphrase with animated icon, quick login buttons, and scroll indicator
   - Two prominent CTA buttons: "👤 視聴者として始める" and "🎬 ストリーマーとして始める"
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

### Auto-Adjust Drop Rates by Rarity

The pack editor includes an automatic drop rate adjustment feature based on card rarity. This helps creators quickly set realistic probabilities without manual calculation.

**Rarity Weights** (`js/pages/dashboard/packs.js`):
```javascript
const rarityWeights = {
  'N': 50,   // Normal: High probability
  'R': 30,   // Rare: Medium probability
  'SR': 15,  // Super Rare: Low probability
  'UR': 5    // Ultra Rare: Very low probability
};
```

**How It Works**:
1. When a card is added to a pack, `autoAdjustDropRates()` automatically calculates drop rates
2. Each card's weight is determined by its rarity
3. Weights are normalized to ensure the total equals 100%
4. Users can manually adjust rates after auto-adjustment
5. The "レアリティで自動調整" button can reset rates to rarity-based defaults anytime

**Example**: If a pack contains 1 N card, 1 R card, and 1 SR card:
- Total weight: 50 + 30 + 15 = 95
- N card: (50/95) × 100 = 52.6%
- R card: (30/95) × 100 = 31.6%
- SR card: (15/95) × 100 = 15.8%

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
4. Include scripts at bottom in this order:
   ```html
   <script src="[relative-path]/js/services/storage.js"></script>
   <script src="[relative-path]/js/mock-data.js"></script>
   <script src="[relative-path]/js/main.js"></script>
   <script src="[relative-path]/js/pages/[page-name].js"></script>
   ```
5. Link component-based CSS:
   ```html
   <link rel="stylesheet" href="[relative-path]/css/app.css">
   <link rel="stylesheet" href="[relative-path]/css/pages/[page-name].css">
   ```
6. Add role checking if needed:
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

### Common Utility Functions (`js/main.js`)

**UI Components**:
- `showLoading()` / `hideLoading()` - Display/hide loading spinner overlay
- `animatePackOpening(cardData, callback)` - Pack opening animation with card reveal

**Form & Data**:
- `validateForm(formId)` - Validates required fields, returns boolean
- `confirmAction(message, onConfirm)` - Browser confirm dialog with callback
- `copyToClipboard(text)` - Copy to clipboard with toast feedback

**Data Operations**:
- `filterItems(items, query, fields)` - Search/filter array by query across specified fields
- `sortItems(items, field, order)` - Sort array by field ('asc' or 'desc')
- `paginate(items, page, perPage)` - Returns paginated results with metadata

**Helpers**:
- `getUrlParam(param)` - Extract query string parameter
- `debounce(func, wait)` - Debounce function calls

## Progressive Web App (PWA) Features

The application is configured as a PWA with the following features:

### Installation
- Users can install the app to their home screen/desktop
- Manifest at `manifest.json` defines app metadata, icons, and shortcuts
- App shortcuts provide quick access to key pages (Discover, Inventory, Dashboard)

### Service Worker (`sw.js`)
- **Cache Strategy**: Network-first with cache fallback
- **Cache Name**: `packandplay-v1` - increment version to force cache refresh
- Caches core HTML, CSS, and JS files for offline access
- Automatically deletes old caches on activation using cache name comparison
- Falls back to cached version when offline
- Includes placeholder push notification handlers for future extension

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

## Streaming Settings (`dashboard/settings.html`)

The streaming settings page provides creators with tools to set up their broadcast integration:

### OBS Overlay URL
- **URL Generation**: Automatically generates creator-specific overlay URL with query parameters
- **Copy to Clipboard**: One-click copy functionality with fallback for older browsers
- **Setup Guide**: Step-by-step instructions for adding the browser source to OBS Studio
- **Configuration**: Recommended settings (1920x1080, transparent background)

### Stream Player Embedding
Creators can embed their live stream player and chat in the settings page:

**Supported Platforms**:
- **YouTube Live**: Player + Chat iframe embedding
- **Twitch**: Player + Chat iframe embedding
- **ツイキャス (TwitCasting)**: Player only (chat not supported by platform)
- **ニコニコ生放送 (Niconico Live)**: Player only (chat requires premium membership)

**URL Extraction Logic**:
```javascript
// YouTube: Extract video ID from watch?v= or /live/
// Twitch: Extract channel name from URL path
// TwitCasting: Extract user ID from URL path
// Niconico: Extract live ID from /watch/lv...
```

**Iframe Generation**:
- YouTube: `youtube.com/embed/{videoId}` + `youtube.com/live_chat?v={videoId}`
- Twitch: `player.twitch.tv/?channel={channel}&parent={host}` + chat embed
- TwitCasting: `twitcasting.tv/{userId}/embeddedplayer/`
- Niconico: `live.nicovideo.jp/embed/{liveId}`

**Storage**:
- Saved in `localStorage.streamSettings` with platform, URL, extracted info, and embed code
- Settings persist across page reloads
- Can be cleared with "クリア" button

**Important Notes**:
- iframe `parent` parameter must match current hostname for Twitch
- YouTube live chat requires `embed_domain` parameter
- TwitCasting and Niconico have limited chat embedding support
- Preview shows actual iframe embeds (not mock data)

## OBS Overlay Integration

The overlay at `overlay/index.html` is designed for OBS Browser Source:
- **Dimensions**: 1920x1080 (hardcoded in CSS)
- **Background**: Transparent
- **URL Pattern**: `http://localhost:8000/overlay/index.html?creator={creatorSlug}`

Test controls are visible in top-right for development. In production OBS, these can be ignored or removed by deleting the `.test-controls` div.

## Key Constraints and Limitations

- No real authentication - session is purely localStorage based
- No backend API - all data is client-side
- No real payment processing - purchase buttons are simulated
- localStorage is cleared when browser cache is cleared
- Single creator demo (tanaka) is hardcoded in many places
- No responsive mobile design - optimized for desktop only
- Browser security may block some features when using `file://` protocol
- Service Workers require HTTPS in production (or localhost for development)

## Critical Implementation Details

### Path Resolution Strategy
The app supports both `file://` protocol (drag-and-drop) and HTTP server modes. The `getRelativePath()` function dynamically calculates relative paths based on current directory depth, checking for "PackAndPlay-mock" in the path or falling back to depth estimation. Always use this function for navigation links, never hardcoded `../` paths.

### Overlay Communication Pattern
The OBS overlay uses a **dual-mechanism** approach:
1. **localStorage `storage` event** - Fires when localStorage changes in another tab/window (doesn't fire in same tab)
2. **1000ms polling** - Checks `localStorage.overlayEvent` every second as fallback

This ensures the overlay works whether it's in a separate browser window (OBS Browser Source) or same tab during testing.

### Modal Close Pattern
Modals close via three methods:
1. Clicking `[data-close-modal]` button
2. Clicking outside modal (on `.modal-overlay`)
3. Calling `closeModal(modalId)` programmatically

All modals must use `modal-overlay` class with `display: flex` and proper ID structure.

### Session Persistence Across File Protocol
When using `file://` protocol, `getRelativePath()` is critical for logout redirects since absolute paths like `/index.html` don't work. The `logout()` function explicitly checks `window.location.protocol` to handle both cases.

## Debugging Tips

### Inspecting localStorage
Open browser DevTools > Application > Local Storage to view/edit:
- Session data
- Inventory contents
- Creator cards and packs
- Redemption queue
- Overlay events

### Testing Overlay Communication
1. Open `dashboard/redemptions.html` in one tab
2. Open `overlay/index.html` in another tab
3. Approve a card in the redemptions page
4. Overlay should display the card effect immediately
5. Check DevTools Console for overlay event logs

### Service Worker Issues
If changes aren't reflecting:
1. DevTools > Application > Service Workers
2. Click "Unregister"
3. Hard reload (Ctrl+Shift+R / Cmd+Shift+R)
4. Or increment `CACHE_NAME` in `sw.js` (e.g., `packandplay-v2`)

### File Protocol Limitations
When using `file://` protocol:
- Service Worker won't register
- Some fetch operations may fail due to CORS
- Use a local HTTP server for full functionality testing

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
2. Click "🎬 ストリーマーとして始める" button in hero section → Auto-logs in with YouTube
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
- 景表法 (Japanese gaming law) compliance requires accurate drop rate display - this is shown in `pack-detail.html`
