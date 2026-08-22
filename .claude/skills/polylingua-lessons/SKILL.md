---
name: polylingua-lessons
description: Use this skill whenever working in the PolyLingua repo (Astro app in /home/user/PolyLingua, or any clone of ylnaud/PolyLingua) on lesson content — adding a new lesson, adding or editing quiz/exercises fields, expanding a language/level, or touching src/content/lessons/**/*.md, src/content.config.ts, or src/components/Practice.astro. Trigger this proactively for requests like "añade una lección de X", "añade ejercicios a las lecciones de Y", "expande el nivel Z", "completa el curso de [idioma]" — even if the user doesn't mention "PolyLingua" or "skill" by name, as long as the file paths or request shape match this project. Captures the content schema, YAML formatting gotchas that have caused real build breaks, the content style guide, and the shipping workflow (build → commit → PR → merge) this project uses.
---

# PolyLingua lesson content

PolyLingua is a 5-language learning site (alemán, inglés, francés, italiano, portugués
— each with A1 to C2, 8 lessons per level, 240 lessons total). Every lesson is one
Markdown file with structured frontmatter that Astro's Content Layer validates against
a Zod schema at build time. That validation is your safety net — a broken lesson fails
`npx astro build` loudly instead of shipping a silently-corrupt page.

## Where things live

- Content: `src/content/lessons/{lang}/{level}/{slug}.md` — `lang` ∈ `de en fr it pt`,
  `level` ∈ `a1 a2 b1 b2 c1 c2`.
- Schema (source of truth, always read this before writing frontmatter — it can
  evolve): `src/content.config.ts`.
- Renderer for quiz + exercises: `src/components/Practice.astro`. This replaced an
  older `Quiz.astro` (deleted) that only handled multiple-choice — don't recreate it.
  `Practice.astro` takes `quiz` and `exercises` as separate props and interleaves them
  into one deck with a shared progress bar and score.
- Full worked example with every field populated, including all 4 exercise types:
  `references/example-lesson.md` in this skill (mirrors the real
  `src/content/lessons/de/a1/articulos-der-die-das.md`).

## Frontmatter shape

Every lesson needs: `language`, `level`, `title`, `description`, `order` (position
within its level), `grammarTopic`, `funFact`, `minutes`, `quiz` (array), `exercises`
(array). `funFact` isn't trivia — it's the "💡 Truco para no aburrirte" callout, so tie
it to the actual grammar point.

`quiz` items: `question`, `options` (≥2), `answerIndex`, `explanation`.

`exercises` items are a discriminated union on `type` — read the four shapes straight
from `src/content.config.ts` before writing any, since a mismatched field name fails
validation with a Zod error that's easy to misdiagnose from the message alone:

- `fill-blank` — `sentence` (must contain the literal `___`), `answer`, optional
  `accepted` (alt. spellings/casing), `hint`, `translation`.
- `match` — `instructions` (optional), `pairs` (**minimum 3**) of `{left, right}`.
- `write` — `prompt`, `answer`, optional `accepted`, `hint`.
- `order` — `sentence` (the full correct sentence, words separated by a single space),
  optional `translation`.

A lesson that mixes `quiz` and `exercises` renders them as one continuous practice
session — there's no need to keep them thematically separate; `exercises` is additive
content on top of whatever `quiz` already has.

## YAML pitfalls that have actually broken this repo

These aren't hypothetical — each one shipped a broken build at least once:

1. **Never write a flow-style array with a trailing comma before a newline**, e.g.
   `options: ["a", "b", "c"], ` followed by a new key on the next line. That trailing
   comma is a YAML mapping error, not just a style nit — it breaks the parser outright.
   Always use block style instead:
   ```yaml
   options:
     - 'a'
     - 'b'
     - 'c'
   ```
   (Both block and inline `["a", "b", "c"]` without a trailing comma work fine — the
   trailing comma outside the brackets is the actual bug.)
2. **`order` exercises: trim words before joining, don't rely on JSX whitespace.** If
   you ever touch `Practice.astro`'s word-chip rendering, remember that Astro renders
   `{word}` inside a multi-line JSX block with surrounding whitespace/newlines in the
   source — `chip.textContent` can carry that whitespace into the string. The fix
   already in place is `.trim()` on every word before joining for comparison; don't
   remove it, and don't add new per-word text handling that skips it.
