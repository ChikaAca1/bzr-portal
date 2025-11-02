# 💻 Lokalni Development Setup - VS Code

## 🎯 Cilj
Podešavanje kompletnog development okruženja na vašem računaru za razvoj BZR Portal-a.

---

## 📋 Preduslovi - Instalirajte Ako Nemate:

1. **Node.js 20+**: https://nodejs.org (LTS verzija - preporuka)
2. **Git**: https://git-scm.com
3. **VS Code**: https://code.visualstudio.com

### VS Code Extensions (preporuka):
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- GitLens
- Error Lens
- Auto Rename Tag

---

## 📥 Korak 1: Klonirajte Projekat

```bash
# Otvorite Terminal (CMD, PowerShell, ili Git Bash)

# 1. Idite u željenu lokaciju
cd C:\Users\[VASE-IME]\Documents  # Windows
# ili
cd ~/Documents  # Mac/Linux

# 2. Klonirajte repo
git clone https://github.com/ChikaAca1/bzr-portal.git

# 3. Uđite u folder
cd bzr-portal

# 4. Checkout development branch
git checkout claude/bzr-portal-development-011CUjZVPM2fZnTHESEfdy2q

# 5. Otvorite u VS Code
code .
```

---

## 📦 Korak 2: Instalirajte Dependencies

### U VS Code: Otvorite 2 terminala (Terminal → Split Terminal)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
# Čekajte ~1-2 minuta
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
# Čekajte ~1-2 minuta
```

---

## 🔐 Korak 3: Konfigurišite Environment Variables

### **Backend Environment Variables**

1. **Kopirajte template:**
```bash
cd backend
cp .env.example .env
```

2. **Otvorite `backend/.env` u VS Code**

3. **Postavite VAŠE vrednosti:**

```bash
# =================================================================
# DATABASE (Supabase)
# =================================================================
DATABASE_URL=postgresql://postgres:[NOVI-PASSWORD]@db.dazylhbqxdmgqxgprsri.supabase.co:5432/postgres

# Kako dobiti:
# 1. Idite na: https://supabase.com/dashboard/project/dazylhbqxdmgqxgprsri/settings/database
# 2. Reset database password
# 3. Kopirajte connection string

# =================================================================
# SUPABASE API KEYS
# =================================================================
SUPABASE_URL=https://dazylhbqxdmgqxgprsri.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Kako dobiti:
# https://supabase.com/dashboard/project/dazylhbqxdmgqxgprsri/settings/api

# =================================================================
# JWT SECRETS (Generišite nove!)
# =================================================================
JWT_SECRET=generišite-sa-openssl-rand-base64-32
JWT_REFRESH_SECRET=generišite-sa-openssl-rand-base64-32
ENCRYPTION_KEY=generišite-sa-openssl-rand-hex-32

# Windows: Koristite Git Bash ili online generator
# Mac/Linux: openssl rand -base64 32

# =================================================================
# SERVER
# =================================================================
PORT=3000
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# =================================================================
# CORS
# =================================================================
CORS_ORIGIN=http://localhost:5173

# =================================================================
# OPCIONO - AI Keys (samo ako imate)
# =================================================================
DEEPSEEK_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# =================================================================
# OPCIONO - Wasabi Storage
# =================================================================
WASABI_ACCESS_KEY_ID=your-key
WASABI_SECRET_ACCESS_KEY=your-secret
WASABI_BUCKET_NAME=bzr-portal-documents
WASABI_REGION=eu-central-1
WASABI_ENDPOINT=https://s3.eu-central-1.wasabisys.com
```

### **Frontend Environment Variables**

1. **Kreirajte `frontend/.env`:**
```bash
cd frontend
# Na Windows koristite VS Code da kreirate fajl
# Desni klik na frontend folder → New File → .env
```

2. **Sadržaj `frontend/.env`:**
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_SUPABASE_URL=https://dazylhbqxdmgqxgprsri.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ Korak 4: Primenite Database Migracije

### **Opcija A: Iz VS Code Terminala**

```bash
cd backend
npx drizzle-kit push:pg
```

Ako dobijete grešku, koristite Opciju B.

### **Opcija B: Supabase SQL Editor (preporuka za prvi put)**

1. Idite na: https://supabase.com/dashboard/project/dazylhbqxdmgqxgprsri/sql/new

2. Otvorite fajl: `backend/drizzle/0000_youthful_starfox.sql`

3. Kopirajte **CEO SQL** (Ctrl+A, Ctrl+C)

4. Paste u Supabase SQL Editor

5. Kliknite **RUN**

6. Verifikujte: Table Editor → trebalo bi da vidite 16 tabela

---

## 🚀 Korak 5: Pokrenite Development Servere

### **Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# Trebalo bi da vidite:
# ✅ Server running at http://localhost:3000
# 📡 tRPC endpoint: http://localhost:3000/trpc
# 💚 Health check: http://localhost:3000/health
```

