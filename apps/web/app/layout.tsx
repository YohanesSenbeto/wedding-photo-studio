import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
  title: "Wedding Photo Studio — Professional Photoshop Editing",
  description:
    "Upload JPG and Sony ARW photos, choose a professional preset, and let the local Photoshop 2022 agent create professional edits and wedding albums.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 overflow-x-hidden">
              <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
