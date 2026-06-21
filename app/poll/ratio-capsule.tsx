"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Share2, X } from "lucide-react";
import { type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

const question = "Should the U.S. adopt universal basic income as AI replaces jobs?";
const options = ["Agree", "Disagree", "Unsure", "It's complicated"] as const;

type Vote = (typeof options)[number];
type Stage = "opening" | "initial" | "confirm" | "securingFirst" | "counter" | "nuance" | "revote" | "securingFinal" | "waitingReveal" | "results";

const counterArguments: Record<Vote, string> = {
  Agree:
    "A permanent UBI may solve the wrong problem. If AI displacement is uneven or temporary, the better response could be targeted support, faster retraining, and lower housing costs instead of a universal cash floor.",
  Disagree:
    "If AI permanently reduces demand for human labor, UBI may be the cleanest way to preserve dignity, bargaining power, and consumer demand without forcing people through fragile means-tested systems.",
  Unsure:
    "Uncertainty itself has a cost. Waiting for perfect evidence could leave displaced workers exposed during the transition, but acting too broadly could lock in an expensive policy before the shape of the problem is clear.",
  "It's complicated":
    "A conditional approach may be strongest. The case for UBI depends less on ideology than on whether AI creates permanent unemployment, temporary disruption, or simply a new kind of labor market."
};

const nuancedPositions = [
  "Support UBI only if paired with job retraining and housing reform.",
  "Oppose UBI as permanent policy, but support temporary AI-displacement payments.",
  "Unsure until we know whether automation actually causes mass unemployment.",
  "Support local pilots first, with public results before any national rollout."
];

const aggregateResults = [
  ["Changed position", "32%"],
  ["Stayed the same", "41%"],
  ["Moved into nuance", "18%"],
  ["Became unsure", "9%"]
];

// TODO: Replace local component state with encrypted vote storage.
// TODO: Issue anonymous session IDs before accepting votes.
// TODO: Add rate limiting before this route is shared publicly.
// TODO: Add anti-spam protection for repeated capsule opens and submissions.
// TODO: Use a final synchronized reveal time shared by all participants.
// TODO: Add a notification system for reveal reminders.
// TODO: Replace fake percentages with database-backed aggregate results.

function isNuance(vote: Vote) {
  return vote === "Unsure" || vote === "It's complicated";
}

function movementLabel(firstVote: Vote, finalVote: Vote) {
  if (firstVote === finalVote) return "stayed";
  if (!isNuance(firstVote) && isNuance(finalVote)) return finalVote === "Unsure" ? "softened" : "moved into nuance";
  if (isNuance(firstVote) && !isNuance(finalVote)) return "hardened";
  if (isNuance(firstVote) && isNuance(finalVote)) return "moved into nuance";
  return "changed";
}

function RatioEye({ active = false }: { active?: boolean }) {
  return (
    <div className={active ? "ratio-eye is-active" : "ratio-eye"} aria-hidden="true">
      <span className="ratio-eye-housing" />
      <span className="ratio-eye-glass" />
      <span className="ratio-eye-ring" />
      <span className="ratio-eye-inner-ring" />
      <span className="ratio-eye-core" />
    </div>
  );
}

function CapsuleObject({ opening = false }: { opening?: boolean }) {
  return (
    <div className={opening ? "capsule-object is-opening" : "capsule-object"} aria-hidden="true">
      <RatioEye active={opening} />
    </div>
  );
}

function Countdown({
  seconds,
  label,
  completeLabel,
  helper,
  onDone
}: {
  seconds: number;
  label: string;
  completeLabel: string;
  helper: string;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const complete = remaining <= 0;

  useEffect(() => {
    if (complete) {
      const doneTimer = window.setTimeout(onDone, 1000);
      return () => window.clearTimeout(doneTimer);
    }

    const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [complete, onDone, remaining]);

  return (
    <div className={complete ? "capsule-ceremony is-complete" : "capsule-ceremony"}>
      <RatioEye active />
      <p className="capsule-kicker">Vote seal</p>
      <h1>{complete ? completeLabel : `${label} ${remaining}`}</h1>
      <p className="capsule-copy">{helper}</p>
    </div>
  );
}

export function RatioCapsule() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("opening");
  const [draftVote, setDraftVote] = useState<Vote | null>(null);
  const [firstVote, setFirstVote] = useState<Vote | null>(null);
  const [finalVote, setFinalVote] = useState<Vote | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setStage("initial"), 2800);
    return () => window.clearTimeout(timer);
  }, []);

  const movement = useMemo(() => {
    if (!firstVote || !finalVote) return "";
    return movementLabel(firstVote, finalVote);
  }, [finalVote, firstVote]);

  const showPanel = stage !== "opening";

  const goHome = useCallback(() => {
    router.push("/");
  }, [router]);

  function beginFirstLock() {
    if (!draftVote) return;
    setFirstVote(draftVote);
    setStage("securingFirst");
  }

  function beginFinalLock() {
    if (!draftVote) return;
    setFinalVote(draftVote);
    setStage("securingFinal");
  }

  async function shareCapsule() {
    const url = window.location.href;
    const text = `Open this Ratio Capsule. Vote once, hear the other side, then vote again: ${url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: "Ratio", text, url });
        setShareStatus("Shared");
        return;
      }

      await navigator.clipboard.writeText(text);
      setShareStatus("Link copied");
    } catch {
      setShareStatus("Share canceled");
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    dragStartY.current = event.clientY;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null) return;
    const distance = event.clientY - dragStartY.current;
    dragStartY.current = null;
    if (distance > 110) goHome();
  }

  function voteButton(vote: Vote, locked = false) {
    const active = draftVote === vote;
    return (
      <button
        className={active ? "capsule-choice is-selected" : "capsule-choice"}
        disabled={locked}
        key={vote}
        onClick={() => setDraftVote(vote)}
        type="button"
      >
        <span>{vote}</span>
        <i>{active && <Check size={17} />}</i>
      </button>
    );
  }

  return (
    <section className={`ratio-capsule-page stage-${stage}`} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
      <div className="capsule-atmosphere" />
      <Link className="capsule-close" href="/" aria-label="Close Ratio">
        <X size={20} />
      </Link>
      <div className="capsule-device-stage">
        <CapsuleObject opening={stage === "opening"} />
        <div className={showPanel ? `capsule-interface is-visible stage-${stage}` : "capsule-interface"}>
          <div className="capsule-handle" />

          {stage === "initial" && (
            <div className="capsule-screen">
              <RatioEye />
              <p className="capsule-kicker">Initial position</p>
              <h1>{question}</h1>
              <div className="capsule-choices">{options.map((vote) => voteButton(vote))}</div>
              <button className="capsule-action" disabled={!draftVote} onClick={() => setStage("confirm")} type="button">
                Continue
              </button>
              <p className="capsule-whisper">Swipe down or tap X to close</p>
            </div>
          )}

          {stage === "confirm" && firstVote === null && (
            <div className="capsule-screen">
              <RatioEye active />
              <p className="capsule-kicker">Confirm seal</p>
              <h1>Lock in your vote?</h1>
              <p className="capsule-copy">Your first position will become part of the capsule. It cannot be changed after lock.</p>
              <div className="capsule-sealed-choice">{draftVote}</div>
              <button className="capsule-action" onClick={beginFirstLock} type="button">
                Lock vote
              </button>
              <button className="capsule-quiet" onClick={() => setStage("initial")} type="button">
                Choose again
              </button>
            </div>
          )}

          {stage === "securingFirst" && (
            <Countdown
              key="securing-first"
              seconds={5}
              label="Securing vote..."
              completeLabel="Vote locked"
              helper="The capsule will now show you the other side."
              onDone={() => {
                setDraftVote(null);
                setStage("counter");
              }}
            />
          )}

          {stage === "counter" && firstVote && (
            <div className="capsule-screen">
              <RatioEye />
              <p className="capsule-kicker">Counter signal</p>
              <h1>Hold one more thought.</h1>
              <div className="capsule-thought">
                <p>{counterArguments[firstVote]}</p>
              </div>
              <button className="capsule-action" onClick={() => setStage("nuance")} type="button">
                Continue
              </button>
            </div>
          )}

          {stage === "nuance" && (
            <div className="capsule-screen">
              <RatioEye />
              <p className="capsule-kicker">Nuance</p>
              <h1>Not every position is binary.</h1>
              <div className="capsule-nuance-list">
                {nuancedPositions.map((position) => (
                  <p key={position}>{position}</p>
                ))}
              </div>
              <button className="capsule-action" onClick={() => setStage("revote")} type="button">
                Vote again
              </button>
            </div>
          )}

          {stage === "revote" && (
            <div className="capsule-screen">
              <RatioEye active />
              <p className="capsule-kicker">Final position</p>
              <h1>{question}</h1>
              <div className="capsule-choices">{options.map((vote) => voteButton(vote))}</div>
              <button className="capsule-action" disabled={!draftVote} onClick={beginFinalLock} type="button">
                Lock final vote
              </button>
            </div>
          )}

          {stage === "securingFinal" && (
            <Countdown
              key="securing-final"
              seconds={5}
              label="Securing vote..."
              completeLabel="Final vote locked"
              helper="Final results are revealed to everyone at once."
              onDone={() => setStage("waitingReveal")}
            />
          )}

          {stage === "waitingReveal" && (
            <Countdown
              key="waiting-reveal"
              seconds={10}
              label="Reveal opens in"
              completeLabel="Results ready"
              helper="Final results are revealed to everyone at once."
              onDone={() => setStage("results")}
            />
          )}

          {stage === "results" && firstVote && finalVote && (
            <div className="capsule-screen">
              <RatioEye />
              <p className="capsule-kicker">Reveal</p>
              <h1>You {movement}.</h1>
              <div className="capsule-vote-readout">
                <div>
                  <span>First</span>
                  <strong>{firstVote}</strong>
                </div>
                <div>
                  <span>Final</span>
                  <strong>{finalVote}</strong>
                </div>
              </div>
              <div className="capsule-community">
                {aggregateResults.map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <p className="capsule-copy">Final results are revealed to everyone at once.</p>
              <button className="capsule-action" onClick={shareCapsule} type="button">
                <Share2 size={18} />
                Share
              </button>
              {shareStatus && <p className="capsule-share-status">{shareStatus}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
