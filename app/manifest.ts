import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ratio",
    short_name: "Ratio",
    description: "Think twice. Decide better.",
    start_url: "/",
    display: "standalone",
    background_color: "#071b29",
    theme_color: "#1677ff"
  };
}
