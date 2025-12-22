import React, { useEffect } from "react";
import { Input, Button } from "antd";
import { CarOutlined } from "@ant-design/icons";
import FitBridgeModal from "../../../components/FitBridgeModal";

export default function ShippingOrderModal({
  isOpen,
  onClose,
  onConfirm,
  shippingRemarks,
  setShippingRemarks,
  selectedOrder,
}) {
  // Auto-fill shippingRemarks with order note when modal opens
  useEffect(() => {
    if (isOpen && selectedOrder?.shippingDetail?.note) {
      setShippingRemarks(selectedOrder.shippingDetail.note);
    }
  }, [isOpen, selectedOrder, setShippingRemarks]);

  return (
    <FitBridgeModal
      open={isOpen}
      onCancel={onClose}
      title="Tạo Đơn Giao Hàng"
      titleIcon={<CarOutlined />}
      width={600}
      logoSize="medium"
      bodyStyle={{ padding: 0, maxHeight: "60vh", overflowY: "auto" }}
      footer={
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
          <Button onClick={onClose}>Hủy</Button>
          <Button
            type="primary"
            onClick={onConfirm}
            className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
          >
            Tạo Đơn
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div>
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
        </div>
        {selectedOrder && (
          <div className="mt-2 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Mã đơn hàng:</span>{" "}
              <span className="font-mono">{selectedOrder.id}</span>
            </p>
          </div>
        )}
      </div>
    </FitBridgeModal>
  );
}
