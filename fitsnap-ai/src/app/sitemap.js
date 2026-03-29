export default async function sitemap() {
  const baseUrl = "https://fitsnap-ai.vercel.app";

  const routes = [
    "",
    "/catalog",
    "/explore",
    "/profile",
    "/rewards",
    "/wardrobe",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}
