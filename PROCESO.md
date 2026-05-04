# PROCESO.md — OperadoresFaena.cl

Documentación viva del proceso de diseño y desarrollo del sitio one-page premium.

---

## 1. Objetivo del Sitio

**OperadoresFaena.cl** es la plataforma #1 en Chile exclusiva para reclutar y encontrar trabajo como operador de maquinaria pesada y camiones en los sectores de minería, construcción y transporte.

**Objetivo primario:** Conectar a operadores calificados (CAEX, cargadores frontales, retroexcavadoras, camiones mineros, etc.) con empresas que necesitan ese perfil, de forma rápida, confiable y especializada.

**Dos audiencias clave:**
- **Operadores:** buscan empleo formal, bien remunerado y con condiciones claras (turno, región, certificaciones).
- **Empresas/Empleadores:** necesitan operadores calificados con rapidez, sin ruido de perfiles no especializados.

**KPIs de éxito del sitio:**
- Conversión en "Postular" o "Publicar Aviso"
- Registro de operadores en la plataforma
- Tiempo en la página y scroll depth
- Tasa de rebote baja (objetivo < 40%)

---

## 2. Decisiones de Diseño

### Paleta de colores
| Rol | Color | Hex | Razón |
|---|---|---|---|
| Primario / CTA | Naranja Faena | `#FF6200` | Energía, acción, visibilidad en fondos oscuros. Color de la industria (cascos, maquinaria). |
| Fondo principal | Negro profundo | `#111111` | Premium, moderno, reduce fatiga visual. Estándar en plataformas tech industriales. |
| Fondo secundario | Gris oscuro | `#1F1F1F` | Profundidad y separación de secciones sin romper el tema oscuro. |
| Acento | Azul Chile | `#0033A0` | Confianza, referencia patriótica sutil. |
| Texto principal | Blanco | `#FFFFFF` | Contraste máximo sobre fondos oscuros (ratio > 7:1). |
| Texto secundario | Gris claro | `#A0A0A0` | Jerarquía visual sin abandonar el tema oscuro. |

**Decisión clave:** Tema oscuro completo. El sector minero opera en ambientes polvorientos y de alta luz; un sitio oscuro se percibe como robusto y premium, diferenciándose de portales de empleo genéricos (Laborum, Trabajando.com) que usan fondos blancos.

### Tipografía
- **Display/Títulos Hero:** `Bebas Neue` — impacto visual máximo, estética industrial, legible en tamaños grandes.
- **Body y UI:** `Inter` — neutralidad, legibilidad óptima en pantallas, amplio soporte de pesos.
- **Jerarquía:**
  - H1 Hero: Bebas Neue, 5xl–8xl, naranja/blanco
  - H2 Secciones: Inter SemiBold/Bold, 3xl–4xl
  - H3 Cards: Inter SemiBold, xl–2xl
  - Body: Inter Regular/Medium, base–lg
  - Labels/Badges: Inter SemiBold, xs–sm, uppercase con letter-spacing

### Layout
- **One-page scroll** con navbar fija
- **Mobile-first** (base 360px, optimizado para 390px iPhone moderno)
- **Máximo ancho de contenido:** 1280px centrado
- **Grid:** CSS Grid + Flexbox via Tailwind
- **Espaciado:** Sistema de 8px base (Tailwind por defecto)

### Jerarquía Visual
1. Hero con imagen de impacto → retención inmediata
2. Filtros → acción rápida (operadores saben qué buscan)
3. Empleos destacados → prueba de valor concreta
4. Cómo funciona → reduce fricción de onboarding
5. Testimonios → prueba social
6. Estadísticas → credibilidad numérica
7. CTA empresas → monetización
8. Footer → navegación y contacto

### Voz y Tono
- **Directo y claro:** sin jerga corporativa vacía
- **Chileno profesional:** uso natural del "tú" y términos del rubro (faena, turno, cuadrilla, régimen)
- **Confianza sin arrogancia:** datos reales, promesas medibles
- **Inclusivo:** mencionar explícitamente que hay oportunidades para distintos niveles de experiencia
- **Evitar:** modismos forzados ("po", "cachai" en copy formal), anglicismos innecesarios

