#!/bin/bash
# Branch Protection Setup Script
# This configures branch protection for the main branch

set -e

REPO="olebaba/botkasse-bsk"
BRANCH="main"

echo "Setting up branch protection for $REPO (branch: $BRANCH)"

# Create a temporary JSON file for the API call
cat > /tmp/branch-protection.json << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Lint", "TypeScript", "Tests"]
  },
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "enforce_admins": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "restrictions": null
}
EOF

# Apply the branch protection
gh api repos/$REPO/branches/$BRANCH/protection \
  -X PUT \
  --input /tmp/branch-protection.json

echo "✓ Branch protection configured successfully!"
echo ""
echo "Protection rules:"
echo "  - Requires passing CI checks: Lint, TypeScript, Tests"
echo "  - Requires 1 code review before merge"
echo "  - Dismisses stale reviews when new commits are pushed"
echo "  - Blocks force push and deletion"

# Clean up
rm /tmp/branch-protection.json