3. **Quote any string containing `:` or embedded quotes.** Unquoted strings with a
   colon get parsed as a new mapping key, silently truncating your value.
4. **`match.pairs` needs at least 3 entries** — the schema enforces this with `.min(3)`,
   so a 2-pair match block fails the build, not just a lint warning.

Always finish a content pass with `npx astro build` (not just eyeballing the YAML) —
it's the only check that actually runs the Zod schema and catches malformed frontmatter
before it reaches a PR.

## Content style

- Lessons are written in Spanish (explanations, headers, hints) but _teach_ the target
  language — a French lesson's `quiz`/`exercises` sentences are in French, a
  Portuguese lesson's are in Portuguese, etc. Keep hints/translations in Spanish
  throughout, matching the rest of the course.
- Every `fill-blank`, `write`, and `order` exercise should reuse vocabulary or example
  sentences that already appear in that lesson's own body — don't invent unrelated
  vocabulary. This keeps the exercise reinforcing what the lesson just taught instead
  of testing something new.
- `hint` fields should explain the _rule_, not just restate the answer (see the
  example: "Terminación -ig: masculina con 98% de certeza" rather than "es 'der'").
- Match `order` in this project's naming style for lesson counts: at levels A1-A2, aim
  for grammar/vocab fundamentals; B1-B2 for connectors and compound tenses; C1 for
  advanced/register-specific grammar and vocabulary (business, academic); C2 for
  cultural nuance (idioms, irony, regional variants, rhetoric, literary style) — this
  mirrors the existing 8-lessons-per-level structure across all 5 languages, so a new
  lesson should slot into whichever tier fits its difficulty.

## Global CSS gotcha worth knowing

`src/styles/global.css` has a global rule `[hidden] { display: none !important; }`.
It exists because `.btn`/`.install-btn` set `display: inline-flex`, which — without
that override — wins the cascade over the browser's default `[hidden]` styling (author
CSS beats the UA stylesheet even at equal specificity), leaving supposedly-hidden
buttons visibly on screen. If you add new interactive elements toggled via the
`hidden` attribute, you don't need to do anything extra — this rule already covers
them — but don't remove it without understanding why it's there.

## Shipping workflow

This repo has shipped ~10 rounds of content/feature work with this exact loop; follow
it rather than improvising a different one:

1. Confirm you're on the working branch (check with the user if unclear which branch
   they want — this repo has used a single long-lived feature branch reset from `main`
   between rounds).
2. Write/edit the lesson file(s).
3. `npx astro build` — must complete with no errors before moving on. Check the final
   page count line to sanity-check nothing regressed.
4. `git add` the specific files (not `-A` blindly), commit with a descriptive Spanish
   message summarizing what changed and why (see recent `git log` for tone/format).
5. `git push -u origin <branch>`.
6. Open a PR with `mcp__github__create_pull_request` (base `main`), then merge with
   `mcp__github__merge_pull_request` using `merge_method: "squash"`. Include a short
   test-plan checklist in the PR body (build passed, counts verified) — that's the
   established PR body style here.

## Scaling to "add exercises/lessons across many files"

When the task is "populate exercises for a whole language" or "write N lessons per
level," don't do all 40+ files serially in one context — this repo has successfully
parallelized that kind of work by spawning one Agent per language×level pair (8 files
each), giving each agent:

- The exact Zod shapes copied inline (agents can't always re-read `content.config.ts`
  reliably mid-task, so paste the shapes into the prompt).
- A pointer to `references/example-lesson.md` (or the live example file) as the
  literal YAML formatting template.
- An explicit instruction to verify their own output (re-parse the YAML, confirm
  `___` present in every `fill-blank`, confirm `match.pairs.length >= 3`) before
  reporting done — catching mistakes per-agent is much cheaper than catching them in
  a 40-file build failure afterward.
- A note not to touch `quiz` or the Markdown body, only add/edit the field in scope —
  this keeps parallel agents from stepping on each other or on unrelated content.

After all agents report back, always run one final `npx astro build` yourself over the
whole repo before shipping — individual agents verifying their own slice doesn't
guarantee cross-file consistency (e.g. duplicate `order` values within a level).
