# 🔐 OAuth Setup Guide - Google & GitHub

Complete guide to configure Google and GitHub OAuth providers in Supabase for KaryaKarta AI.

---

## 📋 Prerequisites

- Supabase project created
- Access to Supabase Dashboard
- Google Cloud Console account
- GitHub account

---

## 🎯 Part 1: Supabase Configuration

### 1. Get Your Redirect URLs

Your Supabase project will need these redirect URLs:

```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

**Find your project ref:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy the "Project URL" - the subdomain is your project ref

**Example:** If your URL is `https://abc123.supabase.co`, your project ref is `abc123`

---

## 🔵 Part 2: Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "KaryaKarta AI" (or your preference)
4. Click "Create"

### Step 2: Configure OAuth Consent Screen

1. In the left sidebar: **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in the required fields:
   - **App name:** KaryaKarta AI
   - **User support email:** Your email
   - **Developer contact:** Your email
5. Click **Save and Continue**
6. **Scopes:** Click "Add or Remove Scopes"
   - Add: `userinfo.email`
   - Add: `userinfo.profile`
7. Click **Save and Continue**
8. **Test users:** Add your email (for testing)
9. Click **Save and Continue**

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "KaryaKarta AI Web Client"
5. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
6. **Authorized redirect URIs:**
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
7. Click **Create**
8. **Copy the Client ID and Client Secret** (you'll need these!)

### Step 4: Enable Google Provider in Supabase

1. Go to Supabase Dashboard
2. **Authentication** → **Providers**
3. Find **Google** and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste your **Client ID**
6. Paste your **Client Secret**
7. Click **Save**

---

## ⚫ Part 3: GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in the form:
   - **Application name:** KaryaKarta AI
   - **Homepage URL:** `http://localhost:3000` (or your domain)
   - **Authorization callback URL:**
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
4. Click **Register application**

### Step 2: Generate Client Secret

1. After creating the app, you'll see your **Client ID**
2. Click **Generate a new client secret**
3. **Copy both the Client ID and Client Secret** (you won't see the secret again!)

### Step 3: Enable GitHub Provider in Supabase

1. Go to Supabase Dashboard
2. **Authentication** → **Providers**
3. Find **GitHub** and click to expand
4. Toggle **Enable Sign in with GitHub** to ON
5. Paste your **Client ID**
6. Paste your **Client Secret**
7. Click **Save**

---

## ✅ Part 4: Testing OAuth

### Test Locally

1. Start your development server:
   ```bash
   cd karyakarta-ai
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Click "Login" or "Sign Up"
4. Try both OAuth buttons:
   - **Continue with Google**
   - **Continue with GitHub**

### Expected Flow

1. Click OAuth button
2. Redirected to provider (Google/GitHub)
3. Authorize the application
4. Redirected back to `/chat`
5. User is now authenticated!

---

## 🔧 Troubleshooting

### "Redirect URI mismatch" Error

**Problem:** The redirect URI doesn't match what's configured.

**Solution:**
- Double-check the callback URL in Google Cloud Console / GitHub
- Must be exactly: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- No trailing slash!

### Google "App not verified" Warning

**Problem:** Google shows a warning screen.

**Solution:** 
- Click "Advanced" → "Go to [App Name] (unsafe)"
- This is normal for apps in development
- To remove: Submit for Google verification (production only)

### OAuth Button Does Nothing

**Problem:** Button clicks but nothing happens.

**Solution:**
- Check browser console for errors
- Verify Supabase credentials in `.env.local`
- Ensure providers are enabled in Supabase dashboard
- Check that Client ID/Secret are correct

### "Invalid Client" Error

**Problem:** Provider says client credentials are invalid.

**Solution:**
- Re-check Client ID in Supabase dashboard
- Re-check Client Secret in Supabase dashboard
- Regenerate the secret if needed
- Wait a few minutes for changes to propagate

---

## 📱 Production Deployment

### Update Redirect URIs

When deploying to production, add your production domain:

**Google:**
1. Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add to **Authorized JavaScript origins:**
   ```
   https://your-production-domain.com
   ```
4. **Authorized redirect URIs** already has Supabase URL (no change needed)

**GitHub:**
1. GitHub OAuth App settings
2. Update **Homepage URL** to production domain
3. **Authorization callback URL** already has Supabase URL (no change needed)

### Environment Variables

Production `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

---

## 🎉 Verification Checklist

- [ ] Google OAuth credentials created
- [ ] GitHub OAuth app created
- [ ] Both providers enabled in Supabase
- [ ] Client IDs and Secrets configured
- [ ] Redirect URLs match exactly
- [ ] Local testing successful
- [ ] Email/password auth still works
- [ ] User can toggle between login/signup in modal
- [ ] Modal closes after successful auth
- [ ] User redirected to `/chat` after auth

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Supabase logs: Dashboard → Logs → Auth Logs
2. Check browser console for JavaScript errors
3. Verify all credentials are correct
4. Ensure redirect URLs match exactly
5. Try regenerating the OAuth secrets

---

**✨ Once configured, users can sign in with:**
- Email & Password
- Google Account
- GitHub Account

All authentication flows are secure and managed by Supabase! 🔒
