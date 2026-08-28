---
language: 'de'
level: 'c1'
title: 'German Participial Constructions (Partizipialkonstruktionen) | PolyLingua'
description: 'Master German Partizip I and Partizip II as compact adjectives and extended participial phrases (erweitertes Partizip), a hallmark of formal written German.'
order: 2
unit: 1
grammarTopic: 'Participial constructions: Partizip I, Partizip II, and erweitertes Partizip'
funFact: "Partizip I always answers \"doing what, right now?\" (der lachende Mann = the man WHILE laughing), while Partizip II always answers \"having what done to it?\" (der geschriebene Brief = the letter THAT WAS written). Once you sort every participle into one of those two questions, the extended construction — the long noun-phrase sandwich German loves in formal writing — stops looking scary and just becomes a relative clause folded flat."
minutes: 11
quiz:
  - question: 'What does Partizip I (the -end form) express when used as an adjective?'
    options: ['A completed action (passive)', 'A simultaneous, ongoing action (active)', 'A future intention']
    answerIndex: 1
    explanation: "Partizip I (infinitive + -d) expresses an active, ongoing action happening at the same time as the main clause: der lachende Mann = the man who is laughing."
  - question: 'What does Partizip II express when used as an adjective, for most transitive verbs?'
    options: ['A completed, passive action', 'An action in progress', 'A habitual action']
    answerIndex: 0
    explanation: 'Partizip II (the past participle) used adjectivally usually has passive, completed meaning: der geschriebene Brief = the letter that has been written.'
  - question: 'How is Partizip I formed?'
    options: ['Infinitive + -d', 'ge- + stem + -t', 'Präteritum stem + -end']
    answerIndex: 0
    explanation: "Partizip I = infinitive + -d: lachen → lachend, schlafen → schlafend. It then takes normal adjective endings when placed before a noun: der lachende Mann."
  - question: 'In "die von mir geschriebene E-Mail," what role does "von mir" play?'
    options: ['It modifies "die", agreeing in gender', 'It is the agent of the participle, embedded inside the extended participial phrase', 'It is unrelated to the participle']
    answerIndex: 1
    explanation: 'In an erweitertes Partizip (extended participial construction), everything between the article and the participle — including agents like "von mir" — modifies the participle, all packed before the noun.'
  - question: 'Which relative clause is equivalent to "die schnell wachsende Wirtschaft"?'
    options: ['die Wirtschaft, die schnell wächst', 'die Wirtschaft, die schnell gewachsen ist', 'die Wirtschaft, die schnell wachsen wird']
    answerIndex: 0
    explanation: 'Partizip I expresses simultaneous/ongoing action, so "die schnell wachsende Wirtschaft" unpacks to a present-tense relative clause: die Wirtschaft, die schnell wächst.'
  - question: 'Which relative clause is equivalent to "der 1990 gebaute Bahnhof"?'
    options: ['der Bahnhof, der 1990 gebaut wird', 'der Bahnhof, der 1990 gebaut wurde', 'der Bahnhof, der 1990 baut']
    answerIndex: 1
    explanation: 'Partizip II here has passive, completed meaning: der Bahnhof, der 1990 gebaut wurde (the station that was built in 1990).'
  - question: 'Where does the noun sit in an extended participial construction (erweitertes Partizip)?'
    options: ['Before the article', 'Right after the article, before all the modifiers', 'After all the modifiers, right before or after the participle']
    answerIndex: 2
    explanation: 'The structure is: article + [all modifiers/agents/adverbs] + participle + noun (or participle right before the noun): die [seit Jahren in der Branche tätige] Firma.'
  - question: 'Which sentence is a correctly formed extended participial construction?'
    options: [
        'die Firma seit Jahren tätige in der Branche',
        'die seit Jahren in der Branche tätige Firma',
        'die tätige seit Jahren in der Branche Firma',
      ]
    answerIndex: 1
    explanation: 'All modifiers (seit Jahren, in der Branche) must sit between the article and the participle, with the participle immediately before the noun: die seit Jahren in der Branche tätige Firma.'