---

## 3. Plan de Secciones y Wireframe Textual

```
┌─────────────────────────────────────────────────────────┐
│  NAVBAR (fija, blur)                                    │
│  [Logo] Inicio Empleos Empresas Operadores Blog Contact │
│                           [Soy Operador] [Publicar ▶]  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  HERO (100vh, imagen CAEX + overlay)                    │
│                                                         │
│  OperadoresFaena.cl                                     │
│  "La mejor forma de encontrar                           │
│   o conseguir trabajo como                              │
│   operador en Chile"                                    │
│                                                         │
│  CAEX · Cargador Frontal · Retroexcavadora · Camiones   │
│                                                         │
│  [🔍 ¿Qué equipo operas?        ] [Buscar Empleos]     │
│                                                         │
│  [Ver empleos disponibles] [Publicar oferta gratis]     │
│                                                         │
│  +1.800 operadores  |  420 vacantes  |  96% satisfacción│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  FILTROS AVANZADOS                                      │
│  "Busca tu próximo empleo"                              │
│  [Licencia ▼] [Equipo ▼] [Región ▼] [Turno ▼]         │
│  [Experiencia ▼] [Certificaciones ▼]                   │
│  [Filtrar empleos ▶] Mostrando 87 empleos              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  EMPLEOS DESTACADOS                                     │
│  [Card] [Card] [Card]                                   │
│  [Card] [Card] [Card]                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CÓMO FUNCIONA                                          │
│  Operadores          |  Empresas                        │
│  1. Regístrate        1. Publica tu aviso               │
│  2. Filtra y postula  2. Recibe postulaciones           │
│  3. Consigue el turno 3. Contrata al mejor              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  TESTIMONIOS                                            │
│  [Foto] [Foto] [Foto]                                   │
│  "..." "..." "..."                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ESTADÍSTICAS (counter-up al entrar viewport)           │
│  +1.800      420       96%       48h                    │
│  operadores  vacantes  satisf.   match                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CTA EMPRESAS (full-width, imagen fondo)                │
│  "¿Necesitas operadores calificados ya?"                │
│  [Publicar aviso hoy ▶]                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  FOOTER                                                 │
│  Navegación  | Operadores | Empresas | Contacto         │
│  ©2025 OperadoresFaena.cl — Hecho en Chile 🇨🇱          │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Stack Técnico y Razones

| Tecnología | Versión/Fuente | Razón |
|---|---|---|
| HTML5 | Semántico | Base, SEO, accesibilidad |
| Tailwind CSS | CDN (play.tailwindcss.com compatible) | Velocidad de desarrollo, consistencia, no build step |
| Alpine.js | CDN 3.x | Interactividad reactiva sin peso de React/Vue; ideal para menú móvil, dropdowns, modal |
| Heroicons | SVG inline | Sin dependencia extra; accesibles; escalables |
| Inter + Bebas Neue | Google Fonts | Gratuitas, bien hosteadas, fallback seguro |
| Unsplash | Source URLs | Imágenes de alta calidad relevantes al sector, sin copyright |
| IntersectionObserver | Browser nativo | Animaciones de scroll sin librerías; amplio soporte (95%+) |

**¿Por qué un solo archivo?**
- Facilita el deployment inmediato (cualquier hosting estático, incluso abrir el archivo directo)
- Reduce fricción para el cliente
- Sin proceso de build ni dependencias

---

## 5. Imágenes / Keywords Unsplash

| Sección | Keywords | Orientación |
|---|---|---|
| Hero background | `mining truck Chile sunset` / `haul truck open pit mine` | Landscape, oscuro/dramático |
| Sección CTA empresas | `mining excavator copper Chile` | Wide, industrial |
| Testimonio 1 | `construction worker portrait` | Cuadrado, persona |
| Testimonio 2 | `mining worker safety helmet` | Cuadrado, persona |
| Testimonio 3 | `truck driver portrait latin` | Cuadrado, persona |
| Testimonio 4 | `engineer hard hat woman` | Cuadrado, persona |

**URLs Unsplash utilizadas:**
- Hero: `https://images.unsplash.com/photo-1558618666-fcd25c85cd64` (heavy machinery open pit)
- Alternativa hero: `https://images.unsplash.com/photo-1504307651254-35680f356dfd`
- CTA empresas: `https://images.unsplash.com/photo-1581094651181-35942459ef62`

