import type { Metadata } from "next";
import { ChatView } from "./_components/chat-view";

export const metadata: Metadata = {
  title: "Chat · AXN Studio",
};

export default function ChatPage() {
  return <ChatView />;
}
