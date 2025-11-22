# Paper → Net Shot Animation

Small demo of the “crumpled paper into basketball net” transition used on my personal website.

## How it works

- The **Projects** button (`#projects-trigger`) acts as the “paper” origin.
- The **Contact** button (`#contact-trigger`) acts as the net target.
- The **Resume** button (`#resume-trigger`) optionally becomes a moving scoreboard.

On click:

1. We take a snapshot of the button positions with `getBoundingClientRect`.
2. We hide the real buttons and place fixed-position overlays:
   - `.shot-paper` (crumpled paper image)
   - `.shot-net` (basketball net)
   - `.shot-scoreboard` (optional)
3. The paper’s background is swapped through a series of crumple frames:
   `paper_stage1.png` → `paper_stage2.png` → `paper_stage3.png` → `paper.png`.
4. Once crumpled, the paper follows a parabolic arc into the net using
   a simple interpolation on x/y and a quadratic term for height.
5. When it reaches the net:
   - The net gets a tiny “score pop” animation.
   - The paper falls down slightly and fades out.
6. After cleanup, the page navigates to the button’s `data-href` / `href`
   (which is `#projects` in this demo, but can be a full page like `projects.html`).
