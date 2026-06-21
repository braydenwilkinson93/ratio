"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="auth-page">
      <div className="auth-card centered">
        <div className="eyebrow">Something went wrong</div>
        <h1>We lost the thread.</h1>
        <p>The error has been contained. Try the request one more time.</p>
        <button className="button" onClick={reset}>Try again</button>
      </div>
    </section>
  );
}
