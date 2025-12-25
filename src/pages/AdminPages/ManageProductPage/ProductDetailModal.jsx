import React from "react";
import {
  Row,
  Col,
  Card,
  Tag,
  Image,
  Descriptions,
  Collapse,
  Tooltip,
  Button,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShoppingOutlined,
  TagOutlined,
  FormOutlined,
  PlusCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import FitBridgeModal from "../../../components/FitBridgeModal";
import defaultImage from "../../../assets/LogoColor.png";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import systemconfigService from "../../../services/systemconfigService";

export default function ProductDetailModal({
  isOpen,
  onClose,
  selectedProduct,
  onUpdate,
  onCreateDetail,
  onUpdateDetail,
}) {
  const [autoHideDays, setAutoHideDays] = useState(30); // Default to 30 days
  const [nearExpiredWarningDays, setNearExpiredWarningDays] = useState(30); // Default to 30 days

  // Fetch system configurations
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        // Fetch AutoHideProductBeforeExpirationDate
        const autoHideResponse = await systemconfigService.getSystemConfigByKey(
          "AutoHideProductBeforeExpirationDate"
        );
        // Handle different response formats
        const autoHideValue = autoHideResponse?.data
        if (autoHideValue) {
          const days = parseInt(autoHideValue, 10);
          if (!isNaN(days) && days > 0) {
            setAutoHideDays(days);
          }
        }

        // Fetch NearExpiredDateProductWarning
        const nearExpiredResponse = await systemconfigService.getSystemConfigByKey(
          "NearExpiredDateProductWarning"
        );
        // Handle different response formats
        const nearExpiredValue = nearExpiredResponse?.data
        if (nearExpiredValue) {
          const days = parseInt(nearExpiredValue, 10);
          if (!isNaN(days) && days > 0) {
            setNearExpiredWarningDays(days);
            console.log("NearExpiredDateProductWarning set to:", days, "from response:", nearExpiredResponse);
          }
        } else {
          console.log("NearExpiredDateProductWarning not found in response:", nearExpiredResponse);
        }
      } catch (error) {
        console.error("Error fetching system configs:", error);
        // Keep default values if fetch fails
      }
    };

    if (isOpen) {
      fetchConfigs();
    }
  }, [isOpen]);

  // Helper function to calculate expiration status
  const getExpirationStatus = (expirationDate, warningDays = nearExpiredWarningDays) => {
    if (!expirationDate) return null;

    const today = dayjs().startOf("day");
    // Try to parse date in different formats
    let expDate = dayjs(expirationDate);
    
    // If dayjs can't parse it, try DD/MM/YYYY format
    if (!expDate.isValid() && typeof expirationDate === 'string') {
      // Try DD/MM/YYYY format
      const parts = expirationDate.split('/');
      if (parts.length === 3) {
        expDate = dayjs(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    }
    
    if (!expDate.isValid()) {
      console.error("Invalid expiration date:", expirationDate);
      return null;
    }
    
    expDate = expDate.startOf("day");
    const daysDiff = expDate.diff(today, "day");

    console.log("Expiration check:", {
      expirationDate,
      today: today.format("DD/MM/YYYY"),
      expDate: expDate.format("DD/MM/YYYY"),
      daysDiff,
      warningDays,
      shouldShowWarning: daysDiff <= warningDays && daysDiff >= 0,
    });

    if (daysDiff < 0) {
      // Expired
      return {
        isExpired: true,
        isNearExpired: false,
        daysDiff: Math.abs(daysDiff),
      };
    } else if (daysDiff <= warningDays) {
      // Near expiration (within configured NearExpiredDateProductWarning days)
      return {
        isExpired: false,
        isNearExpired: true,
        daysDiff: daysDiff,
      };
    } else {
      // Not expired and not near expiration
      return {
        isExpired: false,
        isNearExpired: false,
        daysDiff: daysDiff,
      };
    }
  };

  const handleUpdateProduct = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleCreateDetail = () => {
    if (onCreateDetail) {
      onCreateDetail();
    }
  };

  const handleUpdateDetail = () => {
    if (onUpdateDetail) {
      onUpdateDetail();
    }
  };

  // Helper function to render detail content
  const renderDetailContent = (detail, expirationStatus, isExpired, isNearExpired, daysDiff) => {
    return (
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
                style={{ objectFit: "contain" }}
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
                  <div className="text-xs text-gray-600">Giá Gốc</div>
                  <div className=" text-gray-500 font-medium">
                    {detail.originalPrice?.toLocaleString("vi-VN")}₫
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Giá Hiển Thị</div>
                  <div className="font-bold text-orange-600 text-lg">
                    {detail.displayPrice?.toLocaleString("vi-VN")}₫
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Giá Sale</div>
                  <div className="font-bold text-green-600 text-lg">
                    {detail.salePrice?.toLocaleString("vi-VN")}₫
                  </div>
                </div>
              </div>
            </div>

            {/* Day to Expire Section */}
            {expirationStatus && (
              <div
                className={`p-3 rounded-lg items-center border ${
                  isExpired
                    ? "bg-red-50 border-red-200"
                    : isNearExpired
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-green-50 border-green-200"
                }`}
              >
                <div className="text-sm flex items-center justify-center gap-2 font-semibold text-gray-700">
                  {isExpired ? "Đã hết hạn:" : "Hạn Sử Dụng Còn Lại:"}
                  <p
                    className={`font-bold text-sm ${
                      isExpired
                        ? "text-red-600"
                        : isNearExpired
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {daysDiff} ngày
                  </p>
                </div>
              </div>
            )}
          </div>
        </Col>

        {/* Product Details */}
        <Col xs={24} md={16}>
          <div className="space-y-4">
            {/* Stock & Sales Section */}
            <div className="bg-blue-50 px-6 py-4 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Kho Hàng & Bán Hàng
              </div>
              <Row gutter={[16, 12]}>
                <Col span={8}>
                  <div className="text-xs text-gray-600">Tồn Kho</div>
                  <div className="font-bold text-blue-600 text-xl">
                    {detail.quantity}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-600">Đã Bán</div>
                  <div className="font-bold text-green-600 text-xl">
                    {detail.soldQuantity || 0}
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-xs text-gray-600">Hạn Sử Dụng</div>
                  <div className="font-semibold text-gray-800">
                    {detail.expirationDate
                      ? new Date(detail.expirationDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Serving Information Section */}
            <div className="bg-purple-50 px-6 py-4 rounded-lg border border-purple-200">
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
                    {detail.servingsPerContainerInformation || "N/A"}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Nutritional Info Section */}
            <div className="bg-green-50 px-6 py-4 rounded-lg border border-green-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Thông Tin Dinh Dưỡng (Mỗi Khẩu Phần)
              </div>
              <Row gutter={[16, 12]}>
                <Col span={8}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="text-xs text-gray-600">Protein</div>
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
                      <div className="text-xs text-gray-600">Calories</div>
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
                      <div className="text-xs text-gray-600">BCAA</div>
                      <div className="font-bold text-blue-700">
                        {detail.bcaaPerServingGrams}g
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Additional Information Section */}
            <div className="bg-gray-50 px-6 py-4 rounded-lg border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-2">
                Thông Tin Bổ Sung
              </div>
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <div className="text-xs text-gray-600">Ngày Tạo</div>
                  <div className="font-medium text-gray-800">
                    {detail.createdAt
                      ? new Date(detail.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </div>
                </Col>
                <Col span={12}>
                  <div className="text-xs text-gray-600">Cập Nhật Lần Cuối</div>
                  <div className="font-medium text-gray-800">
                    {detail.updatedAt
                      ? new Date(detail.updatedAt).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : "N/A"}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    );
  };

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
                <div className="flex flex-row justify-between">
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <ShoppingOutlined />
                    Thông Tin Sản Phẩm
                  </span>
                  <Tooltip title="Chỉnh sửa sản phẩm">
                    <span
                      onClick={handleUpdateProduct}
                      className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]"
                    >
                      <FormOutlined style={{ fontSize: 20 }} />
                    </span>
                  </Tooltip>
                </div>
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
                  <Descriptions
                    column={{ xs: 1, sm: 2 }}
                    bordered
                    size="middle"
                  >
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
                      <Tag color="purple">
                        {selectedProduct.countryOfOrigin || "N/A country"}
                      </Tag>
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
                <Descriptions.Item label="Tổng Đã Bán">
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
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
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
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Product Details (Variants) */}
            <Card
              size="small"
              className="shadow-sm hover:shadow-md transition-shadow"
              title={
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <TagOutlined />
                    Danh Sách Loại Hàng (
                    {selectedProduct.productDetails?.length || 0} Loại)
                  </span>
                  <div className="flex items-center gap-3">
                    <Button
                      icon={<PlusCircleOutlined />}
                      onClick={handleCreateDetail}
                      style={{ backgroundColor: "#ED2A46", color: "white" }}
                    >
                      Thêm Loại Hàng
                    </Button>
                    {selectedProduct.productDetails &&
                      selectedProduct.productDetails.length > 0 && (
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={handleUpdateDetail}
                        >
                          Cập Nhật Loại Hàng
                        </Button>
                      )}
                  </div>
                </div>
              }
              style={{ borderColor: "#FFE5E9" }}
            >
              {selectedProduct.productDetails &&
              selectedProduct.productDetails.length > 0 ? (
                (() => {
                  // Group product details by flavour
                  const groupedByFlavour = {};
                  selectedProduct.productDetails.forEach((detail) => {
                    const flavourName = detail.flavourName || "Không có hương vị";
                    if (!groupedByFlavour[flavourName]) {
                      groupedByFlavour[flavourName] = [];
                    }
                    groupedByFlavour[flavourName].push(detail);
                  });

                  // Create collapse items grouped by flavour
                  const flavourItems = Object.keys(groupedByFlavour)
                    .sort()
                    .map((flavourName, flavourIndex) => {
                      const details = groupedByFlavour[flavourName];
                      
                      // Count expired and near expired weights for this flavour
                      let expiredCount = 0;
                      let nearExpiredCount = 0;
                      
                      details.forEach((detail) => {
                        const expirationStatus = getExpirationStatus(
                          detail.expirationDate,
                          nearExpiredWarningDays
                        );
                        if (expirationStatus?.isExpired) {
                          expiredCount++;
                        } else if (expirationStatus?.isNearExpired) {
                          nearExpiredCount++;
                        }
                      });
                      
                      // Create weight items for this flavour
                      const weightItems = details.map((detail, weightIndex) => {
                        const expirationStatus = getExpirationStatus(
                          detail.expirationDate,
                          nearExpiredWarningDays
                        );
                        const isExpired = expirationStatus?.isExpired || false;
                        const isNearExpired =
                          expirationStatus?.isNearExpired || false;
                        const daysDiff = expirationStatus?.daysDiff || 0;
                        const shouldStopBusiness =
                          isExpired ||
                          !detail.isDisplayed ||
                          (!isExpired && daysDiff < autoHideDays);

                        return {
                          key: `weight-${flavourIndex}-${weightIndex}`,
                          label: (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <span className="text-base font-semibold text-gray-800">
                                  {detail.weightValue} {detail.weightUnit}
                                </span>
                                {isExpired && (
                                  <Tag color="error" icon={<StopOutlined />}>
                                    Đã hết hạn ({daysDiff} ngày)
                                  </Tag>
                                )}
                                {!isExpired && isNearExpired && (
                                  <Tag color="warning" icon={<StopOutlined />}>
                                    Sắp hết hạn ({daysDiff} ngày)
                                  </Tag>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {shouldStopBusiness ? (
                                  <Tag color="error" icon={<StopOutlined />}>
                                    Ngừng kinh doanh
                                  </Tag>
                                ) : (
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
                                )}
                                <span className="text-sm text-gray-600">
                                  HSD:{" "}
                                  {detail.expirationDate
                                    ? new Date(
                                        detail.expirationDate
                                      ).toLocaleDateString("vi-VN")
                                    : "N/A"}
                                </span>
                              </div>
                            </div>
                          ),
                          children: renderDetailContent(
                            detail,
                            expirationStatus,
                            isExpired,
                            isNearExpired,
                            daysDiff
                          ),
                        };
                      });

                      return {
                        key: `flavour-${flavourIndex}`,
                        label: (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-lg font-bold text-[#ED2A46]">
                                {flavourName}
                              </span>
                              <Tag color="blue">
                                {details.length} trọng lượng
                              </Tag>
                              {nearExpiredCount > 0 && (
                                <Tag color="warning" icon={<StopOutlined />}>
                                  {nearExpiredCount} trọng lượng sắp hết hạn
                                </Tag>
                              )}
                              {expiredCount > 0 && (
                                <Tag color="error" icon={<StopOutlined />}>
                                  {expiredCount} trọng lượng đã hết hạn
                                </Tag>
                              )}
                            </div>
                          </div>
                        ),
                        children: (
                          <Collapse
                            accordion
                            className="bg-transparent"
                            items={weightItems}
                          />
                        ),
                      };
                    });

                  return (
                    <Collapse
                      accordion
                      className="bg-transparent"
                      items={flavourItems}
                    />
                  );
                })()
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="bg-gray-100 rounded-full p-6 mb-4">
                    <TagOutlined
                      style={{ fontSize: 48 }}
                      className="text-gray-400"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Chưa có loại hàng nào
                  </h3>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    Sản phẩm này chưa có loại hàng nào. Hãy thêm loại hàng đầu
                    tiên để bắt đầu bán sản phẩm.
                  </p>
                  <button
                    onClick={handleCreateDetail}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    <PlusCircleOutlined style={{ fontSize: 18 }} />
                    Thêm Loại Hàng Đầu Tiên
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </FitBridgeModal>
  );
}
