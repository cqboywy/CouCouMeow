# Design QA

- Source of visual truth: `/Users/mr.wang/.codex/visualizations/2026/08/27/01a04144-2e16-7af1-a2bd-8c94942fa618/coucoumeow-motion-audit/03-convix-reference-frame.png`
- Implementation captures:
  - `/Users/mr.wang/.codex/visualizations/2026/08/27/01a04144-2e16-7af1-a2bd-8c94942fa618/coucoumeow-motion-implementation/01-motion-home-ipad.png`
  - `/Users/mr.wang/.codex/visualizations/2026/08/27/01a04144-2e16-7af1-a2bd-8c94942fa618/coucoumeow-motion-implementation/02-motion-home-mobile.png`
- State: live API data loaded, `The Park` selected, background video playing.
- Viewports: 1024 × 768 CSS px and 390 × 844 CSS px.
- Screenshot pixels: 1024 × 768 and 390 × 844. Device pixel ratio was normalized to 1 for comparison. Reference is 1280 × 720 and was compared proportionally rather than pixel-for-pixel because the product target is iPad-first and retains different content.

## Comparison

The full-view comparison preserves the reference hierarchy: rounded full-viewport media frame, centered floating pill navigation, compact badge, large two-line editorial headline, dark pill CTA, and a pale task tray entering from the bottom edge. The implementation deliberately replaces the SaaS dashboard with the existing three-step English-learning path and retains the cat identity.

Focused-region review covered the navigation pill, hero typography, CTA, and task tray. Spacing, alignment, contrast, and clipping remained coherent at both tested breakpoints. No separate crop was needed because all focus regions are visible together in the full-view captures.

## Interaction and accessibility checks

- Verified Today, Library, and Progress navigation.
- Verified Continue Learning, Story, Dictation, and Speaking entry points.
- Verified 390 px layout has no horizontal overflow.
- Verified keyboard-visible focus styles and semantic landmarks/buttons.
- Verified reduced-motion CSS disables the video and hover transition.
- Browser console: no warnings or errors during the checked flows.

## Findings and history

- P0: none.
- P1: none.
- P2: mobile hero scrolls vertically to keep all three task cards reachable; this is intentional and preferable to shrinking tap targets.
- Initial local preview used an API-disallowed origin and showed the empty state; the preview was moved to the allowed `localhost:5173` origin and re-captured with live data.

Final result: passed
