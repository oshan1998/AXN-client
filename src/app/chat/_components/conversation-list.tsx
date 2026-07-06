"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation } from "@/types/chat";

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onDelete,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conversation) =>
      conversation.title.toLowerCase().includes(term),
    );
  }, [conversations, search]);

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-line bg-surface">
      <div className="border-b border-line p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations"
            className="h-8 pl-8 text-[13px]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-[13px] text-ink-faint">
            {search ? "No matches." : "No conversations yet."}
          </p>
        ) : (
          filtered.map((conversation) => {
            const lastMessage = conversation.messages.at(-1);
            return (
              <div
                key={conversation.id}
                className={cn(
                  "group relative border-b border-line",
                  conversation.id === activeId ? "bg-accent-soft" : "hover:bg-surface-muted",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className="w-full px-4 py-3 text-left"
                >
                  <p className="truncate pr-6 text-[13px] font-semibold text-ink">
                    {conversation.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">
                    {lastMessage?.content ?? "No messages yet"}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-faint">
                    {formatRelativeTime(conversation.updatedAt)}
                  </p>
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${conversation.title}`}
                  onClick={() => onDelete(conversation.id)}
                  className="absolute right-3 top-3 rounded p-1 text-ink-faint opacity-0 transition-opacity hover:bg-ink/5 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
