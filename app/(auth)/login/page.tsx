import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";
import { Flash } from "@/components/flash";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const params = await searchParams;
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="eyebrow">Welcome back</div>
        <h1>Continue thinking clearly.</h1>
        <p>Sign in with the email address or phone number tied to your account.</p>
        <Flash error={params.error} />
        <form action={loginAction} className="stack-form">
          <label>Email or phone<input name="identifier" autoComplete="username" required placeholder="you@example.com or +12125550123" /></label>
          <label>Password<input type="password" name="password" autoComplete="current-password" minLength={8} required /></label>
          <button className="button full" type="submit">Sign in</button>
        </form>
        <div className="auth-switch">New to Ratio? <Link href="/register">Create an account</Link></div>
      </div>
    </section>
  );
}
