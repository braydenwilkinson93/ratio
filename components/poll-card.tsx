import Link from "next/link";
import { ArrowRight, MessageSquareText, Users } from "lucide-react";

type PollCardProps = {
  poll: {
    slug: string;
    question: string;
    description: string;
    category: string;
    _count: { votes: number; arguments: number };
  };
};

export function PollCard({ poll }: PollCardProps) {
  return (
    <Link href={`/polls/${poll.slug}`} className="poll-card">
      <div className="eyebrow">{poll.category}</div>
      <h3>{poll.question}</h3>
      <p>{poll.description}</p>
      <div className="card-meta">
        <span><Users size={15} /> {poll._count.votes} votes</span>
        <span><MessageSquareText size={15} /> {poll._count.arguments} arguments</span>
        <ArrowRight className="card-arrow" size={18} />
      </div>
    </Link>
  );
}
