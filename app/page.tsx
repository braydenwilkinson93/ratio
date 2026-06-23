"use client";
import { useState } from "react";

const QUESTIONS = [
  { id: 1, kicker: "Awareness", question: "Have you heard that a large AI data center is being proposed for Spencer County?", options: ["Yes, I've heard about it", "I've heard something about it", "No, this is news to me"] },
  { id: 2, kicker: "Awareness", question: "How informed do you feel about what a data center would mean for your community?", options: ["Very informed", "Somewhat informed", "Not informed at all"] },
  { id: 3, kicker: "The Promise", question: "Do you believe a data center would create meaningful long-term jobs for Spencer County residents?", options: ["Yes, I believe it would", "Maybe, but I'm skeptical", "No, I don't think so"] },
  { id: 4, kicker: "The Promise", question: "Do you think AI infrastructure development benefits rural communities or primarily benefits corporations?", options: ["It benefits rural communities", "It benefits both equally", "It primarily benefits corporations"] },
  { id: 5, kicker: "The Cost", question: "Are you aware that AI data centers consume massive amounts of electricity and water?", options: ["Yes, I knew this", "I had some idea", "No, I wasn't aware"] },
  { id: 6, kicker: "The Cost", question: "CenterPoint Energy has proposed rate increases tied to infrastructure expansion. Did you know this?", options: ["Yes, I knew about the rate increases", "I'd heard something about it", "No, I had no idea"] },
  { id: 7, kicker: "The Cost", question: "Do you think utility customers should pay higher rates to support corporate data center development?", options: ["Yes, if it brings economic growth", "Only with full transparency and consent", "No, corporations should pay their own way"] },
  { id: 8, kicker: "The Real Question", question: "If an AI data center comes to Spencer County, who should foot the bill for the infrastructure it requires?", options: ["Ratepayers — utility customers like me", "The corporations building and using the data center", "A shared arrangement with full public transparency", "I don't know enough to say"] },
];

export default function PollPage() {
  const [step, setStep] = useState("intro");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const q = QUESTIONS[current];
  const isLast = current === QUESTIONS.length - 1;

  function handleNext() {
    if (!selected) return;
    const next: Record<number, string> = { ...answers, [q.id]: selected };
    setAnswers(next);
    setSelected(null);
    if (isLast) { setStep("done"); } else { setCurrent((c) => c + 1); }
  }

  function handleBack() {
    if (current === 0) { setStep("intro"); return; }
    setCurrent((c) => c - 1);
    setSelected(answers[QUESTIONS[current - 1].id] ?? null);
  }

  return (
    <div className="ratio-capsule-page">
      <div className="capsule-atmosphere" />
      <div className="capsule-device-stage">

        {step === "intro" && (
          <div className="capsule-interface is-visible">
            <div className="capsule-handle" />
            <div className="capsule-screen" style={{ minHeight: "660px", alignContent: "center" }}>
              <p className="capsule-kicker">Spencer County</p>
              <h1>Your county.<br />Your bill.<br />Your voice.</h1>
              <p className="capsule-copy">A data center is coming. Utility rates may follow. Eight questions. Two minutes. Completely anonymous.</p>
              <button className="capsule-action" onClick={() => setStep("poll")}>Begin</button>
              <p className="capsule-whisper">No account. No email. No tracking.</p>
            </div>
          </div>
        )}

        {step === "poll" && (
          <div className="capsule-interface is-visible stage-counter">
            <div className="capsule-handle" />
            <div className="capsule-screen">
              <p className="capsule-kicker">Question {current + 1} of {QUESTIONS.length} &middot; {q.kicker}</p>
              <h1>{q.question}</h1>
              <div className="capsule-choices">
                {q.options.map((opt) => (
                  <button key={opt} className={"capsule-choice" + (selected === opt ? " is-selected" : "")} onClick={() => setSelected(opt)}>
                    <span>{opt}</span>
                    <i>{selected === opt ? "✓" : ""}</i>
                  </button>
                ))}
              </div>
              <button className="capsule-action" disabled={!selected} onClick={handleNext}>{isLast ? "Submit" : "Next"}</button>
              {current > 0 && <button className="capsule-quiet" onClick={handleBack}>Back</button>}
              <p className="capsule-whisper">{Math.round((current / QUESTIONS.length) * 100)}% complete</p>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="capsule-interface is-visible">
            <div className="capsule-handle" />
            <div className="capsule-ceremony is-complete">
              <div className="ratio-eye" style={{ margin: "0 auto 8px" }}>
                <div className="ratio-eye-ring" />
                <div className="ratio-eye-core" />
              </div>
              <p className="capsule-kicker">Response recorded</p>
              <h1>Thank you, Spencer County.</h1>
              <p className="capsule-copy">Your voice has been counted. Results from this community will help shape the conversation around AI, energy, and who really pays the price.</p>
              <p className="capsule-whisper">Your response was submitted anonymously.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
