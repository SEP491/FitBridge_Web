import React from "react";
import { Card, Row, Col, Statistic, Button } from "antd";
import { AppstoreOutlined, GiftOutlined, SettingOutlined } from "@ant-design/icons";

export default function ManagePackagesPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-2">
          <AppstoreOutlined />
          Quản Lý Gói Dịch Vụ
        </h1>
        <p className="text-gray-600">
          Quản lý và cấu hình các gói dịch vụ / combo sản phẩm trong hệ thống
        </p>
      </div>

      {/* Simple Statistics Skeleton */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Tổng gói (demo)"
              value={0}
              prefix={<GiftOutlined style={{ color: "#FF914D" }} />}
              valueStyle={{
                color: "#FF914D",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Placeholder */}
      <Card className="border-0 shadow-lg">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-4xl text-[#ED2A46]">
            <SettingOutlined />
          </div>
          <h2 className="text-xl font-semibold mb-2">
            Tính năng quản lý gói dịch vụ đang được phát triển
          </h2>
          <p className="text-gray-600 max-w-xl mb-6">
            Trong tương lai, bạn có thể tạo, chỉnh sửa và sắp xếp các gói dịch vụ hoặc combo
            sản phẩm để tối ưu doanh thu và trải nghiệm người dùng.
          </p>
          <Button
            type="primary"
            className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
            disabled
          >
            Sắp ra mắt
          </Button>
        </div>
      </Card>
    </div>
  );
}
