import React, { useEffect, useState } from "react";
import { Table, Tag, Spin, Empty, Button } from "antd";
import {
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import FitBridgeModal from "../../../components/FitBridgeModal";
import addressService from "../../../services/addressServices";

export default function ShopAddressModal({ isOpen, onClose }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchShopAddresses = async () => {
    setLoading(true);
    try {
      const response = await addressService.getShopAddresses();
      setAddresses(response.data.items || []);
    } catch {
      toast.error("Không thể tải danh sách địa chỉ cửa hàng!");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchShopAddresses();
    }
  }, [isOpen]);

  const handleSetDefaultAddress = (record) => {
    // If already default, do nothing
    if (record.isShopDefaultAddress) {
      return;
    }

    Modal.confirm({
      title: "Đặt địa chỉ mặc định",
      icon: <ExclamationCircleOutlined style={{ color: "#faad14" }} />,
      zIndex: 1100,
      content: (
        <div className="space-y-2">
          <p>
            Bạn có chắc chắn muốn đặt địa chỉ này làm địa chỉ mặc định cho cửa
            hàng?
          </p>
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="font-semibold text-orange-600">
              ⚠️ Lưu ý quan trọng:
            </p>
            <p className="text-sm text-gray-700">
              Thay đổi địa chỉ mặc định có thể ảnh hưởng đến phí vận chuyển của
              các đơn hàng mới.
            </p>
          </div>
        </div>
      ),
      okText: "Xác Nhận",
      cancelText: "Hủy",
      okButtonProps: { className: "bg-blue-500" },
      onOk: async () => {
        try {
          await addressService.updateAddressDefault(record.id, {
            isShopDefaultAddress: true,
          });
          toast.success("Đã cập nhật địa chỉ mặc định thành công!");
          fetchShopAddresses(); // Refresh the list
        } catch {
          toast.error("Không thể cập nhật địa chỉ mặc định. Vui lòng thử lại!");
        }
      },
    });
  };

  const columns = [
    {
      title: "Người Nhận",
      dataIndex: "receiverName",
      key: "receiverName",
      width: 150,
      render: (text, record) => (
        <div>
          <div className="flex items-center gap-2">
            <UserOutlined className="text-blue-500" />
            <span className="font-semibold">{text}</span>
            {record.isShopDefaultAddress && (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Mặc Định
              </Tag>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <PhoneOutlined />
            {record.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: "Địa Chỉ",
      key: "address",
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <HomeOutlined className="text-orange-500 mt-1" />
            <div>
              <div className="font-medium">
                {record.houseNumber} {record.street}
              </div>
              <div className="text-sm text-gray-600">
                {record.ward}, {record.district}
              </div>
              <div className="text-sm text-gray-600">{record.city}</div>
            </div>
          </div>
          {record.googleMapAddressString && (
            <div className="text-xs text-blue-600 flex items-center gap-1 mt-2">
              <EnvironmentOutlined />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${record.latitude},${record.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {record.googleMapAddressString}
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Ghi Chú",
      dataIndex: "note",
      key: "note",
      width: 200,
      render: (text) =>
        text ? (
          <div className="p-2 bg-yellow-50 rounded border border-yellow-200 text-sm">
            {text}
          </div>
        ) : (
          <span className="text-gray-400">Không có ghi chú</span>
        ),
    },
  ];

  return (
    <FitBridgeModal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 text-lg">
          <EnvironmentOutlined className="text-orange-500" />
          <span>Địa Chỉ Cửa Hàng</span>
        </div>
      }
      width={1000}
      logoSize="medium"
      bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
      footer={
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spin
            indicator={
              <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
            }
            tip="Đang tải địa chỉ..."
          />
        </div>
      ) : addresses.length > 0 ? (
        <Table
          dataSource={addresses}
          columns={columns}
          rowKey="id"
          pagination={false}
          rowClassName={(record) =>
            record.isShopDefaultAddress
              ? "bg-green-50 hover:bg-green-100"
              : "hover:bg-gray-50 cursor-pointer"
          }
          onRow={(record) => ({
            onClick: () => handleSetDefaultAddress(record),
            style: {
              cursor: record.isShopDefaultAddress ? "default" : "pointer",
            },
          })}
        />
      ) : (
        <Empty description="Chưa có địa chỉ cửa hàng nào" />
      )}
    </FitBridgeModal>
  );
}
