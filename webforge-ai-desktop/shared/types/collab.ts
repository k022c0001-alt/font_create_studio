/**
 * Collaboration Types
 * WebSocket通信の型定義
 */

export enum OperationType {
  INSERT_GLYPH = "insert_glyph",
  DELETE_GLYPH = "delete_glyph",
  MODIFY_METRICS = "modify_metrics",
  MODIFY_STROKE = "modify_stroke",
  MOVE_POINT = "move_point",
  ADD_POINT = "add_point",
  DELETE_POINT = "delete_point",
  MODIFY_COLOR = "modify_color",
}

export interface Operation {
  id: string;
  type: OperationType;
  user_id: string;
  session_id: string;
  project_id: string;
  glyph_id: string;
  timestamp: number;
  content: Record<string, any>;
  client_version: number;
}

export interface UserSession {
  user_id: string;
  session_id: string;
  cursor_position: { x: number; y: number };
  selected_glyph: string | null;
}

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface PresenceUpdate {
  type: "cursor_moved" | "user_joined" | "user_left";
  user_id: string;
  session_id: string;
  cursor?: { x: number; y: number };
  selected_glyph?: string | null;
  active_users?: UserSession[];
}

export interface RemoteOperation {
  type: "remote_operation";
  operation: Operation;
  sender_user_id: string;
}

export interface SyncResponse {
  type: "sync_response";
  operations: Operation[];
  server_version: number;
}
