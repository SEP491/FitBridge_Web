import React from "react";
import {
  Descriptions,
  Timeline,
  Card,
  Empty,
  Tag,
  Image,
  Button,
} from "antd";
import {
  ShoppingCartOutlined,
  CalendarOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  TagOutlined,
} from "@ant-design/icons";
import FitBridgeModal from "../../../components/FitBridgeModal";
import defaultImage from "../../../assets/LogoColor.png";

export default function OrderDetailModal({
  isOpen,
  onClose,
  selectedOrder,
  getStatusColor,
  getStatusIcon,
  getPaymentMethodDisplay,
  handleCancelOrder,
  openStatusUpdateModal,
  setIsShippingModalOpen,
}) {
  if (!selectedOrder) return null;

  return (
    <FitBridgeModal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 text-lg">
          <ShoppingCartOutlined className="text-orange-500" />
          <span>Chi Tiết Đơn Hàng</span>
        </div>
      }
      width={900}
      footer={
        selectedOrder.currentStatus !== "Finished" &&
        selectedOrder.currentStatus !== "Cancelled" ? (
          <div className="flex justify-end gap-3">
            <Button onClick={onClose}>Đóng</Button>
            {selectedOrder.currentStatus === "Created" && (
              <>
                <Button
                  danger
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  Hủy Đơn
                </Button>
                <Button
                  type="primary"
                  onClick={() => openStatusUpdateModal("Pending")}
                >
                  Xác Nhận Xử Lý
                </Button>
              </>
            )}
            {selectedOrder.currentStatus === "Pending" && (
              <>
                <Button
                  danger
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  Hủy Đơn
                </Button>
                <Button
                  type="primary"
                  onClick={() => openStatusUpdateModal("Processing")}
                  className="bg-blue-500"
                >
                  Xác Nhận Xử Lý
                </Button>
              </>
            )}
            {selectedOrder.currentStatus === "Processing" && (
              <>
                <Button
                  type="primary"
                  onClick={() => setIsShippingModalOpen(true)}
                >
                  Tạo Đơn Giao Hàng
                </Button>
              </>
            )}
          </div>
        ) : (
          <Button onClick={onClose}>Đóng</Button>
        )
      }
    >
      <div className="space-y-6 gap-3 overflow-y-scroll w-full h-[60vh] flex flex-col">
        {/* Order Info */}
        <Descriptions
          title={
            <span className="font-semibold text-base">Thông Tin Đơn Hàng</span>
          }
          bordered
          column={4}
          size="small"
          style={{
            backgroundColor: "#eff6ff",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <Descriptions.Item label="Mã Đơn Hàng" span={3}>
            <span className="font-mono font-semibold">{selectedOrder.id}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng Thái">
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
              {selectedOrder.currentStatus === "InReturning" && "Đang Hoàn Trả"}
              {selectedOrder.currentStatus === "Returned" && "Đã Hoàn Trả"}
              {selectedOrder.currentStatus === "CustomerNotReceived" && "Khách Không Nhận"}
              {selectedOrder.currentStatus === "Finished" && "Hoàn Thành"}
              {selectedOrder.currentStatus === "Cancelled" && "Đã Hủy"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Phương Thức Thanh Toán" span={3}>
            <Tag icon={<CreditCardOutlined />} color="purple">
              {getPaymentMethodDisplay(selectedOrder)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Phí Vận Chuyển">
            <span className="font-medium text-orange-600">
              {selectedOrder.shippingFee.toLocaleString("vi-VN")} ₫
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Mã Coupon" span={3}>
            <Tag icon={<TagOutlined />} color="gold">
              {selectedOrder.couponId}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng Tiền" span={2}>
            <span className="text-xl font-bold text-green-600">
              {selectedOrder.totalAmount.toLocaleString("vi-VN")} ₫
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Ngày Tạo" span={3}>
            <CalendarOutlined className="mr-2" />
            {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
          </Descriptions.Item>
          <Descriptions.Item label="Cập Nhật" span={2}>
            <CalendarOutlined className="mr-2" />
            {new Date(selectedOrder.updatedAt).toLocaleString("vi-VN")}
          </Descriptions.Item>

          <Descriptions.Item label="Link thanh toán" span={3}>
            {selectedOrder.checkoutUrl ? (
              <a
                href={selectedOrder.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedOrder.checkoutUrl}
              </a>
            ) : (
              "N/A"
            )}
          </Descriptions.Item>
        </Descriptions>

        {/* Shipping Details */}
        <Descriptions
          title={
            <span className="font-semibold text-base">
              Thông Tin Giao Hàng
            </span>
          }
          bordered
          column={2}
          size="small"
          style={{
            backgroundColor: "#f0fdf4",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <Descriptions.Item label="Người Nhận" span={2}>
            <UserOutlined className="mr-2" />
            <span className="font-semibold">
              {selectedOrder.shippingDetail?.receiverName}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Số Điện Thoại" span={2}>
            <PhoneOutlined className="mr-2" />
            {selectedOrder.shippingDetail?.phoneNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Địa Chỉ" span={2}>
            <EnvironmentOutlined className="mr-2 text-red-500" />
            {selectedOrder.shippingDetail?.googleMapAddressString}
          </Descriptions.Item>
          {selectedOrder.shippingDetail?.note && (
            <Descriptions.Item label="Ghi Chú" span={2}>
              <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                {selectedOrder.shippingDetail?.note}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Order Items */}
        <Card
          size="small"
          title="Sản Phẩm Đặt Hàng"
          style={{ backgroundColor: "#faf5ff" }}
        >
          {selectedOrder.orderItems.length > 0 ? (
            <div className="space-y-3">
              {selectedOrder.orderItems.map((item, index) => (
                <Card
                  key={item.productDetailId || index}
                  size="small"
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <div className="flex gap-4 items-start">
                    <Image
                      width={80}
                      height={80}
                      src={item.productDetail?.imageUrl || defaultImage}
                      alt={item.productDetail?.productName || "Sản phẩm"}
                      fallback={defaultImage}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-base text-gray-900 mb-2">
                        {item.productDetail?.productName || "Sản phẩm"}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Hương vị:</span>{" "}
                          <Tag color="blue">
                            {item.productDetail?.flavourName || "N/A"}
                          </Tag>
                        </div>
                        <div>
                          <span className="text-gray-500">Trọng lượng:</span>{" "}
                          <Tag color="green">
                            {item.productDetail?.weightValue}{" "}
                            {item.productDetail?.weightUnit}
                          </Tag>
                        </div>
                        <div>
                          <span className="text-gray-500">Số lượng:</span>{" "}
                          <span className="font-medium">x{item.quantity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">HSD:</span>{" "}
                          <span className="text-orange-600">
                            {new Date(
                              item.productDetail?.expirationDate
                            ).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-gray-400 line-through text-sm">
                        {item.productDetail?.displayPrice.toLocaleString(
                          "vi-VN"
                        )}{" "}
                        ₫
                      </div>
                      <div className="text-green-600 font-bold text-lg">
                        {item.price.toLocaleString("vi-VN")} ₫
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="Không có sản phẩm" />
          )}
        </Card>

        {/* Order Timeline */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <div className="font-semibold text-base mb-4">
            Trạng Thái Đơn Hàng
          </div>
          <Timeline
            items={[
              {
                color: "green",
                children: (
                  <div>
                    <div className="font-medium">Đơn hàng được tạo</div>
                    <div className="text-xs text-gray-500">
                      {new Date(selectedOrder.createdAt).toLocaleString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                ),
              },
              (selectedOrder.currentStatus === "Pending" ||
                selectedOrder.currentStatus === "Processing" ||
                selectedOrder.currentStatus === "Assigning" ||
                selectedOrder.currentStatus === "Shipping" ||
                selectedOrder.currentStatus === "Finished") && {
                color: "orange",
                children: (
                  <div>
                    <div className="font-medium">Chờ xử lý</div>
                  </div>
                ),
              },
              (selectedOrder.currentStatus === "Processing" ||
                selectedOrder.currentStatus === "Assigning" ||
                selectedOrder.currentStatus === "Shipping" ||
                selectedOrder.currentStatus === "Finished") && {
                color: "blue",
                children: (
                  <div>
                    <div className="font-medium">Đang xử lý</div>
                  </div>
                ),
              },
              (selectedOrder.currentStatus === "Assigning" ||
                selectedOrder.currentStatus === "Shipping" ||
                selectedOrder.currentStatus === "Finished") && {
                color: "purple",
                children: (
                  <div>
                    <div className="font-medium">Đang phân công giao hàng</div>
                  </div>
                ),
              },
              (selectedOrder.currentStatus === "Shipping" ||
                selectedOrder.currentStatus === "Finished") && {
                color: "cyan",
                children: (
                  <div>
                    <div className="font-medium">Đang giao hàng</div>
                  </div>
                ),
              },
              selectedOrder.currentStatus === "Finished" && {
                color: "lime",
                children: (
                  <div>
                    <div className="font-medium">Hoàn thành đơn hàng</div>
                    <div className="text-xs text-gray-500">
                      {new Date(selectedOrder.updatedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                ),
              },
              selectedOrder.currentStatus === "Cancelled" && {
                color: "red",
                children: (
                  <div>
                    <div className="font-medium">Đơn hàng đã hủy</div>
                    <div className="text-xs text-gray-500">
                      {new Date(selectedOrder.updatedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </div>
                  </div>
                ),
              },
            ].filter(Boolean)}
          />
        </div>
      </div>
    </FitBridgeModal>
  );
}
