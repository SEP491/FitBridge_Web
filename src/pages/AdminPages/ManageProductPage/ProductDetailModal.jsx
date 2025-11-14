import React from "react";
import { Row, Col, Card, Tag, Image, Descriptions, Collapse } from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShoppingOutlined,
  TagOutlined,
} from "@ant-design/icons";
import FitBridgeModal from "../../../components/FitBridgeModal";
import defaultImage from "../../../assets/LogoColor.png";

export default function ProductDetailModal({
  isOpen,
  onClose,
  selectedProduct,
}) {
  return (
    <FitBridgeModal
      open={isOpen}
      onCancel={onClose}
      title="Chi Tiết Sản Phẩm"
      titleIcon={<EyeOutlined />}
      width={1000}
      logoSize="medium"
      bodyStyle={{ padding: "0", maxHeight: "75vh", overflowY: "auto" }}
    >
      {selectedProduct && (
        <div className="flex flex-col">
          {/* Main Content */}
          <div className="p-6 flex flex-col gap-5 space-y-6">
            {/* Product Info Card */}
            <Card
              size="small"
              className="shadow-sm hover:shadow-md transition-shadow"
              title={
                <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                  <ShoppingOutlined />
                  Thông Tin Sản Phẩm
                </span>
              }
              bordered={true}
              style={{ borderColor: "#FFE5E9" }}
            >
              <div className="flex gap-1 flex-row mb-2">
                <div className="col-span-1 border-2 border-gray-300 flex justify-center items-center rounded-lg">
                  <Image
                    style={{ objectFit: "contain" }}
                    width={120}
                    height={100}
                    src={selectedProduct.coverImageUrl || defaultImage}
                    alt={selectedProduct.name}
                    fallback={defaultImage}
                  />
                </div>
                <div className="col-span-4 ">
                  <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
                    <Descriptions.Item label="Tên Sản Phẩm" span={2}>
                      <div className="font-semibold text-base">
                        {selectedProduct.name}
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Thương Hiệu">
                      <Tag color="blue">{selectedProduct.brandName}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Danh Mục">
                      <Tag color="green">{selectedProduct.subCategoryName}</Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Xuất Xứ">
                      <Tag color="purple">{selectedProduct.countryOfOrigin || "N/A country"}</Tag>
                    </Descriptions.Item>
                    
                  </Descriptions>
                </div>
              </div>

              <Descriptions column={{ xs: 1, sm: 2 }} bordered size="middle">
                <Descriptions.Item label="Mô Tả" span={2}>
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedProduct.description || "Không có mô tả"}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng Đã Bán" >
                  <span className="font-bold text-orange-600">
                    {selectedProduct.totalSold || 0}
                  </span>
                </Descriptions.Item>
                
                <Descriptions.Item label="Ngày Tạo">
                  {selectedProduct.createdAt
                    ? new Date(selectedProduct.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Cập Nhật Lần Cuối">
                  {selectedProduct.updatedAt
                    ? new Date(selectedProduct.updatedAt).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Product Details (Variants) */}
            {selectedProduct.productDetails &&
              selectedProduct.productDetails.length > 0 && (
                <Card
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  title={
                    <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                      <TagOutlined />
                      Danh Sách Lô Hàng ({
                        selectedProduct.productDetails.length
                      }{" "}
                      lô)
                    </span>
                  }
                  bordered={true}
                  style={{ borderColor: "#FFE5E9" }}
                >
                  <Collapse
                    accordion
                    className="bg-transparent"
                    items={selectedProduct.productDetails.map(
                      (detail, index) => ({
                        key: index.toString(),
                        label: (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <span className="text-base font-semibold text-gray-800">
                                Lô #{index + 1} - {detail.flavourName} (
                                {detail.weightValue}
                                {detail.weightUnit})
                              </span>
                              {detail.isNearExpired && (
                                <Tag color="error" icon={<StopOutlined />}>
                                  Sắp hết hạn ({detail.daysToExpire} ngày)
                                </Tag>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">
                                HSD:{" "}
                                {detail.expirationDate
                                  ? new Date(
                                      detail.expirationDate
                                    ).toLocaleDateString("vi-VN")
                                  : "N/A"}
                              </span>
                              <Tag
                                color={detail.isDisplayed ? "success" : "error"}
                                icon={
                                  detail.isDisplayed ? (
                                    <CheckCircleOutlined />
                                  ) : (
                                    <StopOutlined />
                                  )
                                }
                              >
                                {detail.isDisplayed ? "Hiển thị" : "Ẩn"}
                              </Tag>
                            </div>
                          </div>
                        ),
                        children: (
                          <Row gutter={[24, 16]}>
                            {/* Product Image and Price */}
                            <Col xs={24} md={8}>
                              <div className="flex flex-col gap-3">
                                {detail.imageUrl ? (
                                  <Image
                                    width="100%"
                                    height={180}
                                    src={detail.imageUrl}
                                    alt={`${selectedProduct.name} - ${detail.flavourName}`}
                                    className="rounded-lg object-cover border-2 border-gray-100"
                                    style={{objectFit:'contain'}}
                                  />
                                ) : (
                                  <div className="w-full h-[180px] bg-gray-200 rounded-lg flex items-center justify-center">
                                    <ShoppingOutlined className="text-4xl text-gray-400" />
                                  </div>
                                )}
                                
                                {/* Price Section */}
                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                  <div className="text-sm font-semibold text-gray-700 mb-2">
                                    Thông Tin Giá
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <div className="text-xs text-gray-600">
                                        Giá Gốc
                                      </div>
                                      <div className=" text-gray-500 font-medium">
                                        {detail.originalPrice?.toLocaleString(
                                          "vi-VN"
                                        )}
                                        ₫
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-600">
                                        Giá Hiển Thị
                                      </div>
                                      <div className="font-bold text-orange-600 text-lg">
                                        {detail.displayPrice?.toLocaleString(
                                          "vi-VN"
                                        )}
                                        ₫
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-600">
                                        Giá Sale
                                      </div>
                                      <div className="font-bold text-green-600 text-lg">
                                        {detail.salePrice?.toLocaleString(
                                          "vi-VN"
                                        )}
                                        ₫
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* {Day to Expire Section} */}
                                <div className={`p-3 rounded-lg items-center border ${
                                  detail.isNearExpired 
                                    ? 'bg-red-50 border-red-200' 
                                    : 'bg-green-50 border-green-200'
                                }`}>
                                  <div className="text-sm flex items-center justify-center gap-2 font-semibold text-gray-700">
                                    Hạn Sử Dụng Còn Lại: 
                                     <p className={`font-bold text-sm ${
                                    detail.isNearExpired 
                                      ? 'text-red-600' 
                                      : 'text-green-600'
                                  }`}>
                                    {detail.daysToExpire !== undefined
                                      ? `${detail.daysToExpire} ngày`
                                      : "N/A"}
                                  </p>
                                  </div>
                                 
                                </div>
                              </div>
                            </Col>

                            {/* Product Details */}
                            <Col xs={24} md={16}>
                              <div className="space-y-4">
                                

                                {/* Stock & Sales Section */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                  <div className="text-sm font-semibold text-gray-700 mb-2">
                                    Kho Hàng & Bán Hàng
                                  </div>
                                  <Row gutter={[16, 12]}>
                                    <Col span={8}>
                                      <div className="text-xs text-gray-600">
                                        Tồn Kho
                                      </div>
                                      <div className="font-bold text-blue-600 text-xl">
                                        {detail.quantity}
                                      </div>
                                    </Col>
                                    <Col span={8}>
                                      <div className="text-xs text-gray-600">
                                        Đã Bán
                                      </div>
                                      <div className="font-bold text-green-600 text-xl">
                                        {detail.soldQuantity || 0}
                                      </div>
                                    </Col>
                                    <Col span={8}>
                                      <div className="text-xs text-gray-600">
                                        Hạn Sử Dụng
                                      </div>
                                      <div className="font-semibold text-gray-800">
                                        {detail.expirationDate
                                          ? new Date(
                                              detail.expirationDate
                                            ).toLocaleDateString("vi-VN")
                                          : "N/A"}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>

                                {/* Serving Information Section */}
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                  <div className="text-sm font-semibold text-gray-700 mb-2">
                                    Thông Tin Khẩu Phần
                                  </div>
                                  <Row gutter={[16, 12]}>
                                    <Col span={12}>
                                      <div className="text-xs text-gray-600 mb-1">
                                        Kích Thước Khẩu Phần
                                      </div>
                                      <div className="font-medium text-gray-800">
                                        {detail.servingSizeInformation || "N/A"}
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <div className="text-xs text-gray-600 mb-1">
                                        Số Lần Dùng Mỗi Hộp
                                      </div>
                                      <div className="font-medium text-gray-800">
                                        {detail.servingsPerContainerInformation ||
                                          "N/A"}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>

                                {/* Nutritional Info Section */}
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                  <div className="text-sm font-semibold text-gray-700 mb-2">
                                    Thông Tin Dinh Dưỡng (Mỗi Khẩu Phần)
                                  </div>
                                  <Row gutter={[16, 12]}>
                                    <Col span={8}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <div>
                                          <div className="text-xs text-gray-600">
                                            Protein
                                          </div>
                                          <div className="font-bold text-green-700">
                                            {detail.proteinPerServingGrams}g
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col span={8}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <div>
                                          <div className="text-xs text-gray-600">
                                            Calories
                                          </div>
                                          <div className="font-bold text-orange-700">
                                            {detail.caloriesPerServingKcal} kcal
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                    <Col span={8}>
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <div>
                                          <div className="text-xs text-gray-600">
                                            BCAA
                                          </div>
                                          <div className="font-bold text-blue-700">
                                            {detail.bcaaPerServingGrams}g
                                          </div>
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>
                                </div>

                                {/* Additional Information Section */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                  <div className="text-sm font-semibold text-gray-700 mb-2">
                                    Thông Tin Bổ Sung
                                  </div>
                                  <Row gutter={[16, 12]}>
                                    <Col span={12}>
                                      <div className="text-xs text-gray-600">
                                        Ngày Tạo
                                      </div>
                                      <div className="font-medium text-gray-800">
                                        {detail.createdAt
                                          ? new Date(
                                              detail.createdAt
                                            ).toLocaleDateString("vi-VN", {
                                              year: "numeric",
                                              month: "2-digit",
                                              day: "2-digit",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "N/A"}
                                      </div>
                                    </Col>
                                    <Col span={12}>
                                      <div className="text-xs text-gray-600">
                                        Cập Nhật Lần Cuối
                                      </div>
                                      <div className="font-medium text-gray-800">
                                        {detail.updatedAt
                                          ? new Date(
                                              detail.updatedAt
                                            ).toLocaleDateString("vi-VN", {
                                              year: "numeric",
                                              month: "2-digit",
                                              day: "2-digit",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : "N/A"}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        ),
                      })
                    )}
                  />
                </Card>
              )}
          </div>
        </div>
      )}
    </FitBridgeModal>
  );
}
