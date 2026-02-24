import { msalInstance, loginRequest } from './msalConfig';
import { FabricQueryResponse, Assistant, Thread, Run, MessageListResponse } from './types';

const WORKSPACE_ID = process.env.NEXT_PUBLIC_FABRIC_WORKSPACE_ID;
const AGENT_ID = process.env.NEXT_PUBLIC_FABRIC_AGENT_ID;

if (!WORKSPACE_ID || !AGENT_ID) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_FABRIC_WORKSPACE_ID and NEXT_PUBLIC_FABRIC_AGENT_ID');
}

const BASE_URL = `https://api.fabric.microsoft.com/v1/workspaces/${WORKSPACE_ID}/dataagents/${AGENT_ID}/aiassistant/openai`;
const API_VERSION = '2024-05-01-preview';

// Polling configuration
const POLL_INTERVAL_MS = 2000; // 2 seconds
const TIMEOUT_SECONDS = 300; // 5 minutes
const TERMINAL_STATES = new Set(['completed', 'failed', 'cancelled', 'requires_action']);

export async function acquireToken(): Promise<string> {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    throw new Error('No authenticated accounts found');
  }

  const request = {
    ...loginRequest,
    account: accounts[0],
  };

  try {
    const response = await msalInstance.acquireTokenSilent(request);
    return response.accessToken;
  } catch (error) {
    const response = await msalInstance.acquireTokenPopup(request);
    return response.accessToken;
  }
}

function generateActivityId(): string {
  return crypto.randomUUID();
}

async function apiRequest<T>(
  endpoint: string,
  token: string,
  method: 'GET' | 'POST' | 'DELETE' = 'POST',
  body?: any
): Promise<T> {

  // const url = `${BASE_URL}${endpoint}?api-version=${API_VERSION}`;
  const separator = endpoint.includes('?') ? '&' : '?';
  const url = `${BASE_URL}${endpoint}${separator}api-version=${API_VERSION}`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'ActivityId': generateActivityId(),
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

async function createAssistant(token: string): Promise<Assistant> {
  return apiRequest<Assistant>('/assistants', token, 'POST', {
    model: 'not used', // Model parameter not used by Fabric
  });
}

async function createThread(token: string): Promise<Thread> {
  return apiRequest<Thread>('/threads', token, 'POST', {});
}

async function addMessageToThread(
  token: string,
  threadId: string,
  message: string
): Promise<void> {
  await apiRequest(`/threads/${threadId}/messages`, token, 'POST', {
    role: 'user',
    content: message,
  });
}

async function createRun(
  token: string,
  threadId: string,
  assistantId: string
): Promise<Run> {
  return apiRequest<Run>(`/threads/${threadId}/runs`, token, 'POST', {
    assistant_id: assistantId,
  });
}

async function getRun(
  token: string,
  threadId: string,
  runId: string
): Promise<Run> {
  return apiRequest<Run>(`/threads/${threadId}/runs/${runId}`, token, 'GET');
}

async function getMessages(
  token: string,
  threadId: string
): Promise<MessageListResponse> {
  return apiRequest<MessageListResponse>(
    `/threads/${threadId}/messages?order=asc`,
    token,
    'GET'
  );
}

async function deleteThread(token: string, threadId: string): Promise<void> {
  await apiRequest(`/threads/${threadId}`, token, 'DELETE');
}

async function pollRunCompletion(
  token: string,
  threadId: string,
  runId: string
): Promise<Run> {
  const startTime = Date.now();

  while (true) {
    const run = await getRun(token, threadId, runId);

    console.log(`Run status: ${run.status}`);

    if (TERMINAL_STATES.has(run.status)) {
      return run;
    }

    const elapsedSeconds = (Date.now() - startTime) / 1000;
    if (elapsedSeconds > TIMEOUT_SECONDS) {
      throw new Error(
        `Run polling exceeded ${TIMEOUT_SECONDS} seconds (last status=${run.status})`
      );
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

export async function queryDataAgent(question: string): Promise<FabricQueryResponse> {
  let threadId: string | null = null;

  try {
    const token = await acquireToken();

    // Step 1: Create assistant
    console.log('Creating assistant...');
    const assistant = await createAssistant(token);
    console.log(`Assistant created: ${assistant.id}`);

    // Step 2: Create thread
    console.log('Creating thread...');
    const thread = await createThread(token);
    threadId = thread.id;
    console.log(`Thread created: ${threadId}`);

    // Step 3: Add message to thread
    console.log('Adding message to thread...');
    await addMessageToThread(token, threadId, question);

    // Step 4: Create run
    console.log('Creating run...');
    const run = await createRun(token, threadId, assistant.id);
    console.log(`Run created: ${run.id}`);

    // Step 5: Poll until completion
    console.log('Polling for completion...');
    const completedRun = await pollRunCompletion(token, threadId, run.id);

    if (completedRun.status !== 'completed') {
      throw new Error(`Run finished with status: ${completedRun.status}${completedRun.last_error ? ' - ' + JSON.stringify(completedRun.last_error) : ''}`);
    }

    // Step 6: Retrieve messages
    console.log('Retrieving messages...');
    const messagesResponse = await getMessages(token, threadId);

    // Extract the assistant's response (last message)
    const assistantMessages = messagesResponse.data.filter(m => m.role === 'assistant');

    if (assistantMessages.length === 0) {
      throw new Error('No assistant response found');
    }

    const lastMessage = assistantMessages[assistantMessages.length - 1];
    const answer = lastMessage.content[0]?.text?.value || 'No response content';

    // Step 7: Cleanup thread
    console.log('Cleaning up thread...');
    await deleteThread(token, threadId);
    console.log('Thread deleted');

    return { answer };
  } catch (error) {
    // Attempt cleanup on error
    if (threadId) {
      try {
        const token = await acquireToken();
        await deleteThread(token, threadId);
        console.log('Thread cleaned up after error');
      } catch (cleanupError) {
        console.error('Failed to cleanup thread:', cleanupError);
      }
    }

    console.error('Error querying data agent:', error);
    throw error;
  }
}
