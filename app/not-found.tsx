import Link from "next/link";

export default function NotFound() {
  return <section className="auth-page"><div className="auth-card centered"><div className="eyebrow">404</div><h1>That question is not here.</h1><p>It may have been moved, closed, or never existed.</p><Link href="/dashboard" className="button">Explore open questions</Link></div></section>;
}
