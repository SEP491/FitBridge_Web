import { useState, useEffect } from "react";
import {
  Dropdown,
  Badge,
  Button,
  List,
  Empty,
  Spin,
  Typography,
  Space,
} from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNotification } from "../../context/NotificationContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Text } = Typography;

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    refreshing,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotification();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAll = async () => {
    await deleteAllNotifications();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = dayjs(timestamp);
    const now = dayjs();
    const diffInHours = now.diff(date, "hour");

    if (diffInHours < 24) {
      return date.fromNow();
    } else {
      return date.format("DD/MM/YYYY HH:mm");
    }
  };

  const getNotificationTitle = (notification) => {
    return notification.title || "Thông báo";
  };

  const getNotificationContent = (notification) => {
    // Priority: body > content > message
    const content =
      notification.body || notification.content || notification.message || "";
    // Replace template placeholders if needed (e.g., {{ TitleRequesterName }})
    // This is a simple replacement - you may need more sophisticated template engine
    return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      // Try to get the value from notification data
      return notification[key] || notification[key.toLowerCase()] || match;
    });
  };

  const notificationDropdownContent = (
    <div className="w-[600px] bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <Text strong className="text-base">
          Thông báo
        </Text>
        <Space>
          {unreadCount > 0 && (
            <Button type="link" size="small" onClick={handleMarkAllAsRead}>
              Đánh dấu đã đọc tất cả
            </Button>
          )}
          {notifications.length > 0 && (
            <Button type="link" size="small" danger onClick={handleDeleteAll}>
              Xóa tất cả
            </Button>
          )}
        </Space>
      </div>

      {/* Notifications List */}
      <div className="max-h-[600px] overflow-y-auto">
        {refreshing && notifications.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description="Không có thông báo nào"
            className="py-8"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(notification) => (
              <List.Item
                className={`!px-4 !py-3 cursor-pointer ${
                  !notification.isRead ? "bg-blue-50" : ""
                } hover:bg-gray-50`}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead(notification.id);
                  }
                }}
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDelete(e, notification.id)}
                  />,
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="flex items-center gap-2">
                      <Text strong={!notification.isRead} className="text-sm">
                        {getNotificationTitle(notification)}
                      </Text>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  }
                  description={
                    <div>
                      {getNotificationContent(notification) && (
                        <Text className="text-sm text-gray-700 mb-1 block">
                          {getNotificationContent(notification)}
                        </Text>
                      )}
                      <Text type="secondary" className="text-xs">
                        {formatTime(
                          notification.timestamp || notification.createdAt
                        )}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 text-center">
          <Text type="secondary" className="text-xs">
            {notifications.length} thông báo
            {unreadCount > 0 && ` • ${unreadCount} chưa đọc`}
          </Text>
        </div>
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => notificationDropdownContent}
      trigger={["click"]}
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
      overlayStyle={{ padding: 0 }}
    >
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined className="text-lg" />}
          className="flex items-center justify-center hover:bg-gray-100"
          size="large"
        />
      </Badge>
    </Dropdown>
  );
}
