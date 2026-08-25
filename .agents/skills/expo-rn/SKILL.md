---
name: expo-rn
description: Expo and Expo Router on top of React Native, TypeScript. Use with vercel-react-native-skills for lists, animations, and native performance. Covers EAS, Expo Router, and JS vs native APIs.
---

# Expo + React Native + TypeScript

Follow `vercel-react-native-skills` for FlashList, Reanimated, images, JS vs native APIs, and platform performance. This skill is Expo-specific.

App directory layout is a default. Real directories come from the `implement`/`tdd` recon of `package.json` and `tsconfig.json` (monorepo, `paths`).

## Defaults

- TypeScript (`.tsx`). Expo Router file-based routes unless the user asked for a different navigator.
- Prefer Expo modules (`expo-*`) before ejecting to raw native code.
- EAS for cloud builds. Do not paste keystore, ASC, or Google Play secrets into chat.

## JS vs native

Stay in JS/Expo until a module is missing. Native modules need a documented reason (sensor, background, Store-only API).
