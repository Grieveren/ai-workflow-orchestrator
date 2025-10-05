#!/bin/bash
# Screenshot Script for Visual Regression Testing
# Requires: Chrome/Chromium browser and screenshot tool (e.g., puppeteer-cli, playwright)
#
# Usage: ./take-screenshots.sh <output-dir>
# Example: ./take-screenshots.sh baseline-screenshots

OUTPUT_DIR="${1:-baseline-screenshots}"
BASE_URL="http://localhost:3000"

echo "📸 Taking screenshots for visual regression testing..."
echo "Output directory: $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Pages to screenshot
declare -A PAGES=(
    ["landing"]="/"
    ["submit"]="/submit"
    ["dashboard"]="/dashboard"
    ["kanban"]="/kanban"
    ["analytics"]="/analytics"
    ["request-detail"]="/request/REQ-001"
)

echo "🌐 Checking if dev server is running..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ Dev server not running at $BASE_URL"
    echo "   Run 'npm run dev:full' first"
    exit 1
fi

echo "✅ Dev server is running"
echo ""

# Manual screenshot instructions
echo "📝 MANUAL SCREENSHOT INSTRUCTIONS:"
echo "   Since automated screenshots require browser automation tools,"
echo "   please take screenshots manually using your browser:"
echo ""

for page_name in "${!PAGES[@]}"; do
    url="${BASE_URL}${PAGES[$page_name]}"
    filename="$OUTPUT_DIR/${page_name}.png"

    echo "   $page_name: $url"
    echo "   → Save as: $filename"
    echo ""
done

echo "💡 TIP: Use browser DevTools (F12) → Device Toolbar (Ctrl+Shift+M)"
echo "         Set viewport to 1920x1080 for consistent screenshots"
echo ""
echo "🚀 Alternative: Install Puppeteer and run automated screenshot script"
echo "   npm install -g puppeteer-cli"
echo "   Then modify this script to use: puppeteer-cli screenshot $url $filename"
