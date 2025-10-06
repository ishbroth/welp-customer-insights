# Secrets Rotation and Environment Variable Security Plan

## Overview
Remove exposed secrets from `.env`, rotate all compromised keys, and properly configure environment variables across different deployment environments.

## IMPORTANT: Supabase Client Configuration Decision (2025-10-05)

**Current Setup (Correct for GitHub Pages):**
- `src/integrations/supabase/client.ts` uses **hardcoded** `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- This is CORRECT and SAFE for the following reasons:
  - GitHub Pages deployment is a **static site** with no access to environment variables during build
  - The anon key is **PUBLIC by design** - it's meant to be embedded in frontend code
  - Security is enforced by **Row Level Security (RLS) policies** on the Supabase backend
  - This is the standard pattern for frontend Supabase applications

**Why Environment Variables Broke Production:**
- Attempted to use `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`
- GitHub Actions workflow (`.github/workflows/build-web.yml`) runs `npm run build` without env vars
- No `.env` file or GitHub Actions secrets configured in CI
- Build resulted in `undefined` values → complete app failure

**DO NOT change this unless:**
- Moving to a deployment platform that supports build-time environment variables (Vercel, Netlify, etc.)
- AND configuring those environment variables in the deployment platform
- AND updating the GitHub Actions workflow to pass them during build

## Current State - Exposed Secrets
The following secrets are exposed in `.env` (committed to Git):
- ❌ `STRIPE_SECRET_KEY` - Should NEVER be client-side
- ❌ `VITE_SUPABASE_SERVICE_ROLE_KEY` - Should ONLY be in Edge Functions
- ⚠️ `RESEND_API_KEY` - Should be in Edge Functions only
- ✅ `VITE_SUPABASE_URL` - PUBLIC (safe to expose, also hardcoded in client)
- ✅ `VITE_SUPABASE_ANON_KEY` - PUBLIC (safe to expose, also hardcoded in client)

## Work to be Done

### 1. Immediate Security Actions
```bash
# Add .env to .gitignore if not already
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Remove .env from git history (if committed)
git rm --cached .env
git commit -m "Remove .env from version control"
```

### 2. Rotate All Exposed Keys

#### Stripe Keys
1. Log into Stripe Dashboard
2. Navigate to Developers → API Keys
3. Roll/Regenerate the secret key
4. Update the new key in Supabase Edge Functions secrets
5. Test payment flows with new key

#### Supabase Service Role Key
1. This key should NEVER be rotated without careful planning
2. It's meant for server-side use only
3. Remove from `.env` immediately
4. Keep only in Supabase Edge Functions environment

#### Resend API Key
1. Log into Resend Dashboard
2. Navigate to API Keys
3. Delete the exposed key
4. Generate new API key
5. Update in Supabase Edge Functions secrets

### 3. Environment Variable Strategy

#### Client-Side (.env for Vite)
**Only public, non-sensitive values:**
```bash
# Supabase Public (ALSO hardcoded in src/integrations/supabase/client.ts)
# NOTE: These are NOT used in GitHub Pages builds - the hardcoded values are used instead
# Keep these for local development only
VITE_SUPABASE_URL=https://yftvcixhifvrovwhtgtj.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>

# Stripe Public
VITE_STRIPE_PUBLISHABLE_KEY=<publishable_key>

# App Config
VITE_APP_ENV=production
VITE_LOG_LEVEL=error
```

#### Server-Side (Supabase Edge Functions)
**All secret keys:**
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (automatically available)
- `FCM_SERVER_KEY` (for push notifications)

#### GitHub Pages/Static Hosting
**IMPORTANT: GitHub Pages does NOT support environment variables during build**
- The workflow runs `npm run build` without any environment variables
- Supabase credentials are **hardcoded** in `src/integrations/supabase/client.ts`
- This is SAFE because the anon key is public and protected by RLS
- DO NOT change to environment variables unless:
  1. Switching to a platform that supports build-time env vars (Vercel, Netlify)
  2. Configuring those env vars in the deployment platform
  3. Updating the GitHub Actions workflow to inject them

### 4. Configure Supabase Edge Function Secrets

Access Supabase Dashboard:
```bash
# Via Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=<new_secret_key>
supabase secrets set RESEND_API_KEY=<new_api_key>
supabase secrets set FCM_SERVER_KEY=<fcm_key>

