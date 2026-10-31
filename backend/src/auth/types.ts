export type AuthenticatedRequest = {
  user: { id: string; workspaceId: string };
};

export type CookieRequest = {
  cookies?: {
    refresh_token?: unknown;
  };
};
