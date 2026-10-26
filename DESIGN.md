# Portfolio design choices

The original engineering portfolio is the default. Admin → **Portfolio UX Design** retains the original presets and adds **Design 7: Video Reference / Monochrome**. The saved `themeUX.activeDesign` chooses the layout. Saving refreshes the browser cache; a failed save reports an error rather than claiming a design was published.

The public page follows the supplied 21.57-second video: a white panel against a soft gray cloud backdrop; oversized outline/solid name typography; a centered monochrome portrait; pill navigation and social links; two-column work cards; expandable expertise rows; a charcoal experience section; and a centered contact invitation.

The reference's source font was not supplied. The page uses locally hosted Inter Variable as the closest visual match rather than claiming an exact font identification. The user's own name, engineering work, research, and professional history replace the sample designer's content.

## Implementation

- `src/components/ReferencePortfolio.tsx`: public layout, project/research detail dialogs, filters, expertise rows, credentials, and contact form.
- `src/reference-portfolio.css`: reference palette, typography, spacing, responsive layout, and brief interaction transitions.
- `src/App.tsx`: data loading and lazy admin/search views.
- `public/reference/portrait-cutout.webp`: optimized transparent portrait, displayed in grayscale by CSS.
- `public/reference/clouds.webp`: optimized cloudy background from the supplied video reference.

`OriginalPortfolio.tsx` composes the restored engineering layout. Design 7 uses `ReferencePortfolio.tsx`, with staggered 650–750 ms reveals throughout its sections, animated hero text and portrait, smooth accordion grids, card hover motion, and dialog transitions. These animations respect reduced-motion preferences. Both layouts load separately, and CV generation, admin/search, and the original engineering lab remain deferred. Original section transitions keep content visible while moving, and the hero renderer skips hidden tabs and limits pixel density to reduce GPU work.

## Asset provenance and prompts

Both assets used the built-in image generation tool in edit mode. Originals remain in the generated image library; website versions are optimized WebP files in `public/reference/`.

Portrait prompt: “Use case: background-extraction. Edit this exact portrait into a clean photographic cutout for the user's personal portfolio website. Remove only the gray studio background, replacing it with genuine alpha transparency. Preserve the exact person's facial identity, expression, hair, beard, skin texture, clothing, pose, proportions, and framing. Do not retouch or redraw the person. Preserve natural hair edges. No text, no shadows, no extra objects.”

Cloud prompt: “Use case: precise-object-edit. Edit this gray cloudy sky image for a subtle website background. Remove only the thin horizontal white line running across the middle. Preserve the cloud composition, monochrome gray palette, low contrast and softness exactly. No text, no foreground objects, no line, no new graphics. Output a clean gray cloud background.”

Animation refinement: the restored layout uses masked title reveals, animated accent rules, first-visit card entrances, pointer highlights with subtle tilt, and eased button movement. Section containers remain stationary to preserve sticky positioning. Motion uses compositor properties and respects reduced-motion preferences; browser performance has not been measured.

## Motion system and loading (October 2026)

- `src/lib/motion.ts`: shared reveal preset (blur-in rise, 0.8 s expo ease, capped stagger). Reveals start ~80 px before an element enters the viewport so nothing pops in late.
- `src/components/motion/`: Lenis smooth scrolling (fine pointers only, pauses while a modal locks the page), a scroll gauge with a gear that turns with scroll, a crosshair cursor follower plus magnetic buttons (`data-magnetic`), the tool marquee, the hero blueprint with meshing gears and the dial ring around the portrait, and `WhenNear`, which mounts the three.js hero canvas only near the viewport.
- Section titles reveal with a mask and draw an engineering dimension line; all motion respects reduced-motion settings.
- Images: the avatar ships as `public/avatar.webp` (15 KB, preloaded). Google Drive images are mirrored with `npm run media:sync` into `public/media/` and served through `src/media-manifest.json`; unmirrored images still fall back to Google's CDN.
- Favicon: static icons in `index.html` are authoritative; only a logo uploaded as a data URL in the admin panel replaces them at runtime.