# Verify
supabase secrets list
```

Or via Dashboard:
1. Project Settings → Edge Functions
2. Add secrets
3. Secrets are encrypted at rest

### 5. Update .env.example
Create `.env.example` for documentation:
```bash
# Supabase Public (safe to commit)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Stripe Public (safe to commit)
VITE_STRIPE_PUBLISHABLE_KEY=

# DO NOT PUT SECRET KEYS HERE
# Secret keys go in Supabase Edge Functions secrets:
# - STRIPE_SECRET_KEY
# - RESEND_API_KEY
# - FCM_SERVER_KEY
```

### 6. Update Edge Functions
Ensure Edge Functions use Deno.env:
```typescript
const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
const resendKey = Deno.env.get('RESEND_API_KEY')
const fcmKey = Deno.env.get('FCM_SERVER_KEY')
```

### 7. Update Documentation
Document environment variable usage:
- What goes in `.env` (client)
- What goes in Edge Function secrets (server)
- How to add new secrets
- Local development setup

### 8. CI/CD Pipeline
**Current State: GitHub Pages with hardcoded Supabase credentials**
- `.github/workflows/build-web.yml` runs `npm run build` without env vars
- Supabase credentials hardcoded in `src/integrations/supabase/client.ts` (correct approach)
- No GitHub Secrets needed for Supabase (anon key is public)

**If switching to environment variables in the future:**
- Add GitHub Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Update workflow to inject during build:
  ```yaml
  - name: Build application
    run: npm run build
    env:
      VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
      VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  ```
- Update `src/integrations/supabase/client.ts` to use `import.meta.env.*`

### 9. Local Development
For local development:
```bash
# Create .env.local (gitignored)
cp .env.example .env.local

# Fill in public values only
# Use Supabase CLI for Edge Function testing with secrets
```

### 10. Audit All API Keys
Review all API integrations:
- [ ] Stripe (rotated)
- [ ] Resend (rotated)
- [ ] Google Maps API (if used)
- [ ] FCM/APNs (verify not exposed)
- [ ] Any other third-party services

### 11. Security Checklist
- [ ] `.env` removed from Git
- [ ] `.env` added to `.gitignore`
- [ ] Stripe secret key rotated
- [ ] Resend API key rotated
- [ ] Service role key removed from `.env`
- [ ] Edge Function secrets configured
- [ ] `.env.example` created
- [ ] Documentation updated
- [ ] All Edge Functions using `Deno.env.get()`
- [ ] Local development guide updated
- [ ] Team notified of changes

## Files to Create
- `.env.example` - Template for environment variables
- `docs/environment-setup.md` - Environment variable guide

## Files to Update
- `.gitignore` - Ensure `.env*` ignored
- `.env` - Remove all secret keys, keep only `VITE_*` vars
- All Edge Functions - Verify using Deno.env
- `README.md` - Link to environment setup guide

## Deployment Environments

### Development
- Local `.env.local` with development keys
- Supabase local secrets for Edge Functions

### Staging
- Staging Supabase project with separate secrets
- Staging Stripe test keys
- Staging Resend API key

### Production
- Production Supabase secrets (encrypted)
- Production Stripe live keys
- Production Resend API key
- GitHub Pages deployment (no secrets in build)

## Deliverables
- All secrets rotated and secured
- Proper environment variable separation
- `.env` file cleaned and safe
- Documentation for future developers
- Security audit passed
- No secrets in version control
