# Email Configuration Guide

## Status: DNS Records Added ✅

DNS records for `bzr-portal.com` have been added to Hostinger on **2025-11-04**.

### Current Configuration

**Environment Variables (`.env`)**:
```env
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # Get from Resend dashboard
EMAIL_FROM=BZR Portal <noreply@bzr-portal.com>
SUPPORT_EMAIL=office@bzr-portal.com
FRONTEND_URL=https://bzr-portal.com
```

⚠️ **IMPORTANT**: Never commit real API keys! Use environment variables only.

**DNS Records Added**:
- ✅ SPF: `v=spf1 include:_spf.mail.hostinger.com include:_spf.resend.com ~all`
- ✅ DKIM: `resend._domainkey` → [Resend DKIM key]
- ✅ DMARC: `v=DMARC1; p=quarantine; rua=mailto:office@bzr-portal.com`

---

## Next Steps (for tomorrow)

### 1. Verify DNS Propagation (15-30 minutes after DNS changes)

**Check SPF Record**:
```bash
nslookup -type=TXT bzr-portal.com
```

**Online Check**:
- Go to: https://mxtoolbox.com/SuperTool.aspx
- Enter: `bzr-portal.com`
- Select: "SPF Record Lookup"
- Expected: **ONE** SPF record with both Hostinger and Resend includes

### 2. Verify Resend Dashboard

- Go to: https://resend.com/domains
- Check status next to `bzr-portal.com`
- Expected: **Green ✅** (verified)
- If yellow: Click "Verify" button

### 3. Test Email Sending

Once Resend shows green ✅, test email sending:

```bash
# Test via API
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "your-email@example.com",
    "companyName": "Test Company",
    "message": "Test message from BZR Portal"
  }'
```

**Expected Result**:
- Email arrives at `office@bzr-portal.com`
- From: `noreply@bzr-portal.com`
- No spam warnings

---

## Email Service Features

**Implemented Email Types**:
1. ✅ Verification email (Serbian Cyrillic)
2. ✅ Trial expiry warning (Serbian Cyrillic)
3. ✅ Document ready notification (Serbian Cyrillic)
4. ✅ Contact form submission (to office@bzr-portal.com)

**Retry Logic**:
- 3 attempts with exponential backoff (1s, 2s, 4s)
- Error handling and logging

---

## Troubleshooting

### DNS Not Propagating?
- Wait 15-30 minutes after adding records
- Check with multiple DNS checkers (MXToolbox, dnschecker.org)
- Verify records in Hostinger DNS Zone Editor

### Resend Not Verifying?
- Ensure only **ONE** SPF record exists
- Ensure only **ONE** DMARC record exists
- DKIM record must be complete (200+ characters)
- Click "Verify" button in Resend dashboard

### Emails Not Sending?
- Check `RESEND_API_KEY` in `.env`
- Verify Resend domain is verified (green ✅)
- Check backend logs for error messages
- Ensure backend is running on port 3000

---

## Resources

- Resend Dashboard: https://resend.com/domains
- MXToolbox: https://mxtoolbox.com/SuperTool.aspx
- DNS Checker: https://dnschecker.org/
- Hostinger Panel: https://hpanel.hostinger.com/

---

**Last Updated**: 2025-11-04
**Status**: Waiting for DNS propagation (15-30 min)
