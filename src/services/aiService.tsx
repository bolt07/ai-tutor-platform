import { useChatStore } from "../store/useChatStore";

export const aiService = {
  getChatResponse: async (
    content: string,
    userId: string,
    sessionId: string,
  ) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetch(`${apiUrl}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: content,
        user_id: userId,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error("API call failed");
    }

    return await response.json();
  },
};
