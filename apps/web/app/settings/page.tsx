import { Row } from '@/components/ui/row';
import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

"use client";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Configured via .env (see .env.example).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Database" value={process.env.DATABASE_URL ? "configured" : "missing"} />
            <Row label="Agent token" value={process.env.AGENT_TOKEN ? "configured" : "missing"} />
            <Row label="Agent URL (browser)" value={process.env.NEXT_PUBLIC_AGENT_URL ?? "default"} />
            <Row label="Photo storage" value={process.env.PHOTO_STORAGE_PATH ?? "./storage/photos"} />
            <Row label="Outputs" value={process.env.OUTPUT_PATH ?? "./storage/outputs"} />
            <Row label="Photoshop version" value={process.env.PHOTOSHOP_VERSION ?? "2022"} />
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Security: the agent authenticates with a shared Bearer token; the browser can never
              send arbitrary commands to the agent — only well‑known job operations validated with
              Zod.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Row } from '@/components/ui/row';
import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

"use client";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Configured via .env (see .env.example).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Database" value={process.env.DATABASE_URL ? "configured" : "missing"} />
            <Row label="Agent token" value={process.env.AGENT_TOKEN ? "configured" : "missing"} />
            <Row label="Agent URL (browser)" value={process.env.NEXT_PUBLIC_AGENT_URL ?? "default"} />
            <Row label="Photo storage" value={process.env.PHOTO_STORAGE_PATH ?? "./storage/photos"} />
            <Row label="Outputs" value={process.env.OUTPUT_PATH ?? "./storage/outputs"} />
            <Row label="Photoshop version" value={process.env.PHOTOSHOP_VERSION ?? "2022"} />
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Security: the agent authenticates with a shared Bearer token; the browser can never
              send arbitrary commands to the agent — only well‑known job operations validated with
              Zod.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Row } from '@/components/ui/row';
import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

"use client";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
import { Row } from '@/components/ui/row';
import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

"use client";

import { Row } from '@/components/ui/row';
import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

import { Row } from '@/components/ui/row';
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
"use client";

import { Row } from '@/components/ui/row';
import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">


/*
 * Page component for Settings route
 */
import { Row } from '@/components/ui/row';
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
/*
 * Page component for Settings route
 */
import { Row } from '@/components/ui/row';
"use client";

import { Row } from '@/components/ui/row';
"use client";

import { Row } from '@/components/ui/row';
/*
 * Page component for Settings route
 */
import { Row } from '@/components/ui/row';
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
/*
 * Page component for Settings route
 */
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
/*
 * Page component for Settings route
 */
/*
 * Page component for Settings route
 */
