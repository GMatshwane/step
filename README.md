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

1. Start the app:

```bash
npm run start
```

1. Open on Android/iOS simulator or Expo Go app.

## Notes

- Step tracking depends on device hardware and OS permissions.
- If pedometer is unavailable, use `Start Demo` to simulate steps.

## Play Store deployment pipeline

This repo includes a GitHub Actions workflow at `.github/workflows/android-playstore-release.yml`.

### One-time setup

1. Create an Expo access token and add it to GitHub repository secrets as `EXPO_TOKEN`.
2. In Google Play Console, create a service account with Android Publisher access.
3. Download the service account JSON key and add it to GitHub repository secrets as `GOOGLE_SERVICE_ACCOUNT_JSON`.
4. Ensure the app exists in Play Console with package name `com.gordonmatshwane.stepcounter`.

### Trigger a release

- Manual: run the `Android Play Store Release` workflow from GitHub Actions.
- Tag-based: push a tag like `v1.0.1` to trigger the workflow automatically.

### Versioning for subsequent releases

- Increment `expo.version` in `app.json` for app version display.
- Increment `expo.android.versionCode` in `app.json` for every Play Store submission.
