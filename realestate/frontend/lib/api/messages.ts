import { apiClient } from "./client";
import { ChatMessage, Conversation } from "./domain-types";

export interface SendMessageInput {
  toUserId: string;
  propertyId?: string;
  body: string;
}

export const messagesApi = {
  conversations: () => apiClient.get<{ conversations: Conversation[] }>("/messages/conversations"),
  thread: (conversationId: string) =>
    apiClient.get<{ messages: ChatMessage[] }>(`/messages/conversations/${conversationId}`),
  send: (input: SendMessageInput) =>
    apiClient.post<{ message: string; conversationId: string; chatMessage: ChatMessage }>(
      "/messages",
      input,
    ),
};
