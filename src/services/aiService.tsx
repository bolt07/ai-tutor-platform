import { useChatStore } from "../store/useChatStore";

const RESPONSES = [
  "That's a great question! Ask your mama :)",
  "To solve this math problem you have to use your rusted brain.",
  "Excellent you have unlocked the too-dumb-to-add-numbers achievement!!!",
  "I am you AI Tutor, so i can't help you to find girlfriend.",
  "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
];

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const aiService = {
  async generateResponse(userPrompt: string) {
    const store = useChatStore.getState();

    store.setVoiceState("processing");
    const thinkingTime = Math.floor(Math.random() * 1000) + 500;
    await sleep(thinkingTime);

    const aiMessageId = store.addMessage("", "ai");

    const responseText =
      RESPONSES.find((r) =>
        userPrompt.toLowerCase().includes(r.split(" ")[0].toLowerCase()),
      ) || RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

    const words = responseText.split(" ");
    let currentText = "";

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];

      store.updateMessageContent(aiMessageId, currentText, true);

      const delay = words[i].endsWith(".") ? 400 : 70 + Math.random() * 50;

      await sleep(delay);
    }

    store.updateMessageContent(aiMessageId, currentText, false);
    store.setVoiceState("idle");
  },
};
