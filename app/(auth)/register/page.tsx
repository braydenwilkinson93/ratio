import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions";
import { Flash } from "@/components/flash";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const params = await searchParams;
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="eyebrow">Join Ratio</div>
        <h1>Make your first vote count.</h1>
        <p>Create an account with email or phone. No public contact details, ever.</p>
        <Flash error={params.error} />
        <form action={registerAction} className="stack-form">
          <label>Display name<input name="displayName" autoComplete="name" minLength={2} maxLength={60} required placeholder="Avery Chen" /></label>
          <label>Email or phone<input name="identifier" autoComplete="username" required placeholder="you@example.com or +12125550123" /></label>
          <label>Password<input type="password" name="password" autoComplete="new-password" minLength={8} required /><small>At least 8 characters</small></label>
          <button className="button full" type="submit">Create account</button>
        </form>
        <div className="auth-switch">Already a member? <Link href="/login">Sign in</Link></div>
      </div>
    </section>
  );
}
