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
          // Determine if conversation is read based on API response or last message sender
          const isRead =
            conv.isRead !== undefined
              ? conv.isRead
              : conv.lastMessageSenderId === currentUser?.id;

          return {
            ...conv,
            isRead,
            lastMessageContent: formatLastMessageContent({
              status: conv.lastMessageStatus,
              isDeleted: conv.lastMessageIsDeleted,
              mediaType: conv.lastMessageMediaType,
              content: conv.lastMessageContent,
              senderName: conv.lastMessageSenderName,
            }),
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
    [loading, currentUser]
  );

  // Basic mapping from incoming messages -> conversation preview
  const findAndUpdateConversation = useCallback(
    (message) => {
      const conversationId = message.conversationId;
      console.log("ChatBubble: Updating conversation:", conversationId);

      setConversations((prev) => {
        const convo = prev.find((conv) => {
          const matches =
            conv.id === conversationId ||
            conv.id?.toString() === conversationId?.toString();
          return matches;
        });

        const isDeleted = message.status === "Deleted" || message.isDeleted;

        if (convo) {
          // Update existing conversation
          const updatedConversations = prev.map((conv) => {
            if (
              conv.id === conversationId ||
              conv.id?.toString() === conversationId?.toString()
            ) {
              return {
                ...conv,
                lastMessageContent: isDeleted
                  ? "Tin nhắn này đã bị xóa"
                  : formatLastMessageContent(message),
                lastMessageType: message.messageType,
                lastMessageMediaType: message.mediaType,
                lastMessageSenderName: message.senderName,
                lastMessageSenderId: message.senderId,
                lastMessageId: message.id,
                lastMessageStatus: message.status,
                lastMessageIsDeleted: isDeleted,
                updatedAt: message.createdAt,
                isRead: message.senderId === currentUser?.id,
              };
            }
            return conv;
          });

          // Sort by latest message time
          return updatedConversations.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        } else {
          // Add new conversation if message includes conversation data
          if (message.newConversation) {
            console.log("ChatBubble: Adding new conversation");
            const newConversation = {
              id: conversationId,
              isGroup: message.newConversation.isGroup || false,
              isRead: false,
              title: message.senderName || message.newConversation.title,
              updatedAt: message.createdAt,
              lastMessageContent: isDeleted
                ? "Tin nhắn này đã bị xóa"
                : formatLastMessageContent(message),
              lastMessageType: message.messageType,
              lastMessageMediaType: message.mediaType,
              lastMessageSenderName: message.senderName,
              lastMessageSenderId: message.senderId,
              lastMessageId: message.id,
              lastMessageStatus: message.status,
              lastMessageIsDeleted: isDeleted,
              conversationImg: message.newConversation.conversationImg || null,
            };

            const newConversations = [...prev, newConversation];
            return newConversations.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          }

          return prev;
        }
      });

      // Also update filtered conversations if search is active
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
            const updatedConversations = prev.map((conv) => {
              if (
                conv.id === conversationId ||
                conv.id?.toString() === conversationId?.toString()
              ) {
                return {
                  ...conv,
                  lastMessageContent: isDeleted
                    ? "Tin nhắn này đã bị xóa"
                    : formatLastMessageContent(message),
                  lastMessageType: message.messageType,
                  lastMessageMediaType: message.mediaType,
                  lastMessageSenderName: message.senderName,
                  lastMessageSenderId: message.senderId,
                  lastMessageId: message.id,
                  lastMessageStatus: message.status,
                  lastMessageIsDeleted: isDeleted,
                  updatedAt: message.createdAt,
                  isRead: message.senderId === currentUser?.id,
                };
              }
              return conv;
            });

            return updatedConversations.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          }

          return prev;
        });
      }
    },
    [currentUser]
  );

  // Subscribe to real-time events (similar to RN)
  useEffect(() => {
    if (!messagingService) return;

    const handleMessageReceived = (message) => {
      findAndUpdateConversation(message);
    };

    const handleMessageUpdated = (updatedMessage) => {
      console.log("ChatBubble: Message updated", updatedMessage);
      const isDeleted =
        updatedMessage.status === "Deleted" || updatedMessage.isDeleted;

      const updatedContent = isDeleted
        ? "Tin nhắn này đã bị xóa"
        : formatLastMessageContent({
            ...updatedMessage,
            content: updatedMessage.newContent || updatedMessage.content,
            mediaType:
              updatedMessage.mediaType || updatedMessage.lastMessageMediaType,
          });

      // Update conversation's last message content
      setConversations((prev) =>
        prev.map((conv) => {
          // Match by conversationId and either lastMessageId or if it's the most recent
          if (conv.id === updatedMessage.conversationId) {
            // Update if lastMessageId matches, or if no lastMessageId is set
            if (
              !conv.lastMessageId ||
              conv.lastMessageId === updatedMessage.id
            ) {
              console.log("ChatBubble: Updating conversation preview", conv.id);
              return {
                ...conv,
                lastMessageContent: updatedContent,
                lastMessageId: updatedMessage.id,
                lastMessageStatus: updatedMessage.status,
                lastMessageIsDeleted: isDeleted,
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
                lastMessageContent: updatedContent,
                lastMessageId: updatedMessage.id,
                lastMessageStatus: updatedMessage.status,
                lastMessageIsDeleted: isDeleted,
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

  const unreadCount = useMemo(() => {
    const count = conversations.filter((c) => !c.isRead).length;
    console.log("Unread count:", count, "Conversations:", conversations);
    return count;
  }, [conversations]);

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
              onClick={async () => {
                // Mark conversation as read when opened
                if (!item.isRead) {
                  try {
                    await messageService.markAsRead({
                      conversationId: item.id,
                      messageIds: [],
                    });
                    // Update local state
                    setConversations((prev) =>
                      prev.map((c) =>
                        c.id === item.id ? { ...c, isRead: true } : c
                      )
                    );
                    setFilteredConversations((prev) =>
                      prev.map((c) =>
                        c.id === item.id ? { ...c, isRead: true } : c
                      )
                    );
                  } catch (error) {
                    console.error("Error marking conversation as read:", error);
                  }
                }
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
                    {!item.isRead && <Badge dot />}
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
      <div
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1000,
        }}
      >
        <Badge count={unreadCount} offset={[-8, 8]} showZero={false}>
          <Button
            type="primary"
            shape="circle"
            icon={<MessageOutlined />}
            size="large"
            style={{
              width: 64,
              height: 64,
              fontSize: 28,
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
      </div>

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
