# Personal OS — Design System (`design.md`)
**Status:** Approved visual direction baseline  
**Product phase:** Productivity OS first; AI-first capabilities are layered in later  
**Reference:** Spacious warm editorial dashboard concept shared in this conversation

## 1. Design intent

Personal OS should feel like a calm, premium personal workspace—not an AI demo, analytics wall, or generic admin template.

The visual language is **warm, editorial, quiet, spacious, and functional**. The UI should support concentration and quick scanning. Whitespace, alignment, typography, and restrained color carry the hierarchy. Avoid visual decoration that competes with the user's work.

### Design principles
1. **One clear focal point per page.** Prioritize the user's next action or current context.
2. **Space before decoration.** Use padding, gaps, and grouping rather than excess borders, gradients, or shadows.
3. **Progressive disclosure.** Show essentials first; reveal secondary details through tabs, menus, drawers, or detail views.
4. **Density is intentional.** Optimize the number of useful items visible for the current viewport, not the maximum number of cards.
5. **Device-native behavior.** Desktop, tablet, and mobile are composed intentionally, not merely resized.
6. **Consistency without sameness.** Reuse tokens and primitives, but let page layout follow its task.
7. **Functional states are design states.** Loading, empty, error, success, disabled, and selected states must be designed.
8. **Quiet confidence.** No neon glow, arbitrary gradients, glassmorphism, excessive animation, or decorative charts.

## 2. Brand and palette

Use a warm neutral base with restrained terracotta as the primary action/accent. Status colors are semantic and limited.

| Token | Suggested value | Use |
|---|---|---|
| `--background` | `#F8F5F0` | App canvas |
| `--foreground` | `#24211F` | Main text |
| `--card` | `#FFFEFC` | Cards and panels |
| `--card-foreground` | `#24211F` | Card text |
| `--popover` | `#FFFEFC` | Menus, popovers |
| `--popover-foreground` | `#24211F` | Popover text |
| `--primary` | `#B84318` | Primary action, active navigation |
| `--primary-foreground` | `#FFFFFF` | Text on primary |
| `--secondary` | `#F0EAE3` | Soft surface |
| `--secondary-foreground` | `#514943` | Secondary surface text |
| `--muted` | `#F2EEE8` | Quiet backgrounds |
| `--muted-foreground` | `#827970` | Secondary text |
| `--accent` | `#F7E4D9` | Subtle accent surface |
| `--accent-foreground` | `#8F3212` | Accent text |
| `--destructive` | `#B42318` | Destructive actions |
| `--destructive-foreground` | `#FFFFFF` | Destructive action text |
| `--border` | `#E8E1D9` | Borders and separators |
| `--input` | `#E2DAD1` | Input borders |
| `--ring` | `#C65A31` | Focus ring |
| `--success` | `#287A4B` | Success/progress |
| `--warning` | `#B66A12` | Warning |
| `--info` | `#426A9A` | Informational |
| `--sidebar` | `#F7F3EE` | Sidebar surface |
| `--sidebar-foreground` | `#5C554E` | Sidebar text |
| `--sidebar-primary` | `#B84318` | Selected sidebar item |
| `--sidebar-primary-foreground` | `#FFFFFF` | Selected item text |
| `--sidebar-accent` | `#F2E5DC` | Hover/selected soft surface |
| `--sidebar-accent-foreground` | `#8F3212` | Hover/selected text |
| `--sidebar-border` | `#E8E1D9` | Sidebar divider |
| `--sidebar-ring` | `#C65A31` | Sidebar focus |

Color usage rules:
- Primary terracotta is for action, selected state, and a small amount of emphasis—not every icon, border, and heading.
- Green/orange/blue are status colors only and should not be used as independent brand accents.
- Do not use gradient backgrounds. A subtle image or illustration is allowed only if the page spec calls for it.
- Never rely on color alone to convey status.

## 3. Typography

Use a clear UI sans-serif for controls and body text; reserve a restrained editorial serif for display headings and select page titles.

Recommended implementation:
- UI/body: `Inter`, with system fallbacks. If adding Inter requires a package, prefer framework-supported font loading or evaluate dependency necessity first.
- Display/editorial: `Georgia` fallback or a project-approved serif font.
- Monospace: system monospace for timestamps, keyboard shortcuts, and technical metadata only.

| Role | Desktop target | Mobile target | Weight / line height |
|---|---:|---:|---|
| Page title | 32–40 px | 28–32 px | 400–500 / 1.15 |
| Welcome/display | 44–52 px | 32–38 px | 400 / 1.12 |
| Section heading | 20–24 px | 18–22 px | 500 / 1.3 |
| Card heading | 16–18 px | 16–18 px | 500 / 1.35 |
| Body | 14–16 px | 14–16 px | 400 / 1.5 |
| Secondary | 12–13 px | 12–13 px | 400 / 1.45 |
| Eyebrow/metadata | 10–12 px | 10–12 px | 500, tracking 0.08em |

Do not use tiny text to squeeze information into a card. Avoid more than three typographic families/roles on one screen.

## 4. Spacing, grid, and layout

Base spacing unit: **4 px**. Use the spacing tokens from `index.css`.

