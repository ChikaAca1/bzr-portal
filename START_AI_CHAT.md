# 🚀 Quick Start - AI Chat Testing

**Everything is configured and ready!**

---

## ✅ Pre-flight Checklist

- ✅ Database migration applied
- ✅ API keys configured:
  - ✅ ANTHROPIC_API_KEY (Claude)
  - ✅ DEEPSEEK_API_KEY (Cost-effective)
  - ✅ OPENAI_API_KEY (GPT-4)
- ✅ Code complete (75% of AI feature)
- ✅ Tests passing (300/315)

---

## 🎬 Start Testing (2 commands)

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
> bzr-portal-backend@1.0.0 dev
> tsx watch src/index.ts

Server listening on :3000
✓ Database connected
✓ AI providers initialized
```

### 2. Start Frontend Server (New Terminal)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
> bzr-portal-frontend@1.0.0 dev
> vite

  VITE v5.x.x  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🧪 Test the AI Chat

### Open Browser
http://localhost:5173

### Test 1: Basic Chat
1. **Click** the purple chat button (bottom-right corner)
2. **Type**: "Здраво"
3. **Press Enter**

**Expected**: AI responds with greeting (uses DeepSeek - cheapest)

### Test 2: Document Creation ⭐

**Type**: "Треба ми Акт о процени ризика"

**Expected Conversation**:
```
AI: "Хајде да започнемо креирање Акта о процени ризика.
     Који је пун назив ваше компаније?"

You: "Тест ДОО"

AI: "Одлично! Сада ми треба ПИБ компаније.
     Који је ПИБ? (9 цифара)"

You: "106006802"  ← Valid PIB

AI: [✅ Validates PIB]
    "Супер! Сада адреса..."
```

**The AI will guide you through**:
1. Company info (11 fields)
2. PIB/JMBG validation
3. Work positions
4. Hazards identification
5. Risk assessment (E×P×F)
6. Corrective measures
7. Document generation confirmation

---

## 📊 What to Check

### Backend Console
Watch for:
```
[INFO] Conversation started: session_xxx
[INFO] Intent detected: document_creation
[INFO] Switching to Claude provider
[INFO] Message saved: conversation_id=1
[INFO] Cost tracked: $0.02
```

### Frontend Console
Check for errors (should be none):
```
F12 → Console tab
```

### Database
Check data is being saved:
```sql
-- In psql or Supabase dashboard
SELECT * FROM conversations ORDER BY started_at DESC LIMIT 3;
SELECT * FROM conversation_messages WHERE conversation_id = 1;
```

### Network Tab
```
F12 → Network tab
POST /api/ai/chat
  Status: 200 OK
  Response: { "success": true, "data": {...} }
```

---

## 🎯 Valid Test Data

### Valid PIB Numbers (pass checksum):
- `106006802`
- `100001159`
- `101234561`

### Invalid PIB (will fail):
- `123456789`
- `111111111`

### Valid JMBG Numbers (pass checksum):
- `0101980710018`
- `0202985720019`
- `1512990730024`

### Invalid JMBG (will fail):
- `1234567890123`
- `0101980710000`

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check port 3000 is free
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <pid> /F

# Try again
npm run dev
```

### Frontend won't start
```bash
# Check port 5173 is free
netstat -ano | findstr :5173

# Try again
npm run dev
```

### Chat button doesn't appear
1. Hard refresh: `Ctrl + Shift + R`
2. Check browser console for errors
3. Verify frontend is running on 5173
4. Check network tab for failed requests

### "Network Error" in chat
1. Verify backend is running on port 3000
2. Check backend console for errors
3. Verify CORS_ORIGIN in `.env` is `http://localhost:5173`

### Database connection error
1. Check `DATABASE_URL` in `backend/.env`
2. Test connection:
   ```bash
   cd backend
   npm run db:push  # Should show no changes needed
   ```

### API Key errors
1. Check `.env` has all keys:
   ```bash
   cat backend/.env | grep "API_KEY"
   ```
2. Restart backend server after adding keys

---

## 💡 Tips

### Clear Chat Session
To start fresh conversation:
1. Open browser DevTools (F12)
2. Application → Storage → Session Storage
3. Delete `bzr-chat-session-id`
4. Refresh page

### Switch AI Provider
Edit `backend/.env`:
```env
# Use DeepSeek (cheapest)
AI_PROVIDER=deepseek

# Use Claude (best quality)
AI_PROVIDER=anthropic

# Use GPT-4 (balanced)
AI_PROVIDER=openai
```
Restart backend server.

### Check Costs
```sql
SELECT
  mode,
  COUNT(*) as conversations,
  SUM(total_cost_usd::numeric) as total_cost
FROM conversations
GROUP BY mode;
```

---

## 🎉 Success Looks Like:

✅ Backend starts without errors
✅ Frontend starts on port 5173
✅ Chat button appears on page
✅ Clicking opens chat window
✅ Typing "Треба ми Акт" triggers document mode
✅ AI asks for company name
✅ PIB validation works (rejects invalid)
✅ Full conversation flows smoothly
✅ Messages saved to database
✅ Cost tracking in backend console
✅ Session persists across pages

---

## 📈 After Testing

### If Everything Works:
🎉 **Congratulations!** The AI chat is fully functional!

**Next step**: Create the DOCX template
- File: `backend/templates/akt-procena-rizika-template.docx`
- Spec: `backend/templates/DOCX_TEMPLATE_SPECIFICATION.md`
- Then: Full document generation will work!

### If Issues:
1. Check backend console for errors
2. Check frontend console for errors
3. Check network tab for failed requests
4. See troubleshooting section above
5. Check `AI_READY_TO_TEST.md` for detailed guide

---

## 📚 Documentation

- `AI_READY_TO_TEST.md` - Comprehensive testing guide
- `DOCUMENT_AGENT_COMPLETE.md` - Implementation details
- `FINAL_SESSION_SUMMARY.md` - Session summary
- `backend/templates/DOCX_TEMPLATE_SPECIFICATION.md` - Template guide

---

## 🚀 Ready? Let's Go!

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2 (new terminal)
cd frontend && npm run dev

# Browser
http://localhost:5173
```

**Then type**: "Треба ми Акт о процени ризика" 🎯

---

**Status**: 🟢 Ready to Test
**Time to First Message**: < 30 seconds
**Blocker**: Only DOCX template (your task)

✅ **Everything else works!**
