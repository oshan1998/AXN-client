"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Paperclip, SendHorizonal, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";
import type { Conversation } from "@/types/chat";
import { MarkdownMessage } from "./markdown-message";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MessageThreadProps {
  conversation: Conversation | null;
  networkName?: string;
  running: boolean;
  cancelling?: boolean;
  onSend: (text: string, files?: File[]) => void;
  onCancel?: () => void;
  onStart: () => void;
  canStart: boolean;
}

export function MessageThread({
  conversation,
  networkName,
  running,
  cancelling = false,
  onSend,
  onCancel,
  onStart,
  canStart,
}: MessageThreadProps) {
  const [draft, setDraft] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length, running]);

  if (!conversation) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center bg-surface-muted">
        <EmptyState
          icon={MessageSquare}
          title="No conversation selected"
          description="Pick a conversation on the left, or start a new one to message a network."
          action={
            canStart ? (
              <Button size="sm" onClick={onStart}>
                New conversation
              </Button>
            ) : undefined
          }
        />
      </section>
    );
  }

  const submit = () => {
    const text = draft.trim();
    if ((!text && selectedFiles.length === 0) || running) return;
    onSend(text, selectedFiles.length > 0 ? selectedFiles : undefined);
    setDraft("");
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-surface-muted">
      <div className="flex items-center gap-3 border-b border-line bg-surface px-5 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold">{conversation.title}</h2>
          <p className="text-xs text-ink-faint">
            Network: {networkName ?? conversation.networkId}
            {conversation.chatId ? ` · chat ${conversation.chatId.slice(-6)}` : ""}
          </p>
        </div>
        {running && onCancel ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onCancel}
            disabled={cancelling}
            className="shrink-0 text-danger hover:border-danger hover:text-danger"
          >
            <Square className="size-3 fill-current" />
            {cancelling ? "Stopping…" : "Stop"}
          </Button>
        ) : null}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {conversation.messages.map((message, index) => (
          <div
            key={`${message.createdAt}-${index}`}
            className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2.5",
                message.role === "user"
                  ? "rounded-br-md bg-accent text-white"
                  : "rounded-bl-md border border-line bg-surface text-ink shadow-card",
              )}
            >
              {message.attachments?.length ? (
                <div className="mb-1.5 flex flex-wrap gap-1.5">
                  {message.attachments.map((attachment) => (
                    <a
                      key={attachment.url}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]",
                        message.role === "user"
                          ? "bg-white/15 text-white"
                          : "bg-surface-muted text-ink-faint",
                      )}
                    >
                      <Paperclip className="size-3" />
                      {attachment.fileName}
                      <span className="opacity-70">{formatFileSize(attachment.size)}</span>
                    </a>
                  ))}
                </div>
              ) : null}
              <MarkdownMessage content={message.content} isUser={message.role === "user"} />
              <p
                className={cn(
                  "mt-1 text-[10px]",
                  message.role === "user" ? "text-white/70" : "text-ink-faint",
                )}
              >
                {formatTime(message.createdAt)}
              </p>
            </div>
          </div>
        ))}

        {running ? (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line bg-surface px-4 py-3 shadow-card">
              <span className="size-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:0ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:120ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:240ms]" />
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex flex-col gap-2 border-t border-line bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        {selectedFiles.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center gap-1.5 rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[11px] text-ink-faint"
              >
                <Paperclip className="size-3" />
                {file.name}
                <span className="opacity-70">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))}
                  aria-label={`Remove ${file.name}`}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-line"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            disabled={running}
            onChange={(event) => {
              const newFiles = Array.from(event.target.files ?? []);
              setSelectedFiles((prev) => [...prev, ...newFiles]);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="secondary"
            aria-label="Attach file"
            className="w-11 px-0"
            disabled={running}
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="size-4" />
          </Button>
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Message the network…"
            disabled={running}
          />
          <Button
            type="submit"
            disabled={running || (!draft.trim() && selectedFiles.length === 0)}
            aria-label="Send"
            className="w-11 px-0"
          >
            <SendHorizonal className="size-4" />
          </Button>
        </div>
      </form>
    </section>
  );
}
