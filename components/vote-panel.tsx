import { CheckCircle2, RefreshCcw } from "lucide-react";
import { voteAction } from "@/app/actions";

type VotePanelProps = {
  pollId: string;
  options: { id: string; label: string }[];
  previousOptionId?: string;
  previousConfidence?: number;
  isRevote?: boolean;
};

export function VotePanel({
  pollId,
  options,
  previousOptionId,
  previousConfidence,
  isRevote = false
}: VotePanelProps) {
  return (
    <section className="vote-panel">
      <div>
        <span className="round-badge">{isRevote ? "ROUND 2 - FINAL VOTE" : "ROUND 1 - INITIAL VOTE"}</span>
        <h2>{isRevote ? "Has your view changed?" : "Where do you stand right now?"}</h2>
        <p>{isRevote ? "Now that you have reviewed both sides, cast your final vote." : "You will get one chance to vote again after considering both sides."}</p>
      </div>
      <form action={voteAction}>
        <input type="hidden" name="pollId" value={pollId} />
        <div className="vote-options">
          {options.map((option, index) => (
            <label className="vote-option" key={option.id}>
              <input type="radio" name="optionId" value={option.id} required defaultChecked={isRevote && previousOptionId === option.id} />
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span>{option.label}</span>
              <CheckCircle2 className="check" size={21} />
            </label>
          ))}
        </div>
        <label className="confidence">Confidence
          <select name="confidence" defaultValue={previousConfidence ?? 3}>
            <option value="1">1 - Very unsure</option>
            <option value="2">2 - Unsure</option>
            <option value="3">3 - Neutral</option>
            <option value="4">4 - Confident</option>
            <option value="5">5 - Very confident</option>
          </select>
        </label>
        <button className="button" type="submit">{isRevote ? <><RefreshCcw size={17} /> Submit final vote</> : "Cast initial vote"}</button>
      </form>
    </section>
  );
}
