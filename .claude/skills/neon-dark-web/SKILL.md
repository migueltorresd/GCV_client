---
name: neon-dark-web
description: >-
  Build web pages and UI in a high-contrast "neon-on-dark" civic-tech design language —
  saturated neon accents (lime, cyan, magenta, orange) on near-black canvases, bold condensed
  uppercase display type, monospace eyebrows/labels, and full-bleed color card grids. The
  default direction is the ÁGATA / GOVTECH look, and the system is built to be re-skinned for
  other brands in the same family (HackerRank-style dark+single-accent, DIMARK-style red-on-black
  agency landings). Use this skill whenever the user wants a landing page, hero section, card grid,
  or marketing/site UI with a dark background and bright neon accents, mentions "ÁGATA", "GOVTECH",
  "govtech", "neon", "dark theme with bright accents", "tarjetas de colores", or shows a reference
  in this style — even if they don't name the skill explicitly. Prefer it over generic styling for
  any dark, high-contrast, accent-driven web design.
license: MIT
---

# Neon-Dark Web

You are the design lead for a studio whose signature is **bright neon energy on disciplined dark surfaces**. The look is confident and a little editorial: huge condensed headlines, monospace labels that read like system output, and big blocks of saturated color used as full surfaces rather than timid accents. It should feel civic/tech-forward — government innovation, developer tooling, agency landings — never corporate-pastel.

The default brand is **ÁGATA / GOVTECH**. Start there unless the brief says otherwise, then re-skin via the variant recipe in `references/tokens.md`.

## The thesis

Three moves carry this entire language. Get these right and everything else follows.

1. **Color is a surface, not a sprinkle.** Accents are used as whole card backgrounds (a lime card, a magenta card) or as the single highlighted word in a headline — not as little buttons and badges scattered around. One surface = one accent. When a surface is a bright accent, all text on it is near-black ink. When a surface is dark, text is white and the accent appears only in the eyebrow + title.
2. **Type does the talking.** Display headlines are heavy, condensed, uppercase, and large enough to crop or wrap hard. Eyebrows and labels are monospace, uppercase, letter-spaced — they read like a terminal tag (`7 RUTAS`, `AGENTES IA / SOLUCIONES / CONSULTORÍA`). The contrast between brutal display type and small mono labels is the personality.
3. **One signature mark.** A single recurring glyph (the open-hand mark, top-right of every card) plus a bracketed wordmark `[NOMBRE]` ties the system together. Use it sparingly and consistently.

## Default palette (ÁGATA / GOVTECH)

Define these as CSS custom properties. Full tables and the re-skin recipe live in `references/tokens.md` — read it when starting a new brand or when you need the complete scale.

```css
:root {
  /* Surfaces */
  --void:     #0A0A0A;  /* pure-black cards, deepest panels */
  --base:     #141414;  /* page canvas */
  --elevated: #1F1F1F;  /* dark-gray card */
  --cream:    #FAF3EA;  /* light section / cream card */

  /* Ink */
  --ink:      #0A0A0A;  /* text on bright/cream surfaces */
  --paper:    #FFFFFF;  /* text on dark surfaces */
  --muted:    #9A9A9A;  /* secondary text on dark */

  /* Neon accent family — one per surface */
  --lime:     #C9F227;
  --cyan:     #34F5DC;
  --magenta:  #F22DC4;
  --pink:     #F58FE0;
  --orange:   #F7861A;
  --red:      #FF3B1F;  /* signature mark / alerts only */
}
```

Rule of thumb for which accent: lime = architecture/build, cyan = data/planning, magenta = the brand/headline word, orange = R&D/analytics, pink = public-facing/innovation, red = the hand mark and genuine alerts only. These are conventions, not laws — keep one accent dominant per section.

## Typography

Three roles. Load from Google Fonts; all are swappable, but keep the role structure.

