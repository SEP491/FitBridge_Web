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
  Form,
  DatePicker,
  Select,
  Popconfirm,
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
  GiftOutlined,
  ProductOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  StopOutlined,
  UndoOutlined,
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
  const [activeTab, setActiveTab] = useState("dashboard");

  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsPagination, setProductsPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Entitlements state
  const [entitlements, setEntitlements] = useState([]);
  const [entitlementsLoading, setEntitlementsLoading] = useState(false);
  const [entitlementsPagination, setEntitlementsPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsPagination, setSubscriptionsPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [subscriptionSearchTerm, setSubscriptionSearchTerm] = useState("");

  // Offerings state
  const [offerings, setOfferings] = useState([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  // Grant/Revoke modals
  const [grantEntitlementModalVisible, setGrantEntitlementModalVisible] =
    useState(false);

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

  // Fetch products
  const fetchProducts = useCallback(async (page = 1, limit = 20) => {
    setProductsLoading(true);
    try {
      const params = { limit };
      const response = await revenueCatService.getProducts(params);
      if (response.data) {
        setProducts(response.data.items || []);
        setProductsPagination((prev) => ({
          ...prev,
          current: page,
          total: response.data.items?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Fetch entitlements
  const fetchEntitlements = useCallback(async (page = 1, limit = 20) => {
    setEntitlementsLoading(true);
    try {
      const params = { limit };
      const response = await revenueCatService.getEntitlements(params);
      if (response.data) {
        setEntitlements(response.data.items || []);
        setEntitlementsPagination((prev) => ({
          ...prev,
          current: page,
          total: response.data.items?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching entitlements:", error);
      toast.error("Không thể tải danh sách quyền truy cập");
    } finally {
      setEntitlementsLoading(false);
    }
  }, []);

  // Fetch subscriptions - requires store_subscription_identifier
  const fetchSubscriptions = useCallback(
    async (storeSubscriptionIdentifier) => {
      if (!storeSubscriptionIdentifier) {
        setSubscriptions([]);
        return;
      }
      setSubscriptionsLoading(true);
      try {
        const params = {
          store_subscription_identifier: storeSubscriptionIdentifier,
        };
        const response = await revenueCatService.searchSubscriptions(params);
        if (response.data) {
          setSubscriptions(response.data.items || []);
          setSubscriptionsPagination((prev) => ({
            ...prev,
            current: 1,
            total: response.data.items?.length || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        if (error.response?.data?.type === "parameter_error") {
          toast.error(
            "Vui lòng nhập mã định danh đăng ký từ cửa hàng để tìm kiếm"
          );
        } else {
          toast.error("Không thể tải danh sách đăng ký");
        }
        setSubscriptions([]);
      } finally {
        setSubscriptionsLoading(false);
      }
    },
    []
  );

  // Handle subscription search
  const handleSubscriptionSearch = (value) => {
    setSubscriptionSearchTerm(value);
    if (value) {
      fetchSubscriptions(value);
    } else {
      setSubscriptions([]);
    }
  };

  // Fetch offerings
  const fetchOfferings = useCallback(async () => {
    setOfferingsLoading(true);
    try {
      const response = await revenueCatService.getOfferings();
      if (response.data) {
        setOfferings(response.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
      toast.error("Không thể tải danh sách gói dịch vụ");
    } finally {
      setOfferingsLoading(false);
    }
  }, []);

  // Grant entitlement to customer
  const handleGrantEntitlement = async (values) => {
    if (!selectedCustomer) return;
    try {
      await revenueCatService.grantEntitlement(selectedCustomer.id, {
        entitlement_id: values.entitlement_id,
        expires_at: dayjs(values.expires_at).valueOf(),
      });
      toast.success("Đã cấp quyền truy cập thành công");
      setGrantEntitlementModalVisible(false);
      fetchCustomerDetails(selectedCustomer.id);
    } catch (error) {
      console.error("Error granting entitlement:", error);
      toast.error("Không thể cấp quyền truy cập");
    }
  };

  // Revoke entitlement from customer
  const handleRevokeEntitlement = async (entitlementId) => {
    if (!selectedCustomer) return;
    try {
      await revenueCatService.revokeGrantedEntitlement(selectedCustomer.id, {
        entitlement_id: entitlementId,
      });
      toast.success("Đã thu hồi quyền truy cập thành công");
      fetchCustomerDetails(selectedCustomer.id);
    } catch (error) {
      console.error("Error revoking entitlement:", error);
      toast.error("Không thể thu hồi quyền truy cập");
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async (subscriptionId) => {
    try {
      await revenueCatService.cancelSubscription(subscriptionId);
      toast.success("Đã hủy đăng ký thành công");
      if (subscriptionSearchTerm) {
        fetchSubscriptions(subscriptionSearchTerm);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Không thể hủy đăng ký");
    }
  };

  // Refund subscription
  const handleRefundSubscription = async (subscriptionId) => {
    try {
      await revenueCatService.refundSubscription(subscriptionId);
      toast.success("Đã hoàn tiền đăng ký thành công");
      if (subscriptionSearchTerm) {
        fetchSubscriptions(subscriptionSearchTerm);
      }
    } catch (error) {
      console.error("Error refunding subscription:", error);
      toast.error("Không thể hoàn tiền đăng ký");
    }
  };

  useEffect(() => {
    fetchMetrics();
    if (activeTab === "dashboard" || activeTab === "customers") {
      fetchCustomers();
    }
    if (activeTab === "products") {
      fetchProducts();
    }
    if (activeTab === "entitlements") {
      fetchEntitlements();
    }
    // Subscriptions tab doesn't auto-fetch - requires search input
    if (activeTab === "offerings") {
      fetchOfferings();
    }
  }, [
    activeTab,
    fetchCustomers,
    fetchProducts,
    fetchEntitlements,
    fetchSubscriptions,
    fetchOfferings,
  ]);

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
        <div>
          <div className="mb-4">
            <Button
              type="primary"
              icon={<GiftOutlined />}
              onClick={() => setGrantEntitlementModalVisible(true)}
            >
              Cấp Quyền Truy Cập
            </Button>
          </div>
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
              {
                title: "Thao Tác",
                key: "action",
                render: (_, record) => (
                  <Popconfirm
                    title="Bạn có chắc chắn muốn thu hồi quyền truy cập này?"
                    onConfirm={() => handleRevokeEntitlement(record.id)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    >
                      Thu Hồi
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
            pagination={false}
            size="small"
          />
        </div>
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

  // Main navigation tabs
  const mainTabs = [
    {
      key: "dashboard",
      label: (
        <span>
          <DollarOutlined /> Tổng Quan
        </span>
      ),
    },
    {
      key: "customers",
      label: (
        <span>
          <UserOutlined /> Khách Hàng
        </span>
      ),
    },
    {
      key: "products",
      label: (
        <span>
          <ProductOutlined /> Sản Phẩm
        </span>
      ),
    },
    {
      key: "entitlements",
      label: (
        <span>
          <GiftOutlined /> Quyền Truy Cập
        </span>
      ),
    },
    {
      key: "subscriptions",
      label: (
        <span>
          <ShoppingCartOutlined /> Đăng Ký
        </span>
      ),
    },
    {
      key: "offerings",
      label: (
        <span>
          <AppstoreOutlined /> Gói Dịch Vụ
        </span>
      ),
    },
  ];

  // Products table columns
  const productColumns = [
    {
      title: "ID Sản Phẩm",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: "Mã Cửa Hàng",
      dataIndex: "store_identifier",
      key: "store_identifier",
    },
    {
      title: "Tên Hiển Thị",
      dataIndex: "display_name",
      key: "display_name",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "subscription" ? "blue" : "green"}>
          {type === "subscription" ? "Đăng Ký" : "Mua Một Lần"}
        </Tag>
      ),
    },
    {
      title: "App",
      dataIndex: ["app", "name"],
      key: "app",
    },
  ];

  // Entitlements table columns
  const entitlementColumns = [
    {
      title: "ID Quyền",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: "Tên Hiển Thị",
      dataIndex: "display_name",
      key: "display_name",
    },
    {
      title: "Mã Định Danh",
      dataIndex: "identifier",
      key: "identifier",
    },
  ];

  // Subscriptions table columns
  const subscriptionColumns = [
    {
      title: "ID Đăng Ký",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: "Khách Hàng",
      dataIndex: "customer_id",
      key: "customer_id",
      render: (id) => (
        <span className="font-mono text-xs">{id?.substring(0, 20)}...</span>
      ),
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
      title: "Thao Tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Bạn có chắc chắn muốn hủy đăng ký này?"
            onConfirm={() => handleCancelSubscription(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger icon={<StopOutlined />} size="small">
              Hủy
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc chắn muốn hoàn tiền đăng ký này?"
            onConfirm={() => handleRefundSubscription(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" icon={<UndoOutlined />} size="small">
              Hoàn Tiền
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Render dashboard content
  const renderDashboard = () => (
    <>
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
    </>
  );

  // Render customers section
  const renderCustomers = () => (
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
  );

  // Render products section
  const renderProducts = () => (
    <Card
      title={
        <span className="flex items-center gap-2">
          <ProductOutlined />
          Quản Lý Sản Phẩm
        </span>
      }
      className="shadow-sm"
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            fetchProducts(
              productsPagination.current,
              productsPagination.pageSize
            )
          }
        >
          Làm Mới
        </Button>
      }
    >
      <Table
        columns={productColumns}
        dataSource={products}
        rowKey="id"
        loading={productsLoading}
        pagination={{
          current: productsPagination.current,
          pageSize: productsPagination.pageSize,
          total: productsPagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          position: ["bottomCenter"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trong tổng ${total} sản phẩm`,
        }}
        onChange={(pagination) =>
          fetchProducts(pagination.current, pagination.pageSize)
        }
        scroll={{ x: 1000 }}
      />
    </Card>
  );

  // Render entitlements section
  const renderEntitlements = () => (
    <Card
      title={
        <span className="flex items-center gap-2">
          <GiftOutlined />
          Quản Lý Quyền Truy Cập
        </span>
      }
      className="shadow-sm"
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            fetchEntitlements(
              entitlementsPagination.current,
              entitlementsPagination.pageSize
            )
          }
        >
          Làm Mới
        </Button>
      }
    >
      <Table
        columns={entitlementColumns}
        dataSource={entitlements}
        rowKey="id"
        loading={entitlementsLoading}
        pagination={{
          current: entitlementsPagination.current,
          pageSize: entitlementsPagination.pageSize,
          total: entitlementsPagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          position: ["bottomCenter"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trong tổng ${total} quyền truy cập`,
        }}
        onChange={(pagination) =>
          fetchEntitlements(pagination.current, pagination.pageSize)
        }
        scroll={{ x: 800 }}
      />
    </Card>
  );

  // Render subscriptions section
  const renderSubscriptions = () => (
    <Card
      title={
        <span className="flex items-center gap-2">
          <ShoppingCartOutlined />
          Tìm Kiếm Đăng Ký
        </span>
      }
      className="shadow-sm"
      extra={
        <Space>
          <Input.Search
            placeholder="Nhập mã định danh đăng ký từ cửa hàng..."
            allowClear
            value={subscriptionSearchTerm}
            onSearch={handleSubscriptionSearch}
            onChange={(e) => {
              setSubscriptionSearchTerm(e.target.value);
              if (!e.target.value) {
                setSubscriptions([]);
              }
            }}
            style={{ width: 350 }}
            prefix={<SearchOutlined />}
            enterButton="Tìm Kiếm"
          />
          {subscriptionSearchTerm && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchSubscriptions(subscriptionSearchTerm)}
            >
              Làm Mới
            </Button>
          )}
        </Space>
      }
    >
      {!subscriptionSearchTerm ? (
        <div className="text-center py-12">
          <ShoppingCartOutlined
            style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
          />
          <p className="text-gray-500 text-lg mb-2">
            Tìm Kiếm Đăng Ký Theo Mã Định Danh
          </p>
          <p className="text-gray-400">
            Vui lòng nhập mã định danh đăng ký từ cửa hàng (Store Subscription
            Identifier) để tìm kiếm
          </p>
        </div>
      ) : subscriptions.length === 0 && !subscriptionsLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Không tìm thấy đăng ký nào với mã định danh:{" "}
            <span className="font-mono">{subscriptionSearchTerm}</span>
          </p>
        </div>
      ) : (
        <Table
          columns={subscriptionColumns}
          dataSource={subscriptions}
          rowKey="id"
          loading={subscriptionsLoading}
          pagination={{
            current: subscriptionsPagination.current,
            pageSize: subscriptionsPagination.pageSize,
            total: subscriptionsPagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ["bottomCenter"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong tổng ${total} đăng ký`,
          }}
          scroll={{ x: 1200 }}
        />
      )}
    </Card>
  );

  // Render offerings section
  const renderOfferings = () => (
    <Card
      title={
        <span className="flex items-center gap-2">
          <AppstoreOutlined />
          Quản Lý Gói Dịch Vụ
        </span>
      }
      className="shadow-sm"
      extra={
        <Button icon={<ReloadOutlined />} onClick={fetchOfferings}>
          Làm Mới
        </Button>
      }
    >
      {offeringsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {offerings.map((offering) => (
            <Col xs={24} sm={12} lg={8} key={offering.id}>
              <Card
                title={offering.display_name || offering.identifier}
                size="small"
                extra={
                  <Tag color="blue">{offering.packages?.length || 0} Gói</Tag>
                }
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="ID">
                    <span className="font-mono text-xs">{offering.id}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã Định Danh">
                    {offering.identifier}
                  </Descriptions.Item>
                  {offering.packages && offering.packages.length > 0 && (
                    <Descriptions.Item label="Gói">
                      {offering.packages.map((pkg) => (
                        <Tag key={pkg.id} className="mb-1">
                          {pkg.display_name || pkg.identifier}
                        </Tag>
                      ))}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
          ))}
          {offerings.length === 0 && (
            <Col span={24}>
              <div className="text-center py-8 text-gray-500">
                Không có gói dịch vụ nào
              </div>
            </Col>
          )}
        </Row>
      )}
    </Card>
  );

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

        {/* Main Navigation Tabs */}
        <Card className="mb-6">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={mainTabs}
            size="large"
          />
        </Card>

        {/* Content based on active tab */}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "customers" && renderCustomers()}
        {activeTab === "products" && renderProducts()}
        {activeTab === "entitlements" && renderEntitlements()}
        {activeTab === "subscriptions" && renderSubscriptions()}
        {activeTab === "offerings" && renderOfferings()}

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

        {/* Grant Entitlement Modal */}
        <Modal
          title={
            <span>
              <GiftOutlined /> Cấp Quyền Truy Cập
            </span>
          }
          open={grantEntitlementModalVisible}
          onCancel={() => setGrantEntitlementModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            layout="vertical"
            onFinish={handleGrantEntitlement}
            initialValues={{
              expires_at: dayjs().add(30, "day"),
            }}
          >
            <Form.Item
              label="Quyền Truy Cập"
              name="entitlement_id"
              rules={[
                { required: true, message: "Vui lòng chọn quyền truy cập" },
              ]}
            >
              <Select
                placeholder="Chọn quyền truy cập"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={entitlements.map((ent) => ({
                  value: ent.id,
                  label: ent.display_name || ent.identifier,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="Ngày Hết Hạn"
              name="expires_at"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hết hạn" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                showTime
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Cấp Quyền
                </Button>
                <Button onClick={() => setGrantEntitlementModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
