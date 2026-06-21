import Link from "next/link";
import { BarChart3, CircleUserRound, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/app/actions";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="shell nav">
        <Logo />
        <nav className="nav-links" aria-label="Main navigation">
          {user ? (
            <>
              <Link href="/dashboard"><BarChart3 size={17} /> Explore</Link>
              <Link href="/polls/new"><Plus size={17} /> Create</Link>
              <Link href="/profile"><CircleUserRound size={17} /> Profile</Link>
              {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
              <form action={logoutAction}><button className="button ghost small">Sign out</button></form>
            </>
          ) : (
            <>
              <Link href="/login">Sign in</Link>
              <Link href="/register" className="button small">Join Ratio</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
