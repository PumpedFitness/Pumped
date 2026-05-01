# Pumped

A fitness app monorepo powered by [Bun](https://bun.sh).

## Structure

```
apps/
├── frontend/   # React Native app
└── backend/    # Backend service (TBD)
```

## Prerequisites

- [Bun](https://bun.sh) >= 1.0
- [Node.js](https://nodejs.org) >= 22
- [Xcode](https://developer.apple.com/xcode/) (for iOS)
- [Android Studio](https://developer.android.com/studio) (for Android)
- [CocoaPods](https://cocoapods.org) (for iOS)

## Getting Started

```bash
# Install all dependencies
bun install

# iOS setup
cd apps/frontend/ios && bundle install && bundle exec pod install && cd ..

# Start the Metro bundler
bun run frontend

# Run on iOS
bun run frontend:ios

# Run on Android
bun run frontend:android
```

## Available Scripts

| Script                | Description                        |
| --------------------- | ---------------------------------- |
| `bun run frontend`         | Start the Metro bundler            |
| `bun run frontend:ios`     | Build and run on iOS simulator     |
| `bun run frontend:android` | Build and run on Android emulator  |
| `bun run frontend:lint`    | Lint the frontend code             |
| `bun run frontend:test`    | Run frontend tests                 |
| `bun run backend`          | Start the backend (TBD)            |
| `bun run backend:build`    | Build the backend (TBD)            |
| `bun run install:all`      | Install all workspace dependencies |
