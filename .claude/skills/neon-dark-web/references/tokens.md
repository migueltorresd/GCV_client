# Tokens & Brand Variants

Complete token tables for the default ÁGATA / GOVTECH look, plus the recipe to derive a new brand in the same neon-on-dark family.

## Contents
- Default ÁGATA token set (surfaces, ink, accents, type, spacing, radius, motion)
- Accent semantics
- Brand variant recipe
- Worked variants: HackerRank-style, DIMARK-style

---

## Default ÁGATA / GOVTECH tokens

```css
:root {
  /* ---- Surfaces ---- */
  --void:     #0A0A0A;   /* black cards, deepest panels */
  --base:     #141414;   /* page canvas */
  --elevated: #1F1F1F;   /* dark-gray card */
  --cream:    #FAF3EA;   /* light section / cream card */

  /* ---- Ink ---- */
  --ink:      #0A0A0A;   /* on bright/cream */
  --paper:    #FFFFFF;   /* on dark */
  --muted:    #9A9A9A;   /* secondary on dark */
  --muted-ink:#3A3A3A;   /* secondary on bright */

  /* ---- Neon accents (use one per surface) ---- */
  --lime:     #C9F227;
  --cyan:     #34F5DC;
  --magenta:  #F22DC4;
  --pink:     #F58FE0;
  --orange:   #F7861A;
  --red:      #FF3B1F;

  /* ---- Type ---- */
  --font-display: 'Archivo', system-ui, sans-serif;   /* wght 800, stretch 80% */
  --font-mono:    'Space Mono', 'JetBrains Mono', monospace;
  --font-body:    'Inter', 'Archivo', system-ui, sans-serif;

  --step-eyebrow: 0.75rem;
  --step-body:    1.0625rem;
  --step-title:   clamp(1.4rem, 2.5vw, 2rem);   /* card titles */
  --step-hero:    clamp(2.5rem, 7vw, 6rem);      /* hero headline */
  --track-mono:   0.12em;

  /* ---- Space / radius / motion ---- */
  --gap:        1.25rem;
  --card-pad:   2rem;
  --section-y:  clamp(4rem, 10vw, 8rem);
  --radius-card: 24px;
  --radius-btn:  4px;
  --ease:       cubic-bezier(0.2, 0.8, 0.2, 1);
  --dur:        260ms;
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

Font loading (Google Fonts):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;800&family=Space+Mono:wght@400;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```
If you want a narrower/heavier hero cut than Archivo gives, swap display to `Oswald:wght@600;700` or `Anton` and keep everything else.

---

## Accent semantics (conventions, not laws)

| Accent    | Hex      | Typical use                                   |
|-----------|----------|-----------------------------------------------|
| lime      | #C9F227  | architecture, build, "transformación"         |
| cyan      | #34F5DC  | data, planning, analytics-input               |
| magenta   | #F22DC4  | the brand itself, the highlighted headline word |
| pink      | #F58FE0  | public-facing, innovation, soft surfaces      |
| orange    | #F7861A  | R&D / I+D+i, analytics-output                  |
| red       | #FF3B1F  | the hand mark, real alerts — almost nothing else |

Keep one accent dominant per section. A card grid may use the full set (one accent per card); a hero should pick a single accent for its highlighted word.

---

## Brand variant recipe

Every component reads from the custom properties above, so re-skinning = redefining variables only.

1. **Surface strategy** — choose one:
   - *All-dark + accents*: `--base`/`--void` everywhere, color only via accent cards and the headline word. (ÁGATA cards, DIMARK.)
   - *Dark/cream alternation*: dark hero → `--cream` section with black cards → dark section. (ÁGATA full site.)
   - *Dark with a luminous transition*: white top → bright accent band → near-black, accent for code/labels. (HackerRank.)
2. **Accent count** — ÁGATA uses a full rainbow because it has 7 distinct "rutas". Most brands want **one or two** signature accents. Drop the unused ones from the palette so they don't creep in.
3. **Display font** — keep the heavy-condensed-uppercase principle; change the face to match brand voice if needed. Always keep the **mono eyebrow** convention — it's load-bearing for the system-output feel.
4. **Signature mark + wordmark** — replace `assets/hand-mark.svg` and the `[NOMBRE]` bracket treatment.

That's it — leave the component CSS alone.

---

## Worked variant: HackerRank-style (dark + single green)

```css
:root {
  --base:    #0B0F14;   /* near-black with a cool cast */
  --void:    #060A0E;
  --cream:   #FFFFFF;    /* a genuinely white top section */
  --paper:   #FFFFFF;
  --muted:   #8A93A0;
  --green:   #19E57E;    /* the one accent */
  --font-display: 'Inter', sans-serif;   /* lighter, rounder than ÁGATA */
  --font-mono:    'JetBrains Mono', monospace;
}
```
Signature move: a luminous green horizontal band as the section transition between the white top and the dark lower half; mono used inline to highlight single words (`human plus AI`).

## Worked variant: DIMARK-style (red on black agency)

```css
:root {
  --base:   #0B0608;   /* black with a faint warm/maroon cast */
  --void:   #000000;
  --red:    #E11324;   /* the one accent */
  --paper:  #FFFFFF;
  --muted:  #8A8A8A;
  --font-display: 'Anton', 'Oswald', sans-serif;  /* very heavy condensed */
}
```
Signature move: oversized condensed uppercase headline with one line in `--red`, faint geometric grid + a dim red globe in the background, dual buttons (solid red + outline). Eyebrow with a leading rule: `—— AGENCIA DIGITAL · MEDELLÍN · LATAM · USA`.
