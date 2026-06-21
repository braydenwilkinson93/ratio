import type { Metadata } from "next";
import { RatioCapsule } from "./ratio-capsule";

const title = "Ratio";
const description = "Vote once. Hear the other side. Vote again.";
const image = "/ratio-capsule-og.png";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: "A silver capsule with a glowing teal eye."
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image]
  }
};

export default function PollCapsulePage() {
  return <RatioCapsule />;
}
