# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sine Toolbox is a monorepo containing tools for creating and managing Sine browser mods (primarily for Zen browser). The project consists of two main packages:

- `create-sine-mod`: CLI tool for scaffolding new Sine mod projects
- `sine-toolbox`: Development toolchain with build and dev commands

## Architecture

### Monorepo Structure
- **Root**: Configuration files, shared dependencies, and workspace setup
- **packages/create-sine-mod**: Project scaffolding CLI with templates and browser profile detection
- **packages/sine-toolbox**: Development toolchain with build/dev commands and schema validation

### Key Components
- **Browser Profile Detection**: Multi-platform system for detecting Firefox-based browser profiles (currently Zen browser)
- **Template System**: Project templates with common files and template-specific overrides
- **Schema Validation**: Uses ArkType for runtime type checking of preferences and theme configurations
- **Package Manager Detection**: Auto-detects and supports npm, yarn, pnpm, and bun

### Build System
- **zshy**: Custom build tool used for both packages
- **Biome**: Code formatting and linting with comprehensive rules
- **TypeScript**: Strict configuration with latest ESNext features

## Common Commands

### Development
```bash
# Lint and format code
bun run check:code

# Type checking
bun run check:types

# Build individual packages
cd packages/create-sine-mod && bun run build
cd packages/sine-toolbox && bun run build
```

### Package Usage
```bash
# Create new Sine mod project
npx create-sine-mod [project-name]

# Development server for Sine projects
sine-toolbox dev

# Build Sine project for production
sine-toolbox build
```

## Important Implementation Details

### Browser Profile Detection
The system detects browser profiles through platform-specific paths:
- WSL detection for cross-platform development
- Browser-specific profile enumeration
- Profile selection via interactive prompts

### Template System
Templates are structured with:
- `common/`: Shared files across all templates
- `[template-name]/`: Template-specific overrides
- Package.json updates with project name and browser profiles

### Schema System
Uses ArkType for runtime validation with complex union types for different field types (checkbox, dropdown, string, separator).

## Code Conventions

- **Runtime**: Bun is the primary runtime
- **Module System**: ESM with `"type": "module"`
- **Imports**: Use `.js` extensions for TypeScript imports
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging**: Custom logger with spinners and status updates