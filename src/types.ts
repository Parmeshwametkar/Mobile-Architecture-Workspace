export enum EmulatorScreen {
  LOGIN = "LOGIN",
  OTP = "OTP",
  DASHBOARD = "DASHBOARD",
  MAP = "MAP",
  CHAT = "CHAT",
  PAYMENT = "PAYMENT",
  SETTINGS = "SETTINGS",
  PROFILE = "PROFILE",
  VAULTS = "VAULTS",
  GALLERY = "GALLERY",
  CALCULATOR = "CALCULATOR",
  NOTES = "NOTES"
}

export enum WorkspaceTab {
  OVERVIEW = "OVERVIEW",
  EMULATOR = "EMULATOR",
  ARCHITECTURE = "ARCHITECTURE",
  API_PLAYGROUND = "API_PLAYGROUND",
  DB_SCHEMA = "DB_SCHEMA",
  CODE_GENERATOR = "CODE_GENERATOR",
  DEVOPS = "DEVOPS"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string;
  biometricsEnabled: boolean;
  pushNotifications: boolean;
  theme: "light" | "dark";
  balance: number;
  verified: boolean;
  joinedAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  status: string;
  date: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

export interface CodeBlock {
  title: string;
  language: string;
  description: string;
  fileName: string;
  category: "frontend" | "backend" | "config";
  code: string;
}

export interface ApiEndpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  authRequired: boolean;
  bodyTemplate?: string;
  responseTemplate: string;
}
