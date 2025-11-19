import React from "react";
import { Modal, Input } from "antd";

export default function ShippingOrderModal({
  isOpen,
  onClose,
  onConfirm,
  shippingRemarks,
  setShippingRemarks,
  selectedOrder,
}) {
  return (
    <Modal
      title="Tạo Đơn Giao Hàng"
      open={isOpen}
      onOk={onConfirm}
      onCancel={onClose}
      okText="Tạo Đơn"
      cancelText="Hủy"
      okButtonProps={{ className: "bg-purple-500" }}
    >
      <div className="py-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ghi chú giao hàng
        </label>
        <Input.TextArea
          value={shippingRemarks}
          onChange={(e) => setShippingRemarks(e.target.value)}
          placeholder="Nhập ghi chú cho đơn giao hàng..."
          rows={4}
          className="w-full"
        />
        {selectedOrder && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Mã đơn hàng:</span>{" "}
              <span className="font-mono">{selectedOrder.id}</span>
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
