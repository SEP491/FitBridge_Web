import React from "react";
import { Modal, Input } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  cancelComment,
  setCancelComment,
  selectedOrder,
}) {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          <span>Xác Nhận Hủy Đơn Hàng</span>
        </div>
      }
      open={isOpen}
      onOk={onConfirm}
      onCancel={onClose}
      okText="Xác Nhận Hủy"
      cancelText="Quay Lại"
      okButtonProps={{ danger: true }}
      zIndex={1100}
    >
      <div className="py-4 space-y-4">
        <div className="p-3 bg-red-50 rounded border border-red-200">
          <p className="text-sm text-red-700">
            ⚠️ <span className="font-semibold">Lưu ý:</span> Hành động này không thể hoàn tác. 
            Đơn hàng sẽ bị hủy và không thể tiếp tục xử lý.
          </p>
        </div>

        {selectedOrder && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Mã đơn hàng:</span>{" "}
              <span className="font-mono">{selectedOrder.id}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Khách hàng:</span>{" "}
              {selectedOrder.shippingDetail?.receiverName}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lý do hủy đơn <span className="text-red-500">*</span>
          </label>
          <Input.TextArea
            value={cancelComment}
            onChange={(e) => setCancelComment(e.target.value)}
            placeholder="Nhập lý do hủy đơn hàng (bắt buộc)..."
            rows={4}
            className="w-full"
            required
          />
        </div>
      </div>
    </Modal>
  );
}