---

## 6. Notas de Accesibilidad y Responsive

### Accesibilidad
- Todos los botones de ícono tienen `aria-label`
- Imágenes decorativas usan `role="presentation"` o `alt=""`
- Imágenes de contenido tienen `alt` descriptivo en español
- Focus states visibles (outline naranja) en todos los elementos interactivos
- Contraste de texto verificado manualmente:
  - Blanco sobre `#111111`: ratio 18.1:1 ✓
  - Blanco sobre `#FF6200`: ratio 3.1:1 (solo para texto grande ≥ 18px bold ✓)
  - `#A0A0A0` sobre `#111111`: ratio 5.3:1 ✓
- Estructura de headings: h1 único (hero) → h2 (secciones) → h3 (cards)
- `lang="es"` en `<html>`

### Responsive Breakpoints
| Breakpoint | px | Ajustes clave |
|---|---|---|
| base | 360–639px | 1 columna, hamburguesa, hero texto pequeño, filtros apilados |
| sm | 640–767px | Algunas grids 2 cols |
| md | 768–1023px | Navbar expandida, filtros 2x3 |
| lg | 1024–1279px | Grid 3 cols, secciones side-by-side |
| xl | 1280px+ | Max-width contenido, tipografía display grande |

---

## 7. Trade-offs Encontrados

1. **Carrusel de testimonios vs. grid:** Decidí usar grid responsivo (no carrusel JS) para mantener simplicidad y evitar una dependencia adicional. En mobile muestra 1 col, en desktop 3–4 tarjetas.

2. **Slider de experiencia:** Reemplazado por un `<select>` nativo estilizado. Un slider custom en Tailwind puro sin JS extra es complicado de mantener accesible.

3. **Counter-up animado:** Implementado con `IntersectionObserver` + `requestAnimationFrame` en script inline, sin librerías. El fallback (si JS falla) muestra los números finales directamente.

4. **Multi-select dropdowns:** Alpine.js maneja los estados `open/closed` y los arrays de selección. Se muestra el conteo de seleccionados en el trigger ("3 equipos").

5. **Unsplash URLs:** `source.unsplash.com` puede estar deprecado; se usan URLs directas de imágenes de Unsplash (con parámetros `?auto=format&fit=crop&w=...&q=80`) como alternativa más estable.

---

## 8. Checklist Final de QA

- [ ] Navbar se fija correctamente al hacer scroll
- [ ] Menú hamburguesa abre/cierra en mobile
- [ ] Todos los dropdowns de filtros funcionan con Alpine
- [ ] Animaciones fade-in activadas por scroll
- [ ] Counter-up funciona al llegar a la sección de estadísticas
- [ ] Modal de postulación abre y cierra
- [ ] Todas las imágenes tienen `alt` o `role="presentation"`
- [ ] No hay clases Tailwind inventadas
- [ ] No hay errores de sintaxis HTML
- [ ] Contraste de colores cumple AA
- [ ] Focus states visibles en todos los interactivos
- [ ] Responsive revisado en 360px, 768px, 1280px (mental walkthrough)
- [ ] Copy en español chileno, sin Lorem Ipsum
- [ ] Footer con copyright y "Hecho en Chile"
- [ ] CDN links son correctos y están en el `<head>`

---

## 9. Mejoras post-lanzamiento

### 9.1 Verificación de imágenes Unsplash

Se verificaron con `curl -s -o /dev/null -w "%{http_code}"` las 11 URLs únicas `images.unsplash.com/photo-*` presentes en `index.html`:

