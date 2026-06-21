CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "PollStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');
CREATE TYPE "ArgumentSide" AS ENUM ('FOR', 'AGAINST');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "bio" VARCHAR(280),
  "role" "Role" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Poll" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "question" VARCHAR(240) NOT NULL,
  "description" TEXT NOT NULL,
  "category" VARCHAR(80) NOT NULL,
  "status" "PollStatus" NOT NULL DEFAULT 'PUBLISHED',
  "closesAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "creatorId" TEXT NOT NULL,
  CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PollOption" (
  "id" TEXT NOT NULL,
  "label" VARCHAR(120) NOT NULL,
  "position" INTEGER NOT NULL,
  "pollId" TEXT NOT NULL,
  CONSTRAINT "PollOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Vote" (
  "id" TEXT NOT NULL,
  "round" INTEGER NOT NULL DEFAULT 1,
  "confidence" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,
  "pollId" TEXT NOT NULL,
  "optionId" TEXT NOT NULL,
  CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Argument" (
  "id" TEXT NOT NULL,
  "title" VARCHAR(140) NOT NULL,
  "summary" VARCHAR(500) NOT NULL,
  "side" "ArgumentSide" NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "approved" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "authorId" TEXT NOT NULL,
  "pollId" TEXT NOT NULL,
  CONSTRAINT "Argument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Rebuttal" (
  "id" TEXT NOT NULL,
  "body" VARCHAR(500) NOT NULL,
  "approved" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "authorId" TEXT NOT NULL,
  "argumentId" TEXT NOT NULL,
  CONSTRAINT "Rebuttal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimit" (
  "id" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE UNIQUE INDEX "Poll_slug_key" ON "Poll"("slug");
CREATE INDEX "Poll_status_createdAt_idx" ON "Poll"("status", "createdAt");
CREATE INDEX "Poll_creatorId_idx" ON "Poll"("creatorId");
CREATE UNIQUE INDEX "PollOption_pollId_position_key" ON "PollOption"("pollId", "position");
CREATE INDEX "PollOption_pollId_idx" ON "PollOption"("pollId");
CREATE UNIQUE INDEX "Vote_userId_pollId_round_key" ON "Vote"("userId", "pollId", "round");
CREATE INDEX "Vote_pollId_round_idx" ON "Vote"("pollId", "round");
CREATE INDEX "Vote_optionId_idx" ON "Vote"("optionId");
CREATE INDEX "Argument_pollId_side_approved_idx" ON "Argument"("pollId", "side", "approved");
CREATE INDEX "Rebuttal_argumentId_approved_idx" ON "Rebuttal"("argumentId", "approved");
CREATE UNIQUE INDEX "RateLimit_keyHash_action_windowStart_key" ON "RateLimit"("keyHash", "action", "windowStart");
CREATE INDEX "RateLimit_windowStart_idx" ON "RateLimit"("windowStart");

ALTER TABLE "Poll" ADD CONSTRAINT "Poll_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PollOption" ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PollOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Argument" ADD CONSTRAINT "Argument_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Argument" ADD CONSTRAINT "Argument_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rebuttal" ADD CONSTRAINT "Rebuttal_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Rebuttal" ADD CONSTRAINT "Rebuttal_argumentId_fkey" FOREIGN KEY ("argumentId") REFERENCES "Argument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
