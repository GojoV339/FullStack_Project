#!/usr/bin/env bash
# Fix Tailwind text color utilities from white to dark secondary
# This script searches for Tailwind classes like text-white, text-white/40, etc.
# and replaces them with text-[#2D2D2D] preserving any opacity suffix.

# Define the root directory (project root)
ROOT_DIR="$(pwd)"

# Find relevant source files (tsx, ts, jsx, js, mdx)
find "$ROOT_DIR" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" -o -name "*.mdx" \) \
  -print0 | while IFS= read -r -d '' file; do
    # Use sed to replace occurrences
    sed -i -E "s/text-white(\/([0-9]+))?/text-\[#2D2D2D\]\1/g" "$file"
  done

echo "Text color replacement completed."
