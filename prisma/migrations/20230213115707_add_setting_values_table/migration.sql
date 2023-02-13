-- CreateTable
CREATE TABLE "SettingValue" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "SettingValue_pkey" PRIMARY KEY ("key")
);
