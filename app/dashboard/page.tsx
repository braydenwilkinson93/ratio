import Link from "next/link";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import { PollCard } from "@/components/poll-card";
import { Flash } from "@/components/flash";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const [polls, voteCount, changedCount] = await Promise.all([
    db.poll.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { votes: true, arguments: true } } }
    }),
    db.vote.count({ where: { userId: user.id } }),
    db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count FROM "Vote" v2
      JOIN "Vote" v1 ON v1."userId" = v2."userId" AND v1."pollId" = v2."pollId"
      WHERE v2."userId" = ${user.id} AND v1.round = 1 AND v2.round = 2
      AND v1."optionId" <> v2."optionId"
    `
  ]);

  return (
    <section className="section shell dashboard">
      <Flash error={params.error} />
      <div className="dashboard-hero">
        <div><div className="eyebrow">Your consensus desk</div><h1>Good to see you, {user.displayName.split(" ")[0]}.</h1><p>Find a live question, take a position, and see what changes after reflection.</p></div>
        <Link href="/polls/new" className="button"><Plus size={18} /> Create a poll</Link>
      </div>
      <div className="stats-row">
        <div><span>{voteCount}</span><small>Total votes</small></div>
        <div><span>{Number(changedCount[0]?.count ?? 0)}</span><small>Views changed</small></div>
        <div><span>{polls.length}</span><small>Open questions</small></div>
        <div className="insight-stat"><Sparkles size={19} /><small>Changing your mind is data, not defeat.</small></div>
      </div>
      <div className="section-heading row"><div><div className="eyebrow">Community</div><h2>Open questions</h2></div><Link href="/polls/new">Ask something <ArrowRight size={16} /></Link></div>
      {polls.length ? <div className="poll-grid">{polls.map((poll) => <PollCard key={poll.id} poll={poll} />)}</div> : <div className="empty">No open questions yet. Start the conversation.</div>}
    </section>
  );
}
