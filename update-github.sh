#!/bin/bash

# Quick GitHub Update Script
echo "🚀 Starting GitHub update..."

# Check if there are any changes
if [[ -z $(git status --porcelain) ]]; then
    echo "✅ No changes to commit"
    exit 0
fi

# Show what files have changed
echo "📝 Files changed:"
git status --short

# Ask for commit message
echo ""
read -p "💬 Enter commit message: " commit_message

# Add all changes
echo "📦 Adding files..."
git add .

# Commit with message
echo "💾 Committing changes..."
git commit -m "$commit_message"

# Push to GitHub
echo "🚀 Pushing to GitHub..."
git push origin main

echo "✅ Update complete!"
echo "🌐 Check your repository: https://github.com/YOUR_USERNAME/YOUR_REPO_NAME"
