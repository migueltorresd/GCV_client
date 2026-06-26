# Component Recipes

Copy-paste HTML/CSS for the core kit. All read from the tokens in `tokens.md`. Match the spacing, radius, and structure here so pages stay coherent. Markup is plain HTML so it drops into any stack (also trivial to port to JSX/NestJS+templating).

## Contents
- Base reset & page shell
- Eyebrow
- Neon card + card grid
- Hero
- Buttons
- Nav
- Section intro
- Writing notes

---

## Base reset & page shell

```css
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--base);
  color: var(--paper);
  font-family: var(--font-body);
  font-size: var(--step-body);
  line-height: 1.55;
}
.container { max-width: 1200px; margin-inline: auto; padding-inline: clamp(1.25rem, 4vw, 3rem); }
section { padding-block: var(--section-y); }
:focus-visible { outline: 2px solid var(--lime); outline-offset: 3px; }  /* swap to brand accent */
```

---

## Eyebrow

The quietest element; sets the system-output tone. Mono, uppercase, tracked.

```html
<span class="eyebrow">7 RUTAS</span>
<!-- or a category list -->
<span class="eyebrow">AGENTES IA / SOLUCIONES / CONSULTORÍA / ANALÍTICA / FORMACIÓN</span>
```
```css
.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--step-eyebrow);
  letter-spacing: var(--track-mono);
  text-transform: uppercase;
  color: currentColor;        /* inherits accent on dark cards, ink on bright */
  opacity: 0.85;
}
```

---

## Neon card + grid

Two card flavours: **bright** (accent fill, black ink) and **dark** (void bg, neon eyebrow + neon title).

```html
<div class="card-grid">
  <!-- bright card -->
  <article class="card card--bright" style="--accent: var(--lime)">
    <header class="card__top">
      <span class="eyebrow">7 RUTAS</span>
      <svg class="card__mark" aria-hidden="true"><use href="assets/hand-mark.svg#hand"/></svg>
    </header>
    <h3 class="card__title">Transformación digital · Arquitectura</h3>
    <span class="card__tag">GOVTECH</span>
  </article>

  <!-- dark card -->
  <article class="card card--dark" style="--accent: var(--cyan)">
    <header class="card__top">
      <span class="eyebrow" style="color: var(--accent)">AGENTES IA / SOLUCIONES</span>
    </header>
    <h3 class="card__title" style="color: var(--accent)">Laboratorio de agentes de IA</h3>
    <p class="card__body">Automatizamos procesos para que te enfoques en lo estratégico.</p>
  </article>
</div>
```
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--gap);
}
.card {
  border-radius: var(--radius-card);
  padding: var(--card-pad);
  min-height: 320px;
  display: flex;
  flex-direction: column;
}
.card__top { display: flex; justify-content: space-between; align-items: flex-start; }
.card__mark { width: 28px; height: 28px; }
.card__title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--step-title);
  text-transform: uppercase;
  line-height: 1.05;
  margin: auto 0 0;          /* push title toward middle/lower */
}
.card__tag {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: 0.04em;
  margin-top: 1.25rem;
}
.card__body { color: var(--muted); margin-top: 1rem; }

.card--bright { background: var(--accent); color: var(--ink); }
.card--bright .card__mark { color: var(--ink); }
.card--dark   { background: var(--void); color: var(--paper); }
.card--dark .card__body { color: var(--muted); }
```

---

## Hero

```html
<section class="hero">
  <div class="container">
    <p class="hero__eyebrow"><span class="rule"></span> AGENCIA DIGITAL · MEDELLÍN · LATAM</p>
    <h1 class="hero__title">Hacemos crecer <span class="hl">tu negocio</span> digitalmente</h1>
    <p class="hero__sub"><strong>+10 años</strong> convirtiendo inversión digital en resultados medibles.</p>
    <div class="hero__cta">
      <a class="btn btn--solid" href="#">Elegir mi plan →</a>
      <a class="btn btn--outline" href="#">Ver casos de éxito</a>
    </div>
  </div>
