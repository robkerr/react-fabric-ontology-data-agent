import { Configuration, PublicClientApplication } from '@azure/msal-browser';

const clientId = process.env.NEXT_PUBLIC_ENTRA_CLIENT_ID;
const tenantId = process.env.NEXT_PUBLIC_ENTRA_TENANT_ID;

if (!clientId || !tenantId) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_ENTRA_CLIENT_ID and NEXT_PUBLIC_ENTRA_TENANT_ID');
}

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    'https://api.fabric.microsoft.com/Workspace.ReadWrite.All',
    'https://api.fabric.microsoft.com/Item.ReadWrite.All',
    'https://api.fabric.microsoft.com/Item.Execute.All',
    'https://api.fabric.microsoft.com/MLModel.ReadWrite.All',
    'https://api.fabric.microsoft.com/MLModel.Execute.All',
  ],
};

export const msalInstance = new PublicClientApplication(msalConfig);
