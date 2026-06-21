import Link from "next/link";
import { ArrowRight, BarChart3, MessageSquareQuote, RefreshCcw } from "lucide-react";
import { db } from "@/lib/db";
import { PollCard } from "@/components/poll-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const polls = await db.poll.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { _count: { select: { votes: true, arguments: true } } }
  });

  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="shell hero-grid">
          <div>
            <div className="eyebrow"><span className="live-dot" /> A consensus engine for clearer thinking</div>
            <h1>Think twice.<br /><span>Decide better.</span></h1>
            <p className="hero-copy">Vote on the questions that matter. Test your position against the strongest arguments. Then decide where you truly stand.</p>
            <div className="hero-actions">
              <Link className="button" href="/register">Join the conversation <ArrowRight size={18} /></Link>
              <Link className="button secondary" href="/dashboard">Explore questions</Link>
            </div>
            <div className="trust-line"><span>Independent thinking</span><span>Constructive debate</span><span>Transparent results</span></div>
          </div>
          <div className="hero-demo">
            <div className="demo-top"><span>LIVE QUESTION</span><span>1,284 participants</span></div>
            <h3>Should cities make public transit free?</h3>
            <div className="demo-choice active"><span>A</span><div><strong>Yes</strong><small>Access should be universal</small></div><b>58%</b></div>
            <div className="demo-choice"><span>B</span><div><strong>No</strong><small>Targeted support is more sustainable</small></div><b>42%</b></div>
            <div className="demo-insight"><RefreshCcw size={17} /><span><strong>14% changed their view</strong> after reading arguments</span></div>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading centered">
          <div className="eyebrow">How Ratio works</div>
          <h2>A better path to consensus</h2>
          <p>Not another popularity contest. Ratio reveals how informed opinions evolve.</p>
        </div>
        <div className="steps">
          <article><span className="step-icon"><BarChart3 /></span><b>01</b><h3>Take a position</h3><p>Cast an initial vote and record how confident you feel.</p></article>
          <article><span className="step-icon"><MessageSquareQuote /></span><b>02</b><h3>Consider both sides</h3><p>Read concise arguments and direct rebuttals from the community.</p></article>
          <article><span className="step-icon"><RefreshCcw /></span><b>03</b><h3>Vote again</h3><p>Confirm or change your position. Both outcomes are meaningful.</p></article>
        </div>
      </section>

      {polls.length > 0 && (
        <section className="section shell">
          <div className="section-heading row"><div><div className="eyebrow">Open now</div><h2>Questions worth considering</h2></div><Link href="/dashboard">View all <ArrowRight size={16} /></Link></div>
          <div className="poll-grid">{polls.map((poll) => <PollCard key={poll.slug} poll={poll} />)}</div>
        </section>
      )}
    </>
  );
}
