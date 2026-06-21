import { updateProfileAction } from "@/app/actions";
import { Flash } from "@/components/flash";
import { requireUser } from "@/lib/auth";
import { formatDate, initials } from "@/lib/utils";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  return (
    <section className="section shell narrow">
      <div className="profile-head">
        <div className="avatar">{initials(user.displayName)}</div>
        <div><div className="eyebrow">Your profile</div><h1>{user.displayName}</h1><p>Member since {formatDate(user.createdAt)}</p></div>
      </div>
      <Flash error={params.error} success={params.saved ? "Profile updated" : undefined} />
      <form action={updateProfileAction} className="panel stack-form">
        <label>Display name<input name="displayName" defaultValue={user.displayName} minLength={2} maxLength={60} required /></label>
        <label>Bio<textarea name="bio" defaultValue={user.bio ?? ""} maxLength={280} placeholder="What perspectives or experience do you bring?" /></label>
        <label>Account identifier<input value={user.email ?? user.phone ?? ""} disabled /><small>Contact support to change your sign-in identifier.</small></label>
        <button className="button" type="submit">Save profile</button>
      </form>
    </section>
  );
}
