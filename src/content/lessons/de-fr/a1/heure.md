---
language: 'fr'
level: 'a1'
title: 'Die Uhrzeit auf Französisch: die halb-zehn-Falle'
description: 'Wie man auf Französisch nach der Uhrzeit fragt und antwortet — und warum das deutsche halb zehn und das französische et demie NICHT dasselbe meinen.'
order: 4
unit: 1
grammarTopic: 'Uhrzeit (l’heure)'
funFact: "Das ist eine der gefährlichsten Fallen für Deutschsprachige: im Deutschen bedeutet 'halb zehn' 9:30 — halb AUF dem Weg zur zehnten Stunde. Im Französischen bedeutet 'dix heures et demie' dagegen 10:30 — halb NACH der zehnten Stunde. Gleiches Wort 'halb/demie', entgegengesetzte Logik. Übersetze 'halb zehn' NIE wörtlich als 'demie dix' — du landest eine Stunde daneben."
minutes: 8
quiz:
  - question: "Was bedeutet 'dix heures et demie' auf Deutsch?"
    options: ['halb zehn (9:30)', 'halb elf (10:30)', 'zehn Uhr (10:00)']
    answerIndex: 1
    explanation: "'dix heures et demie' = zehn Uhr UND halb (dazu) = 10:30. Im Deutschen wäre das 'halb elf', nicht 'halb zehn' — der Bezugspunkt liegt bei der VORHERIGEN vollen Stunde, nicht der nächsten."
  - question: "Wie sagt man 9:30 richtig auf Französisch?"
    options: ['neuf heures et demie', 'dix heures moins demie', 'demie dix']
    answerIndex: 0
    explanation: "9:30 = 'neuf heures et demie' (neun Uhr und halb). Das Französische zählt IMMER von der bereits vergangenen vollen Stunde aus, nie von der kommenden."
  - question: "Wie sagt man 'Viertel nach drei' auf Französisch?"
    options: ['trois heures et quart', 'trois heures moins le quart', 'quart trois']
    answerIndex: 0
    explanation: "'et quart' = und ein Viertel (dazu) = Viertel NACH. trois heures et quart = 3:15."
  - question: "Wie sagt man 'Viertel vor vier' auf Französisch?"
    options: ['quatre heures et quart', 'quatre heures moins le quart', 'trois heures et quart']
    answerIndex: 1
    explanation: "'moins le quart' = minus ein Viertel = Viertel VOR. quatre heures moins le quart = 3:45."
  - question: "Welches deutsche Muster hilft dir bei 'et quart' und 'moins le quart'?"
    options: [
      'Genau wie im Deutschen: Viertel NACH = et quart, Viertel VOR = moins le quart, gleiche Logik wie deutsch nach/vor',
      'Es gibt keine Parallele, alles ist umgekehrt',
      'Nur die vollen Stunden funktionieren gleich',
    ]
    answerIndex: 0
    explanation: "Anders als bei 'halb', stimmen 'Viertel nach' (et quart) und 'Viertel vor' (moins le quart) in ihrer Logik mit dem Deutschen überein — nur bei 'halb' unterscheiden sich die Bezugspunkte."
  - question: "Wie fragt man offiziell nach der Uhrzeit auf Französisch?"
    options: ["Quelle heure est-il ?", "Quelle heure êtes-vous ?", "Qu'est-ce que l'heure ?"]
    answerIndex: 0
    explanation: "'Quelle heure est-il ?' (wörtlich: welche Stunde ist es?) ist die Standardfrage — 'il' hier ist ein unpersönliches Subjekt, wie im deutschen 'es ist spät'."
  - question: "Im 24-Stunden-Format, wie sagt man 14:30 auf Französisch?"
    options: ['quatorze heures trente', 'deux heures et demie', 'quatorze et demie']
    answerIndex: 0
    explanation: "Im offiziellen 24-Stunden-Format werden die Minuten einfach als Zahl angehängt, ohne 'et': quatorze heures trente. Kein 'demie', kein 'quart' — nur Ziffern, wie im Deutschen bei offiziellen Uhrzeiten."
