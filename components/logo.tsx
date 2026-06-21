import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Ratio home">
      <span className="logo-mark">R</span>
      <span>ratio</span>
    </Link>
  );
}
