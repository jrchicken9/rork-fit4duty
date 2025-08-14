#!/bin/bash

# Quick GitHub Update Script
echo "🚀 Starting GitHub update process..."

# Check for changes
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ No changes to commit"
    exit 0
fi

# Show what files changed
echo "📝 Files changed:"
git status --short

# Get commit message from user
echo ""
read -p "💬 Enter commit message: " commit_message

# Add all changes
echo "📦 Adding files..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "$commit_message"

# Pull latest changes
echo "⬇️  Pulling latest changes..."
git pull origin main --rebase

# Push to GitHub
echo "⬆️  Pushing to GitHub..."
git push origin main

echo "✅ Update complete! Your changes are now on GitHub."
