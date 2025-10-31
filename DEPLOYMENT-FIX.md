# DEPLOYMENT FIX - Регистрација не ради

## Проблем
Frontend на Vercel не може да се повеже на backend на Render.
Грешка: "Fail to fetch" при регистрацији.

## Узрок
1. Frontend користи `localhost:3000` уместо production backend URL
2. CORS на backend-у можда не дозвољава Vercel домен

## Решење (5 минута)

### 1. Подеси Render Environment Variables (Backend)

Иди на: https://dashboard.render.com → Твој backend service → Environment

Додај/измени:
```
CORS_ORIGIN=http://localhost:5173,https://bzr-portal1bre.vercel.app
```

**ВАЖНО**: Запамти да укључиш:
- `https://bzr-portal1bre.vercel.app` (без `/` на крају)
- Ако промениш Vercel домен, ажурирај ово!

Након промене, Render ће аутоматски редеплојовати backend.

---

### 2. Подеси Vercel Environment Variables (Frontend)

Иди на: https://vercel.com/dashboard → Твој frontend пројекат → Settings → Environment Variables

Додај нову променљиву:

```
Name:  VITE_API_URL
Value: https://bzr-portal-backend.onrender.com
```

**Scope**: Production, Preview, Development (чекирај све 3)

Након додавања, Vercel неће аутоматски редеплојовати. Мораш ручно:
- Иди на Deployments → Кликни на Latest → Redeploy

---

### 3. Провери да ли ради

Након оба редеплоја (5-10 минута):

1. Отвори: https://bzr-portal1bre.vercel.app/register
2. Попуни форму за регистрацију
3. Кликни "Региструј се"
4. **Треба да видиш успешну регистрацију!**

Ако и даље не ради:
- Отвори Browser DevTools (F12)
- Иди на Network tab
- Покушај регистрацију
- Проверите `POST /trpc/auth.register` захтев
- Проверите да ли иде на `https://bzr-portal-backend.onrender.com` уместо `localhost:3000`

---

## Supabase Налог

Креденшали су у `backend/.env`:

```
SUPABASE_URL=https://dazylhbqxdmgqxgprsri.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Да пронађеш налог:**
1. Иди на https://supabase.com
2. Кликни "Sign in"
3. Покушај login са свим email адресама које користиш
4. Или кликни "Forgot password" и унеси email
5. Ако налог постоји, добићеш reset email

**Ако не можеш да пронађеш налог:**
- Проверите spam folder
- Покушајте Google/GitHub OAuth login
- Email можда није верификован

**Алтернативно**: Креирај нови Supabase пројекат (5 минута)
1. Иди на https://supabase.com → New Project
2. Копирај нови `DATABASE_URL` и `SUPABASE_*` креденшале
3. Замени у Render environment variables
4. Пусти `npm run db:push` локално да креираш табеле

---

## Провера Backend-а

Backend је online и ради:
```
curl https://bzr-portal-backend.onrender.com/health
```

Одговор:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T08:16:34.219Z",
  "service": "BZR Portal Backend",
  "version": "1.0.0"
}
```

---

## Контакт за Подршку

Ако проблем и даље траје:
1. Пошаљи screenshot Browser DevTools Network tab
2. Пошаљи screenshot Render logs
3. Пошаљи screenshot Vercel deployment logs

Email: info@bzrportal.rs
