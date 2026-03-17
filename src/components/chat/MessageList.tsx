import { Message, useChatStore } from "@/src/store/useChatStore";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";
import { Divide } from "lucide-react";
import {
  VirtuosoMessageList,
  VirtuosoMessageListLicense,
  VirtuosoMessageListProps,
} from "@virtuoso.dev/message-list";

// still a few more changes to do
// 1. like why <Message, null> giving me error (done)
// 2. it scrolls to bottoms but has an extra space first so that
// AI can type easily, but the gettting the response the
// space remains there(doesn't shrink) which looks weird
// only top half of the chat have message and lower half is empty

export const MessageLists = () => {
  const chatData = useChatStore((state) => state.chatData);
  const messages = chatData?.data ?? [];
  const sessionId = useChatStore((state) => state.sessionId);

  const ItemContent: VirtuosoMessageListProps<Message, null>["ItemContent"] = ({
    data,
  }) => {
    return (
      <div className="pb-5 px-4">
        <div className="max-w-3xl mx-auto">
          <MessageBubble key={data.id} message={data} />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full relative">
      {/* 1. Overlay the empty state instead of unmounting the list */}
      {messages.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10 pointer-events-none">
          <p className="text-lg">No Messages yet.</p>
          <p className="text-sm">Start a conversation with your AI Tutor!</p>
        </div>
      )}

      {/* 2. Virtuoso remains rendered to maintain its internal size tree */}
      <VirtuosoMessageListLicense licenseKey="">
        <VirtuosoMessageList<Message, null>
          key={sessionId}
          style={{ flex: 1 }}
          data={chatData ?? { data: [] }}
          computeItemKey={({ data }) => data.id}
          ItemContent={ItemContent}
        />
      </VirtuosoMessageListLicense>
    </div>
  );
};
