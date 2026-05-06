# Squint Structural Editing Tutor

_npm_check:
  @test -f package.json || (echo "No package.json found — wait for Phase 1 scaffolding or run 'npm init'." && exit 1)

# Install dependencies (requires Phase 1 scaffolding)
install: _npm_check
  npm install

# Start dev server
dev: _npm_check
  npm run dev

# Build for production (requires Phase 1 scaffolding)
build: _npm_check
  npm run build

# Preview production build (requires Phase 1 scaffolding)
preview: _npm_check
  npm run build && npm run preview

# Run tests
test: _npm_check
  npm test

# Run spell check
spellcheck:
  typos .

# Check code formatting and lint
check: spellcheck

# Show wai project status
status:
  wai status

# Show issue tracker summary
issues:
  bd list

# Run full quality check
qa: check
  @echo "All checks passed"
