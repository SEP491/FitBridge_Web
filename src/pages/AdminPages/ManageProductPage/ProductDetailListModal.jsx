import React from "react";
import { Modal, Table, Image, Tag, Button, Space } from "antd";
import {
  EditOutlined,
  CheckCircleOutlined,
  StopOutlined,
  TagOutlined,
} from "@ant-design/icons";
import FitBridgeModal from "../../../components/FitBridgeModal";
import defaultImage from "../../../assets/LogoColor.png";

export default function ProductDetailListModal({
  isOpen,
  onClose,
  productDetails,
  onSelectDetail,
}) {
  const columns = [
    {
      title: "Hình Ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 100,
      align: "center",
      render: (url) => (
        <Image
          width={60}
          height={60}
          src={url || defaultImage}
          alt="Product detail"
          fallback={defaultImage}
          className="rounded-lg object-cover"
          preview={false}
        />
      ),
    },
    {
      title: "Thông Tin",
      key: "info",
      align: "left",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900">
            {record.flavourName} ({record.weightValue} {record.weightUnit})
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Loại ID: {record.id}
          </div>
        </div>
      ),
    },
    {
      title: "Giá",
      key: "price",
      align: "center",
      width: 150,
      render: (_, record) => (
        <div>
          <div className="text-sm font-semibold text-orange-600">
            {record.salePrice?.toLocaleString("vi-VN")}₫
          </div>
          {record.displayPrice && record.salePrice !== record.displayPrice && (
            <div className="text-xs text-green-600 line-through">
              {record.displayPrice?.toLocaleString("vi-VN")}₫
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Tồn Kho",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 100,
      render: (quantity) => (
        <span className="font-semibold text-blue-600">{quantity || 0}</span>
      ),
    },
    {
      title: "Hạn Sử Dụng",
      dataIndex: "expirationDate",
      key: "expirationDate",
      align: "center",
      width: 120,
      render: (date) => (
        <div className="text-sm">
          {date
            ? new Date(date).toLocaleDateString("vi-VN")
            : "N/A"}
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "isDisplayed",
      key: "isDisplayed",
      align: "center",
      width: 100,
      render: (isDisplayed) => (
        <Tag
          icon={isDisplayed ? <CheckCircleOutlined /> : <StopOutlined />}
          color={isDisplayed ? "success" : "error"}
        >
          {isDisplayed ? "Hiển thị" : "Ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      align: "center",
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => onSelectDetail(record)}
          className="bg-gradient-to-r from-orange-400 to-orange-500 border-0"
        >
          Chỉnh Sửa
        </Button>
      ),
    },
  ];

  return (
    <FitBridgeModal
      open={isOpen}
      onCancel={onClose}
      title="Danh Sách Loại Hàng"
      titleIcon={<TagOutlined />}
      width={1000}
      footer={null}
    >
      <Table
        dataSource={productDetails || []}
        columns={columns}
        rowKey="id"
        pagination={{
          pageSize: 5,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} Loại hàng`,
        }}
        scroll={{ x: 800 }}
      />
    </FitBridgeModal>
  );
}