import { Row } from '@/components/ui/row';
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local Photoshop Agent</CardTitle>
            <CardDescription>
              Runs on the Windows machine with Adobe Photoshop 2022.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!agent.data && <p className="text-muted-foreground">No agent has registered yet.</p>}
            {agent.data && (
              <>
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local Photoshop Agent</CardTitle>
            <CardDescription>
              Runs on the Windows machine with Adobe Photoshop 2022.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!agent.data && <p className="text-muted-foreground">No agent has registered yet.</p>}
            {agent.data && (
              <>
                <Row label="Name" value={agent.data.name} />
                <Row label="Machine" value={agent.data.machineName} />
                <Row label="Platform" value={agent.data.platform} />
                <Row label="Agent version" value={agent.data.appVersion} />
                <Row label="Photoshop" value={agent.data.photoshopVersion ?? "not detected"} />
                <Row label="Photoshop available" value={agent.data.photoshopAvailable ? "Yes" : "No"} />
                <Row label="Mode" value={String((agent.data as { photoshopMode?: string }).photoshopMode ?? "COM")} />
                <Row label="Status" value={agent.data.status} />
                <Row label="Last seen" value={formatDateTime(agent.data.lastSeenAt)} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Configured via .env (see .env.example).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Database" value={process.env.DATABASE_URL ? "configured" : "missing"} />
            <Row label="Agent token" value={process.env.AGENT_TOKEN ? "configured" : "missing"} />
            <Row label="Agent URL (browser)" value={process.env.NEXT_PUBLIC_AGENT_URL ?? "default"} />
            <Row label="Photo storage" value={process.env.PHOTO_STORAGE_PATH ?? "./storage/photos"} />
            <Row label="Outputs" value={process.env.OUTPUT_PATH ?? "./storage/outputs"} />
            <Row label="Photoshop version" value={process.env.PHOTOSHOP_VERSION ?? "2022"} />
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Security: the agent authenticates with a shared Bearer token; the browser can never
              send arbitrary commands to the agent — only well-known job operations validated with
              Zod.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local Photoshop Agent</CardTitle>
            <CardDescription>
              Runs on the Windows machine with Adobe Photoshop 2022.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!agent.data && <p className="text-muted-foreground">No agent has registered yet.</p>}
            {agent.data && (
              <>
                <Row label="Name" value={agent.data.name} />
                <Row label="Machine" value={agent.data.machineName} />
                <Row label="Platform" value={agent.data.platform} />
                <Row label="Agent version" value={agent.data.appVersion} />
                <Row label="Photoshop" value={agent.data.photoshopVersion ?? "not detected"} />
                <Row label="Photoshop available" value={agent.data.photoshopAvailable ? "Yes" : "No"} />
                <Row label="Mode" value={String((agent.data as { photoshopMode?: string }).photoshopMode ?? "COM")} />
                <Row label="Status" value={agent.data.status} />
                <Row label="Last seen" value={formatDateTime(agent.data.lastSeenAt)} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Configured via .env (see .env.example).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Database" value={process.env.DATABASE_URL ? "configured" : "missing"} />
            <Row label="Agent token" value={process.env.AGENT_TOKEN ? "configured" : "missing"} />
            <Row label="Agent URL (browser)" value={process.env.NEXT_PUBLIC_AGENT_URL ?? "default"} />
            <Row label="Photo storage" value={process.env.PHOTO_STORAGE_PATH ?? "./storage/photos"} />
            <Row label="Outputs" value={process.env.OUTPUT_PATH ?? "./storage/outputs"} />
            <Row label="Photoshop version" value={process.env.PHOTOSHOP_VERSION ?? "2022"} />
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Security: the agent authenticates with a shared Bearer token; the browser can never
              send arbitrary commands to the agent — only well-known job operations validated with
              Zod.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local Photoshop Agent</CardTitle>
            <CardDescription>
              Runs on the Windows machine with Adobe Photoshop 2022.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!agent.data && <p className="text-muted-foreground">No agent has registered yet.</p>}
            {agent.data && (
              <>
                <Row label="Name" value={agent.data.name} />
                <Row label="Machine" value={agent.data.machineName} />
                <Row label="Platform" value={agent.data.platform} />
                <Row label="Agent version" value={agent.data.appVersion} />
                <Row label="Photoshop" value={agent.data.photoshopVersion ?? "not detected"} />
                <Row label="Photoshop available" value={agent.data.photoshopAvailable ? "Yes" : "No"} />
                <Row label="Mode" value={String((agent.data as { photoshopMode?: string }).photoshopMode ?? "COM")} />
                <Row label="Status" value={agent.data.status} />
                <Row label="Last seen" value={formatDateTime(agent.data.lastSeenAt)} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Configured via .env (see .env.example).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Database" value={process.env.DATABASE_URL ? "configured" : "missing"} />
            <Row label="Agent token" value={process.env.AGENT_TOKEN ? "configured" : "missing"} />
            <Row label="Agent URL (browser)" value={process.env.NEXT_PUBLIC_AGENT_URL ?? "default"} />
            <Row label="Photo storage" value={process.env.PHOTO_STORAGE_PATH ?? "./storage/photos"} />
            <Row label="Outputs" value={process.env.OUTPUT_PATH ?? "./storage/outputs"} />
            <Row label="Photoshop version" value={process.env.PHOTOSHOP_VERSION ?? "2022"} />
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Security: the agent authenticates with a shared Bearer token; the browser can never
              send arbitrary commands to the agent — only well-known job operations validated with
              Zod.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local Photoshop Agent</CardTitle>
            <CardDescription>
              Runs on the Windows machine with Adobe Photoshop 2022.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!agent.data && <p className="text-muted-foreground">No agent has registered yet.</p>}
            {agent.data && (
              <>
                <Row label="Name" value={agent.data.name} />
                <Row label="Machine" value={agent.data.machineName} />
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

                <Row label="Platform" value={agent.data.platform} />
                <Row label="Agent version" value={agent.data.appVersion} />
                <Row label="Photoshop" value={agent.data.photoshopVersion ?? "not detected"} />
                <Row label="Photoshop available" value={agent.data.photoshopAvailable ? "Yes" : "No"} />
                <Row label="Mode" value={String((agent.data as { photoshopMode?: string }).photoshopMode ?? "COM")} />
                <Row label="Status" value={agent.data.status} />
                <Row label="Last seen" value={formatDateTime(agent.data.lastSeenAt)} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Configured via .env (see .env.example).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Database" value={process.env.DATABASE_URL ? "configured" : "missing"} />
            <Row label="Agent token" value={process.env.AGENT_TOKEN ? "configured" : "missing"} />
            <Row label="Agent URL (browser)" value={process.env.NEXT_PUBLIC_AGENT_URL ?? "default"} />
            <Row label="Photo storage" value={process.env.PHOTO_STORAGE_PATH ?? "./storage/photos"} />
            <Row label="Outputs" value={process.env.OUTPUT_PATH ?? "./storage/outputs"} />
            <Row label="Photoshop version" value={process.env.PHOTOSHOP_VERSION ?? "2022"} />
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Security: the agent authenticates with a shared Bearer token; the browser can never
              send arbitrary commands to the agent — only well-known job operations validated with
              Zod.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

  "use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local Photoshop Agent</CardTitle>
            <CardDescription>
              Runs on the Windows machine with Adobe Photoshop 2022.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!agent.data && <p className="text-muted-foreground">No agent has registered yet.</p>}
            {agent.data && (
              <>
                <Row label="Name" value={agent.data.name} />
                <Row label="Machine" value={agent.data.machineName} />
                <Row label="Platform" value={agent.data.platform} />
                <Row label="Agent version" value={agent.data.appVersion} />
                <Row label="Photoshop" value={agent.data.photoshopVersion ?? "not detected"} />
                <Row label="Photoshop available" value={agent.data.photoshopAvailable ? "Yes" : "No"} />
                <Row label="Mode" value={String((agent.data as { photoshopMode?: string }).photoshopMode ?? "COM")} />
                <Row label="Status" value={agent.data.status} />
                <Row label="Last seen" value={formatDateTime(agent.data.lastSeenAt)} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Configured via .env (see .env.example).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Database" value={process.env.DATABASE_URL ? "configured" : "missing"} />
            <Row label="Agent token" value={process.env.AGENT_TOKEN ? "configured" : "missing"} />
            <Row label="Agent URL (browser)" value={process.env.NEXT_PUBLIC_AGENT_URL ?? "default"} />
            <Row label="Photo storage" value={process.env.PHOTO_STORAGE_PATH ?? "./storage/photos"} />
            <Row label="Outputs" value={process.env.OUTPUT_PATH ?? "./storage/outputs"} />
            <Row label="Photoshop version" value={process.env.PHOTOSHOP_VERSION ?? "2022"} />
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Security: the agent authenticates with a shared Bearer token; the browser can never
              send arbitrary commands to the agent — only well-known job operations validated with
              Zod.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

"use client";

import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
import { Row } from "@/components/ui/row";

export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local Photoshop Agent</CardTitle>
            <CardDescription>
              Runs on the Windows machine with Adobe Photoshop 2022.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!agent.data && <p className="text-muted-foreground">No agent has registered yet.</p>}
            {agent.data && (
              <>
                <Row label="Name" value={agent.data.name} />
                <Row label="Machine" value={agent.data.machineName} />
                <Row label="Platform" value={agent.data.platform} />
                <Row label="Agent version" value={agent.data.appVersion} />
                <Row label="Photoshop" value={agent.data.photoshopVersion ?? "not detected"} />
                <Row label="Photoshop available" value={agent.data.photoshopAvailable ? "Yes" : "No"} />
                <Row label="Mode" value={String((agent.data as { photoshopMode?: string }).photoshopMode ?? "COM")} />
                <Row label="Status" value={agent.data.status} />
                <Row label="Last seen" value={formatDateTime(agent.data.lastSeenAt)} />
              </>
            )}
          </CardContent>
        </Card>
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Configured via .env (see .env.example).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Database" value={process.env.DATABASE_URL ? "configured" : "missing"} />
            <Row label="Agent token" value={process.env.AGENT_TOKEN ? "configured" : "missing"} />
            <Row label="Agent URL (browser)" value={process.env.NEXT_PUBLIC_AGENT_URL ?? "default"} />
            <Row label="Photo storage" value={process.env.PHOTO_STORAGE_PATH ?? "./storage/photos"} />
            <Row label="Outputs" value={process.env.OUTPUT_PATH ?? "./storage/outputs"} />
            <Row label="Photoshop version" value={process.env.PHOTOSHOP_VERSION ?? "2022"} />
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Security: the agent authenticates with a shared Bearer token; the browser can never
import { Row } from "@/components/ui/row";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
              send arbitrary commands to the agent — only well-known job operations validated with
              Zod.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );

use client;



import { useAgentStatus } from "@/hooks/use-photos";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getSettingsEnv } from "@wedding/config/server/settings";

/**
 * This component runs on the server, so we can safely read env vars without
 * causing hydration mismatches.
 */
export default async function SettingsPage() {
  const agent = useAgentStatus();

  // Load the server environment on the server side only.
  // Using getSettingsEnv ensures the values are the same on both sides.
  const settingsEnv = await getSettingsEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl tracking-wide">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Server configuration and local Photoshop agent status.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local Photoshop Agent</CardTitle>
            <CardDescription>
              Runs on the Windows machine with Adobe Photoshop 2022.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!agent.data && <p className="text-muted-foreground">No agent has registered yet.</p>}
            {agent.data && (
              <>
                <Row label="Name" value={agent.data.name} />
                <Row label="Machine" value={agent.data.machineName} />
                <Row label="Platform" value={agent.data.platform} />
                <Row label="Agent version" value={agent.data.appVersion} />
                <Row label="Photoshop" value={agent.data.photoshopVersion ?? "not detected"} />
                <Row label="Photoshop available" value={agent.data.photoshopAvailable ? "Yes" : "No"} />
                <Row label="Mode" value={String((agent.data as { photoshopMode?: string }).photoshopMode ?? "COM")} />
                <Row label="Status" value={agent.data.status} />
                <Row label="Last seen" value={formatDateTime(agent.data.lastSeenAt)} />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Configured via .env (see .env.example).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Database" value={process.env.DATABASE_URL ? "configured" : "missing"} />
            <Row label="Agent token" value={process.env.AGENT_TOKEN ? "configured" : "missing"} />
            <Row label="Agent URL (browser)" value={process.env.NEXT_PUBLIC_AGENT_URL ?? "default"} />
            <Row label="Photo storage" value={process.env.PHOTO_STORAGE_PATH ?? "./storage/photos"} />
            <Row label="Outputs" value={process.env.OUTPUT_PATH ?? "./storage/outputs"} />
            <Row label="Photoshop version" value={process.env.PHOTOSHOP_VERSION ?? "2022"} />
            <p className="pt-2 text-xs leading-relaxed text-muted-foreground">
              Security: the agent authenticates with a shared Bearer token; the browser can never
              send arbitrary commands to the agent — only well-known job operations validated with
              Zod.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
