import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Spin,
  Tag,
  Table,
  Typography,
  Row,
  Col,
  Empty,
  Tooltip,
  ConfigProvider,
  Statistic,
} from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  HistoryOutlined,
  CalendarOutlined,
  DollarOutlined,
  CloseCircleOutlined,
  FireOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { FaFire, FaInfoCircle } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { IoFlame } from "react-icons/io5";
import toast from "react-hot-toast";
import hotResearchService from "../../../services/hotResearchService";
import FitBridgeModal from "../../../components/FitBridgeModal";
import dayjs from "dayjs";

const { Title } = Typography;

// Format VND currency
const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SubscriptionRegisPage() {
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [subscriptionAvailability, setSubscriptionAvailability] = useState({
    isAvailable: true,
    currentCount: 0,
    maxCount: 0,
  });

  // Check subscription availability
  const checkSubscriptionAvailability = async () => {
    try {
      const response =
        await hotResearchService.checkSubscipriontionAvailability();
      if (response?.data) {
        setSubscriptionAvailability({
          isAvailable: response.data.isHotResearchSubscriptionAvailable,
          currentCount: response.data.numOfCurrentHotResearchSubscription,
          maxCount: response.data.maxHotResearchSubscription,
        });
      }
    } catch (error) {
      console.error("Error checking subscription availability:", error);
    }
  };

  // Fetch subscription plans
  const fetchSubscriptionPlans = async () => {
    setLoading(true);
    try {
      const response = await hotResearchService.getSubscriptionPlan();
      if (response?.data) {
        setSubscriptionPlans(response.data);
      }
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast.error("Không thể tải gói đăng ký");
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription history
  const fetchSubscriptionHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await hotResearchService.getUserSubscriptionHistory({
        pageNumber: 1,
        pageSize: 100,
      });
      if (response?.data) {
        setSubscriptionHistory(response.data.items || response.data || []);
      }
    } catch (error) {
      console.error("Error fetching subscription history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchSubscriptionHistory();
    checkSubscriptionAvailability();
  }, []);

  // Handle payment for subscription
  const handlePaySubscription = async (plan) => {
    // Check availability before processing payment
    if (!subscriptionAvailability.isAvailable) {
      toast.error(
        `Bạn đã đạt giới hạn ${subscriptionAvailability.maxCount} gói Hot Research. Không thể đăng ký thêm.`
      );
      return;
    }

    setPaymentLoading(plan.id);
    try {
      const paymentData = {
        request: {
          couponId: null,
          customerPurchasedIdToExtend: null,
          shippingFee: 0,
          addressId: null,
          paymentMethodId: "01997597-d188-7f12-95f4-43ef8d442612",
          orderItems: [
            {
              quantity: 1,
              productDetailId: null,
              gymCourseId: null,
              gymPtId: null,
              subscriptionPlansInformationId: plan.id,
              freelancePTPackageId: null,
            },
          ],
        },
      };

      const response = await hotResearchService.paySubscription(paymentData);

      if (response?.data) {
        // Redirect to payment URL
        window.location.href =
          response.data?.data?.checkoutUrl || response?.paymentUrl;
      } else {
        toast.success("Đã tạo đơn hàng thành công!");
        // Refresh data
        fetchSubscriptionPlans();
        fetchSubscriptionHistory();
        checkSubscriptionAvailability();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error(
        error?.response?.data?.message || "Không thể xử lý thanh toán"
      );
    } finally {
      setPaymentLoading(null);
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;

    setCancelLoading(selectedSubscription.id);
    try {
      await hotResearchService.cancelSubscription(selectedSubscription.id);
      toast.success("Đã hủy gói đăng ký thành công!");
      setIsCancelModalOpen(false);
      setSelectedSubscription(null);
      // Refresh data
      fetchSubscriptionPlans();
      fetchSubscriptionHistory();
      checkSubscriptionAvailability();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error(
        error?.response?.data?.message || "Không thể hủy gói đăng ký"
      );
    } finally {
      setCancelLoading(null);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      Active: "green",
      Pending: "orange",
      Cancelled: "red",
      Expired: "gray",
    };
    return statusColors[status] || "default";
  };

  // Get status text
  const getStatusText = (status) => {
    const statusTexts = {
      Active: "Đang hoạt động",
      Pending: "Đang chờ",
      Cancelled: "Đã hủy",
      Expired: "Hết hạn",
    };
    return statusTexts[status] || status;
  };

  // History table columns
  const historyColumns = [
    {
      title: "Gói Đăng Ký",
      dataIndex: "planName",
      key: "planName",
      render: (text) => (
        <div className="flex items-center gap-2">
          <CrownOutlined className="text-[#FF914D]" />
          <span className="font-medium">{text || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Ngày Bắt Đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (
        <span>{date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}</span>
      ),
    },
    {
      title: "Ngày Kết Thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => (
        <span>{date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}</span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} className="px-3 py-1">
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_, record) => (
        <>
          {record.status === "Active" && (
            <Tooltip title="Hủy gói đăng ký">
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setSelectedSubscription(record);
                  setIsCancelModalOpen(true);
                }}
              >
                Hủy
              </Button>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  // Calculate statistics
  const statistics = {
    totalPlans: subscriptionPlans.length,
    activePlans: subscriptionPlans.filter((p) => p.isActiveForCurrentUser)
      .length,
    totalHistory: subscriptionHistory.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
          }
          tip="Đang tải dữ liệu..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title
            level={2}
            style={{
              margin: 0,
              color: "#ed2a46",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IoFlame style={{ marginRight: 12, color: "#ed2a46" }} />
            Đăng Ký Hot Research
          </Title>
          <p style={{ color: "#6b7280", marginTop: 8, marginBottom: 0 }}>
            Đăng ký gói Hot Research để tăng độ nhận diện phòng gym của bạn
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={8}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Gói Có Sẵn"
                value={statistics.totalPlans}
                prefix={<FireOutlined style={{ color: "#FF914D" }} />}
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
                title="Gói Đang Sử Dụng"
                value={statistics.activePlans}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Lịch Sử Đăng Ký"
                value={statistics.totalHistory}
                prefix={<HistoryOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Subscription Availability Warning */}
        {!subscriptionAvailability.isAvailable && (
          <Card className="border-0 shadow-lg mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-full">
                <StopOutlined className="text-2xl text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-600 mb-1">
                  Đã đạt giới hạn đăng ký Hot Research
                </h3>
                <p className="text-gray-600 mb-0">
                  Bạn đang sử dụng{" "}
                  <span className="font-bold text-red-500">
                    {subscriptionAvailability.currentCount}
                  </span>
                  /{subscriptionAvailability.maxCount} gói Hot Research được
                  phép. Vui lòng hủy một gói đang hoạt động để đăng ký gói mới.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Subscription Plans Section */}
        <Card className="border-0 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FaFire className="text-[#ED2A46] text-xl" />
              <Title level={4} className="!mb-0">
                Gói Đăng Ký Hot Research
              </Title>
            </div>
            {subscriptionAvailability.maxCount > 0 && (
              <Tag
                color={subscriptionAvailability.isAvailable ? "green" : "red"}
                className="px-3 py-1 text-sm"
                icon={
                  subscriptionAvailability.isAvailable ? (
                    <CheckCircleOutlined />
                  ) : (
                    <ExclamationCircleOutlined />
                  )
                }
              >
                {subscriptionAvailability.currentCount}/
                {subscriptionAvailability.maxCount} gói đã sử dụng
              </Tag>
            )}
          </div>

          {subscriptionPlans.length === 0 ? (
            <Empty description="Không có gói đăng ký nào" />
          ) : (
            <Row gutter={[24, 24]}>
              {subscriptionPlans.map((plan) => (
                <Col xs={24} md={12} lg={8} key={plan.id}>
                  <Card
                    className={`h-full shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                      plan.isActiveForCurrentUser
                        ? "border-green-400 bg-gradient-to-br from-green-50 to-emerald-50"
                        : "border-gray-100 hover:border-[#FF914D]"
                    }`}
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Plan Image */}
                    <div className="relative">
                      <img
                        src={
                          plan.imageUrl ||
                          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop"
                        }
                        alt={plan.planName}
                        className="w-full h-44 object-cover rounded-t-lg"
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg" />

                      {plan.isActiveForCurrentUser && (
                        <div className="absolute top-3 right-3">
                          <Tag
                            icon={<CheckCircleOutlined />}
                            color="green"
                            className="px-3 py-1 text-sm font-semibold shadow-md"
                          >
                            Đang sử dụng
                          </Tag>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Tag
                          icon={<FaFire />}
                          color="volcano"
                          className="px-3 py-1 text-sm font-semibold shadow-md"
                        >
                          {plan.featureKeyName === "HotResearch"
                            ? "Hot Research"
                            : plan.featureKeyName}
                        </Tag>
                      </div>

                      {/* Price overlay */}
                      <div className="absolute bottom-3 left-3">
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
                          <span className="text-2xl font-bold text-[#ED2A46]">
                            {formatVND(plan.planCharge)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Plan Content */}
                    <div className="p-5">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          {plan.planName}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                          {plan.description}
                        </p>
                      </div>

                      {/* Plan Details */}
                      <div className="space-y-2 mb-5">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <ClockCircleOutlined className="text-blue-500" />
                            <span className="text-gray-600 text-sm">
                              Thời hạn
                            </span>
                          </div>
                          <span className="font-bold text-blue-600">
                            {plan.duration} ngày
                          </span>
                        </div>

                        {plan.limitUsage && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <FaInfoCircle className="text-purple-500" />
                              <span className="text-gray-600 text-sm">
                                Giới hạn
                              </span>
                            </div>
                            <span className="font-bold text-purple-600">
                              {plan.limitUsage} lượt
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Current Subscription Info */}
                      {plan.isActiveForCurrentUser &&
                        plan.currentUserSubscription && (
                          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarOutlined className="text-green-600" />
                              <span className="font-semibold text-green-700 text-sm">
                                Gói đang hoạt động
                              </span>
                            </div>
                            <div className="text-xs text-green-600 space-y-1">
                              <p className="m-0">
                                Bắt đầu:{" "}
                                <span className="font-medium">
                                  {dayjs(
                                    plan.currentUserSubscription.startDate
                                  ).format("DD/MM/YYYY")}
                                </span>
                              </p>
                              <p className="m-0">
                                Kết thúc:{" "}
                                <span className="font-medium">
                                  {dayjs(
                                    plan.currentUserSubscription.endDate
                                  ).format("DD/MM/YYYY")}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Action Button */}
                      <Tooltip
                        title={
                          !subscriptionAvailability.isAvailable &&
                          !plan.isActiveForCurrentUser
                            ? `Đã đạt giới hạn ${subscriptionAvailability.maxCount} gói Hot Research`
                            : ""
                        }
                      >
                        <Button
                          type="primary"
                          size="large"
                          block
                          icon={
                            paymentLoading === plan.id ? (
                              <LoadingOutlined />
                            ) : !subscriptionAvailability.isAvailable &&
                              !plan.isActiveForCurrentUser ? (
                              <StopOutlined />
                            ) : (
                              <MdPayment />
                            )
                          }
                          onClick={() => handlePaySubscription(plan)}
                          disabled={
                            paymentLoading === plan.id ||
                            (!subscriptionAvailability.isAvailable &&
                              !plan.isActiveForCurrentUser)
                          }
                          className={`h-11 text-sm font-semibold rounded-lg ${
                            !subscriptionAvailability.isAvailable &&
                            !plan.isActiveForCurrentUser
                              ? "!bg-gray-400 !border-gray-400 cursor-not-allowed"
                              : plan.isActiveForCurrentUser
                              ? "!bg-blue-500 hover:!bg-blue-600 !border-blue-500"
                              : "!bg-orange-500 hover:!bg-orange-600 !border-orange-500"
                          }`}
                        >
                          {paymentLoading === plan.id
                            ? "Đang xử lý..."
                            : !subscriptionAvailability.isAvailable &&
                              !plan.isActiveForCurrentUser
                            ? "Đã đạt giới hạn"
                            : plan.isActiveForCurrentUser
                            ? "Gia Hạn Gói"
                            : "Đăng Ký Ngay"}
                        </Button>
                      </Tooltip>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>

        {/* Subscription History Section */}
        <Card className="border-0 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <HistoryOutlined className="text-[#ED2A46] text-xl" />
            <Title level={4} className="!mb-0">
              Lịch Sử Đăng Ký
            </Title>
          </div>

          {/* Results Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-orange-600">
                {subscriptionHistory.length}
              </span>{" "}
              lịch sử đăng ký
            </span>
          </div>

          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "linear-gradient(90deg, #FFE5E9 0%, #FFF0F2 100%)",
                  headerColor: "#333",
                  rowHoverBg: "#FFF9FA",
                },
              },
            }}
          >
            <Table
              dataSource={subscriptionHistory}
              columns={historyColumns}
              loading={loadingHistory}
              rowKey={(record) => record.id || record.userSubscriptionId}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                position: ["bottomCenter"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} mục`,
              }}
              className="rounded-lg overflow-hidden"
              scroll={{ x: 800 }}
              size="middle"
              locale={{
                emptyText: <Empty description="Chưa có lịch sử đăng ký nào" />,
              }}
            />
          </ConfigProvider>
        </Card>
      </div>

      {/* Cancel Subscription Modal */}
      <FitBridgeModal
        open={isCancelModalOpen}
        onCancel={() => {
          setIsCancelModalOpen(false);
          setSelectedSubscription(null);
        }}
        title="Xác Nhận Hủy Gói Đăng Ký"
        titleIcon={<CloseCircleOutlined />}
        width={500}
        footer={null}
      >
        <div className="py-4">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-red-100 rounded-full">
              <CloseCircleOutlined className="text-4xl text-red-500" />
            </div>
          </div>

          <div className="text-center mb-6">
            <Title level={4} className="!mb-2">
              Bạn có chắc chắn muốn hủy gói đăng ký?
            </Title>
            <p className="text-gray-500">
              Sau khi hủy, bạn sẽ không thể sử dụng các tính năng của gói cho
              đến khi đăng ký lại.
            </p>
          </div>

          {selectedSubscription && (
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gói đăng ký:</span>
                <span className="font-semibold">
                  {selectedSubscription.planName}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              size="large"
              block
              onClick={() => {
                setIsCancelModalOpen(false);
                setSelectedSubscription(null);
              }}
            >
              Không, giữ lại
            </Button>
            <Button
              type="primary"
              danger
              size="large"
              block
              loading={cancelLoading === selectedSubscription?.id}
              onClick={handleCancelSubscription}
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </FitBridgeModal>
    </div>
  );
}