</section>
```
```css
.hero { padding-block: clamp(5rem, 14vw, 11rem); }
.hero__eyebrow {
  font-family: var(--font-mono);
  font-size: var(--step-eyebrow);
  letter-spacing: var(--track-mono);
  text-transform: uppercase;
  color: var(--magenta);             /* the section's single accent */
  display: flex; align-items: center; gap: 0.75rem;
}
.hero__eyebrow .rule { width: 2.5rem; height: 1px; background: currentColor; }
.hero__title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: var(--step-hero);
  text-transform: uppercase;
  line-height: 0.95;
  margin: 1.5rem 0;
  max-width: 14ch;
}
.hero__title .hl { color: var(--magenta); }
.hero__sub { color: var(--muted); max-width: 48ch; }
.hero__sub strong { color: var(--paper); }
.hero__cta { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 2rem; }
```

---

## Buttons

```css
.btn {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.95rem 1.4rem;
  border-radius: var(--radius-btn);
  text-decoration: none;
  display: inline-block;
  transition: transform var(--dur) var(--ease), background var(--dur) var(--ease);
}
.btn--solid   { background: var(--magenta); color: var(--ink); border: 1px solid var(--magenta); }
.btn--outline { background: transparent; color: var(--paper); border: 1px solid #3a3a3a; }
.btn:hover    { transform: translateY(-2px); }
.btn--outline:hover { border-color: var(--paper); }
```

---

## Nav

```html
<nav class="nav">
  <a class="nav__brand" href="/">[<span>ÁGATA</span>]</a>
  <ul class="nav__links">
    <li><a href="#">Inicio</a></li>
    <li><a href="#">¿Qué hacemos?</a></li>
    <li><a href="#">Ágata HUB</a></li>
  </ul>
  <a class="btn btn--outline nav__cta" href="#">Contáctanos</a>
</nav>
```
```css
.nav { display: flex; align-items: center; gap: 2rem; padding: 1.25rem clamp(1.25rem,4vw,3rem); }
.nav__brand { font-family: var(--font-mono); font-weight: 700; letter-spacing: 0.08em; color: var(--magenta); text-decoration: none; }
.nav__brand span { color: var(--paper); }
.nav__links { display: flex; gap: 1.75rem; list-style: none; margin: 0; padding: 0; }
.nav__links a { color: var(--paper); text-decoration: none; font-size: 0.95rem; }
.nav__links a:hover { color: var(--magenta); }
.nav__cta { margin-left: auto; }
```

---

## Section intro (centered)

```html
<div class="intro">
  <span class="eyebrow">¿QUIÉNES SOMOS?</span>
  <h2 class="intro__title">Tecnología para innovar lo público</h2>
  <p class="intro__sub">Te acompañamos a resolver tus retos públicos con tecnología e innovación.</p>
</div>
```
```css
.intro { text-align: center; max-width: 60ch; margin: 0 auto clamp(2.5rem,6vw,4rem); }
.intro__title { font-family: var(--font-mono); font-size: clamp(1.8rem, 4vw, 2.75rem); margin: 0.75rem 0; }
.intro__sub { color: var(--muted); }
```

---

## Writing notes

- Spanish, civic/tech register. Verb-led, concrete: "Digitalizamos trámites y modernizamos los procesos", not "Soluciones end-to-end de transformación".
- Eyebrows are terse category tags, often a `/`-separated list. They name what the thing *is*, in the user's vocabulary.
- A control says exactly what it does and keeps that name through the flow: a button "Elegir mi plan" leads somewhere about choosing a plan.
- Empty/error states: plain directive copy in the interface's voice, never an apology and never vague. "No hay solicitudes todavía. Crea la primera." over "¡Ups! Algo salió mal."
- One job per element: a label labels, an example demonstrates. No element does double duty.
