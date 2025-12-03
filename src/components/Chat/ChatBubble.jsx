import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Badge,
  Button,
  Drawer,
  Input,
  List,
  Avatar,
  Spin,
  Tooltip,
} from "antd";
import {
  MessageOutlined,
  ReloadOutlined,
  WifiOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMessagingState } from "../../context/messagingStateContext";
import { CLIENT_METHODS } from "../../services/signalR/message/constants/hubMethods";
import { LIFECYCLE_METHODS } from "../../services/signalR/message/constants/lifecycleMethods";
import messageService from "../../services/messageService";
import MessageDetailDrawer from "./MessageDetailDrawer";
import CreateConversationModal from "./CreateConversationModal";
import Cookies from "js-cookie";

const { Search } = Input;

// Helper to decode JWT and get current user info
const getCurrentUserFromToken = () => {
  try {
    const accessToken = Cookies.get("accessToken");
    if (!accessToken) return null;

    const parts = accessToken.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const paddedPayload = payload + "===".slice((payload.length + 3) % 4);
    const decoded = atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(decoded);

    return {
      id: parsed.sub || parsed.userId,
      name:
        parsed["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        parsed.name ||
        "Bạn",
      avatarUrl: parsed.AvatarUrl || null,
      role:
        parsed[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        parsed.role ||
        null,
    };
  } catch (error) {
    console.error("Error decoding user token:", error);
    return null;
  }
};

// Helper to format last message content
const formatLastMessageContent = (message) => {
  if (!message) return "Chưa có tin nhắn";

  const isDeleted = message.status === "Deleted" || message.isDeleted;
  if (isDeleted) return "Tin nhắn này đã bị xóa";

  // Check if message is an image
  if (
    message.mediaType === "Image" ||
    message.lastMessageMediaType === "Image"
  ) {
    const senderName = message.senderName || message.lastMessageSenderName;
    return senderName ? `${senderName} đã gửi 1 hình ảnh` : "Đã gửi 1 hình ảnh";
  }

  // Return text content for other message types
  return message.content || message.lastMessageContent || "Chưa có tin nhắn";
};

// Minimal web version of your React Native MessageScreen,
// shown inside a floating drawer.
export default function ChatBubble() {
  const { messagingService, connectionStatus } = useMessagingState();

  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userPresences, setUserPresences] = useState({});
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const conversationsRef = useRef(conversations);
  const searchQueryRef = useRef(searchQuery);
  const currentUser = useMemo(() => getCurrentUserFromToken(), []);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  const fetchConversations = useCallback(
    async (isRefresh = false) => {
      if (loading) return;
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);

        const params = {
          pageNumber: 1,
          pageSize: 20,
        };

        const response = await messageService.getConversations(params);
        const fetchedConversations =
          response.data?.items || response.items || [];
        console.log("fetchedConversations", fetchedConversations);
        const processed = fetchedConversations.map((conv) => {
          return {
            ...conv,
            lastMessageContent: formatLastMessageContent({
              status: conv.lastMessageStatus,
              isDeleted: conv.lastMessageIsDeleted,
              mediaType: conv.lastMessageMediaType,
              content: conv.lastMessageContent,
              senderName: conv.lastMessageSenderName,
            }),
            // Initialize unreadCount if not provided by API
            unreadCount:
              conv.unreadCount !== undefined
                ? conv.unreadCount
                : conv.isRead === false
                ? 1
                : 0,
          };
        });

        setConversations(processed);
        setFilteredConversations(processed);
      } catch (e) {
        console.error("Error fetching conversations:", e);
      } finally {
        setTimeout(() => {
          setLoading(false);
          setRefreshing(false);
        }, 500);
      }
    },
    [loading]
  );

  // Basic mapping from incoming messages -> conversation preview
  const findAndUpdateConversation = useCallback(
    (message) => {
      const conversationId = message.conversationId;
      const isMessageFromOtherUser = message.senderId !== currentUser?.id;
      const isConversationOpen =
        selectedConversation?.id === conversationId ||
        selectedConversation?.id?.toString() === conversationId?.toString();

      setConversations((prev) => {
        const convo = prev.find(
          (conv) =>
            conv.id === conversationId ||
            conv.id?.toString() === conversationId?.toString()
        );

        const isDeleted = message.status === "Deleted" || message.isDeleted;

        if (convo) {
          const updated = prev.map((conv) => {
            if (
              conv.id === conversationId ||
              conv.id?.toString() === conversationId?.toString()
            ) {
              return {
                ...conv,
                lastMessageContent: formatLastMessageContent({
                  ...message,
                  isDeleted,
                }),
                lastMessageSenderName: message.senderName,
                lastMessageSenderId: message.senderId,
                lastMessageId: message.id,
                lastMessageMediaType: message.mediaType,
                updatedAt: message.createdAt,
                // Mark as unread if message is from another user and conversation is not open
                isRead:
                  isMessageFromOtherUser && !isConversationOpen
                    ? false
                    : conv.isRead,
                // Increment unread count if message is from another user and conversation is not open
                unreadCount:
                  isMessageFromOtherUser && !isConversationOpen
                    ? (conv.unreadCount || 0) + 1
                    : isConversationOpen
                    ? 0
                    : conv.unreadCount || 0,
              };
            }
            return conv;
          });

          return updated.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        }

        if (message.newConversation) {
          const newConversation = {
            id: conversationId,
            isGroup: message.newConversation.isGroup || false,
            title: message.senderName || message.newConversation.title,
            updatedAt: message.createdAt,
            lastMessageContent: formatLastMessageContent({
              ...message,
              isDeleted,
            }),
            lastMessageSenderName: message.senderName,
            lastMessageSenderId: message.senderId,
            lastMessageMediaType: message.mediaType,
            conversationImg: message.newConversation.conversationImg || null,
            // Mark as unread if message is from another user
            isRead: !isMessageFromOtherUser,
            // Set unread count to 1 if message is from another user
            unreadCount: isMessageFromOtherUser ? 1 : 0,
          };

          const merged = [...prev, newConversation];
          return merged.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        }

        return prev;
      });

      const currentSearchQuery = searchQueryRef.current;
      if (currentSearchQuery) {
        setFilteredConversations((prev) => {
          const convo = prev.find(
            (conv) =>
              conv.id === conversationId ||
              conv.id?.toString() === conversationId?.toString()
          );

          const isDeleted = message.status === "Deleted" || message.isDeleted;

          if (convo) {
            const updated = prev.map((conv) => {
              if (
                conv.id === conversationId ||
                conv.id?.toString() === conversationId?.toString()
              ) {
                return {
                  ...conv,
                  lastMessageContent: formatLastMessageContent({
                    ...message,
                    isDeleted,
                  }),
                  lastMessageSenderName: message.senderName,
                  lastMessageSenderId: message.senderId,
                  lastMessageId: message.id,
                  lastMessageMediaType: message.mediaType,
                  updatedAt: message.createdAt,
                  // Mark as unread if message is from another user and conversation is not open
                  isRead:
                    isMessageFromOtherUser && !isConversationOpen
                      ? false
                      : conv.isRead,
                  // Increment unread count if message is from another user and conversation is not open
                  unreadCount:
                    isMessageFromOtherUser && !isConversationOpen
                      ? (conv.unreadCount || 0) + 1
                      : isConversationOpen
                      ? 0
                      : conv.unreadCount || 0,
                };
              }
              return conv;
            });

            return updated.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          }
          return prev;
        });
      }
    },
    [currentUser, selectedConversation]
  );

  // Subscribe to real-time events (similar to RN)
  useEffect(() => {
    if (!messagingService) return;

    const handleMessageReceived = (message) => {
      findAndUpdateConversation(message);
    };

    const handleMessageUpdated = (updatedMessage) => {
      const isDeleted =
        updatedMessage.status === "Deleted" || updatedMessage.isDeleted;

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === updatedMessage.conversationId) {
            if (
              !conv.lastMessageId ||
              conv.lastMessageId === updatedMessage.id
            ) {
              return {
                ...conv,
                lastMessageContent: formatLastMessageContent({
                  status: updatedMessage.status,
                  isDeleted,
                  mediaType:
                    updatedMessage.mediaType || conv.lastMessageMediaType,
                  content: updatedMessage.newContent || updatedMessage.content,
                  senderName: conv.lastMessageSenderName,
                }),
                lastMessageId: updatedMessage.id,
              };
            }
          }
          return conv;
        })
      );

      setFilteredConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === updatedMessage.conversationId) {
            if (
              !conv.lastMessageId ||
              conv.lastMessageId === updatedMessage.id
            ) {
              return {
                ...conv,
                lastMessageContent: formatLastMessageContent({
                  status: updatedMessage.status,
                  isDeleted,
                  mediaType:
                    updatedMessage.mediaType || conv.lastMessageMediaType,
                  content: updatedMessage.newContent || updatedMessage.content,
                  senderName: conv.lastMessageSenderName,
                }),
                lastMessageId: updatedMessage.id,
              };
            }
          }
          return conv;
        })
      );
    };

    const handleReconnecting = () => {
      fetchConversations(false);
    };

    const handleUserPresenceUpdate = (presenceData) => {
      console.log("⚪ SignalR Event: USER_PRESENCE_UPDATE", presenceData);
      setUserPresences((prev) => ({
        ...prev,
        [presenceData.userId]: presenceData.isOnline,
      }));
    };

    messagingService.onEvent(
      CLIENT_METHODS.MESSAGE_RECEIVED,
      handleMessageReceived
    );
    messagingService.onEvent(
      CLIENT_METHODS.MESSAGE_UPDATED,
      handleMessageUpdated
    );
    messagingService.onEvent(
      CLIENT_METHODS.USER_PRESENCE_UPDATE,
      handleUserPresenceUpdate
    );
    messagingService.onEvent(
      LIFECYCLE_METHODS.ON_RECONNECTING,
      handleReconnecting
    );

    return () => {
      messagingService.offEvent(
        CLIENT_METHODS.MESSAGE_RECEIVED,
        handleMessageReceived
      );
      messagingService.offEvent(
        CLIENT_METHODS.MESSAGE_UPDATED,
        handleMessageUpdated
      );
      messagingService.offEvent(
        CLIENT_METHODS.USER_PRESENCE_UPDATE,
        handleUserPresenceUpdate
      );
      messagingService.offEvent(
        LIFECYCLE_METHODS.ON_RECONNECTING,
        handleReconnecting
      );
    };
  }, [messagingService, findAndUpdateConversation, fetchConversations]);

  // Simple search
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFilteredConversations(conversationsRef.current);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = conversationsRef.current.filter((conv) => {
      const title = conv.title || "";
      return title.toLowerCase().includes(lower);
    });
    setFilteredConversations(filtered);
  }, []);

  useEffect(() => {
    // keep filtered in sync when no search
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    }
  }, [conversations, searchQuery]);

  const unreadCount = useMemo(
    () => conversations.filter((c) => !c.isRead).length,
    [conversations]
  );

  const renderHeaderStatus = () => {
    const icon =
      connectionStatus === "connected" ? (
        <WifiOutlined style={{ color: "#22c55e" }} />
      ) : (
        <WifiOutlined style={{ color: "#f97316" }} />
      );

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span
            style={{
              fontSize: 13,
              color: connectionStatus === "connected" ? "#16a34a" : "#ea580c",
            }}
          >
            {connectionStatus === "connected"
              ? "Đã kết nối"
              : connectionStatus === "reconnecting"
              ? "Đang kết nối lại..."
              : "Ngoại tuyến"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Tooltip title="Làm mới danh sách">
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => fetchConversations(true)}
            />
          </Tooltip>
          <Tooltip title="Bắt đầu cuộc trò chuyện mới">
            <Button
              size="small"
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
              }}
            />
          </Tooltip>
        </div>
      </div>
    );
  };

  const renderList = () => {
    if (loading && !refreshing && !conversations.length) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 200,
            gap: 8,
          }}
        >
          <Spin />
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Đang tải cuộc trò chuyện...
          </span>
        </div>
      );
    }

    return (
      <List
        dataSource={filteredConversations}
        itemLayout="horizontal"
        renderItem={(item) => {
          // Determine if any user in the conversation is online
          let isOnline = false;

          // For group conversations, check if any member (except current user) is online
          if (item.members && Array.isArray(item.members)) {
            isOnline = item.members.some(
              (m) =>
                m.userId !== currentUser?.id && userPresences[m.userId] === true
            );
          } else if (item.participants && Array.isArray(item.participants)) {
            // Alternative field name for participants
            isOnline = item.participants.some((p) => {
              const userId = p.userId || p.id;
              return (
                userId !== currentUser?.id && userPresences[userId] === true
              );
            });
          } else if (item.lastMessageSenderId) {
            // For one-on-one conversations, use the last message sender
            // If it's not the current user, check their online status
            if (item.lastMessageSenderId !== currentUser?.id) {
              isOnline = userPresences[item.lastMessageSenderId] === true;
            }
          }

          return (
            <List.Item
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedConversation(item);
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge
                    dot={isOnline}
                    status={isOnline ? "success" : "default"}
                    offset={[-2, 2]}
                  >
                    <Avatar src={item.conversationImg}>
                      {item.title?.[0]?.toUpperCase()}
                    </Avatar>
                  </Badge>
                }
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{item.title}</span>
                    {!item.isRead && (item.unreadCount || 0) > 0 && (
                      <Badge
                        count={item.unreadCount || 1}
                        style={{ backgroundColor: "#ef4444" }}
                      />
                    )}
                  </div>
                }
                description={
                  <span style={{ fontSize: 12, color: "#6b7280" }}>
                    {item.lastMessageContent || "Chưa có tin nhắn"}
                  </span>
                }
              />
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <>
      <Badge count={unreadCount} offset={[-4, 4]}>
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          size="large"
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 1000,
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
            background:
              "linear-gradient(135deg, rgba(248,113,113,1), rgba(249,115,22,1))",
            border: "none",
          }}
          onClick={() => {
            setOpen(true);
            if (!conversations.length) {
              fetchConversations(true);
            }
          }}
        />
      </Badge>

      <Drawer
        title="Tin nhắn"
        placement="right"
        width={360}
        onClose={() => setOpen(false)}
        open={open}
        destroyOnClose
      >
        {renderHeaderStatus()}
        <Search
          placeholder="Tìm kiếm cuộc trò chuyện"
          allowClear
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        {renderList()}
      </Drawer>

      <MessageDetailDrawer
        open={!!selectedConversation}
        conversation={selectedConversation}
        onClose={() => setSelectedConversation(null)}
        onMessagesRead={(conversationId) => {
          // Mark conversation as read when messages are read
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId ||
              conv.id?.toString() === conversationId?.toString()
                ? { ...conv, isRead: true, unreadCount: 0 }
                : conv
            )
          );
          setFilteredConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId ||
              conv.id?.toString() === conversationId?.toString()
                ? { ...conv, isRead: true, unreadCount: 0 }
                : conv
            )
          );
        }}
      />

      <CreateConversationModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConversationCreated={(conversation) => {
          if (!conversation) return;
          setConversations((prev) => {
            const exists = prev.some((c) => c.id === conversation.id);
            if (exists) return prev;
            const merged = [...prev, conversation];
            return merged.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          });
          setFilteredConversations((prev) => {
            const exists = prev.some((c) => c.id === conversation.id);
            if (exists) return prev;
            const merged = [...prev, conversation];
            return merged.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          });
          setSelectedConversation(conversation);
        }}
      />
    </>
  );
}
