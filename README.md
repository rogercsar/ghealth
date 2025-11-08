# GHealth MVP

Mobile-first web app em React (Vite) com Tailwind, Supabase e Capacitor.

## Setup

1. Configure variáveis de ambiente no `.env`:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

2. Instalar dependências:

```
npm install
```

3. Rodar em desenvolvimento:

```
npm run dev
```

## Supabase

- Execute `supabase.sql` no editor SQL para criar tabelas e políticas RLS.
- Crie (ou deixe o script criar) o bucket `health-reports` para laudos.

## Capacitor (Android)

- Inicializar (já feito):

```
npx cap init ghealth com.ghealth.app --web-dir=dist
```

- Sincronizar após cada build:

```
npm run build
npx cap sync
```

- Rodar no Android (requer SDK e Android Studio):

```
npx cap run android
```

## Deploy (Netlify)

- O arquivo `netlify.toml` está configurado para publicar `dist` e redirecionamento SPA.
- Configure build em Netlify com comando `npm run build`.
