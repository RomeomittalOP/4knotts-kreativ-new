Drop the brand assets here so the site can render them:

  logo.png      ← the "4 KNOTTS KREATIV" circular monogram
  mascot.png    ← the spiky-haired character in the 4K hoodie

Recommended:
  logo.png      512×512 px, PNG with transparent background
  mascot.png    1024×1024 px, PNG with transparent background

The site references them at "/logo.png" and "/mascot.png" — Vite serves
anything in this folder at the URL root.

If a file is missing, the site gracefully falls back:
  - logo.png   → text [4K] mark
  - mascot.png → the inline SVG robot
