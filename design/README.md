# Diseño de interfaz — Dental Practice Manager

> [!info] Crédito
> El diseño de la interfaz fue realizado por **Taqui** utilizando **Stitch** (herramienta de Google Labs).
> Estilo visual inspirado en la estética de Apple, con paleta de la rama de la salud (odontología).

> [!warning] Estado del diseño
> Estas pantallas son la **base / referencia del diseño**, no la versión final. Sirven como guía visual para construir el frontend real en [`../public/`](../public/). Sujeto a ajustes.

Este diseño pertenece al proyecto **Dental Practice Manager** (véase el [`README principal`](../README.md)). El backend está en [`../src/`](../src/) (Node + Express + SQLite, arquitectura en capas).

## Design system "Clinical Precision"

Stitch generó un design system coherente (ver [`DESIGN.md`](DESIGN.md)):

- **Fuente:** Inter (exclusiva). Títulos 700, botones 600, cuerpo 400.
- **Colores:** Primario azul `#005ab3` / `#0073e0`, menta/verde para estados positivos, coral/ámbar para alertas, texto en grises.
- **Radios:** tarjetas 14px, modal 18px, píldoras 10px (día) / 9999px (botones).
- **Grid:** contenido centrado a 1024px, navegación fija de 48px.
- **Sombras:** suaves (6% en tarjetas, 18% en modales).

## Pantallas

| Pantalla | Mockup | Código (Stitch HTML) |
|----------|--------|----------------------|
| Agenda del día | [`screens/agenda.png`](screens/agenda.png) | [`code/agenda.html`](code/agenda.html) |
| Directorio de pacientes | [`screens/pacientes.png`](screens/pacientes.png) | [`code/pacientes.html`](code/pacientes.html) |
| Modal "Nueva cita" | [`screens/nueva-cita.png`](screens/nueva-cita.png) | [`code/nueva-cita.html`](code/nueva-cita.html) |
| Configuración | [`screens/configuracion.png`](screens/configuracion.png) | [`code/configuracion.html`](code/configuracion.html) |

## Notas

- Las imágenes (`screens/`) son los mockups exportados desde Stitch.
- Los archivos `code/*.html` son el código HTML que Stitch genera por pantalla; sirven como referencia visual, no reemplazan el frontend del proyecto (`../public/`).
- Herramienta: [Stitch (Google Labs)](https://labs.google/stitch).
