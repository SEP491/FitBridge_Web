import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Spin,
  Avatar,
  Typography,
  Divider,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import messageService from "../../services/messageService";

const { Text } = Typography;

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
    };
  } catch (error) {
    console.error("Error decoding user token:", error);
    return null;
  }
};

export default function CreateConversationModal({
  open,
  onClose,
  onConversationCreated,
}) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const currentUser = useMemo(() => getCurrentUserFromToken(), []);

  // Load possible users to start a conversation with
  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const params = {
          page: 1,
          size: 50,
          doApplyPaging: false,
        };
        const response = await messageService.getUsersConversations(params);
        const items = response.data?.items || response.items || [];
        // Filter out current user from the list
        const filtered = currentUser
          ? items.filter((u) => u.id !== currentUser.id)
          : items;
        setUsers(filtered);
      } catch (error) {
        console.error("CreateConversationModal: error fetching users", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [open, currentUser]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const selectedUser = users.find((u) => u.id === values.userId);
      if (!selectedUser) {
        throw new Error("Selected user not found");
      }

      if (!currentUser) {
        throw new Error("Current user information not available");
      }

      // Build members array with both current user and selected user
      const payload = {
        isGroup: false,
        members: [
          {
            memberId: currentUser.id,
            memberName: currentUser.name,
            memberAvatarUrl: currentUser.avatarUrl || "",
          },
          {
            memberId: selectedUser.id,
            memberName: selectedUser.fullName,
            memberAvatarUrl: selectedUser.avatarUrl || "",
          },
        ],
        newMessageContent: values.initialMessage || "",
        groupImage: null,
      };

      const response = await messageService.createConversation(payload);

      // Extract conversation data from API response
      // The response might be: {status, message, data: {conversationId, ...}}
      // or the conversation object directly
      let conversationData = null;

      if (response) {
        // If response has status/message, it's an API response wrapper
        if (response.status && response.data) {
          // Try to get conversation from data, or fetch it using conversationId
          const conversationId =
            response.data.conversationId || response.data.id;
          if (conversationId) {
            // Fetch the full conversation details
            try {
              const fullConversation = await messageService.getConversations({
                page: 1,
                size: 50, // Fetch more to ensure we find the new conversation
              });
              const conversations =
                fullConversation.data?.items || fullConversation.items || [];
              const fetchedConv = conversations.find(
                (c) => c.id === conversationId
              );

              if (fetchedConv) {
                // Ensure the title shows the selected user, not current user
                // For one-on-one conversations, the title should be the other user's name
                conversationData = {
                  ...fetchedConv,
                  // Override title to ensure it shows the selected user
                  title: selectedUser.fullName || fetchedConv.title,
                  // Override image to show selected user's avatar
                  conversationImg:
                    selectedUser.avatarUrl || fetchedConv.conversationImg,
                  // Ensure last message content is set if we sent an initial message
                  lastMessageContent: values.initialMessage
                    ? formatLastMessageContent({
                        content: values.initialMessage,
                        mediaType: "Text",
                        senderName: currentUser.name,
                      })
                    : fetchedConv.lastMessageContent,
                  // Mark as read if we sent the first message
                  isRead: values.initialMessage ? true : false,
                };
              } else {
                // Conversation not found in list yet, construct it
                conversationData = {
                  id: conversationId,
                  isGroup: false,
                  isRead: values.initialMessage ? true : false,
                  title: selectedUser.fullName,
                  updatedAt: new Date().toISOString(),
                  lastMessageContent: values.initialMessage
                    ? formatLastMessageContent({
                        content: values.initialMessage,
                        mediaType: "Text",
                        senderName: currentUser.name,
                      })
                    : "Chưa có tin nhắn",
                  conversationImg: selectedUser.avatarUrl || null,
                  lastMessageSenderId: values.initialMessage
                    ? currentUser.id
                    : null,
                  lastMessageSenderName: values.initialMessage
                    ? currentUser.name
                    : null,
                  lastMessageMediaType: values.initialMessage ? "Text" : null,
                };
              }
            } catch (error) {
              console.error("Error fetching conversation details:", error);
              // Fallback: construct a basic conversation object with selected user info
              conversationData = {
                id: conversationId,
                isGroup: false,
                isRead: values.initialMessage ? true : false,
                title: selectedUser.fullName,
                updatedAt: new Date().toISOString(),
                lastMessageContent: values.initialMessage
                  ? formatLastMessageContent({
                      content: values.initialMessage,
                      mediaType: "Text",
                      senderName: currentUser.name,
                    })
                  : "Chưa có tin nhắn",
                conversationImg: selectedUser.avatarUrl || null,
                lastMessageSenderId: values.initialMessage
                  ? currentUser.id
                  : null,
                lastMessageSenderName: values.initialMessage
                  ? currentUser.name
                  : null,
                lastMessageMediaType: values.initialMessage ? "Text" : null,
              };
            }
          }
        } else if (response.id) {
          // Response is already a conversation object
          // Ensure it shows the selected user, not current user
          conversationData = {
            ...response,
            title: selectedUser.fullName || response.title,
            conversationImg: selectedUser.avatarUrl || response.conversationImg,
            lastMessageContent: values.initialMessage
              ? formatLastMessageContent({
                  content: values.initialMessage,
                  mediaType: "Text",
                  senderName: currentUser.name,
                })
              : response.lastMessageContent || "Chưa có tin nhắn",
            isRead: values.initialMessage
              ? true
              : response.isRead !== undefined
              ? response.isRead
              : false,
          };
        } else if (response.data && response.data.id) {
          // Response.data is the conversation object
          conversationData = {
            ...response.data,
            title: selectedUser.fullName || response.data.title,
            conversationImg:
              selectedUser.avatarUrl || response.data.conversationImg,
            lastMessageContent: values.initialMessage
              ? formatLastMessageContent({
                  content: values.initialMessage,
                  mediaType: "Text",
                  senderName: currentUser.name,
                })
              : response.data.lastMessageContent || "Chưa có tin nhắn",
            isRead: values.initialMessage
              ? true
              : response.data.isRead !== undefined
              ? response.data.isRead
              : false,
          };
        }
      }

      if (onConversationCreated && conversationData) {
        onConversationCreated(conversationData);
      }

      form.resetFields();
      onClose();
    } catch (err) {
      console.error("CreateConversationModal error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const selectedUserId = Form.useWatch("userId", form);
  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ fontSize: 20, color: "#1890ff" }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>
            Bắt đầu cuộc trò chuyện mới
          </span>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText="Bắt đầu trò chuyện"
      cancelText="Hủy"
      width={520}
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
        },
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          label={
            <span style={{ fontWeight: 500, fontSize: 14 }}>
              Chọn người dùng để trò chuyện
            </span>
          }
          name="userId"
          rules={[{ required: true, message: "Vui lòng chọn người dùng" }]}
        >
          <Select
            showSearch
            placeholder="Tìm kiếm theo tên hoặc vai trò..."
            optionFilterProp="label"
            loading={loadingUsers}
            notFoundContent={
              loadingUsers ? (
                <div style={{ textAlign: "center", padding: 12 }}>
                  <Spin size="small" />
                </div>
              ) : (
                <div
                  style={{ textAlign: "center", padding: 12, color: "#999" }}
                >
                  Không tìm thấy người dùng
                </div>
              )
            }
            size="large"
            style={{ width: "100%" }}
            options={users.map((u) => ({
              value: u.id,
              label: `${u.fullName} • ${u.userRole}`,
              user: u,
            }))}
            optionRender={(option) => (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "4px 0",
                }}
              >
                <Avatar
                  src={option.data.user.avatarUrl}
                  icon={<UserOutlined />}
                  size="small"
                />
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {option.data.user.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {option.data.user.userRole}
                  </div>
                </div>
              </div>
            )}
          />
        </Form.Item>

        {selectedUser && (
          <div
            style={{
              padding: 16,
              background: "#f5f7fa",
              borderRadius: 8,
              marginBottom: 16,
              border: "1px solid #e8e8e8",
            }}
          >
            <Text
              type="secondary"
              style={{ fontSize: 12, display: "block", marginBottom: 8 }}
            >
              Người tham gia cuộc trò chuyện:
            </Text>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar src={currentUser?.avatarUrl} icon={<UserOutlined />} />
              <Text strong>{currentUser?.name || "Bạn"}</Text>
              <span style={{ color: "#999", margin: "0 8px" }}>↔</span>
              <Avatar src={selectedUser.avatarUrl} icon={<UserOutlined />} />
              <Text strong>{selectedUser.fullName}</Text>
            </div>
          </div>
        )}

        <Divider style={{ margin: "16px 0" }} />

        <Form.Item
          label={
            <span style={{ fontWeight: 500, fontSize: 14 }}>
              Tin nhắn đầu tiên (tùy chọn)
            </span>
          }
          name="initialMessage"
        >
          <Input.TextArea
            placeholder="Xin chào..."
            autoSize={{ minRows: 3, maxRows: 5 }}
            style={{ borderRadius: 8 }}
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
