import * as ScreenOrientation from "expo-screen-orientation";

export async function lockPortrait(): Promise<void> {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

export async function lockLandscape(): Promise<void> {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
}
