import type { MetadataRoute } from "next";
import { DOMAIN } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${DOMAIN}`;
  return ["", "/pricing", "/vendors", "/free-analysis"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}
