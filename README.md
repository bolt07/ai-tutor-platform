# AI Tutor

A real-time educational application featuring interactive voice and text chat. This platform uses continuous live audio streaming and WebSockets to allow students to talk naturally with an AI tutor.

## Features

- **Real-time Voice Chat:**Push the mic and talk to you AI tutor.
- **Text Chat:**You can also ask questions via text also with good markdown support.
- **Persistance History:**Chat history and user sessions persist across reloads.

## Tech Stack

- **Framework:** Next.js
- **Styling:** Tailwind / Lucide-Icons / Tailwind-typography
- **State Mangement:** Zustand

* **Audio Processing for text-chat:** SpeechRecognition / SpeechSynthesis WebAPIs
* **Audio-Streaming for voice-chat:** Web Audio API
* **Networking:** HTTPS / Websockets

## Architecture

![Chat Page Architecture](assets\chatPage.png)
![Voice Page Architecture](assets\voicePage.png)

## Getting Started

```bash
git clone [https://github.com/bolt07/ai-tutor-platform.git](https://github.com/bolt07/ai-tutor-platform.git)
npm install
npm run dev
```
