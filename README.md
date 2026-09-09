# Career Tracker

App para manejar tus modo carrera en EAFC 26. Reemplaza el sheet ARSEN-LEVER-DEPOR.

## Setup — pasos primera vez

### 1. Crear las tablas en Supabase (5 min)

1. Abre https://supabase.com/dashboard/project/nddfwgdizzxlnjukuqsn
2. Menú lateral → **SQL Editor** → **New query**
3. Copia y pega **TODO el contenido de** `supabase/migrations/001_initial_schema.sql`
4. Click **Run** (o Cmd+Enter). Debería decir "Success. No rows returned."

Esto crea todas las tablas + habilita RLS con políticas abiertas (para MVP, tighten later).

### 2. Instalar dependencias del app

```bash
cd career-tracker
npm install
cp .env.example .env
```

El `.env` ya viene con la URL y anon key de tu proyecto Supabase — no tienes que tocar nada por ahora.

### 3. Cargar tu primera data (seed)

```bash
npm run import-sheet
```

Esto crea:
- Save "ARSEN-LEVER-DEPOR"
- Season "2037-2038" con Manchester United, formación 4-3-3
- Los 11 titulares + 8 del bench que llevamos hoy en el sheet

Es un seed mínimo — después lo extendemos para leer todas las temporadas.

### 4. Arrancar la app

```bash
npm run dev
```

Abre http://localhost:5173. Deberías ver tu save y poder navegar a la season.

## Estructura

```
supabase/migrations/     ← SQL de las tablas
scripts/import-sheet.ts  ← seed inicial
src/
  pages/
    SavesPage.tsx        ← lista de partidas
    SavePage.tsx         ← detalle de una partida (sus temporadas)
    SeasonPage.tsx       ← plantilla de una temporada
  lib/supabase.ts        ← cliente supabase
  types/database.ts      ← tipos TS
```

## Próximos pasos

- [ ] IA vision: subir foto de jugador → llenar formulario
- [ ] Editar/agregar jugadores desde la UI
- [ ] Sección de títulos por temporada
- [ ] Sección de selección nacional
- [ ] Auto-buscar foto de perfil del jugador (FUT.gg)
- [ ] Share target (PWA) para compartir fotos desde el cel
- [ ] Importar temporadas 2030-2036 del sheet

## Notas

- La `anon` key en el `.env` es pública, no pasa nada si se ve. Es la publishable key.
- La `service_role` NUNCA la pongas en un `VITE_` var. Es solo para scripts server-side.
- RLS actualmente es "todo abierto" para MVP. Cuando agreguemos auth, cambia las policies a `auth.uid() = owner_id`.
