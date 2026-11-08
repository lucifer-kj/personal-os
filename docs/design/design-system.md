# Personal OS — Production Design System Specification

## 1. Vision & Non-Negotiable Principles

Personal OS is a private single-user workstation designed for calm, focused productivity. The visual language is inspired by high-end editorial publications and architectural minimalism: dark obsidian surfaces, tactile typography, restrained terracotta accents, and generous spatial rhythm.

### 1.1 Non-Negotiable Tenets
1. **Design Before Implementation**: Every component is inspected, typed, and structured before code changes.
2. **No Screenshot Hacks**: No arbitrary pixel offsets, excessive absolute positioning, negative margin compensations, or nested containers with redundant padding. All layouts rely on Flexbox, CSS Grid, and intrinsic sizing.
3. **No Visual Clutter**: Every view has one dominant visual hierarchy, a restrained primary action set, and intentional whitespace.
4. **No Artificial AI Tropes**: Zero low-contrast gray-on-gray slop, neon gradients, bloated pills, or excessive glassmorphism. Surfaces feel quiet, solid, and physically grounded.
5. **Full Functionality Preservation**: Zero regressions to Supabase RLS, API contracts, local storage preferences, or test suites.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Dark Obsidian Theme (Primary Workstation Mode)
| Token | Variable | Value | Role |
| :--- | :--- | :--- | :--- |
| **App Background** | `--background` | `#0E0C0B` | Deep warm obsidian canvas |
| **Sidebar Surface** | `--sidebar` | `#12100E` | Pinned vertical navigation rail |
| **Card Surface** | `--card` | `#161311` | Primary component container |
| **Elevated Surface**| `--surface-elevated` | `#1C1816` | Modals, popovers, dropdowns |
| **Muted Surface** | `--muted` | `#1E1A18` | Inactive pills, hover states |
| **Border Subtle** | `--border` | `#26211D` | Standard 1px structural dividers |
| **Border Active** | `--border-active` | `#3D261C` | Selected card and focus ring borders |
| **Text Primary** | `--foreground` | `#F4EFEA` | High-contrast editorial cream white |
| **Text Secondary** | `--muted-foreground` | `#9A9085` | Subtitles, labels, metadata |
| **Brand Terracotta**| `--primary` | `#E05B27` | Primary action buttons, active indicators |
| **Brand Hover** | `--primary-hover` | `#C94D1D` | Interactive state hover |
| **Accent Glow** | `--accent` | `#2C1A12` | Active item background pill |
| **Success** | `--success` | `#34945A` | Saved status, completed progress |
| **Warning** | `--warning` | `#D98218` | Medium priority, star bookmarks |
| **Destructive** | `--destructive` | `#D93829` | Urgent priority, delete actions |
| **Info / Tech** | `--info` | `#5587C4` | Category pills, information banners |

### 2.2 Light Editorial Theme (Secondary Mode)
| Token | Variable | Value | Role |
| :--- | :--- | :--- | :--- |
| **App Background** | `--background` | `#F8F5F0` | Warm parchment canvas |
| **Sidebar Surface** | `--sidebar` | `#F7F3EE` | Lateral navigation rail |
| **Card Surface** | `--card` | `#FFFEFC` | Crisp elevated paper cards |
| **Border** | `--border` | `#E8E1D9` | Warm divider line |
| **Text Primary** | `--foreground` | `#24211F` | Deep espresso readable text |
| **Text Secondary** | `--muted-foreground` | `#827970` | Secondary muted metadata |
| **Brand Terracotta**| `--primary` | `#B84318` | Primary warm terracotta action |

---

## 3. Typography System

The interface pairs an authoritative editorial serif for titles with a razor-sharp geometric sans-serif for controls and UI data.

```
+-------------------------------------------------------------------+
| Editorial Serif: Newsreader / Playfair Display / Georgia          |
| Roles: Page titles, greetings, article headlines, section heads   |
+-------------------------------------------------------------------+
| Sans-Serif: Inter                                                 |
| Roles: Controls, body text, buttons, form inputs, navigation      |
+-------------------------------------------------------------------+
| Monospace: SFMono-Regular, Consolas, monospace                     |
| Roles: Timestamps, keyboard shortcuts (⌘K), tags, counters        |
+-------------------------------------------------------------------+
```

