import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Spin,
  Row,
  Col,
  Tag,
  Statistic,
  ConfigProvider,
  Button,
  Modal,
  Descriptions,
  Tabs,
  Space,
  Badge,
  Tooltip,
  Input,
} from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  LoadingOutlined,
  GlobalOutlined,
  MobileOutlined,
  AppleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import revenueCatService from "../../../services/revenueCatService";
import toast from "react-hot-toast";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Format currency
const formatCurrency = (value, unit = "$") => {
  if (value === null || value === undefined) return `${unit}0`;
  return `${unit}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format date from timestamp
const formatDate = (timestamp) => {
  if (!timestamp) return "Không có";
  return dayjs(timestamp).format("DD/MM/YYYY HH:mm");
};

export default function ManagePremiumPage() {
  const [metrics, setMetrics] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetailsModalVisible, setCustomerDetailsModalVisible] =
    useState(false);
  const [customerSubscriptions, setCustomerSubscriptions] = useState([]);
  const [customerEntitlements, setCustomerEntitlements] = useState([]);
  const [customerPurchases, setCustomerPurchases] = useState([]);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch revenue metrics
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await revenueCatService.getChartRevenue();
      if (response.data && response.data.metrics) {
        setMetrics(response.data.metrics);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast.error("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = useCallback(
    async (page = 1, limit = 20, search = "") => {
      setCustomersLoading(true);
      try {
        const params = {
          limit,
          ...(search && { search }),
        };
        const response = await revenueCatService.getCustomers(params);
        if (response.data) {
          setCustomers(response.data.items || []);
          setPagination((prev) => ({
            ...prev,
            current: page,
            total: response.data.items?.length || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Không thể tải danh sách khách hàng");
      } finally {
        setCustomersLoading(false);
      }
    },
    []
  );

  // Fetch customer details
  const fetchCustomerDetails = useCallback(async (customerId) => {
    setLoadingCustomerDetails(true);
    try {
      const [customerRes, subscriptionsRes, entitlementsRes, purchasesRes] =
        await Promise.all([
          revenueCatService.getCustomer(customerId, { expand: ["attributes"] }),
          revenueCatService.getCustomerSubscriptions(customerId),
          revenueCatService.getCustomerActiveEntitlements(customerId),
          revenueCatService.getCustomerPurchases(customerId),
        ]);

      setSelectedCustomer(customerRes.data);
      setCustomerSubscriptions(subscriptionsRes.data?.items || []);
      setCustomerEntitlements(entitlementsRes.data?.items || []);
      setCustomerPurchases(purchasesRes.data?.items || []);
      setCustomerDetailsModalVisible(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Không thể tải thông tin chi tiết khách hàng");
    } finally {
      setLoadingCustomerDetails(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    fetchCustomers();
  }, [fetchCustomers]);

  // Get key metrics
  const getMetric = (id) => {
    return metrics.find((m) => m.id === id);
  };

  const activeTrials = getMetric("active_trials")?.value || 0;
  const activeSubscriptions = getMetric("active_subscriptions")?.value || 0;
  const mrr = getMetric("mrr")?.value || 0;
  const revenue = getMetric("revenue")?.value || 0;
  const newCustomers = getMetric("new_customers")?.value || 0;
  const activeUsers = getMetric("active_users")?.value || 0;

  // Prepare chart data for revenue metrics
  const revenueMetrics = metrics.filter(
    (m) => m.id.startsWith("mrr_") || m.id === "mrr"
  );
  const revenueChartData = {
    labels: revenueMetrics.map((m) => m.name.replace("MRR ", "")),
    datasets: [
      {
        label: "Doanh Thu Định Kỳ Hàng Tháng",
        data: revenueMetrics.map((m) => m.value),
        backgroundColor: "rgba(237, 42, 71, 0.6)",
        borderColor: "#ed2a47c9",
        borderWidth: 2,
      },
    ],
  };

  // Prepare chart data for revenue by period
  const revenuePeriodData = {
    labels: ["MRR", "Doanh Thu (28 ngày)"],
    datasets: [
      {
        label: "Doanh Thu",
        data: [mrr, revenue],
        backgroundColor: ["rgba(255, 145, 77, 0.6)", "rgba(237, 42, 71, 0.6)"],
        borderColor: ["#FF914D", "#ed2a47c9"],
        borderWidth: 2,
      },
    ],
  };

  // Prepare doughnut chart for subscriptions
  const subscriptionData = {
    labels: ["Đăng Ký Đang Hoạt Động", "Dùng Thử Đang Hoạt Động"],
    datasets: [
      {
        data: [activeSubscriptions, activeTrials],
        backgroundColor: ["rgba(237, 42, 71, 0.8)", "rgba(255, 145, 77, 0.8)"],
        borderColor: ["#ed2a47c9", "#FF914D"],
        borderWidth: 2,
      },
    ],
  };

  // Table columns for customers
  const customerColumns = [
    {
      title: "Mã Khách Hàng",
      dataIndex: "id",
      key: "id",
      width: 250,
      render: (id) => (
        <span className="font-mono text-xs text-gray-700">{id}</span>
      ),
    },
    {
      title: "Nền Tảng",
      dataIndex: "last_seen_platform",
      key: "platform",
      width: 120,
      render: (platform) => {
        const isIOS = platform?.toLowerCase() === "ios";
        const isAndroid = platform?.toLowerCase() === "android";
        return (
          <Tag
            color={isIOS ? "blue" : isAndroid ? "green" : "default"}
            icon={isIOS ? <AppleOutlined /> : <MobileOutlined />}
          >
            {platform || "Không có"}
          </Tag>
        );
      },
    },
    {
      title: "Quốc Gia",
      dataIndex: "last_seen_country",
      key: "country",
      width: 100,
      render: (country) => (
        <Tag icon={<GlobalOutlined />}>{country || "Không có"}</Tag>
      ),
    },
    {
      title: "Phiên Bản App",
      dataIndex: "last_seen_app_version",
      key: "appVersion",
      width: 120,
      render: (version) => (
        <span className="text-sm">{version || "Không có"}</span>
      ),
    },
    {
      title: "Lần Đầu Thấy",
      dataIndex: "first_seen_at",
      key: "firstSeen",
      width: 150,
      render: (timestamp) => (
        <span className="text-sm">{formatDate(timestamp)}</span>
      ),
    },
    {
      title: "Lần Cuối Thấy",
      dataIndex: "last_seen_at",
      key: "lastSeen",
      width: 150,
      render: (timestamp) => (
        <span className="text-sm">{formatDate(timestamp)}</span>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => fetchCustomerDetails(record.id)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ];

  // Handle table pagination
  const handleTableChange = (pagination) => {
    fetchCustomers(pagination.current, pagination.pageSize, searchTerm);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchCustomers(1, pagination.pageSize, value);
  };

  // Format subscription status
  const formatSubscriptionStatus = (status) => {
    const statusMap = {
      active: { text: "Đang Hoạt Động", color: "success" },
      expired: { text: "Đã Hết Hạn", color: "error" },
      canceled: { text: "Đã Hủy", color: "default" },
      trial: { text: "Dùng Thử", color: "processing" },
      grace_period: { text: "Gia Hạn", color: "warning" },
      billing_issue: { text: "Lỗi Thanh Toán", color: "error" },
    };
    const statusInfo = statusMap[status] || { text: status, color: "default" };
    return <Badge status={statusInfo.color} text={statusInfo.text} />;
  };

  // Format entitlement status
  const formatEntitlementStatus = (status) => {
    const statusMap = {
      active: { text: "Đang Hoạt Động", color: "success" },
      expired: { text: "Đã Hết Hạn", color: "error" },
      revoked: { text: "Đã Thu Hồi", color: "error" },
    };
    const statusInfo = statusMap[status] || { text: status, color: "default" };
    return <Badge status={statusInfo.color} text={statusInfo.text} />;
  };

  // Customer details modal tabs
  const customerDetailsTabs = [
    {
      key: "info",
      label: "Thông Tin",
      children: selectedCustomer ? (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Mã Khách Hàng">
            {selectedCustomer.id}
          </Descriptions.Item>
          <Descriptions.Item label="Nền Tảng">
            {selectedCustomer.last_seen_platform || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Quốc Gia">
            {selectedCustomer.last_seen_country || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Phiên Bản App">
            {selectedCustomer.last_seen_app_version || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Phiên Bản Nền Tảng">
            {selectedCustomer.last_seen_platform_version || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Lần Đầu Thấy">
            {formatDate(selectedCustomer.first_seen_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Lần Cuối Thấy" span={2}>
            {formatDate(selectedCustomer.last_seen_at)}
          </Descriptions.Item>
          {selectedCustomer.attributes?.map((attr) => (
            <Descriptions.Item
              key={attr.name}
              label={attr.name}
              span={attr.name === "$email" ? 2 : 1}
            >
              {attr.value || "Không có"}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Không có thông tin khách hàng
        </div>
      ),
    },
    {
      key: "subscriptions",
      label: `Đăng Ký (${customerSubscriptions.length})`,
      children: (
        <Table
          dataSource={customerSubscriptions}
          rowKey="id"
          columns={[
            {
              title: "ID Đăng Ký",
              dataIndex: "id",
              key: "id",
              render: (id) => <span className="font-mono text-xs">{id}</span>,
            },
            {
              title: "Trạng Thái",
              dataIndex: "status",
              key: "status",
              render: formatSubscriptionStatus,
            },
            {
              title: "Sản Phẩm",
              dataIndex: ["product", "store_identifier"],
              key: "product",
            },
            {
              title: "Bắt Đầu",
              dataIndex: "starts_at",
              key: "starts_at",
              render: formatDate,
            },
            {
              title: "Hết Hạn",
              dataIndex: "expires_at",
              key: "expires_at",
              render: formatDate,
            },
            {
              title: "Gia Hạn Tự Động",
              dataIndex: "will_renew",
              key: "will_renew",
              render: (willRenew) =>
                willRenew ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Có
                  </Tag>
                ) : (
                  <Tag color="red" icon={<CloseCircleOutlined />}>
                    Không
                  </Tag>
                ),
            },
          ]}
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: "entitlements",
      label: `Quyền Truy Cập (${customerEntitlements.length})`,
      children: (
        <Table
          dataSource={customerEntitlements}
          rowKey="id"
          columns={[
            {
              title: "ID Quyền",
              dataIndex: "id",
              key: "id",
              render: (id) => <span className="font-mono text-xs">{id}</span>,
            },
            {
              title: "Trạng Thái",
              dataIndex: "status",
              key: "status",
              render: formatEntitlementStatus,
            },
            {
              title: "Hết Hạn",
              dataIndex: "expires_at",
              key: "expires_at",
              render: formatDate,
            },
            {
              title: "Sản Phẩm",
              dataIndex: ["product", "store_identifier"],
              key: "product",
            },
          ]}
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: "purchases",
      label: `Giao Dịch (${customerPurchases.length})`,
      children: (
        <Table
          dataSource={customerPurchases}
          rowKey="id"
          columns={[
            {
              title: "ID Giao Dịch",
              dataIndex: "id",
              key: "id",
              render: (id) => <span className="font-mono text-xs">{id}</span>,
            },
            {
              title: "Sản Phẩm",
              dataIndex: ["product", "store_identifier"],
              key: "product",
            },
            {
              title: "Giá",
              dataIndex: ["price", "amount"],
              key: "price",
              render: (amount, record) =>
                amount
                  ? formatCurrency(
                      amount / 100,
                      record.price?.currency_code || "$"
                    )
                  : "Không có",
            },
            {
              title: "Ngày Mua",
              dataIndex: "purchased_at",
              key: "purchased_at",
              render: formatDate,
            },
            {
              title: "Trạng Thái",
              dataIndex: "status",
              key: "status",
              render: (status) => (
                <Tag color={status === "completed" ? "green" : "default"}>
                  {status === "completed" ? "Hoàn Thành" : status}
                </Tag>
              ),
            },
          ]}
          pagination={false}
          size="small"
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bảng Điều Khiển Quản Lý Premium
          </h1>
          <p className="text-gray-600">
            Theo dõi chỉ số doanh thu và quản lý khách hàng premium
          </p>
        </div>

        {/* Key Metrics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Đăng Ký Đang Hoạt Động"
                value={activeSubscriptions}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: "#ed2a47c9" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Dùng Thử Đang Hoạt Động"
                value={activeTrials}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#FF914D" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Doanh Thu Định Kỳ Hàng Tháng"
                value={formatCurrency(mrr)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Doanh Thu (28 ngày)"
                value={formatCurrency(revenue)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Additional Metrics */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Khách Hàng Mới (28 ngày)"
                value={newCustomers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Người Dùng Hoạt Động (28 ngày)"
                value={activeUsers}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#13c2c2" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64 mb-6">
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48, color: "#ed2a47c9" }}
                  spin
                />
              }
              tip="Đang tải dữ liệu..."
              size="large"
            />
          </div>
        ) : (
          <Row gutter={[16, 16]} className="mb-6">
            {/* Revenue Comparison Chart */}
            <Col xs={24} lg={12}>
              <Card
                title="Tổng Quan Doanh Thu"
                className="shadow-sm"
                style={{ height: "100%" }}
              >
                <div style={{ height: "300px" }}>
                  <Bar
                    data={revenuePeriodData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return formatCurrency(context.parsed.y);
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function (value) {
                              return formatCurrency(value);
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </Card>
            </Col>

            {/* Subscriptions Doughnut Chart */}
            <Col xs={24} lg={12}>
              <Card
                title="Tổng Quan Đăng Ký"
                className="shadow-sm"
                style={{ height: "100%" }}
              >
                <div style={{ height: "300px" }}>
                  <Doughnut
                    data={subscriptionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return `${context.label}: ${context.parsed}`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </Card>
            </Col>

            {/* MRR by Currency Chart */}
            {revenueMetrics.length > 0 && (
              <Col xs={24}>
                <Card
                  title="Doanh Thu Định Kỳ Hàng Tháng Theo Loại Tiền Tệ"
                  className="shadow-sm"
                >
                  <div style={{ height: "400px" }}>
                    <Bar
                      data={revenueChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return formatCurrency(context.parsed.y);
                              },
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function (value) {
                                return formatCurrency(value);
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* Customers Table */}
        <Card
          title={
            <span className="flex items-center gap-2">
              <UserOutlined />
              Khách Hàng Premium
            </span>
          }
          className="shadow-sm"
          extra={
            <Space>
              <Input.Search
                placeholder="Tìm kiếm theo email..."
                allowClear
                onSearch={handleSearch}
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchCustomers(
                    pagination.current,
                    pagination.pageSize,
                    searchTerm
                  )
                }
              >
                Làm Mới
              </Button>
            </Space>
          }
        >
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#FFE5E9",
                },
              },
            }}
          >
            <Table
              columns={customerColumns}
              dataSource={customers}
              rowKey="id"
              loading={customersLoading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                position: ["bottomCenter"],
                size: "middle",
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong tổng ${total} khách hàng`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 1200 }}
              size="middle"
            />
          </ConfigProvider>
        </Card>

        {/* Customer Details Modal */}
        <Modal
          title={
            <span>
              <UserOutlined /> Chi Tiết Khách Hàng
            </span>
          }
          open={customerDetailsModalVisible}
          onCancel={() => setCustomerDetailsModalVisible(false)}
          footer={null}
          width={1000}
        >
          {loadingCustomerDetails ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="large" tip="Đang tải thông tin..." />
            </div>
          ) : (
            <Tabs items={customerDetailsTabs} />
          )}
        </Modal>
      </div>
    </div>
  );
}
