/**
 * Collaboration IPC Channels
 * Electron IPC通信用チャンネル名（定数化）
 */

export const COLLAB_CHANNELS = {
  // WebSocket接続
  CONNECT_COLLAB: 'collab:connect',
  DISCONNECT_COLLAB: 'collab:disconnect',
  
  // 操作送信
  SEND_OPERATION: 'collab:send-operation',
  SEND_PRESENCE: 'collab:send-presence',
  
  // イベント受信
  REMOTE_OPERATION: 'collab:remote-operation',
  PRESENCE_UPDATED: 'collab:presence-updated',
  CONNECTION_STATUS: 'collab:connection-status',
  
  // ユーザー管理
  ACTIVE_USERS_CHANGED: 'collab:active-users-changed',
  USER_JOINED: 'collab:user-joined',
  USER_LEFT: 'collab:user-left',
} as const;
