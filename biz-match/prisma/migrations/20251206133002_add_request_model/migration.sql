-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('DRAFT', 'MATCHING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budgetMin" INTEGER,
    "budgetMax" INTEGER,
    "industry" TEXT,
    "timeline" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'MATCHING',
    "aiCategory" TEXT,
    "aiSkills" TEXT[],
    "aiFeatures" TEXT,
    "aiComplexity" TEXT,
    "embedding" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
