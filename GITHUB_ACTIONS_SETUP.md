# GitHub Actions Setup Guide

## ✅ What Was Installed

Three automated workflows have been set up for your DriveReady Dashboard:

### 1. **CI Pipeline** (`ci.yml`)
Runs automatically on every push and pull request to `main` and `develop` branches.

**What it does:**
- ✓ Installs dependencies
- ✓ Runs ESLint (code quality check)
- ✓ Runs TypeScript type checking
- ✓ Runs all tests
- ✓ Builds the project
- ✓ Checks build size
- ✓ Reviews dependencies for security issues (on PRs only)

**Result:** You'll see a green checkmark ✅ or red X ❌ on each commit/PR

### 2. **Deploy Preview** (`deploy-preview.yml`)
Runs when you open a pull request to `main`.

**What it does:**
- ✓ Builds production version
- ✓ Uploads build artifacts (available for 7 days)
- ✓ Comments on PR with build status

### 3. **Dependabot** (`dependabot.yml`)
Automatically checks for dependency updates.

**What it does:**
- ✓ Checks npm packages weekly (every Monday at 9 AM)
- ✓ Checks GitHub Actions monthly
- ✓ Opens PRs automatically with updates
- ✓ Limits to 5 open PRs at a time

---

## 🔧 Required Setup (Important!)

### Add GitHub Secrets

For the Deploy Preview workflow to build successfully, you need to add your Supabase credentials as GitHub Secrets:

1. Go to your repository on GitHub: https://github.com/itaymm211010/driveready-dashboard
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

   **Secret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase project URL (from Project Settings → API)

   **Secret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: Your Supabase anon/public key (from Project Settings → API)

**Why?** The preview builds need these to connect to your database during the build process.

---

## 📊 How to View Results

### Check Workflow Status
1. Go to your repo: https://github.com/itaymm211010/driveready-dashboard
2. Click the **Actions** tab at the top
3. You'll see all workflow runs with their status

### Status Badge
A badge has been added to your README showing the CI status:

![CI Pipeline](https://github.com/itaymm211010/driveready-dashboard/actions/workflows/ci.yml/badge.svg)

- **Green badge** = All checks passing ✅
- **Red badge** = Build failing ❌
- **Orange badge** = In progress ⏳

---

## 🚨 What Happens When Checks Fail?

If the CI pipeline fails, you'll get:
1. **Email notification** from GitHub
2. **Red X** on your commit in GitHub
3. **Blocked PR** (if you set up branch protection - recommended)

**Common failure reasons:**
- ESLint errors (code style issues)
- TypeScript type errors
- Test failures
- Build errors (missing dependencies, syntax errors)

**To fix:**
1. Check the workflow logs in the Actions tab
2. Fix the issues locally
3. Push again - the workflow runs automatically

---

## 🔒 Optional: Branch Protection Rules (Recommended)

To prevent broken code from being merged:

1. Go to **Settings** → **Branches**
2. Click **Add rule** under "Branch protection rules"
3. Branch name pattern: `main`
4. Enable:
   - ☑️ Require status checks to pass before merging
   - ☑️ Select: "Code Quality & Tests"
   - ☑️ Require branches to be up to date before merging
5. Click **Create**

**Result:** No one can merge to `main` unless all CI checks pass!

---

## 📝 Workflow Files Location

All workflow files are in `.github/workflows/`:
- `ci.yml` - Main CI pipeline
- `deploy-preview.yml` - PR preview builds
- `dependabot.yml` - Dependency updates configuration

---

## 🎯 Next Steps

1. **Add GitHub Secrets** (see above) - Required for preview builds
2. **Set up Branch Protection** (see above) - Recommended for safety
3. **Make a test commit** to see the workflow in action
4. **Review Dependabot PRs** when they appear (automated updates)

---

## 💡 Tips

### Disable a Workflow
If you want to temporarily disable a workflow:
1. Go to **Actions** tab
2. Click the workflow name (e.g., "CI Pipeline")
3. Click the **⋮** menu → **Disable workflow**

### Manual Trigger
Currently, workflows trigger automatically. To add manual triggers, edit the workflow file and add:
```yaml
on:
  workflow_dispatch:  # Adds "Run workflow" button in GitHub
```

### Skip CI
To skip running CI on a commit (e.g., for docs only):
```bash
git commit -m "Update docs [skip ci]"
```

---

## ❓ Questions?

**Q: Does this cost money?**
A: No! GitHub Actions is free for public repositories (2000 minutes/month for private repos).

**Q: Will this slow down my development?**
A: No! Workflows run in parallel on GitHub's servers, not your machine. You can keep coding immediately after pushing.

**Q: Can I see workflow results locally?**
A: Not directly, but you can run the same commands locally:
```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

**Q: What if I want to change the workflow?**
A: Edit the `.yml` files in `.github/workflows/` and push. Changes take effect immediately.

---

**Need help?** Check the workflow logs in the Actions tab or review the [GitHub Actions documentation](https://docs.github.com/en/actions).
