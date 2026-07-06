import type { Metadata } from "next";
import { NetworkEditorLoader } from "./_components/network-editor";

export const metadata: Metadata = {
  title: "Network editor · AXN Studio",
};

export default async function NetworkEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NetworkEditorLoader id={id} />;
}
