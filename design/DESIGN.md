---
name: Clinical Precision
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#414754'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#717786'
  outline-variant: '#c0c6d6'
  surface-tint: '#005db8'
  primary: '#005ab3'
  on-primary: '#ffffff'
  primary-container: '#0073e0'
  on-primary-container: '#fefcff'
  inverse-primary: '#aac7ff'
  secondary: '#006a67'
  on-secondary: '#ffffff'
  secondary-container: '#88f4f0'
  on-secondary-container: '#00706e'
  tertiary: '#006b27'
  on-tertiary: '#ffffff'
  tertiary-container: '#008733'
  on-tertiary-container: '#f7fff2'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00468d'
  secondary-fixed: '#88f4f0'
  secondary-fixed-dim: '#6bd7d3'
  on-secondary-fixed: '#00201f'
  on-secondary-fixed-variant: '#00504e'
  tertiary-fixed: '#72fe88'
  tertiary-fixed-dim: '#53e16f'
  on-tertiary-fixed: '#002107'
  on-tertiary-fixed-variant: '#00531c'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  max_width: 1024px
  nav_height: 48px
  gutter: 24px
  margin_mobile: 16px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 24px
---

## Brand & Style
The design system is built for a professional dental practice, prioritizing clarity, trust, and clinical hygiene. The aesthetic is **Corporate / Modern** with a lean towards medical minimalism. It aims to reduce patient anxiety and streamline administrative tasks through a structured, calm interface. The visual language uses ample whitespace, a crisp blue primary palette, and a high-contrast typographic hierarchy to ensure information is easily scannable in a fast-paced clinical environment.

## Colors
The palette is rooted in medical cleanliness. White and Light Gray form the structural foundation, creating a "sanitized" digital environment. 

- **Primary Blue** is used for critical actions and brand presence.
- **Mint and Green** signify positive clinical outcomes and confirmed statuses.
- **Coral and Amber** are reserved for alerts, cancellations, and medical warnings, ensuring high visibility without inducing panic.
- **Text colors** use a tiered grayscale to separate administrative metadata from primary patient information.

## Typography
This design system utilizes **Inter** exclusively to leverage its exceptional legibility and neutral, systematic tone. 

- **Hierarchy:** Titles are strictly 700 weight to anchor sections. Body text at 400 weight provides a comfortable reading experience for patient notes.
- **Utility:** Labels (500) and Buttons (600) provide subtle weight shifts to distinguish interactive elements from static content.
- **Scale:** Large headlines scale down for mobile devices to maintain vertical rhythm without overwhelming the viewport.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy, centering content within a 1024px container to ensure density and readability on desktop monitors often used at dental reception desks.

- **Mobile:** Content reflows to a single column with 16px side margins.
- **Desktop:** A 12-column structure is used within the 1024px limit.
- **Rhythm:** A base-8 scale drives vertical spacing, with a 48px fixed height for the primary navigation bar to maximize vertical space for patient records.

## Elevation & Depth
Hierarchy is established through **Ambient Shadows** and tonal layering rather than heavy borders.

- **Surface Levels:** The base background is Light Gray (#F5F7FA), while active workspaces and cards are pure White (#FFFFFF).
- **Shadows:** A very soft, diffused shadow (6% opacity) lifts cards from the background. 
- **Modals:** Use a high-depth shadow (18% opacity) to create a clear "break" from the background application state, focusing the user entirely on the dialog task.

## Shapes
The shape language is "Soft-Modern," using varying radii to categorize information:
- **Functional (Inputs/Pills):** Rounded shapes suggest approachability and ease of use.
- **Structural (Cards/Modals):** Large radii (14px-18px) create a contemporary, friendly container for dense medical data.
- **Selection (Day Pills):** A tighter 10px radius differentiates date/time pickers from general action buttons.

## Components
- **Top Navigation:** 48px high, white background, anchored by a #E5E5EA bottom border. Includes a blue tooth icon (Logo), 15px gray links (Blue when active), and a 28px circular avatar with "DA" initials.
- **Buttons:** 
  - *Primary:* Pill-shaped, solid Blue background, white text.
  - *Secondary:* Pill-shaped, white background, Blue border, Blue text.
- **Cards:** White background with 14px radius and soft shadow. For **Alerts**, a 4px solid left border is added using the corresponding status color (Coral or Amber).
- **Inputs:** 12px radius with a subtle #E5E5EA border. On focus, the border transitions to Primary Blue.
- **Day Pills:** Small 10px rounded containers used in calendar views to show availability, utilizing the Mint and Green accent colors for status.
- **Modals:** 18px radius, centered, utilizing the deep 18% opacity shadow to overlay the workspace.