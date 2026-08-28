---
title: 'Aprender 5 idiomas gratis sin internet: así funciona una app que no necesita cuenta ni WiFi'
description: 'Cómo una web puede funcionar sin conexión, sin cuenta y sin pesar 200 MB: la explicación técnica (sencilla) detrás de una PWA para aprender idiomas.'
publishDate: 2026-08-12
tags: ['offline', 'PWA', 'cómo funciona']
---

"Funciona sin internet" suena a promesa de marketing hasta que lo probás en
la práctica: modo avión activado, y las lecciones siguen ahí. Vale la pena
explicar cómo es posible, porque no es magia — es una decisión técnica que
casi ninguna app grande de idiomas toma.

## El problema de las apps "normales"

La mayoría de las apps de idiomas más conocidas son aplicaciones nativas
pesadas (pensá en decenas o cientos de MB de descarga) que además dependen de
un servidor para cargar cada lección, guardar tu progreso, o validar tu
cuenta. Sin conexión, buena parte de esas funciones simplemente no
responde — y si tenés poco espacio en el teléfono o una conexión lenta, ya
partís en desventaja.

## Qué es una PWA (sin tecnicismos)

PWA significa "Progressive Web App" — en corto, una página web que se
comporta como una app instalable, pero sin pasar por una tienda de
aplicaciones ni pesar cientos de MB. Se "instala" agregando un ícono a tu
pantalla de inicio directamente desde el navegador, y una vez instalada
puede seguir funcionando aunque se corte la conexión.

## Cómo logra funcionar sin internet

La clave está en un archivo que corre en segundo plano llamado _service
worker_: la primera vez que visitás el sitio con conexión, ese archivo
guarda en tu dispositivo una copia de las páginas y lecciones que fuiste
abriendo. La próxima vez que las pidas — con o sin internet — el navegador
las sirve directamente desde esa copia local, sin esperar respuesta de
ningún servidor.

Esto solo es posible si el sitio es genuinamente liviano: PolyLingua está
construido como una web 100% estática, sin el peso de un framework pesado
cargando en cada clic, lo que además hace que cada página cargue más rápido
incluso con buena conexión.

## Por qué tampoco hace falta una cuenta

El otro pilar de esto es dónde vive tu progreso. En vez de guardarlo en un
servidor (lo que exigiría iniciar sesión, y no funcionaría sin conexión),
PolyLingua guarda tu racha, las lecciones completadas, tus logros y las
palabras que fallaste directamente en el `localStorage` de tu propio
navegador — un espacio de almacenamiento privado que cada sitio web tiene
disponible en tu dispositivo. Nada de eso viaja a ningún servidor, así que
no necesita ni cuenta ni conexión para leerlo o escribirlo.

## La contrapartida: hay que ser honesto sobre las limitaciones

Como tu progreso vive solo en tu navegador, si cambiás de dispositivo o
borrás los datos del sitio, ese progreso no te sigue automáticamente — no
hay una cuenta en la nube que lo sincronice entre celular y computadora. Es
el costo de no pedirte registro: la conveniencia de "sin cuenta" y la de
"progreso sincronizado entre dispositivos" tironean en direcciones opuestas,
y PolyLingua eligió la primera.

## Preguntas frecuentes

**¿Cuánto espacio ocupa en mi dispositivo?**
Muy poco. Todo el CSS y JavaScript del sitio pesa apenas unas decenas de
kilobytes en total — nada que ver con los cientos de megabytes de una app
nativa de idiomas. Lo único que va creciendo es el caché de las páginas
que fuiste visitando, y aun así el total se mantiene en pocos megabytes
incluso después de recorrer varias lecciones.

**¿Qué pasa si borro los datos del navegador?**
Perdés el caché offline (necesitás conexión una vez más para
regenerarlo) y también tu progreso guardado — racha, lecciones
completadas, logros — porque todo vive en el mismo `localStorage` del
navegador, sin copia en ningún servidor. Es la contrapartida de no pedir
una cuenta: nadie más que vos tiene esos datos, así que si los borrás,
no hay forma de recuperarlos desde otro lado.

**¿Funciona en iPhone/Safari, o solo en Android/Chrome?**
Sí. Safari en iOS soporta service workers y permite "Agregar a pantalla
de inicio" para instalar el sitio como una PWA, igual que Chrome en
Android. El comportamiento offline depende del navegador y la versión,
pero el mecanismo (service worker + `localStorage`) es un estándar web
que ambos implementan, no una función exclusiva de un sistema operativo.

**¿Necesito instalar la PWA para que funcione offline, o alcanza con
visitarla desde el navegador?**
Alcanza con visitarla normalmente al menos una vez con conexión — el
service worker se registra igual, con o sin instalación. Instalarla
(agregar el ícono a la pantalla de inicio) solo cambia cómo se abre
después: como una app aparte en vez de una pestaña del navegador.

## Para quién tiene sentido esto en la práctica

Si viajás seguido, tenés datos móviles limitados, o simplemente querés
practicar en el subte o en un lugar sin señal, una app que de verdad
funciona offline — no "modo avión con funciones reducidas", sino completa —
es una diferencia real, no un detalle técnico menor. Podés probarlo vos
mismo: entrá a [PolyLingua](/idiomas), abrí un par de lecciones — por ejemplo
[artículos en alemán](/es/de/a1/articulos-der-die-das) o
[present simple en inglés](/es/en/a1/present-simple) — con
conexión, y después activá el modo avión para ver que siguen ahí.
