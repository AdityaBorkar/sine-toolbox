# create-sine-mod

The easiest way to get started with Sine Mods for Zen Browser.

## Quick Start

### Interactive

You can create a new project interactively by running:

```bash
npx create-sine-mod@latest
# or
yarn create sine-mod
# or
pnpm create sine-mod
# or
bun create sine-mod
```

You will be asked for the name of your project, and then whether you want to create a TypeScript project:

```bash
✔ What is your project named? … my-sine-mod
✔ Which template would you like to use? › basic
✔ Which package manager would you like to use? › bun
```

### Non-interactive

You can also pass command line arguments to set up a new project non-interactively. See `create-sine-mod --help`:

```bash
npx create-sine-mod@latest my-sine-mod --template basic --package-manager bun
```

## Options

`create-sine-mod` comes with the following options:

- **-t, --template `<name>`** - Specify a template for the created project. Available templates: `basic`
- **--package-manager `<name>`** - Specify which package manager to use. Available options: `npm`, `yarn`, `pnpm`, `bun`
- **--skip-install** - Skip dependency installation

## Templates

### Basic

The basic template includes:

- **TypeScript support** - Full TypeScript configuration with strict mode
- **Preferences schema** - Runtime validation for mod preferences using ArkType
- **Development tooling** - Pre-configured build and dev commands via `sine-toolbox`
- **Browser profile detection** - Automatic detection of Zen Browser profiles

## What You Get

After creating your project, you'll have:

```
my-sine-mod/
├── README.md
├── package.json
├── tsconfig.json
├── preferences.json      # Define your mod's preferences
└── src/
    ├── index.ts         # Main mod entry point
    └── preferences.ts   # Preferences schema and types
```

## Getting Started

Once your project is created:

1. **Install dependencies** (if not done automatically):
   ```bash
   cd my-sine-mod
   npm install  # or yarn/pnpm/bun install
   ```

2. **Start development server**:
   ```bash
   npm run dev  # or yarn/pnpm/bun dev
   ```

3. **Build for production**:
   ```bash
   npm run build  # or yarn/pnpm/bun build
   ```

## Browser Support

Currently supports:
- **Zen Browser** - Full support with automatic profile detection

Platform support:
- ✅ **Windows** - Full support including WSL
- ✅ **macOS** - WIP. Help needed!
- ✅ **Linux** - WIP. Help needed!

## Contributing

See the main [sine-toolbox repository](https://github.com/AdityaBorkar/sine-toolbox) for contribution guidelines.
