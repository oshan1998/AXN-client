import type { Metadata } from "next";
import { NetworksView } from "./_components/networks-view";

export const metadata: Metadata = {
  title: "Networks · AXN Studio",
};

export default function NetworksPage() {
  return <NetworksView />;
}
