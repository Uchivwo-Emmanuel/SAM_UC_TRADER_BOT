import { createAuthClient } from "better-auth/react";
import { appConfig } from "./config";

export const authClient = createAuthClient({ baseURL: appConfig.authBaseUrl });
