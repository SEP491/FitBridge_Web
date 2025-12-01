import React from "react";
import { Modal, Select, Input, Tag } from "antd";

const { Option } = Select;

export default function StatusUpdateModal({
  isOpen,
  onClose,
  onConfirm,
  newStatus,
  setNewStatus,
  statusDescription,
  setStatusDescription,
  selectedOrder,
  getStatusColor,
  getStatusIcon,
}) {
  // Get available status options based on current status
  const getAvailableStatusOptions = () => {
    if (!selectedOrder) return [];

    const currentStatus = selectedOrder.currentStatus;
    const hasCheckoutUrl = selectedOrder.checkoutUrl;

    if (currentStatus === "Created") {
      return [
        { value: "Pending", label: "Chờ Xử Lý" },
        { value: "Cancelled", label: "Hủy Đơn" },
      ];
    }
    // Pending: Can go to Processing or Cancelled (only if has checkoutUrl)
    if (currentStatus === "Pending") {
      const options = [
        { value: "Processing", label: "Đang Xử Lý" },
        { value: "Finished", label: "Hoàn Thành" },
      ];
      if (!hasCheckoutUrl) {
        options.push({ value: "Cancelled", label: "Hủy Đơn" });
      }
      return options;
    }

    // CustomerNotReceived: Can only go to Finished
    if (currentStatus === "CustomerNotReceived") {
      return [{ value: "Finished", label: "Hoàn Thành" }];
    }

    if (currentStatus === "Returned") {
      return [{ value: "Cancelled", label: "Hủy Đơn" }];
    }
    


    // For other statuses, return all options (default behavior)
    return [
      { value: "Processing", label: "Đang Xử Lý" },
      { value: "Assigning", label: "Đang Phân Công" },
      { value: "Accepted", label: "Đã Chấp Nhận" },
      { value: "Shipping", label: "Đang Giao Hàng" },
      { value: "Arrived", label: "Đã Đến Nơi" },
      { value: "InReturn", label: "Đang Hoàn Trả" },
      { value: "Returned", label: "Đã Hoàn Trả" },
      { value: "CustomerNotReceived", label: "Khách Không Nhận" },
      { value: "Finished", label: "Hoàn Thành" },
      { value: "Cancelled", label: "Đã Hủy" },
    ];
  };

  const availableOptions = getAvailableStatusOptions();

  return (
    <Modal
      title="Cập Nhật Trạng Thái Đơn Hàng"
      open={isOpen}
      onOk={onConfirm}
      onCancel={onClose}
      okText="Cập Nhật"
      cancelText="Hủy"
      okButtonProps={{ className: "bg-blue-500" }}
      zIndex={1100}
    >
      <div className="py-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái mới
          </label>
          <Select
            value={newStatus}
            onChange={setNewStatus}
            placeholder="Chọn trạng thái"
            className="w-full"
            size="large"
          >
            {availableOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả / Ghi chú
          </label>
          <Input.TextArea
            value={statusDescription}
            onChange={(e) => setStatusDescription(e.target.value)}
            placeholder="Nhập mô tả hoặc ghi chú cho việc cập nhật trạng thái..."
            rows={4}
            className="w-full"
          />
        </div>
        {selectedOrder && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Mã đơn hàng:</span>{" "}
              <span className="font-mono">{selectedOrder.id}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Trạng thái hiện tại:</span>{" "}
              <Tag
                icon={getStatusIcon(selectedOrder.currentStatus)}
                color={getStatusColor(selectedOrder.currentStatus)}
              >
                {selectedOrder.currentStatus === "Created" && "Đã Tạo"}
                {selectedOrder.currentStatus === "Pending" && "Chờ Xử Lý"}
                {selectedOrder.currentStatus === "Processing" && "Đang Xử Lý"}
                {selectedOrder.currentStatus === "Assigning" && "Đang Phân Công"}
                {selectedOrder.currentStatus === "Accepted" && "Đã Chấp Nhận"}
                {selectedOrder.currentStatus === "Shipping" && "Đang Giao Hàng"}
                {selectedOrder.currentStatus === "Arrived" && "Đã Đến Nơi"}
                {selectedOrder.currentStatus === "InReturn" && "Đang Hoàn Trả"}
                {selectedOrder.currentStatus === "Returned" && "Đã Hoàn Trả"}
                {selectedOrder.currentStatus === "CustomerNotReceived" && "Khách Không Nhận"}
                {selectedOrder.currentStatus === "Finished" && "Hoàn Thành"}
                {selectedOrder.currentStatus === "Cancelled" && "Đã Hủy"}
              </Tag>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
