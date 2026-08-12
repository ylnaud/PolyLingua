/**
 * Builds a `.practice-item` fieldset at runtime, matching the exact markup that
 * Practice.astro generates at build time for each exercise `kind`. This exists only
 * for the review/SRS page (src/pages/idiomas/[lang]/repasar.astro), which is the one
 * place in the app that must assemble Practice's DOM from data read out of
 * localStorage instead of from static frontmatter — a static Astro build has no way
 * to know ahead of time which items a given visitor has due for review.
 *
 * If Practice.astro's template markup for a given kind ever changes, this file must
 * be updated to match, since Practice.astro's own client script (querying via the
 * data-* attributes used here) is what actually drives interaction once these
 * fieldsets are inserted into the DOM.
 */

export interface SrsEntry {
  id: string;
  kind: string;
  data: any;
  box: number;
  due: string;
  lang: string;
  level: string;
}

const KIND_LABELS: Record<string, string> = {
  choice: '🔘 Opción múltiple',
  'fill-blank': '✏️ Completa el hueco',
  match: '🔗 Empareja',
  write: '⌨️ Escribe la respuesta',
  order: '🧩 Ordena la frase',
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

export function buildItemFieldset(entry: SrsEntry, index: number): HTMLFieldSetElement {
  const { kind, data, id } = entry;
  const fieldset = el('fieldset', {
    class: 'practice-item',
    'data-practice-item': '',
    'data-kind': kind,
    'data-index': String(index),
    'data-item-id': id,
    'data-item-json': JSON.stringify(data),
    'data-spoken-only': kind === 'write' && data.spokenOnly ? 'true' : 'false',
  });
  if (index !== 0) fieldset.hidden = true;

  fieldset.appendChild(el('span', { class: 'kind-tag' }, KIND_LABELS[kind] ?? kind));

  if (kind === 'choice') {
    fieldset.appendChild(el('legend', {}, data.question));
    const options = el('div', { class: 'options' });
    (data.options as string[]).forEach((opt, oi) => {
      const btn = el('button', {
        type: 'button',
        class: 'option',
        'data-option': '',
        'data-correct': oi === data.answerIndex ? 'true' : 'false',
      });
      btn.textContent = opt;
      options.appendChild(btn);
    });
    fieldset.appendChild(options);
  }

  if (kind === 'fill-blank' || kind === 'write') {
    if (kind === 'fill-blank') {
      fieldset.appendChild(el('legend', {}, 'Completa la frase'));
      const idx = (data.sentence as string).indexOf('___');
      const before = idx === -1 ? data.sentence : data.sentence.slice(0, idx);
      const after = idx === -1 ? '' : data.sentence.slice(idx + 3);
      const p = el('p', { class: 'prompt-sentence' });
      p.append(before, el('span', { class: 'blank-marker', 'aria-hidden': 'true' }, '___'), after);
      fieldset.appendChild(p);
      if (data.translation) fieldset.appendChild(el('p', { class: 'prompt-translation' }, data.translation));
    } else {
      fieldset.appendChild(
        el('legend', {}, data.spokenOnly ? '🔊 Escucha y escribe lo que oís' : data.prompt)
      );
      if (data.spokenOnly) {
        fieldset.appendChild(
          el(
            'button',
            {
              type: 'button',
              class: 'speak-btn spoken-only-speak',
              'data-speak': '',
              'data-speak-text': data.answer,
              'aria-label': 'Escuchar de nuevo',
            },
            '🔊 Escuchar'
          )
        );
      }
    }
    const inputId = `review-input-${index}`;
    const label = el('label', { class: 'visually-hidden', for: inputId }, 'Tu respuesta');
    fieldset.appendChild(label);
    const row = el('div', { class: 'answer-row' });
    const input = el('input', {
      type: 'text',
      id: inputId,
      class: 'answer-input',
      'data-answer-input': '',
      'data-answer': data.answer,
      'data-accepted': (data.accepted ?? []).join('|'),
      autocomplete: 'off',
      autocapitalize: 'off',
      spellcheck: 'false',
    });
    const checkBtn = el('button', { type: 'button', class: 'btn btn-primary check', 'data-check': '' }, 'Comprobar');
    row.append(input, checkBtn);
    fieldset.appendChild(row);
    if (data.hint) {
      const details = el('details', { class: 'hint' });
      details.append(el('summary', {}, '💡 Pista'), el('p', {}, data.hint));
      fieldset.appendChild(details);
    }
  }

  if (kind === 'match') {
    fieldset.appendChild(
      el('legend', {}, data.instructions ?? 'Empareja cada elemento con su pareja correcta')
    );
    const pairs = data.pairs as { left: string; right: string }[];
    const board = el('div', { class: 'match-board', 'data-match-board': '', 'data-remaining': String(pairs.length) });
    const leftCol = el('div', { class: 'match-col', 'data-match-col': 'left' });
    pairs.forEach((pair, pi) => {
      const row = el('div', { class: 'option-row' });
      const btn = el('button', { type: 'button', class: 'match-item', 'data-match-item': '', 'data-side': 'left', 'data-pair': String(pi) }, pair.left);
      const speakBtn = el('button', {
        type: 'button',
        class: 'speak-btn match-speak',
        'data-speak': '',
        'data-speak-text': pair.left,
        'aria-label': `Escuchar «${pair.left}»`,
      }, '🔊');
      row.append(btn, speakBtn);
      leftCol.appendChild(row);
    });
    const rightCol = el('div', { class: 'match-col', 'data-match-col': 'right' });
    shuffle(pairs.map((_, pi) => pi)).forEach((pi) => {
      rightCol.appendChild(
        el('button', { type: 'button', class: 'match-item', 'data-match-item': '', 'data-side': 'right', 'data-pair': String(pi) }, pairs[pi].right)
      );
    });
    board.append(leftCol, rightCol);
    fieldset.appendChild(board);
  }

  if (kind === 'order') {
    fieldset.appendChild(el('legend', {}, 'Ordena las palabras para formar la frase correcta'));
    if (data.translation) fieldset.appendChild(el('p', { class: 'prompt-translation' }, data.translation));
    fieldset.appendChild(
      el('div', {
        class: 'order-assembled',
        'data-order-assembled': '',
        'data-answer': data.sentence,
        'aria-label': 'Frase que estás construyendo',
      })
    );
    const words = (data.sentence as string).split(' ');
    const bank = el('div', { class: 'order-bank', 'data-order-bank': '' });
    shuffle(words.map((_, wi) => wi)).forEach((wi) => {
      bank.appendChild(
        el('button', { type: 'button', class: 'word-chip', 'data-word-chip': '', 'data-word-index': String(wi) }, words[wi])
      );
    });
    fieldset.appendChild(bank);
    fieldset.appendChild(el('button', { type: 'button', class: 'btn btn-primary check', 'data-check': '', hidden: '' }, 'Comprobar'));
  }

  fieldset.appendChild(el('p', { class: 'feedback', 'data-feedback': '', role: 'status', 'aria-live': 'polite' }));
  const explanation = el('p', { class: 'explanation', 'data-explanation': '', hidden: '' });
  if (kind === 'choice') explanation.textContent = data.explanation ?? '';
  fieldset.appendChild(explanation);
  if (kind === 'fill-blank' || kind === 'write' || kind === 'order') {
    fieldset.appendChild(
      el('button', { type: 'button', class: 'speak-btn reveal-speak', 'data-speak': '', 'data-reveal-speak': '', hidden: '' }, '🔊 Escuchar')
    );
  }
  fieldset.appendChild(el('button', { type: 'button', class: 'btn btn-primary next', 'data-next': '', hidden: '' }, 'Siguiente →'));

  return fieldset;
}
