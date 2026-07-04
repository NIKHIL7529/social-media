"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { API_URL } from "@/lib/api";
import type { Chat, ChatMessage } from "@/types/social";

type RealtimeStatus = "connecting" | "connected" | "disconnected" | "error";

type OnlineUser = {
  user: string;
};

type UseChatRealtimeOptions = {
  enabled: boolean;
  activeChatId: string | null;
  onMessage: (message: ChatMessage & { chatId: string }) => void;
  onGroup: (chat: Chat) => void;
  onOnlineUsers: (users: OnlineUser[]) => void;
  onTyping: (event: { chatId: string; user: string; isTyping: boolean }) => void;
};

function wsUrl() {
  const url = new URL(API_URL);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws/chat";
  url.search = "";
  return url.toString();
}

export function useChatRealtime({
  enabled,
  onMessage,
  onGroup,
  onOnlineUsers,
  onTyping,
}: UseChatRealtimeOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const initialConnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptRef = useRef(0);
  const intentionalCloseRef = useRef(false);
  const handlersRef = useRef({
    onMessage,
    onGroup,
    onOnlineUsers,
    onTyping,
  });
  const [status, setStatus] = useState<RealtimeStatus>("disconnected");

  useEffect(() => {
    handlersRef.current = {
      onMessage,
      onGroup,
      onOnlineUsers,
      onTyping,
    };
  }, [onGroup, onMessage, onOnlineUsers, onTyping]);

  const cleanupReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (initialConnectTimerRef.current) {
      window.clearTimeout(initialConnectTimerRef.current);
      initialConnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.readyState === WebSocket.OPEN || socketRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    cleanupReconnect();
    intentionalCloseRef.current = false;
    const socket = new WebSocket(wsUrl());
    socketRef.current = socket;
    setStatus("connecting");

    socket.onopen = () => {
      reconnectAttemptRef.current = 0;
      setStatus("connected");
    };

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "online_users") {
        handlersRef.current.onOnlineUsers(payload.users || []);
      }
      if (payload.type === "typing") {
        handlersRef.current.onTyping({
          chatId: payload.chatId,
          user: payload.sender,
          isTyping: Boolean(payload.isTyping),
        });
      }
      if (payload.type === "message" && payload.message) {
        handlersRef.current.onMessage({ ...payload.message, chatId: payload.chatId });
      }
      if (payload.type === "group") {
        handlersRef.current.onGroup(payload.chat);
      }
    };

    socket.onerror = () => {
      setStatus("error");
    };

    socket.onclose = (event) => {
      socketRef.current = null;
      setStatus("disconnected");
      if (intentionalCloseRef.current) {
        return;
      }
      if (event.code === 1008) {
        toast.error("Realtime session expired. Login again to use live chat.");
        return;
      }
      if (!enabled) return;
      const delay = Math.min(1000 * 2 ** reconnectAttemptRef.current, 15000);
      reconnectAttemptRef.current += 1;
      reconnectTimerRef.current = window.setTimeout(connect, delay);
    };
  }, [cleanupReconnect, enabled]);

  useEffect(() => {
    if (enabled) {
      initialConnectTimerRef.current = window.setTimeout(connect, 75);
    }
    return () => {
      cleanupReconnect();
      intentionalCloseRef.current = true;
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [cleanupReconnect, connect, enabled]);

  const send = useCallback((payload: Record<string, unknown>) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      return false;
    }
    socketRef.current.send(JSON.stringify(payload));
    return true;
  }, []);

  return { status, send };
}
