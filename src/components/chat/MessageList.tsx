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
  const messageLength = chatData?.data ?? 0;

  if (messageLength === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
        <p className="text-lg">No Messages yet.</p>
        <p className="text-sm">Start a conversation with your AI Tutor!</p>
      </div>
    );
  }

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
    <div className="flex flex-col flex-1 h-full min-h-0 text-[70%]">
      <VirtuosoMessageListLicense licenseKey="">
        <VirtuosoMessageList<Message, null>
          style={{ flex: 1 }}
          data={chatData}
          // keys to avoid rendering issues
          computeItemKey={({ data }) => data.id}
          ItemContent={ItemContent}
        />
      </VirtuosoMessageListLicense>
    </div>
  );
};