exercises:
  - type: 'fill-blank'
    sentence: 'Der ___ Mann sitzt im Park und liest. (lachen, Partizip I as adjective)'
    answer: 'lachende'
    accepted: ['lachende']
    hint: 'Partizip I: infinitive + -d, then the normal weak adjective ending -e after "der": lachend + e.'
    translation: 'The laughing man is sitting in the park and reading.'
    placeholder: 'lachende / gelachte / lacht'
  - type: 'fill-blank'
    sentence: 'Die ___ E-Mail liegt noch im Entwurfsordner. (schreiben, Partizip II as adjective)'
    answer: 'geschriebene'
    accepted: ['geschriebene']
    hint: 'Partizip II of schreiben is geschrieben; add the weak adjective ending -e after "die": geschrieben + e.'
    translation: 'The written email is still in the drafts folder.'
    placeholder: 'geschriebene / schreibende / schreibte'
  - type: 'match'
    instructions: 'Match each participial phrase with its correct relative-clause meaning.'
    pairs:
      - left: 'die wachsende Wirtschaft'
        right: 'die Wirtschaft, die wächst'
      - left: 'der gebaute Bahnhof'
        right: 'der Bahnhof, der gebaut wurde'
      - left: 'das schlafende Kind'
        right: 'das Kind, das schläft'
      - left: 'die gelesenen Bücher'
        right: 'die Bücher, die gelesen wurden'
  - type: 'write'
    prompt: 'Rewrite as an extended participial construction: "die Firma, die seit Jahren in der Branche tätig ist" (Start with "die...")'
    answer: 'die seit Jahren in der Branche tätige Firma'
    accepted: ['die seit Jahren in der Branche tätige Firma']
    hint: 'Move every modifier between article and participle, and put the participle right before the noun: die [seit Jahren in der Branche] tätige Firma.'
    placeholder: 'die ... tätige Firma'
  - type: 'write'
    prompt: 'Turn "die E-Mail, die von mir geschrieben wurde" into an extended participial construction.'
    answer: 'die von mir geschriebene E-Mail'
    accepted: ['die von mir geschriebene E-Mail']
    hint: 'The agent "von mir" moves between the article and the participle: die [von mir] geschriebene E-Mail.'
    placeholder: 'die von mir ... E-Mail'
  - type: 'order'
    sentence: 'Die seit Jahren in der Branche tätige Firma expandiert weiter'
    translation: 'The company, active in the industry for years, keeps expanding.'
vocabulary:
  - term: 'das Partizip I'
    translation: 'present participle (active, simultaneous)'
  - term: 'das Partizip II'
    translation: 'past participle (passive, completed)'
  - term: 'das erweiterte Partizip'
    translation: 'extended participial construction'
  - term: 'wachsend'
    translation: 'growing'
  - term: 'tätig'
    translation: 'active, working'
  - term: 'gebaut'
    translation: 'built'
  - term: 'der Entwurf'
    translation: 'draft'
---

Formal German writing — reports, news articles, legal and academic texts — loves packing an
entire relative clause into a single adjective phrase before a noun. That compression is called
a **participial construction** (Partizipialkonstruktion), and once you can decode it, dense
written German becomes far more readable.

## Two participles, two meanings

German has two participles, and used as adjectives they mean opposite things:

| Form | Built from | Meaning | Example |
| --- | --- | --- | --- |
| **Partizip I** | infinitive + **-d** | active, simultaneous ("while X-ing") | der **lachende** Mann (the man who is laughing) |
| **Partizip II** | past participle | passive, completed ("that was X-ed") | der **geschriebene** Brief (the letter that was written) |

Both take normal adjective endings once placed before a noun, exactly like any other adjective:
*der lachende Mann*, *ein lachender Mann*, *die lachenden Männer*.

## Partizip I: "while doing"

Partizip I always describes something happening **at the same time** as the main clause, and
it is almost always active in meaning:

- *die wachsende Wirtschaft* = die Wirtschaft, **die wächst** (the economy that is growing)
- *das schlafende Kind* = das Kind, **das schläft** (the child who is sleeping)
- *ein überraschendes Ergebnis* = ein Ergebnis, **das überrascht** (a surprising result)

## Partizip II: "having been done"

Partizip II used adjectivally almost always describes a **completed, passive** state for
transitive verbs:

- *der gebaute Bahnhof* = der Bahnhof, **der gebaut wurde** (the station that was built)
- *die gelesenen Bücher* = die Bücher, **die gelesen wurden** (the books that were read)
- *ein bekannter Autor* = ein Autor, **der bekannt ist** (a well-known author)

## The extended participial construction (erweitertes Partizip)

This is where C1 German gets genuinely dense. Instead of leaving the participle alone, German
can load an entire phrase — adverbs, prepositional phrases, even the agent of a passive action
— **between the article and the participle**, all before the noun:

> die **seit Jahren in der Branche** tätige Firma
> (the company that has been active in the industry for years)

> die **von mir gestern geschriebene** E-Mail
> (the email that was written by me yesterday)

The structure is always:

**article → [all modifiers, in normal clause order] → participle → noun**

To decode one of these, work backward: find the noun, find the participle right before it, then
read everything in between as if it were a relative clause with the participle turned back into
a full verb:

> die von mir gestern geschriebene E-Mail
> → die E-Mail, **die von mir gestern geschrieben wurde**

## Why this construction matters at C1

Extended participial constructions let a writer pack a relative clause's worth of information
into a noun phrase without ever opening a subordinate clause — which is exactly why German news
articles, legal texts, and academic papers are full of them: they are more compact, and they
keep the main clause's verb-second structure uncluttered. Recognizing them quickly, and being
able to unpack them into a relative clause when they get long, is essential for reading (and
eventually writing) formal German fluently.
