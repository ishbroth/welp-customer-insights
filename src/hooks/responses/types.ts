
export interface Response {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  authorAvatar?: string;
}

export interface ConversationStatus {
  canRespond: boolean;
  isMyTurn: boolean;
}