exercises:
  - type: 'fill-blank'
    sentence: 'Il est neuf heures ___ demie. (9:30)'
    answer: 'et'
    accepted: ['Et']
    hint: "'et demie' hängt die halbe Stunde an die VORHERIGE volle Stunde an — 9:30 bezieht sich auf neun, nicht auf zehn."
    translation: 'Es ist halb zehn.'
    placeholder: 'et / moins'
  - type: 'fill-blank'
    sentence: 'Il est quatre heures ___ le quart. (3:45)'
    answer: 'moins'
    accepted: ['Moins']
    hint: "'moins le quart' = Viertel VOR — genau wie im Deutschen."
    translation: 'Es ist Viertel vor vier.'
    placeholder: 'et / moins'
  - type: 'match'
    instructions: 'Verbinde jede französische Uhrzeit mit der richtigen deutschen Übersetzung.'
    pairs:
      - left: 'neuf heures et demie'
        right: 'halb zehn'
      - left: 'trois heures et quart'
        right: 'Viertel nach drei'
      - left: 'quatre heures moins le quart'
        right: 'Viertel vor vier'
      - left: 'dix heures'
        right: 'zehn Uhr'
      - left: 'Quelle heure est-il ?'
        right: 'Wie spät ist es?'
  - type: 'write'
    prompt: "Schreibe 'halb acht' (7:30) auf Französisch."
    answer: 'sept heures et demie'
    accepted: ['Sept heures et demie']
    hint: "Zähle von der VORHERIGEN vollen Stunde: 7:30 bezieht sich auf sept (sieben), nicht huit (acht)."
    placeholder: '... heures et demie'
  - type: 'write'
    prompt: "Schreibe 'Viertel nach fünf' (5:15) auf Französisch."
    answer: 'cinq heures et quart'
    accepted: ['Cinq heures et quart']
    hint: "'et quart' = Viertel NACH, angehängt an die genannte Stunde."
    placeholder: '... heures et quart'
  - type: 'order'
    sentence: 'Il est neuf heures et demie'
    translation: 'Es ist halb zehn.'
vocabulary:
  - term: 'heure'
    translation: 'Stunde/Uhr'
  - term: 'et demie'
    translation: 'und halb (bezogen auf die vorherige Stunde)'
  - term: 'et quart'
    translation: 'und ein Viertel (Viertel nach)'
  - term: 'moins le quart'
    translation: 'minus ein Viertel (Viertel vor)'
  - term: 'Quelle heure est-il ?'
    translation: 'Wie spät ist es?'
---

Uhrzeiten klingen nach einem harmlosen Thema — bis du merkst, dass das deutsche
"halb" und das französische "demie" nach unterschiedlicher Logik funktionieren. Diese
eine Falle sorgt für mehr Verwirrung als fast jede andere Vokabel in diesem Kurs.

## Die Grundfrage

**Quelle heure est-il ?** — Wie spät ist es? (wörtlich: welche Stunde ist es?)

Antwort immer mit **Il est ...** (Es ist ...), genau wie im Deutschen mit dem
unpersönlichen "es".

## Volle Stunden

```
Il est une heure.      Es ist ein Uhr. (Ausnahme: "une", nicht "un")
Il est deux heures.    Es ist zwei Uhr.
Il est dix heures.     Es ist zehn Uhr.
```

## Die halb-Falle: entgegengesetzte Bezugspunkte

| Deutsch     | Bezugspunkt         | Uhrzeit |
| ------------ | --------------------- | ------- |
| halb zehn    | die KOMMENDE Stunde (zehn) | 9:30    |

| Französisch          | Bezugspunkt          | Uhrzeit |
| ---------------------- | ----------------------- | ------- |
| neuf heures et demie   | die VERGANGENE Stunde (neun) | 9:30    |

Beide Sprachen benutzen ein Wort für "halb" (halb / demie), aber sie zeigen in
entgegengesetzte Richtungen:

```
DEUTSCH:      halb zehn        →  bezieht sich auf ZEHN (die kommende Stunde)  →  9:30
FRANZÖSISCH:  neuf heures et demie  →  bezieht sich auf NEUN (die vergangene Stunde)  →  9:30
```

Wenn du "halb zehn" reflexartig mit "demie dix" übersetzt, landest du bei 10:30 —
eine ganze Stunde daneben. Die Regel: **nenne im Französischen immer die volle
Stunde, die bereits vergangen ist**, und hänge "et demie" an.

## Viertel nach und Viertel vor: hier stimmt die Logik überein

Zum Glück funktionieren "Viertel nach" und "Viertel vor" in beiden Sprachen gleich:

| Ausdruck              | Bedeutung        | Beispiel                     |
| ----------------------- | ------------------ | ------------------------------- |
| et quart                | Viertel NACH        | trois heures et quart (3:15)     |
| moins le quart          | Viertel VOR         | quatre heures moins le quart (3:45) |

## Minuten, die kein rundes Muster haben

Für alle anderen Minutenzahlen wird einfach die Zahl angehängt:

```
Il est trois heures dix.       Es ist zehn nach drei. (3:10)
Il est trois heures vingt.     Es ist zwanzig nach drei. (3:20)
```

## Das offizielle 24-Stunden-Format

Bei Fahrplänen, Öffnungszeiten und Nachrichten wird wie im Deutschen das
24-Stunden-Format benutzt — dort gibt es kein "demie" oder "quart", nur Ziffern:

```
14h30  →  quatorze heures trente   (14:30)
21h15  →  vingt et une heures quinze  (21:15)
```

## Der praktische Trick

Merke dir nur einen einzigen Satz: "Das Französische nennt immer die Stunde, die
schon vorbei ist, und rechnet von dort aus weiter." Wenn du diesen Satz im Kopf
hast, fällt dir "halb zehn" nie wieder als Übersetzungsfalle zum Opfer.
