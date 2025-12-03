import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Drawer,
  List,
  Input,
  Button,
  Spin,
  Typography,
  Avatar,
  Modal,
  message as antMessage,
  Upload,
  Popover,
  Divider,
} from "antd";
import {
  SendOutlined,
  PictureOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CloseOutlined,
  SmileOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import { useMessagingState } from "../../context/messagingStateContext";
import messageService from "../../services/messageService";
import {
  CLIENT_METHODS,
  HUB_METHODS,
} from "../../services/signalR/message/constants/hubMethods";
import { LIFECYCLE_METHODS } from "../../services/signalR/message/constants/lifecycleMethods";
import Cookies from "js-cookie";

const { Text } = Typography;
const { TextArea } = Input;

// Helper to format message time
const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86400000);

  // Today - show time only
  if (diffDays === 0) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // Yesterday
  if (diffDays === 1) {
    return `Hôm qua ${date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
  // This week
  if (diffDays < 7) {
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  // Older - show date and time
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper to check if message is edited
const isMessageEdited = (msg) => {
  if (!msg.createdAt || !msg.updatedAt) return false;
  // Message is edited if updatedAt is different from createdAt (with some tolerance for server timing)
  const createdAt = new Date(msg.createdAt).getTime();
  const updatedAt = new Date(msg.updatedAt).getTime();
  // Allow 2 seconds difference for server processing
  return updatedAt - createdAt > 2000 || msg.isEdited === true;
};

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

export default function MessageDetailDrawer({
  open,
  onClose,
  conversation,
  onMessagesRead,
}) {
  const { messagingService, connectionStatus } = useMessagingState();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [input, setInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [typingStatus, setTypingStatus] = useState(null);
  const [userPresence, setUserPresence] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fetchingRef = useRef(false);
  const fetchMessagesRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const previousScrollHeightRef = useRef(0);
  const textAreaRef = useRef(null);
  const currentUser = useMemo(() => getCurrentUserFromToken(), []);

  const conversationId = conversation?.id;
  const isConnected = connectionStatus === "connected";

  const reactions = useMemo(() => ["❤️", "👍", "😂", "😮", "😢", "🙏"], []);

  // Fetch messages
  const fetchMessages = useCallback(
    async (page = 1, isInitial = false) => {
      if (!conversationId || fetchingRef.current) return;
      try {
        fetchingRef.current = true;
        setLoading(true);
        const params = {
          page: page,
          size: 20,
        };
        const response = await messageService.getMessages(
          conversationId,
          params
        );
        console.log("response", response);
        // Response structure: { status, message, data: [...] }
        const items = response.data;
        console.log("items", items);

        const processed = items.map((msg) => {
          const isDeleted = msg.status === "Deleted" || msg.isDeleted;
          const isOwn = msg.senderId === currentUser?.id;
          return {
            ...msg,
            content: isDeleted ? "Tin nhắn này đã bị xóa" : msg.content,
            isOwn,
          };
        });

        console.log("processed", processed);

        if (isInitial) {
          const reversed = [...processed].reverse();
          console.log("Setting initial messages:", reversed);
          setMessages(reversed);
          setPageNumber(1);
          setHasMore(processed.length >= 20);
        } else {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const uniqueNew = processed.filter((m) => !existingIds.has(m.id));
            const reversed = [...uniqueNew].reverse();
            // When loading more (older messages), prepend to the beginning
            return [...reversed, ...prev];
          });
          setHasMore(processed.length >= 20);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Reset loadingMoreRef on error
        if (!isInitial) {
          loadingMoreRef.current = false;
        }
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [conversationId, currentUser]
  );

  // Keep ref updated
  useEffect(() => {
    fetchMessagesRef.current = fetchMessages;
  }, [fetchMessages]);

  // Scroll to bottom when messages are loaded (only if not loading more)
  useEffect(() => {
    if (messages.length > 0 && listRef.current && !loadingMoreRef.current) {
      setTimeout(() => {
        if (listRef.current && !loadingMoreRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages.length]);

  // Join group and fetch on open
  useEffect(() => {
    if (!open || !conversationId || !messagingService) return;

    let mounted = true;

    (async () => {
      try {
        console.log("🟢 JOIN_GROUP: Joining conversation group", {
          conversationId: conversationId.toString(),
          conversationTitle: conversation?.title,
        });
        await messagingService.joinGroup(conversationId.toString());
        console.log("✅ JOIN_GROUP: Successfully joined conversation group", {
          conversationId: conversationId.toString(),
        });
        if (mounted && fetchMessagesRef.current) {
          await fetchMessagesRef.current(1, true);
        }
      } catch (e) {
        console.error("❌ JOIN_GROUP: Error joining group:", e, {
          conversationId: conversationId.toString(),
        });
      }
    })();

    return () => {
      mounted = false;
      fetchingRef.current = false;
      loadingMoreRef.current = false;
      previousScrollHeightRef.current = 0;
      if (messagingService && conversationId) {
        console.log("🔴 LEAVE_GROUP: Leaving conversation group", {
          conversationId: conversationId.toString(),
          conversationTitle: conversation?.title,
        });
        messagingService
          .leaveGroup(conversationId.toString())
          .then(() => {
            console.log(
              "✅ LEAVE_GROUP: Successfully left conversation group",
              {
                conversationId: conversationId.toString(),
              }
            );
          })
          .catch((error) => {
            console.error("❌ LEAVE_GROUP: Error leaving group:", error, {
              conversationId: conversationId.toString(),
            });
          });
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        messagingService
          .invokeHubMethod(HUB_METHODS.USER_TYPING, {
            conversationId: conversationId.toString(),
            isTyping: false,
          })
          .catch(() => {});
      }
      setMessages([]);
      setPageNumber(1);
      setHasMore(true);
      setInput("");
      setReplyingTo(null);
      setEditingMessage(null);
      setTypingStatus(null);
    };
  }, [open, conversationId, messagingService, conversation]);

  // Mark as read
  const markAsRead = useCallback(async () => {
    if (!conversationId || !currentUser) return;
    try {
      const unreadIds = messages
        .filter((m) => m.senderId !== currentUser.id && !m.isRead)
        .map((m) => m.id)
        .filter(Boolean);

      if (unreadIds.length > 0) {
        await messageService.markAsRead({
          conversationId,
          messageIds: unreadIds,
        });
        // Notify parent that messages have been marked as read
        if (onMessagesRead) {
          onMessagesRead(conversationId);
        }
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, [conversationId, messages, currentUser, onMessagesRead]);

  // Mark as read when messages change
  useEffect(() => {
    if (messages.length > 0 && currentUser) {
      markAsRead();
    }
  }, [messages, currentUser, markAsRead]);

  // Mark conversation as read when drawer opens
  useEffect(() => {
    if (open && conversationId && onMessagesRead) {
      onMessagesRead(conversationId);
    }
  }, [open, conversationId, onMessagesRead]);

  // Auto-focus text area when drawer opens
  useEffect(() => {
    if (open && textAreaRef.current) {
      // Small delay to ensure drawer is fully rendered
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Auto-cancel reply if the replied message is deleted
  useEffect(() => {
    if (replyingTo) {
      const repliedMsg = messages.find((m) => m.id === replyingTo.id);
      const isRepliedMsgDeleted =
        repliedMsg?.isDeleted || repliedMsg?.status === "Deleted";
      if (isRepliedMsgDeleted) {
        setReplyingTo(null);
      }
    }
  }, [messages, replyingTo]);

  // Subscribe to SignalR events
  useEffect(() => {
    if (!messagingService || !conversationId) return;

    const handleMessageReceived = (message) => {
      console.log("🔵 SignalR Event: MESSAGE_RECEIVED", message);
      if (
        message.conversationId === conversationId ||
        message.conversationId?.toString() === conversationId?.toString()
      ) {
        const isDeleted = message.status === "Deleted" || message.isDeleted;
        const isOwn = message.senderId === currentUser?.id;
        setMessages((prev) => {
          // Check if message already exists
          if (prev.some((m) => m.id === message.id)) return prev;

          // If this is our own message, try to replace optimistic message
          if (isOwn) {
            const optimisticIndex = prev.findIndex(
              (m) =>
                m.id?.startsWith("temp-") &&
                ((m.mediaType === "Image" &&
                  (m.mediaUrl?.includes("blob:") ||
                    message.mediaUrl === m.mediaUrl ||
                    message.content === m.content)) ||
                  (m.mediaType !== "Image" &&
                    (m.content === message.content ||
                      m.mediaUrl === message.mediaUrl))) &&
                m.senderId === currentUser?.id
            );

            if (optimisticIndex !== -1) {
              // Replace optimistic message with real one
              const optimisticMsg = prev[optimisticIndex];
              // Revoke preview URL if it exists
              if (optimisticMsg.mediaUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(optimisticMsg.mediaUrl);
              }
              const newMessages = [...prev];
              newMessages[optimisticIndex] = {
                ...message,
                content: isDeleted ? "Tin nhắn này đã bị xóa" : message.content,
                isOwn,
              };
              return newMessages;
            }
          }

          // Add new message
          return [
            ...prev,
            {
              ...message,
              content: isDeleted ? "Tin nhắn này đã bị xóa" : message.content,
              isOwn,
            },
          ];
        });

        if (message.senderId !== currentUser?.id) {
          markAsRead();
        }

        // Scroll to bottom
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, 100);
      }
    };

    const handleMessageUpdated = (updatedMessage) => {
      console.log("🟢 SignalR Event: MESSAGE_UPDATED", updatedMessage);
      if (updatedMessage.conversationId === conversationId) {
        const isDeleted =
          updatedMessage.status === "Deleted" || updatedMessage.isDeleted;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id
              ? {
                  ...msg,
                  content: isDeleted
                    ? "Tin nhắn này đã bị xóa"
                    : updatedMessage.newContent ||
                      updatedMessage.content ||
                      msg.content,
                  isDeleted,
                  status: updatedMessage.status || msg.status,
                }
              : msg
          )
        );
      }
    };

    const handleTyping = (typingData) => {
      console.log("🟡 SignalR Event: USER_TYPING", typingData);
      if (
        typingData.conversationId === conversationId &&
        typingData.userId !== currentUser?.id
      ) {
        setTypingStatus(typingData);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (typingData.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setTypingStatus(null);
          }, 3000);
        }
      }
    };

    const handleStatusUpdate = (statusUpdate) => {
      console.log("🟠 SignalR Event: UPDATE_MESSAGE_STATUS", statusUpdate);
      if (statusUpdate.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((msg) =>
            statusUpdate.messageIds?.includes(msg.id)
              ? { ...msg, deliveryStatus: statusUpdate.status, isRead: true }
              : msg
          )
        );
      }
    };

    const handleReactionReceived = (reactionData) => {
      console.log("🟣 SignalR Event: REACTION_RECEIVED", reactionData);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === reactionData.messageId
            ? { ...msg, reaction: reactionData.reaction }
            : msg
        )
      );
    };

    const handleReactionRemoved = (reactionData) => {
      console.log("🔴 SignalR Event: REACTION_REMOVED", reactionData);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === reactionData.messageId ? { ...msg, reaction: null } : msg
        )
      );
    };

    const handleUserPresenceUpdate = (presenceData) => {
      console.log("⚪ SignalR Event: USER_PRESENCE_UPDATE", presenceData);
      setUserPresence(presenceData);
    };

    const handleReconnecting = () => {
      console.log("🔄 SignalR Event: ON_RECONNECTING");
      fetchMessages(pageNumber, false);
    };

    messagingService.onEvent(
      CLIENT_METHODS.MESSAGE_RECEIVED,
      handleMessageReceived
    );
    messagingService.onEvent(
      CLIENT_METHODS.MESSAGE_UPDATED,
      handleMessageUpdated
    );
    messagingService.onEvent(CLIENT_METHODS.USER_TYPING, handleTyping);
    messagingService.onEvent(
      CLIENT_METHODS.UPDATE_MESSAGE_STATUS,
      handleStatusUpdate
    );
    messagingService.onEvent(
      CLIENT_METHODS.REACTION_RECEIVED,
      handleReactionReceived
    );
    messagingService.onEvent(
      CLIENT_METHODS.REACTION_REMOVED,
      handleReactionRemoved
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
      messagingService.offEvent(CLIENT_METHODS.USER_TYPING, handleTyping);
      messagingService.offEvent(
        CLIENT_METHODS.UPDATE_MESSAGE_STATUS,
        handleStatusUpdate
      );
      messagingService.offEvent(
        CLIENT_METHODS.REACTION_RECEIVED,
        handleReactionReceived
      );
      messagingService.offEvent(
        CLIENT_METHODS.REACTION_REMOVED,
        handleReactionRemoved
      );
      messagingService.offEvent(
        CLIENT_METHODS.USER_PRESENCE_UPDATE,
        handleUserPresenceUpdate
      );
      messagingService.offEvent(
        LIFECYCLE_METHODS.ON_RECONNECTING,
        handleReconnecting
      );
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [
    messagingService,
    conversationId,
    currentUser,
    pageNumber,
    fetchMessages,
    markAsRead,
  ]);

  // Typing indicator
  const handleTyping = useCallback(
    (text) => {
      setInput(text);
      if (isConnected && conversationId && messagingService) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        if (text.length > 0) {
          messagingService
            .invokeHubMethod(HUB_METHODS.USER_TYPING, {
              conversationId: conversationId.toString(),
              isTyping: true,
            })
            .catch(() => {});

          typingTimeoutRef.current = setTimeout(() => {
            if (messagingService && isConnected) {
              messagingService
                .invokeHubMethod(HUB_METHODS.USER_TYPING, {
                  conversationId: conversationId.toString(),
                  isTyping: false,
                })
                .catch(() => {});
            }
          }, 3000);
        } else {
          messagingService
            .invokeHubMethod(HUB_METHODS.USER_TYPING, {
              conversationId: conversationId.toString(),
              isTyping: false,
            })
            .catch(() => {});
        }
      }
    },
    [isConnected, conversationId, messagingService]
  );

  // Send message
  const handleSend = useCallback(async () => {
    if (!input.trim() || sending || !conversationId) return;

    const messageContent = input.trim();

    // Edit mode
    if (editingMessage) {
      try {
        setSending(true);
        // Optimistic update: update local state immediately
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessage.id
              ? {
                  ...msg,
                  content: messageContent,
                }
              : msg
          )
        );
        await messageService.updateMessage({
          messageId: editingMessage.id,
          conversationId,
          newContent: messageContent,
        });
        setEditingMessage(null);
        setInput("");
        antMessage.success("Đã cập nhật tin nhắn");
      } catch (error) {
        console.error("Error editing message:", error);
        // Revert optimistic update on error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === editingMessage.id
              ? {
                  ...msg,
                  content: editingMessage.content,
                }
              : msg
          )
        );
        antMessage.error("Không thể cập nhật tin nhắn");
      } finally {
        setSending(false);
      }
      return;
    }

    // Stop typing
    if (isConnected && messagingService && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      messagingService
        .invokeHubMethod(HUB_METHODS.USER_TYPING, {
          conversationId: conversationId.toString(),
          isTyping: false,
        })
        .catch(() => {});
    }

    const replyData = replyingTo
      ? {
          replyToMessageId: replyingTo.id,
          replyToMessageContent: replyingTo.content,
          replyToMessageMediaType: replyingTo.mediaType,
        }
      : {};

    try {
      setSending(true);
      await messageService.sendMessage({
        conversationId,
        content: messageContent,
        mediaType: "Text",
        ...replyData,
      });
      setInput("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      antMessage.error("Không thể gửi tin nhắn");
    } finally {
      setSending(false);
    }
  }, [
    input,
    replyingTo,
    editingMessage,
    conversationId,
    sending,
    isConnected,
    messagingService,
  ]);

  // Upload and send image
  const handleImageUpload = useCallback(
    async (file) => {
      if (!conversationId) return;

      // Create preview URL for optimistic update
      const previewUrl = URL.createObjectURL(file);
      const tempId = `temp-${Date.now()}-${Math.random()}`;

      try {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await messageService.uploadImage(formData);
        if (uploadResponse.status !== "200" || !uploadResponse.data) {
          throw new Error("Upload failed");
        }

        const imageUrl = uploadResponse.data;

        // Optimistic update: add message to local state immediately with preview URL
        const optimisticMessage = {
          id: tempId,
          conversationId,
          content: previewUrl, // Use preview URL for immediate display
          mediaType: "Image",
          mediaUrl: previewUrl, // Use preview URL for immediate display
          senderId: currentUser?.id,
          senderName: currentUser?.name || "Bạn",
          senderAvatarUrl: currentUser?.avatarUrl,
          isOwn: true,
          createdAt: new Date().toISOString(),
          replyToMessageId: replyingTo?.id || null,
          replyToMessageContent: replyingTo?.content || null,
          replyToMessageMediaType: replyingTo?.mediaType || null,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        // Scroll to bottom
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, 100);

        await messageService.sendMessage({
          conversationId,
          content: imageUrl,
          mediaType: "Image",
          mediaUrl: imageUrl,
          replyToMessageId: replyingTo?.id || null,
        });

        setReplyingTo(null);
        antMessage.success("Đã gửi hình ảnh");
      } catch (error) {
        console.error("Error uploading image:", error);
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        // Revoke preview URL
        URL.revokeObjectURL(previewUrl);
        antMessage.error("Không thể gửi hình ảnh");
      } finally {
        setUploadingImage(false);
      }
    },
    [conversationId, replyingTo, currentUser]
  );

  // Delete message
  const handleDelete = useCallback(
    async (messageId) => {
      Modal.confirm({
        title: "Xóa tin nhắn",
        content: "Bạn có chắc chắn muốn xóa tin nhắn này?",
        okText: "Xóa",
        cancelText: "Hủy",
        okType: "danger",
        onOk: async () => {
          // Find the message to save original content for rollback
          const messageToDelete = messages.find((m) => m.id === messageId);
          if (!messageToDelete) return;

          // Optimistic update: update local state immediately
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: "Tin nhắn này đã bị xóa",
                    isDeleted: true,
                    status: "Deleted",
                  }
                : msg
            )
          );

          try {
            await messageService.deleteMessage(messageId);
          } catch (error) {
            console.error("Error deleting message:", error);
            // Revert optimistic update on error
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId
                  ? {
                      ...msg,
                      content: messageToDelete.content,
                      isDeleted: false,
                      status: messageToDelete.status,
                    }
                  : msg
              )
            );
            antMessage.error("Không thể xóa tin nhắn");
          }
        },
      });
    },
    [messages]
  );

  // React to message
  const handleReact = useCallback(
    async (messageId, reaction) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;

      const removeReaction = message?.reaction === reaction;
      const previousReaction = message?.reaction;

      // Optimistic update: update local state immediately
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                reaction: removeReaction ? null : reaction,
              }
            : msg
        )
      );

      try {
        await messageService.reactMessage({
          messageId,
          conversationId,
          reaction,
          removeReaction,
        });
      } catch (error) {
        console.error("Error reacting:", error);
        // Revert optimistic update on error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  reaction: previousReaction,
                }
              : msg
          )
        );
        antMessage.error("Không thể thêm phản ứng");
      }
    },
    [messages, conversationId]
  );

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && conversationId && !loadingMoreRef.current) {
      loadingMoreRef.current = true;
      // Save current scroll height before loading
      if (listRef.current) {
        previousScrollHeightRef.current = listRef.current.scrollHeight;
      }
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchMessages(nextPage, false);
    }
  }, [loading, hasMore, pageNumber, conversationId, fetchMessages]);

  // Handle scroll to load more messages
  useEffect(() => {
    const scrollContainer = listRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      // Check if scrolled near the top (within 100px)
      if (
        scrollContainer.scrollTop <= 100 &&
        !loading &&
        hasMore &&
        !loadingMoreRef.current
      ) {
        handleLoadMore();
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [loading, hasMore, handleLoadMore]);

  // Maintain scroll position after loading more messages
  useEffect(() => {
    if (
      loadingMoreRef.current &&
      listRef.current &&
      previousScrollHeightRef.current > 0 &&
      !loading
    ) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (listRef.current && previousScrollHeightRef.current > 0) {
          const scrollContainer = listRef.current;
          const newScrollHeight = scrollContainer.scrollHeight;
          const scrollDifference =
            newScrollHeight - previousScrollHeightRef.current;

          // Restore scroll position
          scrollContainer.scrollTop = scrollDifference;
          previousScrollHeightRef.current = 0;
          loadingMoreRef.current = false;
        }
      }, 50);
    }
  }, [messages.length, loading]);

  // Render message item
  const renderMessage = useCallback(
    (msg) => {
      const isOwn = msg.senderId === currentUser?.id;
      const isDeleted = msg.status === "Deleted" || msg.isDeleted;

      // Check if the replied message is deleted
      const repliedMessage = msg.replyToMessageId
        ? messages.find((m) => m.id === msg.replyToMessageId)
        : null;
      const isRepliedMessageDeleted =
        repliedMessage?.isDeleted || repliedMessage?.status === "Deleted";

      // Regular message
      return (
        <div
          key={msg.id}
          className="message-row"
          style={{
            display: "flex",
            justifyContent: isOwn ? "flex-end" : "flex-start",
            alignItems: "flex-end",
            marginBottom: 8,
            padding: "0 8px",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            const hoverButtons = e.currentTarget.querySelector(
              ".message-action-buttons"
            );
            if (hoverButtons) {
              hoverButtons.style.opacity = "1";
            }
          }}
          onMouseLeave={(e) => {
            const hoverButtons = e.currentTarget.querySelector(
              ".message-action-buttons"
            );
            if (hoverButtons) {
              hoverButtons.style.opacity = "0";
            }
          }}
        >
          {!isOwn && (
            <Avatar
              src={msg.senderAvatarUrl}
              size="small"
              style={{ marginRight: 8, alignSelf: "flex-end" }}
            >
              {msg.senderName?.[0]?.toUpperCase()}
            </Avatar>
          )}

          {/* Action buttons - Messenger style */}
          {isOwn && (
            <div
              className="message-action-buttons"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginRight: 8,
                opacity: 0,
                transition: "opacity 0.2s",
                pointerEvents: "auto",
              }}
            >
              {msg.mediaType === "Text" && !isDeleted && (
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingMessage(msg);
                    setInput(msg.content);
                    setSelectedMessage(null);
                  }}
                  style={{
                    color: "#65676b",
                    fontSize: 16,
                    width: 32,
                    height: 32,
                    padding: 0,
                  }}
                  title="Chỉnh sửa"
                />
              )}
              {!isDeleted && (
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    handleDelete(msg.id);
                    setSelectedMessage(null);
                  }}
                  style={{
                    color: "#65676b",
                    fontSize: 16,
                    width: 32,
                    height: 32,
                    padding: 0,
                  }}
                  title="Xóa"
                />
              )}
            </div>
          )}

          <Popover
            content={
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {!isOwn && (
                  <Button
                    size="small"
                    type="text"
                    onClick={() => {
                      setReplyingTo(msg);
                      setSelectedMessage(null);
                    }}
                  >
                    Trả lời
                  </Button>
                )}
                {isOwn && msg.mediaType === "Text" && !isDeleted && (
                  <Button
                    size="small"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingMessage(msg);
                      setInput(msg.content);
                      setSelectedMessage(null);
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                )}
                {isOwn && !isDeleted && (
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      handleDelete(msg.id);
                      setSelectedMessage(null);
                    }}
                  >
                    Xóa
                  </Button>
                )}
                {!isOwn && (
                  <>
                    <Divider style={{ margin: "4px 0" }} />
                    <div style={{ display: "flex", gap: 4 }}>
                      {reactions.map((reaction) => (
                        <Button
                          key={reaction}
                          size="small"
                          type={msg.reaction === reaction ? "primary" : "text"}
                          onClick={() => {
                            handleReact(msg.id, reaction);
                            setSelectedMessage(null);
                          }}
                        >
                          {reaction}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            }
            trigger="contextMenu"
            open={selectedMessage?.id === msg.id}
            onOpenChange={(open) => {
              if (!open) setSelectedMessage(null);
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedMessage(msg);
              }}
            >
              {msg.mediaType === "Image" && !isDeleted ? (
                <div>
                  <img
                    src={msg.mediaUrl || msg.content}
                    alt=""
                    style={{
                      maxWidth: "100%",
                      borderRadius: 12,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      window.open(msg.mediaUrl || msg.content, "_blank");
                    }}
                  />
                  {/* Reaction for images */}
                  {msg.reaction && (
                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 16,
                        textAlign: isOwn ? "right" : "left",
                      }}
                    >
                      {msg.reaction}
                    </div>
                  )}
                  {/* Message time for images */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                      fontSize: 11,
                      opacity: 0.7,
                      color: isOwn ? "#fff" : "#666",
                      paddingLeft: 4,
                    }}
                  >
                    {formatMessageTime(
                      msg.createdAt || msg.sentAt || msg.timestamp
                    )}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: isOwn ? "#f97316" : "#f3f4f6",
                    color: isOwn ? "#fff" : "#111827",
                    borderRadius: 12,
                    padding: "8px 12px",
                    fontSize: 14,
                  }}
                >
                  {msg.replyToMessageId && !isRepliedMessageDeleted && (
                    <div
                      style={{
                        borderLeft: `3px solid ${isOwn ? "#fff" : "#999"}`,
                        paddingLeft: 8,
                        marginBottom: 4,
                        fontSize: 12,
                        opacity: 0.8,
                      }}
                    >
                      {msg.replyToMessageContent}
                    </div>
                  )}
                  {!isOwn && (
                    <Text
                      strong
                      style={{
                        display: "block",
                        fontSize: 12,
                        marginBottom: 2,
                        color: isOwn ? "#fff" : "#111827",
                      }}
                    >
                      {msg.senderName}
                    </Text>
                  )}
                  <div>{msg.content}</div>
                  {msg.reaction && (
                    <div style={{ marginTop: 4, fontSize: 16 }}>
                      {msg.reaction}
                    </div>
                  )}
                  {/* Message time and edited status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 4,
                      fontSize: 11,
                      opacity: 0.7,
                      color: isOwn ? "rgba(255, 255, 255, 0.7)" : "#666",
                    }}
                  >
                    {formatMessageTime(
                      msg.createdAt || msg.sentAt || msg.timestamp
                    )}
                    {isMessageEdited(msg) && (
                      <span style={{ fontStyle: "italic" }}>Đã chỉnh sửa</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Popover>

          {/* Action buttons for other users' messages */}
          {!isOwn && (
            <div
              className="message-action-buttons"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginLeft: 8,
                opacity: 0,
                transition: "opacity 0.2s",
                pointerEvents: "auto",
              }}
            >
              <Button
                type="text"
                size="small"
                icon={<RollbackOutlined />}
                onClick={() => {
                  setReplyingTo(msg);
                  setSelectedMessage(null);
                }}
                style={{
                  color: "#65676b",
                  fontSize: 16,
                  width: 32,
                  height: 32,
                  padding: 0,
                }}
                title="Trả lời"
              />
              <Popover
                content={
                  <div style={{ display: "flex", gap: 4 }}>
                    {reactions.map((reaction) => (
                      <Button
                        key={reaction}
                        size="small"
                        type={msg.reaction === reaction ? "primary" : "text"}
                        onClick={() => {
                          handleReact(msg.id, reaction);
                          setSelectedMessage(null);
                        }}
                        style={{ fontSize: 20, padding: "4px 8px" }}
                      >
                        {reaction}
                      </Button>
                    ))}
                  </div>
                }
                trigger="click"
                placement="top"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<SmileOutlined />}
                  style={{
                    color: "#65676b",
                    fontSize: 16,
                    width: 32,
                    height: 32,
                    padding: 0,
                  }}
                  title="Thêm phản ứng"
                />
              </Popover>
            </div>
          )}

          {isOwn && (
            <Avatar
              src={currentUser?.avatarUrl}
              size="small"
              style={{ marginLeft: 8, alignSelf: "flex-end" }}
            >
              {currentUser?.name?.[0]?.toUpperCase()}
            </Avatar>
          )}
        </div>
      );
    },
    [
      currentUser,
      handleDelete,
      handleReact,
      selectedMessage,
      reactions,
      messages,
    ]
  );

  const title = useMemo(
    () => conversation?.title || "Cuộc trò chuyện",
    [conversation]
  );

  return (
    <>
      <Drawer
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar src={conversation?.conversationImg} size="small">
              {title?.[0]?.toUpperCase()}
            </Avatar>
            <div>
              <div style={{ fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 12, color: "#999" }}>
                {typingStatus?.isTyping
                  ? "Đang nhập..."
                  : userPresence?.isOnline
                  ? "Đang hoạt động"
                  : connectionStatus === "reconnecting"
                  ? "Đang kết nối lại..."
                  : "Ngoại tuyến"}
              </div>
            </div>
          </div>
        }
        placement="right"
        width={480}
        open={open}
        onClose={onClose}
        destroyOnClose
      >
        <div
          ref={listRef}
          style={{
            height: "calc(100vh - 220px)",
            overflowY: "auto",
            marginBottom: 12,
            padding: "8px 0",
          }}
        >
          {loading && !messages.length ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <Spin />
            </div>
          ) : (
            <>
              {hasMore && !loading && (
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <Button size="small" onClick={handleLoadMore}>
                    Tải tin nhắn cũ hơn
                  </Button>
                </div>
              )}
              {messages.map(renderMessage)}
              {typingStatus?.isTyping && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "0 8px",
                    marginBottom: 8,
                  }}
                >
                  <Avatar size="small" src={conversation?.conversationImg} />
                  <div
                    style={{
                      backgroundColor: "#f3f4f6",
                      borderRadius: 12,
                      padding: "8px 12px",
                    }}
                  >
                    <div style={{ display: "flex", gap: 4 }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#999",
                          animation: "typing 1.4s infinite",
                        }}
                      />
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#999",
                          animation: "typing 1.4s infinite 0.2s",
                        }}
                      />
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#999",
                          animation: "typing 1.4s infinite 0.4s",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Reply preview */}
        {replyingTo &&
          !editingMessage &&
          (() => {
            const repliedMsg = messages.find((m) => m.id === replyingTo.id);
            const isRepliedMsgDeleted =
              repliedMsg?.isDeleted || repliedMsg?.status === "Deleted";

            // Don't show preview if the replied message is deleted
            if (isRepliedMsgDeleted) {
              return null;
            }

            return (
              <div
                style={{
                  backgroundColor: "#f0f9ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 8,
                  padding: 8,
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Trả lời {replyingTo.senderName}
                  </Text>
                  <div style={{ fontSize: 13, color: "#666" }}>
                    {replyingTo.content?.substring(0, 50)}
                    {replyingTo.content?.length > 50 ? "..." : ""}
                  </div>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setReplyingTo(null)}
                />
              </div>
            );
          })()}

        {/* Edit preview */}
        {editingMessage && (
          <div
            style={{
              backgroundColor: "#fef3c7",
              border: "1px solid #fbbf24",
              borderRadius: 8,
              padding: 8,
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <Text type="secondary" style={{ fontSize: 12, color: "#f59e0b" }}>
                Đang chỉnh sửa
              </Text>
              <div style={{ fontSize: 13, color: "#666" }}>
                {editingMessage.content?.substring(0, 50)}
                {editingMessage.content?.length > 50 ? "..." : ""}
              </div>
            </div>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => {
                setEditingMessage(null);
                setInput("");
              }}
            />
          </div>
        )}

        {/* Input area */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={(file) => {
              handleImageUpload(file);
              return false;
            }}
            disabled={uploadingImage || sending}
          >
            <Button
              icon={<PictureOutlined />}
              disabled={uploadingImage || sending}
              loading={uploadingImage}
            />
          </Upload>
          <TextArea
            ref={textAreaRef}
            autoSize={{ minRows: 1, maxRows: 4 }}
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={sending}
            onClick={handleSend}
            disabled={!input.trim() && !editingMessage}
          />
        </div>
      </Drawer>

      <style>
        {`
          @keyframes typing {
            0%, 60%, 100% {
              opacity: 0.3;
            }
            30% {
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
}
