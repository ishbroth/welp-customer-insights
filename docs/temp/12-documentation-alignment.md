# Documentation Alignment Plan

## Overview
Reorganize, update, and consolidate all project documentation into a clear, maintainable structure.

## Current State Issues
- Documentation files scattered in root directory
- Outdated references to Twilio (should be Resend)
- Duplicate documentation files
- Unclear organization
- Mix of technical specs and implementation guides
- Snapshot files may be outdated

## Work to be Done

### 1. Move Root Documentation Files
Files currently in root to move to `docs/`:
- `ACCOUNT_DELETION_REFERENCE.md` → `docs/features/account-deletion.md`
- `ANDROID_QUICKSTART.md` → `docs/mobile/android-quickstart.md`
- `APP_STORE_GUIDE.md` → `docs/mobile/app-store-guide.md`
- `ORPHANED_DATA_TRACKING.md` → `docs/maintenance/orphaned-data.md`
- `RESEND_CODE_ISSUE_TRACKING.md` → `docs/maintenance/resend-issues.md`
- `RESTORE_POINT_BEFORE_ASSOCIATES.md` → `docs/maintenance/restore-points.md`
- `android-build.md` → `docs/mobile/android-build.md`

### 2. Create Organized Directory Structure
```
docs/
├── README.md (index of all documentation)
├── getting-started/
│   ├── setup.md
│   ├── environment-variables.md
│   └── local-development.md
├── features/
│   ├── authentication.md
│   ├── reviews.md
│   ├── billing.md
│   ├── subscriptions.md
│   ├── notifications.md
│   ├── account-deletion.md
│   └── business-verification.md
├── api/
│   ├── edge-functions.md
│   ├── database-schema.md
│   └── integrations.md
├── mobile/
│   ├── android-setup.md
│   ├── ios-setup.md
│   ├── android-build.md
│   ├── app-store-guide.md
│   └── capacitor-plugins.md
├── architecture/
│   ├── overview.md
│   ├── database-design.md
│   ├── authentication-flow.md
│   └── state-management.md
├── deployment/
│   ├── production-checklist.md
│   ├── github-pages.md
│   └── supabase-setup.md
├── maintenance/
│   ├── orphaned-data.md
│   ├── restore-points.md
│   └── troubleshooting.md
└── temp/
    └── (implementation plans)
```

### 3. Update Twilio → Resend References
Files to update:
- `docs/registration-flow.md`
- `docs/USER_ACTIONS_REFERENCE.md`
- `docs/README.md`
- `src/docs/snapshots/TECHNICAL_SPECIFICATION.md`
- `src/docs/snapshots/CURRENT_STATE_SUMMARY.md`
- `src/docs/snapshots/COMPREHENSIVE_FEATURE_SUMMARY.md`
- `src/docs/snapshots/AUTHENTICATION_SYSTEM_SNAPSHOT.md`

Replace all mentions of:
- "Twilio" → "Resend"
- "SMS verification" → "Email verification" (where applicable)
- Update code examples
- Update architecture diagrams if any

### 4. Consolidate Duplicate Documentation
Review and merge:
- `docs/credit-system.md` vs `docs/credit-system-reference.md`
  - Keep one comprehensive version
  - Merge unique content from both
- Review all `-reference` vs non-reference files
- Keep most up-to-date version

### 5. Review Snapshot Files
Located in `src/docs/snapshots/`:
- `AUTHENTICATION_SYSTEM_SNAPSHOT.md`
- `BUSINESS_VERIFICATION_SNAPSHOT.md`
- `COMPREHENSIVE_FEATURE_SUMMARY.md`
- `CREDIT_SYSTEM_SNAPSHOT.md`
- `CURRENT_STATE_SUMMARY.md`
- `REVIEW_SYSTEM_SNAPSHOT.md`
- `SEARCH_SYSTEM_SNAPSHOT.md`
- `TECHNICAL_SPECIFICATION.md`

Actions:
- Review each for accuracy
- Update outdated information
- Move to `docs/architecture/` if still relevant
- Archive or delete if superseded

### 6. Standardize Documentation Format
All documentation should include:
```markdown
# Title

## Overview
Brief description of what this covers

## Current Implementation
How it currently works

## Usage
How to use/implement

## Configuration
Any configuration options

## Examples
Code examples

## Troubleshooting
Common issues and solutions

## Related Documentation
Links to related docs
```

### 7. Create Master Documentation Index
Update `docs/README.md` as the main index:
- Link to all documentation
- Organized by category
- Quick start guide
- FAQ section
- Contribution guidelines

### 8. Add Cross-References
Link related documentation:
- Authentication docs ↔ Profile docs
- Review docs ↔ Notification docs
- Mobile docs ↔ Deployment docs
- API docs ↔ Feature docs

### 9. Create Onboarding Guide
New developer onboarding:
- Project overview
- Technology stack
- Setup instructions
- Development workflow
- Contribution guidelines
- Code standards

### 10. Archive Old Documentation
Create `docs/archive/` for:
- Outdated implementation details
- Deprecated features
- Historical decisions
- Restore point references

### 11. Update README.md
Main project README should include:
- Project description
- Quick start
- Link to full documentation
- Technology stack
- License
- Contributing

### 12. Documentation Maintenance Guide
Create guide for keeping docs current:
- When to update docs
- How to write good docs
- Review process
- Versioning strategy

## Files to Move
From root to docs/:
- ACCOUNT_DELETION_REFERENCE.md
- ANDROID_QUICKSTART.md
- APP_STORE_GUIDE.md
- ORPHANED_DATA_TRACKING.md
- RESEND_CODE_ISSUE_TRACKING.md
- RESTORE_POINT_BEFORE_ASSOCIATES.md
- android-build.md

## Files to Create
- `docs/getting-started/setup.md`
- `docs/getting-started/environment-variables.md`
- `docs/getting-started/local-development.md`
- `docs/architecture/overview.md`
- `docs/deployment/production-checklist.md`
- `docs/onboarding.md`
- `docs/CONTRIBUTING.md`

## Files to Update
- `docs/README.md` - Complete rewrite as index
- `README.md` - Link to docs/
- All files with Twilio references
- Consolidate duplicate files

## Files to Archive
- Outdated snapshots
- Old implementation notes
- Deprecated feature docs

## Deliverables
- Clean, organized documentation structure
- All Twilio references updated to Resend
- No documentation in root directory
- Comprehensive documentation index
- Onboarding guide for new developers
- Easy to find and maintain documentation
- Clear contribution guidelines
