# Fabric Data Agent Chat Application

A Next.js application that provides a chat interface to interact with Microsoft Fabric Data Agent, authenticated via Entra ID using MSAL.

## Features

- **Microsoft Entra ID Authentication**: Secure authentication using MSAL library
- **Chat Interface**: Interactive chat UI to communicate with Fabric Data Agent
- **Sample Questions**: Pre-configured sample questions displayed on initial load
- **Modern UI**: Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui
- **Real-time Responses**: Send queries and receive responses from the Fabric Data Agent

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: @azure/msal-react + @azure/msal-browser

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Access to the Microsoft Fabric Data Agent
- Valid Entra ID app registration

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your configuration values:
```env
NEXT_PUBLIC_ENTRA_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_ENTRA_TENANT_ID=your-tenant-id-here
NEXT_PUBLIC_FABRIC_WORKSPACE_ID=your-workspace-id-here
NEXT_PUBLIC_FABRIC_AGENT_ID=your-agent-id-here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Environment Variables

All sensitive configuration is stored in environment variables. Configure these in your `.env.local` file:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ENTRA_CLIENT_ID` | Your Entra ID Application (client) ID |
| `NEXT_PUBLIC_ENTRA_TENANT_ID` | Your Entra ID Directory (tenant) ID |
| `NEXT_PUBLIC_FABRIC_WORKSPACE_ID` | Your Microsoft Fabric Workspace ID |
| `NEXT_PUBLIC_FABRIC_AGENT_ID` | Your Microsoft Fabric Data Agent ID |

**Note**: These variables use the `NEXT_PUBLIC_` prefix because they're accessed in client-side code.

### Entra ID Settings

Configure your Entra ID app registration with:

- **Required Scopes**:
  - `https://api.fabric.microsoft.com/Workspace.ReadWrite.All`
  - `https://api.fabric.microsoft.com/Item.ReadWrite.All`
  - `https://api.fabric.microsoft.com/Item.Execute.All`
  - `https://api.fabric.microsoft.com/MLModel.ReadWrite.All`
  - `https://api.fabric.microsoft.com/MLModel.Execute.All`
- **Redirect URIs**: Add `http://localhost:3000` for development (adjust for production)

### Microsoft Fabric API

The application uses:
- **API Version**: `2024-05-01-preview`
- **API Pattern**: OpenAI Assistants API (thread-based conversations)

#### API Workflow

The application uses the OpenAI Assistants API pattern with the following steps:

1. **Create Assistant** - Initialize an assistant instance
2. **Create Thread** - Create a conversation thread
3. **Add Message** - Add user's question to the thread
4. **Create Run** - Execute the query against the Data Agent
5. **Poll Status** - Poll the run status every 2 seconds until completion (max 5 minutes)
6. **Retrieve Messages** - Get the assistant's response from the thread
7. **Cleanup** - Delete the thread to free resources

This follows the official Microsoft Fabric documentation for programmatic Data Agent access.

### Sample Questions

Sample questions are configured in `/config/sampleQuestions.json`:

1. For each store, show any freezers operated by that store that ever had a humidity lower than 46 percent.
2. What is the top product by revenue across all stores?
3. What is the product revenue for stores in Paris?

## Usage

1. **Authentication**: When you first open the app, click "Sign in with Microsoft" to authenticate
2. **Sample Questions**: After authentication, you'll see three sample questions you can click to ask
3. **Send Query**: Type your own question in the input field and click the send button (or press Enter)
4. **Reset Conversation**: Click the reset button to clear the conversation and return to sample questions

## Project Structure

```
/app
  layout.tsx          # Root layout with MSAL provider
  page.tsx            # Main chat interface (protected)
  globals.css         # Global styles + Tailwind imports
/components
  ui/                 # shadcn/ui components
  chat/
    ChatInterface.tsx      # Main chat container
    MessageList.tsx        # Display conversation history
    MessageInput.tsx       # User input with send button
    SampleQuestions.tsx    # Display initial sample questions
    Message.tsx            # Individual message component
/lib
  msalConfig.ts       # MSAL configuration and instance
  fabricApi.ts        # Microsoft Fabric API client
  types.ts            # TypeScript interfaces
  utils.ts            # Utility functions
/config
  sampleQuestions.json    # Sample questions configuration
/hooks
  useAuth.ts          # Authentication hook
  useFabricAgent.ts   # Hook for API calls with token management
```

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Security

- **Environment Variables**: All sensitive configuration (IDs, keys) stored in `.env.local` which is git-ignored
- **Bearer Tokens**: Acquired per-request and not stored persistently
- **Token Caching**: MSAL handles token caching securely in session storage
- **Authentication**: All API calls authenticated with Entra ID
- **No Secrets in Code**: Use `.env.example` as a template without exposing actual credentials

## Notes

- The redirect URI is automatically set based on the current origin (defaults to `http://localhost:3000` in development)
- Ensure your Entra ID app registration has the correct redirect URIs configured
- The application requires network access to Microsoft Fabric API endpoints
