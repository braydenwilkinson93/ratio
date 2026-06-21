import Link from "next/link";
import { ArrowLeft, Clock3, RefreshCcw, ShieldCheck, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { addArgumentAction } from "@/app/actions";
import { ArgumentCard } from "@/components/argument-card";
import { Flash } from "@/components/flash";
import { ResultBars } from "@/components/result-bars";
import { VotePanel } from "@/components/vote-panel";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PollPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; voted?: string; contributed?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const user = await getCurrentUser();
  const poll = await db.poll.findUnique({
    where: { slug },
    include: {
      creator: { select: { displayName: true } },
      options: { orderBy: { position: "asc" } },
      votes: { orderBy: [{ userId: "asc" }, { round: "asc" }] },
      arguments: {
        where: { approved: true },
        orderBy: [{ score: "desc" }, { createdAt: "asc" }],
        include: {
          author: { select: { displayName: true } },
          rebuttals: {
            where: { approved: true },
            include: { author: { select: { displayName: true } } },
            orderBy: { createdAt: "asc" }
          }
        }
      }
    }
  });
  if (!poll || (poll.status === "DRAFT" && user?.role !== "ADMIN")) notFound();

  const ownVotes = user ? poll.votes.filter((vote) => vote.userId === user.id) : [];
  const latestByUser = new Map<string, (typeof poll.votes)[number]>();
  for (const vote of poll.votes) latestByUser.set(vote.userId, vote);
  const initialVotes = poll.votes.filter((vote) => vote.round === 1);
  const currentVotes = [...latestByUser.values()];
  const initialResults = poll.options.map((option) => ({
    ...option,
    count: initialVotes.filter((vote) => vote.optionId === option.id).length
  }));
  const currentResults = poll.options.map((option) => ({
    ...option,
    count: currentVotes.filter((vote) => vote.optionId === option.id).length
  }));
  const switched = poll.votes.filter((vote) => {
    if (vote.round !== 2) return false;
    return poll.votes.find((first) => first.userId === vote.userId && first.round === 1)?.optionId !== vote.optionId;
  }).length;
  const secondRoundCount = poll.votes.filter((vote) => vote.round === 2).length;
  const shiftPercent = secondRoundCount ? Math.round((switched / secondRoundCount) * 100) : 0;
  const isOpen = poll.status === "PUBLISHED" && (!poll.closesAt || poll.closesAt > new Date());
  const canVote = isOpen && ownVotes.length < 2;
  const isRevote = ownVotes.length === 1;
  const forArguments = poll.arguments.filter((argument) => argument.side === "FOR");
  const againstArguments = poll.arguments.filter((argument) => argument.side === "AGAINST");

  return (
    <section className="section shell poll-page">
      <Link href="/dashboard" className="back-link"><ArrowLeft size={16} /> Back to questions</Link>
      <Flash error={query.error} success={query.voted ? `Vote round ${query.voted} recorded.` : query.contributed ? "Contribution added." : undefined} />
      <div className="poll-header">
        <div>
          <div className="eyebrow">{poll.category}</div>
          <h1>{poll.question}</h1>
          <p>{poll.description}</p>
          <div className="poll-meta">
            <span><Users size={16} /> {latestByUser.size} participants</span>
            <span><ShieldCheck size={16} /> Created by {poll.creator.displayName}</span>
            <span><Clock3 size={16} /> {poll.closesAt ? `Closes ${formatDate(poll.closesAt)}` : "Open-ended"}</span>
          </div>
        </div>
        <div className={`status-pill ${isOpen ? "" : "closed"}`}>{isOpen ? "Open" : "Closed"}</div>
      </div>

      {canVote && !isRevote && <VotePanel pollId={poll.id} options={poll.options} />}
      {!user && <div className="callout">Sign in to vote and contribute. <Link href="/login">Sign in</Link></div>}

      <section className="results-panel">
        <div className="section-heading row"><div><div className="eyebrow">Live consensus</div><h2>What the community thinks</h2></div>{secondRoundCount > 0 && <div className="shift-stat"><RefreshCcw size={18} /><strong>{shiftPercent}%</strong><span>changed position</span></div>}</div>
        <div className="result-columns">
          <div><h3>Initial vote</h3><ResultBars results={initialResults} total={initialVotes.length} /></div>
          <div><h3>Current position</h3><ResultBars results={currentResults} total={currentVotes.length} /></div>
        </div>
      </section>

      <section className="arguments-section">
        <div className="section-heading centered"><div className="eyebrow">Consider the evidence</div><h2>The strongest arguments</h2><p>Read with curiosity. Rebut ideas, not people.</p></div>
        <div className="argument-columns">
          <div><h3 className="side-title for">Arguments for</h3>{forArguments.map((argument) => <ArgumentCard key={argument.id} argument={argument} canReply={Boolean(user) && isOpen} />)}{forArguments.length === 0 && <div className="empty small">No arguments yet.</div>}</div>
          <div><h3 className="side-title against">Arguments against</h3>{againstArguments.map((argument) => <ArgumentCard key={argument.id} argument={argument} canReply={Boolean(user) && isOpen} />)}{againstArguments.length === 0 && <div className="empty small">No arguments yet.</div>}</div>
        </div>
        {user && isOpen && (
          <details className="contribute">
            <summary>Contribute an argument</summary>
            <form action={addArgumentAction} className="stack-form">
              <input type="hidden" name="pollId" value={poll.id} />
              <label>Position<select name="side"><option value="FOR">For</option><option value="AGAINST">Against</option></select></label>
              <label>Argument title<input name="title" minLength={5} maxLength={140} required /></label>
              <label>Concise summary<textarea name="summary" minLength={20} maxLength={500} required /></label>
              <button className="button small" type="submit">Publish argument</button>
            </form>
          </details>
        )}
      </section>
      {canVote && isRevote && (
        <VotePanel
          pollId={poll.id}
          options={poll.options}
          previousOptionId={ownVotes[0]?.optionId}
          previousConfidence={ownVotes[0]?.confidence}
          isRevote
        />
      )}
    </section>
  );
}
