import { createPollAction } from "@/app/actions";
import { Flash } from "@/components/flash";
import { requireUser } from "@/lib/auth";

export default async function NewPollPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireUser();
  const params = await searchParams;
  return (
    <section className="section shell narrow">
      <div className="section-heading"><div className="eyebrow">Create a question</div><h1>Invite thoughtful disagreement.</h1><p>Clear, neutral framing produces better arguments and more useful results.</p></div>
      <Flash error={params.error} />
      <form action={createPollAction} className="panel stack-form">
        <label>Question<input name="question" minLength={10} maxLength={240} required placeholder="Should our city..." /></label>
        <label>Context<textarea name="description" minLength={20} maxLength={2000} required placeholder="Explain why this question matters and provide essential context." /></label>
        <label>Category<input name="category" minLength={2} maxLength={80} required placeholder="Public policy" /></label>
        <div className="form-grid">
          <label>Option A<input name="optionA" maxLength={120} required placeholder="Yes" /></label>
          <label>Option B<input name="optionB" maxLength={120} required placeholder="No" /></label>
        </div>
        <label>Close date <span className="optional">(optional)</span><input type="datetime-local" name="closesAt" /></label>
        <button className="button" type="submit">Publish question</button>
      </form>
    </section>
  );
}
