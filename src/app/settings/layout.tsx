import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SettingsTabs } from "./_components/settings-tabs";

export const metadata: Metadata = {
  title: "Settings · AXN Studio",
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-6 border-b border-line bg-surface px-6">
        <h1 className="text-[15px] font-semibold">Settings</h1>
        <SettingsTabs />
      </header>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
