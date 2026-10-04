# 🗣️ Azure AI Foundry Avatar (MERN + TypeScript)

An interactive, real-time AI Talking Avatar application built using the MERN stack (MongoDB, Express, React, Node.js) with TypeScript. It integrates **Azure AI Foundry Agents**, **Azure Cognitive Services Speech SDK**, and **Azure Talking Avatar** for real-time speech recognition, natural conversational AI, and synchronized voice & avatar animation.

---

## 🌟 Key Features

- 🎭 **Interactive AI Talking Avatar**: Synchronized visual lip-sync and expressions powered by Azure Speech & Talking Avatar services.
- 🤖 **Azure AI Foundry Integration**: Connected with `@azure/ai-projects` for multi-turn conversational AI reasoning and agent execution.
- 🎙️ **Real-Time Speech-to-Text & TTS**: Low-latency voice interaction allowing users to speak directly to the avatar.
- ⚡ **Simulation Mode**: Built-in mock mode to run and test the complete UI/UX without active Azure cloud credentials.
- 🌐 **Multi-Language & Customization**: Support for multiple voices, avatar characters, styles, and background configurations.
- 💬 **Live Chat Panel**: Synchronized text interface displaying conversation history with Markdown support.
- 💾 **Session History**: Optional Cosmos DB / MongoDB integration for saving chat sessions.

---

## 🏗️ Architecture Overview

```
               +----------------------------------+
               |          React Client            |
               | (Vite + TypeScript + Tailwind)   |
               +-----------------+----------------+
                                 |
           Speech / Audio        | REST / WebSocket API
           & Avatar Stream       |
                                 v
               +-----------------+----------------+
               |          Express Server          |
               |      (Node.js + TypeScript)      |
               +--------+-----------------+-------+
                        |                 |
     Azure AI Projects  |                 | Azure Speech SDK
       (Foundry SDK)    v                 v
          +-------------+---+   +---------+---------+
          |  Azure AI   |   | Azure Speech  |
          |Foundry Agent|   | & Talking Avatar|
          +-------------+---+   +-------------------+
```

---

## 📁 Repository Structure

```
Avatar/
├── client/                     # Frontend Application (React + Vite + TS)
│   ├── src/
│   │   ├── components/         # Avatar Canvas, Voice Control Bar, Chat Panel, Settings
│   │   ├── hooks/              # Speech Recognition & WebRTC/Avatar hooks
│   │   ├── services/           # API Services & Azure Speech SDK wrappers
│   │   ├── types/              # TypeScript Interfaces
│   │   ├── App.tsx             # Root Component
│   │   └── main.tsx            # Entry Point
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend API Service (Express + Node + TS)
│   ├── src/
│   │   ├── config/             # Configuration & Environment setups
│   │   ├── routes/             # API Endpoints (Agent, Speech, History)
│   │   ├── services/           # Azure Foundry, Azure Speech & Database services
│   │   └── index.ts            # Server Entry Point
│   ├── .env.example            # Environment template
│   └── package.json
│
├── package.json                # Root workspace package.json
├── .gitignore                  # Git ignore definitions
└── README.md                   # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (or `pnpm` / `yarn`)
- **Azure Account**: (Optional if using Simulation Mode) Access to Azure AI Foundry and Azure Speech Resource.

---

### 1. Installation

Clone the repository and install all dependencies for both client and server using the workspace command:

```bash
# Clone the repository
git clone https://github.com/your-username/azure-ai-foundry-avatar.git
cd Avatar

# Install client and server dependencies
npm run install:all
```

---

### 2. Environment Configuration

Copy the example environment file in the `server` directory:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your credentials or leave `SIMULATION_MODE=true` for testing:

```env
PORT=5000

# Azure AI Foundry Agent Credentials
AZURE_AI_FOUNDRY_ENDPOINT=https://your-foundry-resource.services.ai.azure.com
AZURE_AI_FOUNDRY_PROJECT_CONNECTION_STRING=your_connection_string
AZURE_AI_FOUNDRY_AGENT_ID=asst_your_agent_id
AZURE_OPENAI_API_KEY=your_openai_api_key

# Azure Speech & Talking Avatar Credentials
AZURE_SPEECH_KEY=your_azure_speech_key
AZURE_SPEECH_REGION=eastus
AZURE_SPEECH_AVATAR_CHARACTER=lisa
AZURE_SPEECH_AVATAR_STYLE=graceful

# Cosmos DB / MongoDB (Optional)
COSMOS_DB_CONNECTION_STRING=mongodb://localhost:27017/avatar_db
ENABLE_COSMOS_STORAGE=false

# Simulation Mode (Set to true to test locally without live Azure keys)
SIMULATION_MODE=true
```

---

### 3. Running the Application

Start the backend server and frontend client:

#### Start Backend Server:
```bash
npm run dev:server
```
*Server runs on `http://localhost:5000`*

#### Start Frontend Client:
```bash
npm run dev:client
```
*Client runs on `http://localhost:5173`*

---

## 📜 Available NPM Scripts

From the root directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run install:all` | Installs dependencies in both `server/` and `client/` directories |
| `npm run dev:server` | Starts the Express backend server with hot-reload (`ts-node-dev`) |
| `npm run dev:client` | Starts the Vite React frontend development server |
| `npm run build:all` | Builds production distribution artifacts for both backend and frontend |

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Speech SDK**: Microsoft Cognitive Services Speech SDK (`microsoft-cognitiveservices-speech-sdk`)

### Backend
- **Framework**: Express.js
- **Runtime**: Node.js
- **Language**: TypeScript
- **Azure SDKs**: `@azure/ai-projects`, `@azure/identity`
- **Database**: Mongoose (MongoDB / Azure Cosmos DB)
- **WebSockets**: `ws` for real-time communication

---

## 📄 License

This project is licensed under the MIT License.
