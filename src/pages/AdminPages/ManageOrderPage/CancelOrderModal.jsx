import React from "react";
import { Input, Button } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import FitBridgeModal from "../../../components/FitBridgeModal";

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  cancelComment,
  setCancelComment,
  selectedOrder,
}) {
  return (
    <FitBridgeModal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          <span>Xác Nhận Hủy Đơn Hàng</span>
        </div>
      }
      width={650}
      logoSize="medium"
      bodyStyle={{ padding: 0, maxHeight: "60vh", overflowY: "auto" }}
      footer={
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
          <Button onClick={onClose}>Quay Lại</Button>
          <Button
            type="primary"
            danger
            onClick={onConfirm}
            disabled={!cancelComment?.trim()}
            className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
          >
            Xác Nhận Hủy
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div className="p-3 bg-red-50 rounded border border-red-200">
          <p className="text-sm text-red-700">
            ⚠️ <span className="font-semibold">Lưu ý:</span> Hành động này không thể
            hoàn tác. Đơn hàng sẽ bị hủy và không thể tiếp tục xử lý.
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
    </FitBridgeModal>
  );
}
