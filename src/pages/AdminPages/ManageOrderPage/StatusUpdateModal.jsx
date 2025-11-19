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
  return (
    <Modal
      title="Cập Nhật Trạng Thái Đơn Hàng"
      open={isOpen}
      onOk={onConfirm}
      onCancel={onClose}
      okText="Cập Nhật"
      cancelText="Hủy"
      okButtonProps={{ className: "bg-blue-500" }}
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
            <Option value="Processing">Đang Xử Lý</Option>
            <Option value="Assigning">Đang Phân Công</Option>
            <Option value="Shipping">Đang Giao Hàng</Option>
            <Option value="Finished">Hoàn Thành</Option>
            <Option value="Cancelled">Đã Hủy</Option>
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
                {selectedOrder.currentStatus === "Shipping" && "Đang Giao Hàng"}
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
