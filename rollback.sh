#!/bin/bash
# Rollback Script for Dependency Migration
# This script reverts all migration changes and restores the baseline state

echo "🔄 DEPENDENCY MIGRATION ROLLBACK SCRIPT"
echo "========================================"
echo ""

# Check if we're on the migration branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "migration/dependency-upgrades" ]; then
    echo "⚠️  WARNING: You're not on the migration branch!"
    echo "   Current branch: $CURRENT_BRANCH"
    echo "   Expected: migration/dependency-upgrades"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📋 Rollback Options:"
echo "   1. Rollback to baseline commit (hard reset)"
echo "   2. Revert specific phase commit"
echo "   3. Switch to main branch (preserve migration branch)"
echo "   4. Cancel"
echo ""
read -p "Select option (1-4): " -n 1 -r option
echo ""

case $option in
    1)
        echo "🔙 Rolling back to baseline commit: fe578f3"
        echo ""

        # Show what will be reset
        echo "Files that will be reset:"
        git diff --name-only fe578f3
        echo ""

        read -p "Proceed with hard reset? (y/N) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git reset --hard fe578f3
            npm install
            echo ""
            echo "✅ Rollback complete!"
            echo "   Run 'npm run test:run' to verify"
        else
            echo "❌ Rollback cancelled"
            exit 0
        fi
        ;;

    2)
        echo "📝 Recent commits on this branch:"
        git log --oneline -10
        echo ""
        read -p "Enter commit hash to revert: " commit_hash

        if [ -z "$commit_hash" ]; then
            echo "❌ No commit hash provided"
            exit 1
        fi

        echo "🔙 Reverting commit: $commit_hash"
        git revert "$commit_hash"
        npm install
        echo ""
        echo "✅ Revert complete!"
        ;;

    3)
        echo "🔀 Switching to main branch"
        git checkout main
        echo ""
        echo "ℹ️  Migration branch preserved: migration/dependency-upgrades"
        echo "   To resume: git checkout migration/dependency-upgrades"
        ;;

    4)
        echo "❌ Rollback cancelled"
        exit 0
        ;;

    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "📊 Current status:"
git status --short
echo ""
echo "🧪 Recommended next steps:"
echo "   1. npm run test:run      # Verify tests pass"
echo "   2. npm run lint          # Verify linting passes"
echo "   3. npm run build         # Verify build succeeds"
echo "   4. npm run dev:full      # Start dev servers"
