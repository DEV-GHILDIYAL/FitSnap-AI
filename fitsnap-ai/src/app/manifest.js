export default function manifest() {
  return {
    name: "FitSnap AI – AI-Powered Virtual Try-On",
    short_name: "FitSnap AI",
    description: "Try outfits on yourself instantly with AI magic.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#121212",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
