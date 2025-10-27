# 🔧 Auth Troubleshooting Guide

## Issue: Login/Signup Not Working

### Quick Fix: Disable Email Confirmation

By default, Supabase requires email confirmation for new signups. This needs to be disabled for immediate login.

### Steps to Fix:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Authentication Settings**
   - Click **Authentication** in left sidebar
   - Click **Providers**
   - Click **Email** to expand

3. **Disable Email Confirmation**
   - Find "Confirm email" toggle
   - **Turn it OFF**
   - Click **Save**

4. **Alternative: Enable Auto-confirm**
   - In same Email provider settings
   - Look for "Enable email confirmations"
   - **Uncheck this option**
   - Click **Save**

### Verify Settings:

After making changes, check these are enabled:
- ✅ Email provider is enabled
- ✅ "Confirm email" is disabled OR
- ✅ "Enable email confirmations" is unchecked

### Test the Fix:

1. **Restart your dev server:**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

2. **Try to sign up:**
   - Click "Sign Up" button
   - Enter email and password
   - Submit form
   - Should redirect to /chat immediately

3. **Try to log in:**
   - Click "Login" button  
   - Enter same credentials
   - Should work immediately

---

## Common Issues & Solutions

### Issue 1: "Invalid login credentials"

**Cause:** Email confirmation is still required

**Solution:**
1. Disable email confirmation (see above)
2. Try signing up with a new email
3. Previous unconfirmed emails won't work

### Issue 2: "User already registered"

**Cause:** Email was used but not confirmed

**Solution:**
1. Disable email confirmation
2. Go to Supabase Dashboard → Authentication → Users
3. Delete the unconfirmed user
4. Try signing up again

### Issue 3: OAuth Buttons Don't Work

**Cause:** OAuth providers not configured

**Solution:**
- Follow `docs/OAUTH_SETUP_GUIDE.md`
- Configure Google and GitHub providers
- Email/password should work without OAuth

### Issue 4: Modal Doesn't Open

**Cause:** JavaScript error or hook issue

**Solution:**
1. Check browser console for errors
2. Verify AuthModalProvider is in layout.tsx
3. Clear browser cache and reload

### Issue 5: Form Submits But Nothing Happens

**Cause:** Network error or Supabase connection

**Solution:**
1. Check browser Network tab for failed requests
2. Verify NEXT_PUBLIC_SUPABASE_URL in .env.local
3. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
4. Restart dev server after changing .env.local

---

## Verification Checklist

After fixes, verify:

- [ ] Can open login modal
- [ ] Can open signup modal
- [ ] Can toggle between login/signup
- [ ] Can submit email/password form
- [ ] No errors in browser console
- [ ] Redirects to /chat after success
- [ ] Can see user email in chat sidebar
- [ ] Can sign out successfully

---

## Still Having Issues?

### Check Supabase Logs:

1. Go to Supabase Dashboard
2. Click **Logs** → **Auth Logs**
3. Look for recent auth attempts
4. Check for error messages

### Check Browser Console:

1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Share error messages for help

### Verify Environment:

```bash
# Check if env variables are loaded
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Quick Test Script

Try this in browser console after opening the modal:

```javascript
// Test if Supabase is initialized
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Test if modal hook works
const { openModal } = useAuthModal();
openModal('login');
```

---

## Need More Help?

1. Check Supabase auth logs
2. Verify all settings above
3. Try with a fresh email address
4. Clear browser cache completely
5. Restart development server

**Most Common Fix:** Disable email confirmation in Supabase! ✅
