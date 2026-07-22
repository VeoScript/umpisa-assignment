-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_recipes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "mealName" TEXT NOT NULL,
    "thumbnail" TEXT,
    "category" TEXT,
    "area" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plan_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mealType" "MealType" NOT NULL,
    "mealId" TEXT NOT NULL,
    "mealName" TEXT NOT NULL,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plan_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "saved_recipes_userId_idx" ON "saved_recipes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_recipes_userId_mealId_key" ON "saved_recipes"("userId", "mealId");

-- CreateIndex
CREATE INDEX "meal_plan_entries_userId_date_idx" ON "meal_plan_entries"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plan_entries_userId_date_mealType_key" ON "meal_plan_entries"("userId", "date", "mealType");

-- AddForeignKey
ALTER TABLE "saved_recipes" ADD CONSTRAINT "saved_recipes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_entries" ADD CONSTRAINT "meal_plan_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
