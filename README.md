# Step Counter App (React Native + Expo)

A simple React Native step counter app with:

- Live step tracking via `expo-sensors` pedometer support
- Goal progress bar (10,000 daily steps)
- Estimated distance and calories
- Demo mode for devices without a pedometer sensor

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the app:

```bash
npm run start
```

3. Open on Android/iOS simulator or Expo Go app.

## Notes

- Step tracking depends on device hardware and OS permissions.
- If pedometer is unavailable, use `Start Demo` to simulate steps.