- **Display** (headlines, card titles): a heavy condensed grotesque. Default `Archivo` (variable — use weight 800 + `font-stretch: 80%`) or `Oswald`/`Anton` for a narrower, heavier cut. Always uppercase for hero headlines, sentence-or-title case allowed for card titles.
- **Mono** (eyebrows, labels, data, the `[wordmark]`): `Space Mono` or `JetBrains Mono`. Uppercase, `letter-spacing: 0.08em–0.16em`, small.
- **Body** (paragraphs): `Inter` or `Archivo` at normal width. Keep measure ~60–70ch, color `--muted` on dark.

Set a deliberate scale (e.g. display clamp(2.5rem, 7vw, 6rem), eyebrow 0.75rem). Let headlines be big enough that they wrap to 2–3 lines — that wrapping is part of the look (see "TRANSFORMA-CIÓN DIGITAL").

## Core components

Recipes with copy-paste HTML/CSS are in `references/components.md` — read it before building any of these so you match spacing, radius, and structure exactly. Summary of the kit:

- **Eyebrow** — mono, uppercase, tracked-out label. Often a category list separated by `/`. The smallest, quietest element on the page; it sets the system-output tone.
- **Neon card** — radius ~24px, generous padding. Either a full bright-accent background with black ink, or `--void` black with a neon eyebrow + neon title + muted body. Eyebrow top-left, brand tag bottom-left, signature mark top-right. These tile into a 3-up responsive grid.
- **Hero** — eyebrow with leading em-dash rule (`— AGENCIA DIGITAL · MEDELLÍN`), then a massive condensed uppercase headline with **one** word in an accent color, a short mono/body subline, and two buttons.
- **Buttons** — solid (accent fill, black ink) as primary; outline (1px border, transparent) as secondary. Square or barely-rounded corners; arrow glyph `→` on the primary.
- **Nav** — minimal: wordmark left, sparse links, one solid accent CTA right. Thin or no border.

## Layout rhythm

Alternate **dark hero → cream content section → dark section**, or run all-dark with accent cards as the only color. The cream section is where black cards with neon titles live (see the ÁGATA "¿Quiénes somos?" grid). Big vertical padding between sections (`clamp(4rem, 10vw, 8rem)`). Center-aligned section intros (label + heading + one-line subhead) above left-aligned content grids.

## The signature mark

`assets/hand-mark.svg` is an **abstract open-hand placeholder**. It is NOT the real ÁGATA/ETB logo — that mark is ETB's registered property. When building for the real brand, swap in the licensed original. For any other brand, design or drop in that brand's own mark. Pair it with a bracketed wordmark: `[NOMBRE]`, wordmark in mono, brackets in the accent color.

## Writing the copy

Spanish, civic/tech register, active and concrete. Short verb-led claims ("Hacemos crecer tu negocio", "Tecnología para innovar lo público"). Eyebrows name categories tersely. Avoid filler and English buzzwords unless the brand is bilingual. Empty/error states get plain directive copy in the interface's voice. (See the writing notes in `references/components.md`.)

## Restraint

Spend boldness in one place per section — usually the headline word or one full-color card. Keep everything around it quiet: lots of black, disciplined spacing, no gratuitous gradients or glows. The three AI-generated-looking defaults to avoid: cream+serif+terracotta, generic numbered `01/02/03` markers when the content isn't actually a sequence, and ambient neon glow everywhere. Use numbered markers only for real sequences (the "7 RUTAS" set is a real set of 7). Hit the quality floor without announcing it: responsive to mobile, visible keyboard focus, `prefers-reduced-motion` respected, accent-on-dark and ink-on-bright contrast checked.

## How to extend to a new brand

1. Read `references/tokens.md` → "Brand variant recipe".
2. Pick a surface strategy (all-dark + accents, or dark/cream alternation) and **one or two** signature accents instead of the full ÁGATA rainbow (e.g. HackerRank = one green; DIMARK = one red).
3. Swap the display font if the brand needs a different voice, keep the mono-eyebrow convention.
4. Redefine only the CSS custom properties — every component reads from them, so nothing else changes.
5. Replace the signature mark + wordmark.

## Process

Plan the token set and one signature element in your head first, sanity-check it isn't a generic default, then build from `references/components.md`. After building, look at it with fresh eyes against the reference vibe and cut one thing.
