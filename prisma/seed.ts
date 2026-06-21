import { ArgumentSide, PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const admin = await db.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@ratio.local" },
    update: { role: Role.ADMIN },
    create: {
      email: process.env.ADMIN_EMAIL ?? "admin@ratio.local",
      displayName: "Ratio Admin",
      passwordHash: await hash(process.env.ADMIN_PASSWORD ?? "ChangeMe123!", 12),
      role: Role.ADMIN,
      bio: "Keeping the conversation useful."
    }
  });

  const member = await db.user.upsert({
    where: { email: "maya@example.com" },
    update: {},
    create: {
      email: "maya@example.com",
      displayName: "Maya Rivera",
      passwordHash: await hash("DemoPass123!", 12),
      bio: "Urban policy researcher and transit rider."
    }
  });

  const existing = await db.poll.findUnique({ where: { slug: "free-public-transit" } });
  if (!existing) {
    await db.poll.create({
      data: {
        slug: "free-public-transit",
        question: "Should cities make public transit free for all riders?",
        description: "Fare-free transit could broaden access and increase ridership, but it also requires cities to replace substantial operating revenue. Consider who benefits, who pays, and what produces the strongest transportation system.",
        category: "Public policy",
        creatorId: admin.id,
        options: { create: [{ label: "Yes, make transit fare-free", position: 0 }, { label: "No, retain fares", position: 1 }] },
        arguments: {
          create: [
            {
              side: ArgumentSide.FOR,
              title: "Mobility is essential infrastructure",
              summary: "Removing fares gives low-income residents more reliable access to work, education, healthcare, and community life while reducing the friction of using public transport.",
              score: 42,
              authorId: member.id,
              rebuttals: { create: [{ body: "Universal access is valuable, but discounted passes can target limited funding toward riders who need it most.", authorId: admin.id }] }
            },
            {
              side: ArgumentSide.FOR,
              title: "Faster boarding improves service",
              summary: "Eliminating fare collection can shorten dwell times, reduce enforcement costs, and make buses faster and more predictable across an entire route.",
              score: 31,
              authorId: admin.id
            },
            {
              side: ArgumentSide.AGAINST,
              title: "Service quality matters more than price",
              summary: "Many potential riders cite frequency and reliability rather than fares as their main barrier. Redirecting fare revenue may make those service problems harder to solve.",
              score: 38,
              authorId: admin.id,
              rebuttals: { create: [{ body: "Fare collection itself has costs, so the net budget gap can be smaller than headline revenue suggests.", authorId: member.id }] }
            },
            {
              side: ArgumentSide.AGAINST,
              title: "Universal subsidies are poorly targeted",
              summary: "Free rides for every passenger also subsidize people who can comfortably pay. Income-based programs may deliver more equity for each public dollar.",
              score: 26,
              authorId: member.id
            }
          ]
        }
      }
    });
  }

  const questions = [
    ["four-day-work-week", "Should a four-day work week become the standard?", "Organizations are testing shorter work weeks with no reduction in pay. Weigh productivity, employee wellbeing, customer coverage, and implementation costs.", "Work"],
    ["ai-generated-political-ads", "Should AI-generated political advertising require a disclosure?", "Synthetic media can reduce production costs and expand creative expression, while also making misleading political content easier to produce at scale.", "Technology"]
  ];
  for (const [slug, question, description, category] of questions) {
    if (!(await db.poll.findUnique({ where: { slug } }))) {
      await db.poll.create({
        data: {
          slug, question, description, category, creatorId: admin.id,
          options: { create: [{ label: "Yes", position: 0 }, { label: "No", position: 1 }] }
        }
      });
    }
  }
}

main()
  .then(() => console.log("Ratio seed complete"))
  .finally(() => db.$disconnect());