### Type Scale
- **Display 1 (Dashboard Hero Greeting)**: `font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--foreground)]`
- **Page Heading (Radar / Notes Title)**: `font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[var(--foreground)]`
- **Article / Note Title**: `font-serif text-xl sm:text-2xl font-bold leading-snug text-[var(--foreground)]`
- **Section Heading (Executive Summary / Comments)**: `font-serif text-lg font-medium text-[var(--foreground)]`
- **Card Title / Metric Label**: `font-sans text-xs sm:text-sm font-semibold text-[var(--foreground)]`
- **Body & Prose**: `font-sans text-xs sm:text-sm leading-relaxed text-[var(--foreground)]`
- **Metadata & Badges**: `font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)]`

---

## 4. Spacing, Radii & Depth Scale

### 4.1 Spacing Scale
- `p-1` (4px): Inner pill button padding.
- `p-2` (8px): List item padding, compact controls.
- `p-3` (12px): Stream card padding, input fields.
- `p-4` (16px): Standard card body padding.
- `p-6` / `p-8` (24px - 32px): Dashboard hero padding, page container gutters.

### 4.2 Radii Tokens
- Control / Tag Pill: `rounded-lg` (8px) or `rounded-full` (9999px for buttons).
- Card Container: `rounded-2xl` (16px).
- Modal / Panoramic Hero: `rounded-3xl` (24px).

### 4.3 Borders & Elevation
- Surfaces use **1px solid borders** (`border-[var(--border)]`) with 0 or minimal soft shadows (`shadow-2xs` / `shadow-xs`).
- No heavy artificial box-shadows. Depth is conveyed through subtle tonal step-ups (`#0E0C0B` -> `#161311` -> `#1C1816`).

---

## 5. Time-of-Day Panoramic Hero Scenery System

The dashboard hero features a panoramic misty mountain landscape that dynamically adapts to the user's local solar cycle while guaranteeing WCAG AA text contrast.

### 5.1 Verified Asset Inventory (`public/scenery/`)
| Period | Exact Filename | Dimensions | File Size | Trigger Window |
| :--- | :--- | :--- | :--- | :--- |
| **Dawn** | `Golden Sunrise Over Misty Mountains.png` | 2172 x 724 | 1.63 MB | 05:00 — 08:59 |
| **Day** | `Sunlit Mountain Valleys Beneath Soft Clouds.png` | 2172 x 724 | 1.97 MB | 09:00 — 16:59 |
| **Dusk** | `Misty Mountain Sunset Panorama.png` | 2172 x 724 | 1.73 MB | 17:00 — 18:59 |
| **Evening** | `Golden Sunset Over Mountain Ridges.png` | 2172 x 724 | 1.93 MB | 19:00 — 21:59 |
| **Night** | `Moonlit Milky Way Over Misty Mountains.png` | 2172 x 724 | 1.89 MB | 22:00 — 04:59 |
| **Fallbacks** | `dawn.svg`, `day.svg`, `dusk.svg`, `night.svg` | Vector | ~2 KB | Offline / Image Error |

### 5.2 Layer Composition
1. **Layer 0 (Base Image)**: Next.js `<Image fill className="object-cover object-top opacity-70 dark:opacity-50" />`.
2. **Layer 1 (Readability Blur & Gradient)**:
   - Subtle backdrop blur on hero container (`backdrop-blur-xs`).
   - Dark gradient ramp: `bg-gradient-to-b from-black/40 via-black/20 to-[var(--background)]`.
3. **Layer 2 (Foreground UI)**:
   - Date & Weather chip (`SAT, NOV 7 • 24°C Kolkata`).
   - Editorial Greeting (`Good morning, Arif.`).
   - Action cluster (`Start Deep Work (45m)`, `Plan My Day`).
   - Frosted Glass Daily Intention card.
