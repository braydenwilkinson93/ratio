import { MessageCircleReply } from "lucide-react";
import { addRebuttalAction } from "@/app/actions";

type ArgumentCardProps = {
  argument: {
    id: string;
    title: string;
    summary: string;
    score: number;
    author: { displayName: string };
    rebuttals: { id: string; body: string; author: { displayName: string } }[];
  };
  canReply: boolean;
};

export function ArgumentCard({ argument, canReply }: ArgumentCardProps) {
  return (
    <article className="argument-card">
      <div className="argument-head">
        <div><h4>{argument.title}</h4><span>By {argument.author.displayName}</span></div>
        <span className="score">+{argument.score}</span>
      </div>
      <p>{argument.summary}</p>
      {argument.rebuttals.length > 0 && (
        <div className="rebuttals">
          <div className="rebuttal-title"><MessageCircleReply size={15} /> Rebuttals</div>
          {argument.rebuttals.map((rebuttal) => (
            <p key={rebuttal.id}><strong>{rebuttal.author.displayName}:</strong> {rebuttal.body}</p>
          ))}
        </div>
      )}
      {canReply && (
        <details>
          <summary>Add a rebuttal</summary>
          <form action={addRebuttalAction} className="compact-form">
            <input type="hidden" name="argumentId" value={argument.id} />
            <textarea name="body" required minLength={10} maxLength={500} placeholder="Challenge this argument with evidence or reasoning..." />
            <button className="button small" type="submit">Post rebuttal</button>
          </form>
        </details>
      )}
    </article>
  );
}
