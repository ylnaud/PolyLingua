---
name: polylingua-lessons
description: Use this skill whenever working in the PolyLingua repo (Astro app in /home/user/PolyLingua, or any clone of ylnaud/PolyLingua) on lesson content — adding a new lesson, adding or editing quiz/exercises fields, expanding a language/level, or touching src/content/lessons/**/*.md, src/content.config.ts, or src/components/Practice.astro. Trigger this proactively for requests like "añade una lección de X", "añade ejercicios a las lecciones de Y", "expande el nivel Z", "completa el curso de [idioma]" — even if the user doesn't mention "PolyLingua" or "skill" by name, as long as the file paths or request shape match this project. Captures the content schema, YAML formatting gotchas that have caused real build breaks, the content style guide, and the shipping workflow (build → commit → PR → merge) this project uses.
---

# PolyLingua lesson content

PolyLingua teaches five languages (alemán, inglés, francés, italiano, portugués) from
A1 to C2. Every lesson is one Markdown file with structured frontmatter that Astro's
Content Layer validates against a Zod schema at build time. That validation is your
safety net — a broken lesson fails `npx astro build` loudly instead of shipping a
silently-corrupt page.

## Two language axes — get this wrong and the build fails on a confusing error

A lesson has **two** languages, not one, and confusing them is the most expensive
mistake you can make here:

- **`userLang`** — the language the explanation is written in. Both `es` and `en` are
  active today.
- **`targetLang`** — the language being taught. Six exist: `de en es fr it pt`.

The frontmatter field `language` is **always the targetLang**. The userLang is never
in the frontmatter — it is inferred from the folder name.

## Where things live

- Content: **`src/content/lessons/<userLang>-<targetLang>/<level>/<slug>.md`**, e.g.
  `src/content/lessons/es-de/a1/articulos-der-die-das.md`. The six courses that exist
  are `es-de` (91 lessons), `en-de` (84, visible now that `en` is active), `es-fr` (78),
  `es-en` (77), `es-it` (77), `es-pt` (77). 484 lessons total.

  There is **no** `src/content/lessons/de/…` folder. Writing one there fails the build
  — but with an error that never names your file:

  ```
  generating static routes
  Missing parameter: targetLang
    Location: node_modules/astro/dist/core/routing/generator.js:18:13
  ```

  (Verified by actually creating one, not inferred.) The glob picks the file up,
  `parseLessonId('de/a1/x')` returns `targetLang: undefined`, and Astro's route
  generator rejects the undefined param. If you ever see `Missing parameter: targetLang`
  and nothing you touched looks related, check for a lesson in a single-language
  folder: `ls src/content/lessons/` should show only the six `xx-yy` courses.

- Which courses exist is derived from those folder names by `src/lib/courses.ts` —
  never hard-code a course list. Use `getCourseStaticPaths`, `getTargetLangsFor` and
  `getCourseLessons`. Filtering only by the `language` field is a known bug source: it
  matches both `es-de` and `en-de`.
- `src/lib/lessonPath.ts` (`parseLessonId`) is the single place that knows the id
  format. Don't re-split ids by hand.
- Schema (source of truth, always read this before writing frontmatter — it can
  evolve): `src/content.config.ts`.
- Renderer for quiz + exercises: `src/components/Practice.astro`. This replaced an
  older `Quiz.astro` (deleted) that only handled multiple-choice — don't recreate it.
  `Practice.astro` takes `quiz` and `exercises` as separate props and interleaves them
  into one deck with a shared progress bar and score.
- Full worked example with every field populated, including all 4 exercise types:
  `references/example-lesson.md` in this skill (mirrors the real
  `src/content/lessons/es-de/a1/articulos-der-die-das.md`).

## Frontmatter shape

Required by Zod: `language` (the **targetLang**), `level`, `title`, `description`,
`order` (position within its level), `grammarTopic`, `funFact`. `funFact` isn't trivia
— it's the "💡 Truco para no aburrirte" callout, so tie it to the actual grammar point.

Two more that Zod treats as optional but you should always fill in:

- **`unit`** — optional to the schema, **not** to the level page. Every level today has
  units defined in `src/data/units.ts` (keyed `<targetLang>-<level>`), and the page
  groups lessons by unit. A lesson with no `unit`, or a `unit` that isn't in that list,
  belongs to no group. Fifteen lessons were once invisible on their own level page
  while still sitting in the sitemap. `tests/data-integrity.test.ts` now fails if one
  appears. If the topic fits no existing unit, add a unit to `units.ts` — don't leave
  the field empty.
- **`skills`** — feeds the adaptive engine (`src/lib/engine/`, documented in
  `docs/LEARNING_ENGINE.md`). Ids come from the catalogue in `src/data/skills.ts`
  (`de.a1.wordorder.basic`). The relation is N:N. All 484 lessons across the six
  courses are tagged, `en-de` included. Tests fail if you reference a skill that
  doesn't exist, or leave a skill with no lesson. Tagged doesn't mean equally
  covered: the catalogue has 413 skills, and only 253 have a repair template in
  `REPAIR_TEMPLATES` (`src/lib/engine/exerciseGenerator.ts`). Those templates are
  written in Spanish, so the English interface's repair loop only lights up where
  a translated gloss also exists — today, the 17 A1 German skills in
  `REPAIR_GLOSSES.en`. Everything else stays tagged and still feeds the engine; it
  just has no repair loop. Every skill in category `grammar` or `word_order` needs
  a repair template — `tests/engine.test.ts` enforces it, so a new skill in either
  category ships broken without one.

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
- Pitch the topic to its level: A1-A2 grammar/vocab fundamentals; B1-B2 connectors and
  compound tenses; C1 advanced or register-specific grammar and vocabulary (business,
  academic); C2 cultural nuance (idioms, irony, regional variants, rhetoric, literary
  style). Levels do **not** hold a fixed number of lessons — across the six courses it
  runs from 135 at A1 down to 56 at B2 — so slot a new lesson wherever its difficulty
  fits rather than padding a level to a target count.

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
3. Run all three checks that actually exist in `package.json` — there is no `lint`
   script, don't invent one:
   - `npm run check` — **read the `- N errors` line specifically.** The output ends
     with ~125 hints, so `| tail -3` hides the error count and a build with 6 real
     errors looks green. This has happened.
   - `npm test` — the suite is the safety net for units, skills and SEO invariants.
   - `npm run build` — the only thing that runs the Zod schema. Check the page count.
4. Format **only the files you touched**, never the whole repo:
   `git diff --name-only | xargs npx prettier --write`. Running `prettier --write .`
   reformats dozens of unrelated lessons and buries your real change in the diff — it
   has polluted commits here twice. If a lesson shows up in `git status` that you never
   meant to edit, `git restore` it before committing.
5. `git add` the specific files (not `-A` blindly), commit with a descriptive Spanish
   message summarizing what changed and why (see recent `git log` for tone/format).
6. `git push -u origin <branch>`.
7. Open a PR with `mcp__github__create_pull_request` (base `main`), then merge with
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
