import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <nav className="nav shell">
        <Link href="/" className="logo">
          <span className="logo-mark">R</span>
          Ratio
        </Link>
      </nav>
    </header>
  );
}
