import React from "react";
import { Card, Row, Col, Statistic, Button } from "antd";
import { BellOutlined, InfoCircleOutlined, SettingOutlined } from "@ant-design/icons";

export default function ManageNotificationPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-2">
          <BellOutlined />
          Quản Lý Thông Báo
        </h1>
        <p className="text-gray-600">
          Cấu hình và theo dõi các thông báo gửi tới người dùng hệ thống
        </p>
      </div>

      {/* Simple Statistics Skeleton */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Tổng thông báo (demo)"
              value={0}
              prefix={<BellOutlined style={{ color: "#FF914D" }} />}
              valueStyle={{
                color: "#FF914D",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Đã gửi hôm nay (demo)"
              value={0}
              prefix={<InfoCircleOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{
                color: "#1890ff",
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
            Tính năng quản lý thông báo đang được phát triển
          </h2>
          <p className="text-gray-600 max-w-xl mb-6">
            Khu vực này sẽ cho phép bạn tạo, cấu hình và theo dõi các thông báo đẩy, email
            hoặc in-app để đảm bảo người dùng luôn nhận được thông tin quan trọng.
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
