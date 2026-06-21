import { toggleArgumentAction, updatePollStatusAction } from "@/app/actions";
import { Flash } from "@/components/flash";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const [users, polls, votes, argumentsCount, recentPolls, recentArguments] = await Promise.all([
    db.user.count(), db.poll.count(), db.vote.count(), db.argument.count(),
    db.poll.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { creator: true, _count: { select: { votes: true } } } }),
    db.argument.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { author: true, poll: true } })
  ]);
  return (
    <section className="section shell dashboard">
      <Flash error={params.error} />
      <div className="dashboard-hero"><div><div className="eyebrow">Administration</div><h1>Ratio control room</h1><p>Moderate public content and monitor product health.</p></div></div>
      <div className="stats-row"><div><span>{users}</span><small>Users</small></div><div><span>{polls}</span><small>Polls</small></div><div><span>{votes}</span><small>Vote rounds</small></div><div><span>{argumentsCount}</span><small>Arguments</small></div></div>
      <div className="admin-grid">
        <section className="panel"><h2>Recent polls</h2><div className="admin-list">{recentPolls.map((poll) => <div className="admin-row" key={poll.id}><div><strong>{poll.question}</strong><small>{poll.creator.displayName} - {poll._count.votes} votes - {formatDate(poll.createdAt)}</small></div><form action={updatePollStatusAction}><input type="hidden" name="pollId" value={poll.id} /><select name="status" defaultValue={poll.status}><option>DRAFT</option><option>PUBLISHED</option><option>CLOSED</option></select><button className="button ghost small">Save</button></form></div>)}</div></section>
        <section className="panel"><h2>Argument moderation</h2><div className="admin-list">{recentArguments.map((argument) => <div className="admin-row" key={argument.id}><div><strong>{argument.title}</strong><small>{argument.author.displayName} on {argument.poll.question}</small></div><form action={toggleArgumentAction}><input type="hidden" name="argumentId" value={argument.id} /><input type="hidden" name="approved" value={String(!argument.approved)} /><button className={`button small ${argument.approved ? "danger" : ""}`}>{argument.approved ? "Hide" : "Approve"}</button></form></div>)}</div></section>
      </div>
    </section>
  );
}
