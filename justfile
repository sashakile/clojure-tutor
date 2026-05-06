# Squint Structural Editing Tutor

# Install dependencies
install:
  npm install

# Start dev server
dev:
  npm run dev

# Build for production
build:
  npm run build

# Preview production build
preview:
  npm run preview

# Run spell check
spellcheck:
  typos .

# Check code formatting and lint
check: spellcheck

# Evaluate squint code snippet (for testing)
# Usage: just eval "(+ 1 2)"
eval expr:
  node -e "import('squint-cljs').then(s => s.compileString('{{expr}}').then(console.log))"

# Show wai project status
status:
  wai status

# Show issue tracker summary
issues:
  bd list

# Run full quality check
qa: check
  @echo "All checks passed"
