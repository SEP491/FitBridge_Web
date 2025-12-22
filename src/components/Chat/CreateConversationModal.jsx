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

      const conversation = await messageService.createConversation(payload);

      if (onConversationCreated && conversation) {
        onConversationCreated(conversation);
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
