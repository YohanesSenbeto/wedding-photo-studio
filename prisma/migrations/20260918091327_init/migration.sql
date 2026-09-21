-- CreateEnum
CREATE TYPE "PhotoStatus" AS ENUM ('UPLOADED', 'ANALYZED', 'PROCESSING', 'COMPLETED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'CONNECTING', 'PROCESSING', 'PHOTOSHOP_OPENING', 'EDITING', 'EXPORTING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('EDIT_PHOTO', 'CREATE_ALBUM');

-- CreateEnum
CREATE TYPE "OutputFormat" AS ENUM ('JPG', 'TIFF', 'PSD');

-- CreateEnum
CREATE TYPE "OutputKind" AS ENUM ('EDITED', 'ALBUM_PAGE', 'TEMPLATE', 'THUMBNAIL');

-- CreateEnum
CREATE TYPE "ColorMode" AS ENUM ('RGB', 'CMYK');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('OFFLINE', 'ONLINE', 'BUSY');

-- CreateEnum
CREATE TYPE "AlbumStatus" AS ENUM ('DRAFT', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER NOT NULL,
    "status" "PhotoStatus" NOT NULL DEFAULT 'UPLOADED',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditingPreset" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "params" JSONB NOT NULL,
    "isBuiltIn" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditingPreset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditingJob" (
    "id" TEXT NOT NULL,
    "agentJobId" TEXT NOT NULL,
    "type" "JobType" NOT NULL DEFAULT 'EDIT_PHOTO',
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "photoId" TEXT,
    "albumId" TEXT,
    "presetId" TEXT,
    "agentId" TEXT,
    "params" JSONB,
    "inputPath" TEXT NOT NULL,
    "outputPath" TEXT,
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "EditingJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "groomName" TEXT NOT NULL,
    "brideName" TEXT NOT NULL,
    "weddingDate" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "caption" TEXT,
    "status" "AlbumStatus" NOT NULL DEFAULT 'DRAFT',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlbumPage" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "templateKey" TEXT NOT NULL,
    "templateTitle" TEXT NOT NULL,
    "layoutKey" TEXT NOT NULL,
    "caption" TEXT,
    "photoIds" TEXT[],
    "params" JSONB,
    "outputId" TEXT,

    CONSTRAINT "AlbumPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutputFile" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "format" "OutputFormat" NOT NULL,
    "kind" "OutputKind" NOT NULL DEFAULT 'EDITED',
    "width" INTEGER,
    "height" INTEGER,
    "dpi" INTEGER,
    "colorMode" "ColorMode",
    "jobId" TEXT,
    "photoId" TEXT,
    "albumId" TEXT,
    "albumPageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutputFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL,
    "photoshopVersion" TEXT,
    "photoshopAvailable" BOOLEAN NOT NULL DEFAULT false,
    "photoshopMode" TEXT NOT NULL DEFAULT 'COM',
    "status" "AgentStatus" NOT NULL DEFAULT 'OFFLINE',
    "activeJobId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_fileName_key" ON "Photo"("fileName");

-- CreateIndex
CREATE INDEX "Photo_createdAt_idx" ON "Photo"("createdAt");

-- CreateIndex
CREATE INDEX "Photo_status_idx" ON "Photo"("status");

-- CreateIndex
CREATE UNIQUE INDEX "EditingPreset_key_key" ON "EditingPreset"("key");

-- CreateIndex
CREATE UNIQUE INDEX "EditingJob_agentJobId_key" ON "EditingJob"("agentJobId");

-- CreateIndex
CREATE INDEX "EditingJob_status_createdAt_idx" ON "EditingJob"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlbumPage_albumId_order_key" ON "AlbumPage"("albumId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "OutputFile_albumPageId_key" ON "OutputFile"("albumPageId");

-- CreateIndex
CREATE INDEX "OutputFile_createdAt_idx" ON "OutputFile"("createdAt");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingJob" ADD CONSTRAINT "EditingJob_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingJob" ADD CONSTRAINT "EditingJob_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingJob" ADD CONSTRAINT "EditingJob_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "EditingPreset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingJob" ADD CONSTRAINT "EditingJob_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditingJob" ADD CONSTRAINT "EditingJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlbumPage" ADD CONSTRAINT "AlbumPage_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputFile" ADD CONSTRAINT "OutputFile_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "EditingJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputFile" ADD CONSTRAINT "OutputFile_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputFile" ADD CONSTRAINT "OutputFile_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputFile" ADD CONSTRAINT "OutputFile_albumPageId_fkey" FOREIGN KEY ("albumPageId") REFERENCES "AlbumPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