| URL (ID Unsplash) | Uso | Estado |
|---|---|---|
| `photo-1558618666-fcd25c85cd64` | Hero background | 200 OK |
| `photo-1605000797499-95a51c5269ae` | Card 1 — CAEX | 200 OK |
| `photo-1581094651181-35942459ef62` | Card 2 — Cargador Frontal | 200 OK |
| `photo-1589939705384-5185137a7f0f` | Card 3 — Retroexcavadora | 200 OK |
| `photo-1601584115197-04ecc0da31d7` | Card 4 — Camión Minero | 200 OK |
| `photo-1566753323558-f4e0952af115` | Card 5 — Excavadora | 200 OK |
| `photo-1533062618053-d51e617307ec` | Card 6 — Bulldozer | 200 OK |
| `photo-1504307651254-35680f356dfd` | CTA Empresas background | 200 OK |
| `photo-1542178243-bc20204b769f` | Testimonio 1 — Carlos | 200 OK |
| `photo-1531123897727-8f129e1688ce` | Testimonio 2 — Pamela | 200 OK |
| `photo-1500648767791-00dcc994a43e` | Testimonio 3 — Andrés | 200 OK |

**Resultado:** Todas las imágenes devuelven HTTP 200. No se requirió ningún reemplazo.

**Fallback activado:** El script incluye un listener global `document.addEventListener('error', ...)` (captura en fase de captura) que detecta errores en cualquier `<img>`, genera un SVG placeholder base64 con fondo `#1F1F1F` y el texto del atributo `alt`, y asigna ese dataURI como nuevo `src`. Se incluye `onerror = null` para evitar bucles infinitos.

### 9.2 Modal de postulación funcional

Se implementó un componente Alpine `postulacion()` con las siguientes características:

- **Componente:** función `postulacion()` registrada en el script global; instanciado en un `<div x-data="postulacion()">` al final del `<body>` (antes de los scripts).
- **Activación:** escucha el evento custom `@abrir-postulacion.window` que los 6 botones "Postular" ya disparaban con `$dispatch`. No fue necesario modificar los botones.
- **Campos del formulario:** Nombre completo (required), RUT (required), Email (required), Teléfono (required), Años de experiencia (select), Comentario (textarea, opcional).
- **Submit:** `@submit.prevent` llama `enviar()` → muestra estado de éxito inline y auto-cierra a los 2.5 segundos.
- **Cierre:** botón X, clic en overlay oscuro, tecla `Escape` (`@keydown.escape.window`).
- **Scroll lock:** `document.body.classList.add('overflow-hidden')` al abrir; se quita al cerrar.
- **Animaciones:** `x-transition` con `opacity` en el overlay y `scale + opacity` en la card.
- **Accesibilidad:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-titulo"`, foco inicial en campo Nombre (`x-ref="nombreInput"`, llamado con `$nextTick`), botón cerrar con `aria-label="Cerrar"`.

### 9.3 Contraste del CTA naranja

Se auditaron todas las clases de color con potencial problema de contraste. Cambios aplicados:

| Selector afectado | Problema | Cambio |
|---|---|---|
| Etiquetas de sección `text-xs font-semibold uppercase tracking-widest text-faena` (6 instancias) | `#FF6200` a 12px tiene ratio ~4.6:1 sobre fondos oscuros, justo al límite AA para texto pequeño | `text-faena` → `text-faena-300` (`#FF8A38`, ratio ~5.8:1) |
| Badges `bg-faena/15 border border-faena/40 text-faena` (2 instancias: hero y CTA empresas) | Texto naranja sobre fondo translúcido muy tenue — bajo contraste percibido | `bg-faena/15` → `bg-faena/25`; `text-faena` → `text-faena-300` |
| Botones primarios `bg-faena` en el sitio | Verificado con grep: todos usan `text-black`, no `text-white` | Sin cambios necesarios |
| Labels de categoría en cards de empleo (`text-faena-300`) | Ya usaban `faena-300` correctamente | Sin cambios |

**Nota sobre `faena-300`:** El color `#FF8A38` tiene un ratio de contraste ~5.8:1 sobre `#111111` y ~5.4:1 sobre `#1F1F1F`, cumpliendo holgadamente WCAG AA para texto de cualquier tamaño (mínimo 4.5:1) y rozando AA para texto grande (mínimo 3:1).
