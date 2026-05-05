# Guía de Configuración para Producción

## Paso 1: Verificar Supabase

Tu Supabase está ya configurada. Verifica:

```bash
# Variables en .env
NEXT_PUBLIC_SUPABASE_URL=https://dtxenrtwddzdxcppypwn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Verificar migraciones en Supabase

1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. SQL Editor → Verifica que existan:
   - `users`, `operadores`, `empresas`, `vacantes`, `postulaciones`
   - `planes_suscripcion`, `suscripciones_empresa`, `pagos`

3. RLS → Verificar que esté habilitado en todas las tablas

---

## Paso 2: Deploy en Vercel

### Opción A: Deploy Automático (Recomendado)

1. **Push código a GitHub**
   ```bash
   git add .
   git commit -m "MVP OperadoresFaena.cl - Initial release"
   git push origin main
   ```

2. **Importar en Vercel**
   - Ir a [vercel.com/new](https://vercel.com/new)
   - Conectar tu repo GitHub
   - Vercel auto-detecta Next.js

3. **Agregar variables de entorno en Vercel**
   - Settings → Environment Variables
   - Agregar:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://dtxenrtwddzdxcppypwn.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

4. **Deploy** — Click "Deploy"

---

### Opción B: Deploy Manual

```bash
# Build localmente
npm run build

# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## Paso 3: Configuración Post-Deploy

### A. Agregar dominios personalizados

En Vercel Settings → Domains:
- Agregar tu dominio `operadoresfaena.cl`
- Configurar DNS

### B. Habilitar HTTPS (Automático en Vercel)

Vercel proporciona SSL gratis.

### C. Configurar email (Opcional pero Recomendado)

Para confirmación de email en Supabase:

1. Ve a Supabase → Authentication → Email
2. Configura SMTP personalizado O usa el de Supabase

---

## Paso 4: Testing

### Test de Autenticación

```bash
npm run dev
```

1. Abre http://localhost:3000
2. Click "Soy Operador" → Signup
3. Completa: email, password
4. Setup-profile: datos operador
5. ¿Llegaste a /dashboard/operador? ✓

### Test de Operador

1. Editar perfil
2. Ver empleos (landing)
3. Ver detalle de vacante

### Test de Empresa

1. Signup como "Soy Empresa"
2. Setup perfil empresa
3. Crear nueva vacante
4. Ver vacantes publicadas

---

## Paso 5: Optimizaciones Recomendadas

### A. Analytics

```bash
npm install @vercel/analytics
```

En `src/app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### B. Monitoreo de Errores (Sentry)

```bash
npm install @sentry/nextjs
```

Sigue: https://docs.sentry.io/platforms/javascript/guides/nextjs/

### C. SEO

Ya configurado en `layout.tsx`. Personalizaba:

```tsx
export const metadata: Metadata = {
  title: 'OperadoresFaena.cl — Empleos para Operadores de Maquinaria Pesada',
  description: '...',
  // Agregar más metadata según necesidad
};
```

---

## Paso 6: Datos Iniciales (Dummy Data)

Para testing, crea vacantes de ejemplo:

```sql
-- En Supabase SQL Editor

INSERT INTO empresas (user_id, nombre, rut, telefono, region, ciudad)
VALUES 
  ('user-id-aqui', 'Minera ABC', '76123456-7', '+56912345678', 'Atacama', 'Copiapó'),
  ('user-id-aqui', 'Constructora XYZ', '78654321-9', '+56987654321', 'Metropolitana', 'Santiago');

INSERT INTO vacantes 
  (empresa_id, titulo, descripcion, equipo_requerido, experiencia_minima, region, ciudad, turno, cantidad_vacantes)
VALUES
  ('empresa-id', 'Operador CAEX', 'Busco operador con 5+ años...', 'CAEX', 5, 'Atacama', 'Copiapó', 'rotativo', 2),
  ('empresa-id', 'Cargador Frontal', 'Turno día...', 'Cargador Frontal', 2, 'Metropolitana', 'Santiago', 'mañana', 1);
```

---

## Paso 7: Configuración de Storage (Para Archivos)

La estructura de storage ya está lista. Para usarla:

1. Supabase → Storage → Create new bucket
2. Crear bucket: `operadores` (publicidad: ON para avatares)
3. Crear bucket: `empresas` (público para logos)

En tu código UI:
```typescript
// Upload CV
const { data, error } = await supabase.storage
  .from('operadores')
  .upload(`${userId}/cv/${file.name}`, file);
```

---

## Monitoreo en Producción

### Vercel Dashboard
- Metrics → Latencia, uptime, build times
- Deployments → Historial y rollback

### Supabase Dashboard
- Logs → Errores SQL y RLS
- Realtime → Estado de conexiones

---

## Troubleshooting

### Error: "Cannot read property 'map' of undefined"
→ Asegúrate de que Supabase tiene datos. Verifica RLS no está bloqueando reads.

### Error: "Infinite redirect loop"
→ El usuario no tiene perfil (operador/empresa). Chequea que se creen al signup.

### PWA no funciona
→ Verifica `public/manifest.json` existe. En dev, chrome requiere HTTPS para PWA (OK en prod).

---

## Mantenimiento Regular

- [ ] Revisar logs de Supabase semanalmente
- [ ] Backup de BD (Supabase lo hace automático)
- [ ] Actualizar dependencias: `npm update`
- [ ] Monitoreo de uptime (Vercel Status)

---

**¡Listo para producción!** 🚀
