# Checklist WCAG 2.2 — OperadoresFaena.cl

Objetivo: **AA** en flujos críticos (auth, postular, dashboards).

## Ya implementado

| Criterio | Estado | Notas |
|---|---|---|
| 1.1.1 Texto alternativo | Parcial | Hero/testimonios con `alt`; avatares con fallback inicial |
| 1.3.1 Info y relaciones | OK | Labels en formularios auth y vacantes |
| 1.4.3 Contraste | Parcial | faena `#FF6200` sobre negro OK; revisar gray-500 sobre ink-800 |
| 2.1.1 Teclado | Parcial | Forms y links OK; chips y switches accesibles con button |
| 2.4.4 Propósito del enlace | OK | CTAs descriptivos |
| 2.4.7 Foco visible | OK | `focus:ring-2 focus:ring-faena` en utilidades |
| 3.1.1 Idioma | OK | `<html lang="es">` |
| 3.3.1 Identificación de errores | OK | Mensajes de error en forms |
| 3.3.2 Etiquetas | OK | Labels + `htmlFor` en auth |
| 4.1.2 Nombre, rol, valor | Parcial | Dialog postulación con `role="dialog"` aria-modal |

## Pendiente / backlog

- [ ] Skip link "Saltar al contenido"
- [ ] Live regions (`aria-live`) en toasts de upload/postulación
- [ ] Preferencia `prefers-reduced-motion` para animaciones bounce/glow
- [ ] Contraste de chips inactivos (gray-400) vs ink-700
- [ ] Prueba con NVDA/VoiceOver en flujo postular
- [ ] Captcha accesible si se añade anti-bot
- [ ] Tabla de postulantes con headers correctos (`<th scope>`)
- [ ] Focus trap robusto en modales (react-focus-lock)

## Cómo auditar

```bash
# Lighthouse CI o DevTools
# axe DevTools extension en /auth/login, /vacantes, /dashboard/*

npm run dev
# Abrir Chrome → Lighthouse → Accessibility
```

## Contacto a11y

Reportar barriers a: contacto@operadoresfaena.cl con subject `[A11Y]`.
