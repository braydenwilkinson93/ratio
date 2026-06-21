"use server";

import { ArgumentSide, PollStatus, Prisma, type User } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearSession, createSession, hashPassword, requireAdmin, requireUser, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/utils";
import {
  argumentSchema,
  authSchema,
  pollSchema,
  rebuttalSchema,
  registerSchema,
  voteSchema
} from "@/lib/validation";

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function authDestination(identifier: string) {
  const normalized = identifier.trim();
  return identifier.includes("@")
    ? { email: normalized.toLowerCase(), phone: undefined }
    : { email: undefined, phone: normalized.replace(/[\s()-]/g, "") };
}

function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function pollIsOpen(poll: { status: PollStatus; closesAt: Date | null }) {
  return poll.status === "PUBLISHED" && (!poll.closesAt || poll.closesAt > new Date());
}

export async function registerAction(formData: FormData) {
  const rawIdentifier = value(formData, "identifier");
  if (!(await checkRateLimit({ action: "register", identifier: rawIdentifier, limit: 5, windowMinutes: 60 }))) {
    redirect("/register?error=Too many attempts. Please try again later.");
  }
  const parsed = registerSchema.safeParse({
    displayName: value(formData, "displayName"),
    identifier: rawIdentifier,
    password: value(formData, "password")
  });
  if (!parsed.success) redirect(`/register?error=${encodeURIComponent(parsed.error.issues[0].message)}`);

  const destination = authDestination(parsed.data.identifier);
  const exists = await db.user.findFirst({
    where: destination.email ? { email: destination.email } : { phone: destination.phone }
  });
  if (exists) redirect("/login?error=An account already exists for that email or phone");

  const passwordHash = await hashPassword(parsed.data.password);
  let user: User;
  try {
    user = await db.user.create({
      data: {
        ...destination,
        displayName: parsed.data.displayName,
        passwordHash
      }
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      redirect("/login?error=An account already exists for that email or phone");
    }
    throw error;
  }
  await createSession({ userId: user.id, role: user.role });
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const rawIdentifier = value(formData, "identifier");
  if (!(await checkRateLimit({ action: "login", identifier: rawIdentifier, limit: 10 }))) {
    redirect("/login?error=Too many attempts. Please try again later.");
  }
  const parsed = authSchema.safeParse({
    identifier: rawIdentifier,
    password: value(formData, "password")
  });
  if (!parsed.success) redirect(`/login?error=${encodeURIComponent(parsed.error.issues[0].message)}`);

  const destination = authDestination(parsed.data.identifier);
  const user = await db.user.findFirst({
    where: destination.email ? { email: destination.email } : { phone: destination.phone }
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    redirect("/login?error=Invalid credentials");
  }
  await createSession({ userId: user.id, role: user.role });
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const displayName = value(formData, "displayName").trim();
  const bio = value(formData, "bio").trim();
  if (displayName.length < 2 || displayName.length > 60 || bio.length > 280) {
    redirect("/profile?error=Check your name and bio length");
  }
  await db.user.update({ where: { id: user.id }, data: { displayName, bio: bio || null } });
  revalidatePath("/profile");
  redirect("/profile?saved=1");
}

export async function createPollAction(formData: FormData) {
  const user = await requireUser();
  if (!(await checkRateLimit({ action: "create-poll", identifier: user.id, limit: 10, windowMinutes: 60 }))) {
    redirect("/polls/new?error=Poll creation limit reached. Please try again later.");
  }
  const parsed = pollSchema.safeParse({
    question: value(formData, "question"),
    description: value(formData, "description"),
    category: value(formData, "category"),
    optionA: value(formData, "optionA"),
    optionB: value(formData, "optionB"),
    closesAt: value(formData, "closesAt")
  });
  if (!parsed.success) redirect(`/polls/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`);

  const baseSlug = slugify(parsed.data.question);
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;
  const poll = await db.poll.create({
    data: {
      slug,
      question: parsed.data.question,
      description: parsed.data.description,
      category: parsed.data.category,
      closesAt: parsed.data.closesAt ? new Date(parsed.data.closesAt) : null,
      creatorId: user.id,
      options: {
        create: [
          { label: parsed.data.optionA, position: 0 },
          { label: parsed.data.optionB, position: 1 }
        ]
      }
    }
  });
  redirect(`/polls/${poll.slug}`);
}

export async function voteAction(formData: FormData) {
  const user = await requireUser();
  if (!(await checkRateLimit({ action: "vote", identifier: user.id, limit: 30 }))) {
    redirect("/dashboard?error=Voting limit reached. Please try again later.");
  }
  const parsed = voteSchema.safeParse({
    pollId: value(formData, "pollId"),
    optionId: value(formData, "optionId"),
    confidence: value(formData, "confidence")
  });
  if (!parsed.success) redirect("/dashboard?error=Invalid vote");

  const poll = await db.poll.findUnique({
    where: { id: parsed.data.pollId },
    include: { options: true, votes: { where: { userId: user.id }, orderBy: { round: "desc" } } }
  });
  if (!poll || !pollIsOpen(poll)) {
    redirect("/dashboard?error=This poll is not open");
  }
  if (!poll.options.some((option) => option.id === parsed.data.optionId)) {
    redirect(`/polls/${poll.slug}?error=Invalid option`);
  }

  const round = (poll.votes[0]?.round ?? 0) + 1;
  if (round > 2) redirect(`/polls/${poll.slug}?error=You have already revoted`);

  try {
    await db.vote.create({
      data: {
        pollId: poll.id,
        optionId: parsed.data.optionId,
        userId: user.id,
        confidence: parsed.data.confidence,
        round
      }
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      redirect(`/polls/${poll.slug}?error=That vote round was already recorded`);
    }
    throw error;
  }
  revalidatePath(`/polls/${poll.slug}`);
  redirect(`/polls/${poll.slug}?voted=${round}`);
}

export async function addArgumentAction(formData: FormData) {
  const user = await requireUser();
  if (!(await checkRateLimit({ action: "argument", identifier: user.id, limit: 15, windowMinutes: 60 }))) {
    redirect("/dashboard?error=Contribution limit reached. Please try again later.");
  }
  const parsed = argumentSchema.safeParse({
    pollId: value(formData, "pollId"),
    side: value(formData, "side"),
    title: value(formData, "title"),
    summary: value(formData, "summary")
  });
  if (!parsed.success) redirect("/dashboard?error=Invalid argument");

  const poll = await db.poll.findUnique({ where: { id: parsed.data.pollId } });
  if (!poll) redirect("/dashboard?error=Poll not found");
  if (!pollIsOpen(poll)) redirect(`/polls/${poll.slug}?error=This poll is not open for contributions`);
  await db.argument.create({
    data: {
      pollId: poll.id,
      authorId: user.id,
      side: parsed.data.side as ArgumentSide,
      title: parsed.data.title,
      summary: parsed.data.summary
    }
  });
  revalidatePath(`/polls/${poll.slug}`);
  redirect(`/polls/${poll.slug}?contributed=1`);
}

export async function addRebuttalAction(formData: FormData) {
  const user = await requireUser();
  if (!(await checkRateLimit({ action: "rebuttal", identifier: user.id, limit: 25, windowMinutes: 60 }))) {
    redirect("/dashboard?error=Contribution limit reached. Please try again later.");
  }
  const parsed = rebuttalSchema.safeParse({
    argumentId: value(formData, "argumentId"),
    body: value(formData, "body")
  });
  if (!parsed.success) redirect("/dashboard?error=Invalid rebuttal");

  const argument = await db.argument.findUnique({ where: { id: parsed.data.argumentId }, include: { poll: true } });
  if (!argument) redirect("/dashboard?error=Argument not found");
  if (!argument.approved || !pollIsOpen(argument.poll)) {
    redirect(`/polls/${argument.poll.slug}?error=This argument is not open for rebuttals`);
  }
  await db.rebuttal.create({
    data: { argumentId: argument.id, authorId: user.id, body: parsed.data.body }
  });
  revalidatePath(`/polls/${argument.poll.slug}`);
  redirect(`/polls/${argument.poll.slug}?contributed=1`);
}

export async function updatePollStatusAction(formData: FormData) {
  await requireAdmin();
  const pollId = value(formData, "pollId");
  const status = value(formData, "status") as PollStatus;
  if (!Object.values(PollStatus).includes(status)) redirect("/admin?error=Invalid status");
  await db.poll.update({ where: { id: pollId }, data: { status } });
  revalidatePath("/admin");
}

export async function toggleArgumentAction(formData: FormData) {
  await requireAdmin();
  const argumentId = value(formData, "argumentId");
  const approved = value(formData, "approved") === "true";
  await db.argument.update({ where: { id: argumentId }, data: { approved } });
  revalidatePath("/admin");
}