### **Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# Trebalo bi da vidite:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

---

## ✅ Korak 6: Testirajte Setup

### **Test Backend:**
Otvorite browser:
```
http://localhost:3000/health
```

Trebalo bi da vidite:
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T...",
  "service": "BZR Portal Backend",
  "version": "1.0.0"
}
```

### **Test Frontend:**
Otvorite:
```
http://localhost:5173
```

Trebalo bi da vidite landing page!

---

## 🔧 Development Workflow

### **1. Razvijanje:**
- Menjajte kod u VS Code
- Serveri će automatski reload-ovati (Hot Module Replacement)
- Testirajte na http://localhost:5173

### **2. Testiranje:**
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm run test
```

### **3. Commit & Push:**
```bash
# Dodajte izmene
git add .

# Commit (PAZI: .env fajlovi su u .gitignore - neće biti commitovani!)
git commit -m "feat: opis izmene"

# Push
git push origin claude/bzr-portal-development-011CUjZVPM2fZnTHESEfdy2q
```

### **4. Automatski Deployment:**
- ✅ **Render** (backend) - automatski deploy-uje sa GitHub-a
- ✅ **Vercel** (frontend) - automatski deploy-uje sa GitHub-a

---

## 🚨 VAŽNO - .gitignore Bezbednost

**Ovi fajlovi SU u .gitignore (neće biti commitovani):**
```
backend/.env
backend/.env.local
backend/.env.supabase
frontend/.env
frontend/.env.local
```

**Uvek pre commit-a proverite:**
```bash
git status
# Ako vidite .env fajl u promenjenim fajlovima, STOP!
# Dodajte ga u .gitignore pre commit-a
```

---

## 🐛 Troubleshooting

### **Problem: "Cannot connect to database"**
**Rešenje:**
- Proverite DATABASE_URL u `backend/.env`
- Proverite da li je password tačan
- Proverite da li su migracije primenjene

### **Problem: "Port 3000 already in use"**
**Rešenje:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### **Problem: "Module not found"**
**Rešenje:**
```bash
# Obrišite node_modules i reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Problem: TypeScript greške**
**Rešenje:**
```bash
# Rebuild TypeScript
npm run build
```

---

## 📚 Korisni Komandi

```bash
# Backend
npm run dev          # Pokreni dev server
npm run build        # Build za production
npm test             # Pokreni testove
npm run db:push      # Primeni migracije
npm run db:seed      # Seed hazard types

# Frontend
npm run dev          # Pokreni dev server
npm run build        # Build za production
npm run preview      # Preview production build
npm run test:e2e     # E2E testovi sa Playwright
```

---

## 🎯 Sledeći Koraci Nakon Setup-a:

1. **Seed Hazard Types** (45+ opasnosti):
```bash
cd backend
npm run db:seed
```

2. **Testirajte kompletni workflow:**
   - Register → Verify Email → Create Company → Add Position → Assess Risks

3. **Razvijajte nove features** lokalno i testrajte

4. **Commit & Push** - automatski deployment na Render i Vercel!

---

## 📞 Pomoć

Ako nešto ne radi:
1. Proverite logove u terminalu
2. Proverite browser konzolu (F12)
3. Proverite da li su svi env vars postavljeni
4. Restartujte servere (Ctrl+C, pa ponovo `npm run dev`)

---

**Srećan development!** 🚀
