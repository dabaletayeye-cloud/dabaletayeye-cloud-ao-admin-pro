import { apiAdapter } from './adapter';
export { AUTO_REPLIES, INIT_CONVERSATIONS, fmtTime, fmtMsgTime } from '../data/chatData';
export type { Conversation, ChatMessage } from '../data/chatData';
export const getChatData = () => apiAdapter.getChatData();
