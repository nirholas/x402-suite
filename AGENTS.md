# AGENTS.md

Operating notes for AI coding agents (Claude Code, Codex, Cursor, Copilot and others) working in this repository. Everything here is derived from the files actually in the tree, so trust it over guesses, and update it when the facts change.

## What this repository is

Fifty open-source services that let AI agents buy real things - booking, travel, shopping, and the infrastructure underneath, priced per request over x402

- Homepage: https://nirholas.github.io/x402-suite/
- Source: https://github.com/nirholas/x402-suite
- Primary language: JavaScript
- License: Apache License 2.0 (see the LICENSE file)

## Repository layout

- `docs/`
- `README.md`
- `LICENSE`

## Setup

No package manifest is checked in. Follow the installation steps in `README.md`.

## Commands

No build, test or lint scripts are declared in the tree. Verify changes by running the project as `README.md` describes.

## Conventions

- `.env` files are gitignored; never commit credentials, and read configuration from environment variables.
- Commit messages follow Conventional Commits (`type(scope): summary`), matching the existing history.
- Read the surrounding code before adding to it, and match its naming, file organisation and error-handling style.
- Keep `README.md` accurate: if a change alters behaviour, commands or configuration, update the docs in the same commit.
- Do not leave TODO comments, stub functions, placeholder data or commented-out code behind. Finish what you start or leave it out.
- Small, focused commits with a subject line that describes the change, not the act of committing.

## Where to raise things

- Bugs and feature requests: https://github.com/nirholas/x402-suite/issues
- Questions and ideas: https://github.com/nirholas/x402-suite/discussions
- Security issues: report privately at https://github.com/nirholas/x402-suite/security/advisories/new, never in a public issue.