### Layout guidance
- Desktop app shell: fixed/compact sidebar around 220–240 px; header around 64–72 px.
- Main content max width: approximately 1440 px; center content on wider displays.
- Main content horizontal padding: 32 px desktop, 24 px tablet, 16 px mobile.
- Vertical section gaps: 24–32 px desktop; 16–24 px mobile.
- Card internal padding: 24 px default; 16–20 px compact; mobile usually 16 px.
- Standard card radius: 16–20 px; controls radius: 10–12 px; pill radius only for compact status chips.
- Border: 1 px solid token border; shadows subtle and optional, used to separate layers—not as decoration.
- Maintain alignment across cards and their headings/actions.
- Avoid card nesting. A panel should not be a stack of additional panel shells unless hierarchy requires it.

### Responsive composition
- **Small mobile (320–375):** single-column primary workflow; compact header; sidebar becomes drawer or bottom navigation based on information architecture; secondary panels move below.
- **Mobile (390–430):** single-column or carefully composed two-up small metrics; no desktop side-by-side main panels.
- **Tablet (768–1024):** sidebar may become compact/drawer; use two-column content only where each column remains comfortably readable.
- **Desktop (1280–1440):** full navigation and balanced multi-column layout; maintain whitespace.
- **Wide (1600+):** do not stretch text/cards indefinitely; keep a content max width and increase outer margins.

Breakpoint values are implementation guides, not hard requirements. Choose breakpoints by testing layout behavior.

## 5. App shell and navigation

### Desktop
- Persistent left navigation grouped by meaningful areas: Chronicle, Atelier, Library, Operations.
- Sidebar has logo/brand, clear active route, section labels, and account area.
- Top bar contains breadcrumb/page context, global search, notifications, and one primary create action.
- Do not place all global actions in the sidebar and header simultaneously.

### Mobile
- Use a compact top bar and a deliberate navigation drawer or bottom navigation.
- Expose only the most frequent destinations in persistent navigation; put the rest in a labeled “More”/drawer.
- Maintain a clear page title and a reachable create/capture action.
- Account for safe-area insets.

## 6. Component guidelines

### Buttons
- Primary: solid terracotta, one dominant action per context.
- Secondary: neutral outline or quiet surface.
- Tertiary: text/icon action, low visual weight.
- Destructive: semantic destructive token; confirm destructive irreversible actions.
- Buttons need hover, pressed, focus-visible, disabled, and loading states.
- Icon-only buttons must have accessible names and tooltip/label support.

### Cards and panels
- Use cards for distinct content groups, not every element.
- Prefer a simple surface with border and padding; no unnecessary shadow.
- Card headings align with the content hierarchy and may include one contextual action.
- Keep metric cards low-complexity: label, value, optional trend/status, simple progress.

### Forms
- Labels above fields; helper/error text below.
- Use consistent field height and spacing.
- Validation errors must be specific and adjacent to the field.
- Do not use placeholder text as a substitute for labels.

### Lists and tables
- Clear row hierarchy, comfortable row height, consistent alignment.
- Use dividers sparingly.
- Include explicit empty states and loading states.
- On mobile, choose responsive columns, row cards, or controlled horizontal scroll—not accidental overflow.

### Status badges
- Small, restrained, semantic.
- Use text and icon in addition to color.
- Do not badge every metadata field.

### Dialogs, drawers, popovers
- Use for focused secondary flows, not to hide primary workflows.
- Keyboard escape, focus management, and sensible focus return are required.
- Prefer drawer/sheet for mobile detail/edit flows when appropriate.

### Motion
- Motion is functional: state transition, feedback, or navigation.
- Default duration 120–200 ms; ease-out for entering, ease-in for exiting.
- Respect `prefers-reduced-motion`.
- No scroll-triggered spectacle, springy card movement, or animated gradients.

## 7. Dashboard composition

Dashboard should be a calm overview, not a cockpit.

Suggested desktop order:
1. Greeting/date/intention region with one primary focus action.
2. A restrained row of 3–4 summary metrics.
3. Current Focus panel and Focus Timer, if a timer session is active/relevant.
4. Today’s Flow / chronological agenda.
5. Active Projects (short shortlist).
6. Quick Capture (available but visually secondary).
7. Notes/recent items only when useful and not crowding.

Do not show all possible modules on the dashboard. Let users customize or navigate to full pages for details. If a timer is inactive, do not give it the visual weight of an active focus session.

## 8. Accessibility and usability

- Target WCAG 2.2 AA for text contrast and interaction accessibility.
- Semantic landmarks, headings in logical order, labels, alt text, and accessible names.
- Keyboard access for all actions; visible focus indicators.
- Avoid focus traps except inside modal/dialog patterns, with proper focus management.
- Touch targets: aim for 44×44 CSS px for primary interactive targets.
- Support zoom/reflow without loss of functionality.
- Respect reduced motion.
- Do not convey meaning solely through color, shape, or position.

## 9. Design review checklist

- [ ] Clear focal point and primary action.
- [ ] No crowded or redundant cards.
- [ ] Layout is composed for the actual viewport.
- [ ] Spacing and typography use tokens.
- [ ] Content has enough room for realistic lengths.
- [ ] No gradient/glow/glassmorphism unless approved by page spec.
- [ ] Active, hover, focus, disabled, loading, empty, error, and success states considered.
- [ ] No horizontal overflow, clipping, or overlapping.
- [ ] Mobile navigation and touch behavior are intentional.
- [ ] Contrast and keyboard accessibility checked.
- [ ] Visual review performed at relevant breakpoints.

## 10. Decision log

- Warm cream + terracotta editorial direction chosen from the shared reference.
- Spacious composition takes precedence over dashboard density.
- Design tokens are centralized in `index.css`; this file documents their intent and usage.
- Theme/component library may be selected from tweakcn/shadcn ecosystem, but tokens and page composition must remain product-specific.
