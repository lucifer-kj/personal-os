import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.personalos.app",
  appName: "Personal OS",
  webDir: "public",
  server: {
    // Connects to your hosted Next.js production workstation on Vercel
    // For local physical device testing on Wi-Fi, change this to your PC's LAN IP (e.g. http://192.168.1.X:3000)
    url: process.env.CAPACITOR_SERVER_URL || "https://prsnl-os.vercel.app",
    cleartext: process.env.NODE_ENV === "development",
    androidScheme: "https",
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0E0C0B",
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === "development",
  },
};

export default config;
