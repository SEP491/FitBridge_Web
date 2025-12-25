import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  Descriptions,
  Row,
  Col,
  Tabs,
  Modal,
  Form,
  InputNumber,
  Space,
  Image,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  BankOutlined,
  CalendarOutlined,
  DollarOutlined,
  MoneyCollectOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  FaMoneyBillWave,
  FaFilter,
  FaUserCircle,
  FaInfoCircle,
  FaReceipt,
} from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { ImStatsBars } from "react-icons/im";
import transactionService from "../../../services/transactionServices";
import paymentService from "../../../services/paymentService";
import dashboardService from "../../../services/dashboardService";
import FitBridgeModal from "../../../components/FitBridgeModal";
import defaultAvatar from "../../../assets/LogoColor.png";
import banks from "../../../constants/banks";
import WalletBalanceTab from "./WalletBalanceTab";

export default function ManageGymTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalTransactionDetailOpen, setIsModalTransactionDetailOpen] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");

  // Withdrawal requests states
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [withdrawalSearchText, setWithdrawalSearchText] = useState("");
  const [selectedWithdrawalRequest, setSelectedWithdrawalRequest] =
    useState(null);
  const [isModalWithdrawalDetailOpen, setIsModalWithdrawalDetailOpen] =
    useState(false);
  const [isModalCreateWithdrawalOpen, setIsModalCreateWithdrawalOpen] =
    useState(false);
  const [formCreateWithdrawal] = Form.useForm();
  const [loadingCreateWithdrawal, setLoadingCreateWithdrawal] = useState(false);
  const [walletBalance, setWalletBalance] = useState({
    totalAvailableBalance: 0,
    totalPendingBalance: 0,
  });
  const [loadingWalletBalance, setLoadingWalletBalance] = useState(false);
  const [withdrawalPagination, setWithdrawalPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Wallet balance detail states
  const [pendingItems, setPendingItems] = useState([]);
  const [pendingTotalProfit, setPendingTotalProfit] = useState(0);
  const [loadingPendingDetails, setLoadingPendingDetails] = useState(false);

  const [availableItems, setAvailableItems] = useState([]);
  const [availableTotalProfit, setAvailableTotalProfit] = useState(0);
  const [loadingAvailableDetails, setLoadingAvailableDetails] = useState(false);

  const [disbursementItems, setDisbursementItems] = useState([]);
  const [disbursementTotalProfit, setDisbursementTotalProfit] = useState(0);
  const [loadingDisbursementDetails, setLoadingDisbursementDetails] =
    useState(false);
  const [walletFilter, setWalletFilter] = useState("all");

  const sortByDateDesc = (items, getDate) =>
    (items || []).slice().sort((a, b) => {
      const da = getDate(a);
      const db = getDate(b);
      const ta = da ? new Date(da).getTime() : 0;
      const tb = db ? new Date(db).getTime() : 0;
      return tb - ta; // desc
    });

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getGymOwnerTransaction({
        sortOrder: "dsc",
        doApplyPaging: false,
      });
      const items = response.data?.items || response.data || [];
      setTransactions(items);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tải danh sách giao dịch, vui lòng thử lại sau."
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet balance (available + pending)
  const fetchWalletBalance = async () => {
    setLoadingWalletBalance(true);
    try {
      const response = await dashboardService.getBalanceOfGym({});
      const data = response.data || {};
      setWalletBalance({
        totalAvailableBalance: data.totalAvailableBalance || 0,
        totalPendingBalance: data.totalPendingBalance || 0,
      });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      toast.error("Không thể tải số dư ví");
      setWalletBalance({
        totalAvailableBalance: 0,
        totalPendingBalance: 0,
      });
    } finally {
      setLoadingWalletBalance(false);
    }
  };

  // Fetch withdrawal requests
  const fetchWithdrawalRequests = useCallback(
    async (page = 1, pageSize = 10) => {
      setLoadingWithdrawals(true);
      try {
        const response = await paymentService.getAllWithdrawalRequests({
          page,
          size: pageSize,
        });

        const { items, total, page: currentPage, totalPages } = response.data;

        setWithdrawalRequests(items || []);
        setWithdrawalPagination({
          current: currentPage,
          pageSize,
          total,
          totalPages,
        });
      } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        toast.error("Không thể tải danh sách yêu cầu rút tiền");
        setWithdrawalRequests([]);
      } finally {
        setLoadingWithdrawals(false);
      }
    },
    []
  );

  // Fetch wallet balance details
  const fetchPendingBalanceDetails = useCallback(async () => {
    setLoadingPendingDetails(true);
    try {
      const response = await dashboardService.getPendingBalanceDetails({
        page: 1,
        size: 100,
        sortOrder: 'dsc'
      });
      const data = response.data || {};
      setPendingItems(
        sortByDateDesc(
          data.items || [],
          (item) => item.transactionDetail?.transactionDate
        )
      );
      setPendingTotalProfit(data.totalProfitSum || 0);
    } catch (error) {
      console.error("Error fetching pending balance details:", error);
      toast.error("Không thể tải chi tiết số dư đang chờ");
      setPendingItems([]);
      setPendingTotalProfit(0);
    } finally {
      setLoadingPendingDetails(false);
    }
  }, []);

  const fetchAvailableBalanceDetails = useCallback(async () => {
    setLoadingAvailableDetails(true);
    try {
      const response = await dashboardService.getAvailableBalanceDetails({
        page: 1,
        size: 100,
        sortOrder: 'dsc'
      });
      const data = response.data || {};
      setAvailableItems(
        sortByDateDesc(data.items || [], (item) => item.transactionDate)
      );
      setAvailableTotalProfit(data.totalProfitSum || 0);
    } catch (error) {
      console.error("Error fetching available balance details:", error);
      toast.error("Không thể tải chi tiết số dư khả dụng");
      setAvailableItems([]);
      setAvailableTotalProfit(0);
    } finally {
      setLoadingAvailableDetails(false);
    }
  }, []);

  const fetchDisbursementDetails = useCallback(async () => {
    setLoadingDisbursementDetails(true);
    try {
      const response = await dashboardService.getDisbursementDetails({
        page: 1,
        size: 100,
        sortOrder: 'dsc'
      });
      const data = response.data || {};
      setDisbursementItems(
        sortByDateDesc(data.items || [], (item) => item.transactionDate)
      );
      setDisbursementTotalProfit(data.totalProfitSum || 0);
    } catch (error) {
      console.error("Error fetching disbursement details:", error);
      toast.error("Không thể tải chi tiết giải ngân");
      setDisbursementItems([]);
      setDisbursementTotalProfit(0);
    } finally {
      setLoadingDisbursementDetails(false);
    }
  }, []);


  useEffect(() => {
    fetchTransactions();
    fetchWalletBalance();
    fetchDisbursementDetails()
  }, []);

  useEffect(() => {
    if (activeTab === "withdrawals") {
      fetchWithdrawalRequests();
    } else if (activeTab === "wallet") {
      fetchPendingBalanceDetails();
      fetchAvailableBalanceDetails();
      fetchDisbursementDetails();
    }
  }, [
    activeTab,
    fetchWithdrawalRequests,
    fetchPendingBalanceDetails,
    fetchAvailableBalanceDetails,
    fetchDisbursementDetails,
  ]);

  // No server-side pagination; sorting is handled client-side by antd

  const handleWithdrawalTableChange = (newPagination) => {
    fetchWithdrawalRequests(newPagination.current, newPagination.pageSize);
  };

  const fetchTransactionDetail = async (transactionId) => {
    setLoadingDetail(true);
    try {
      const response = await transactionService.getGymOwnerTransactionDetails(
        transactionId
      );
      setSelectedTransaction(response.data);
      setIsModalTransactionDetailOpen(true);
    } catch (error) {
      console.error("Error fetching transaction detail:", error);
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tải chi tiết giao dịch, vui lòng thử lại sau."
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case "ExtendCourse":
        return "Khách gia hạn gói tập";
      case "DistributeProfit":
        return "Nhận tiền quyết toán";
      case "GymCourse":
        return "Khách mua gói tập";
      case "Withdraw":
        return "Rút tiền";
      case "ProductOrder":
        return "Đơn hàng sản phẩm";
      case "PendingDeduction":
        return "Khấu trừ tiền tạm giữ";
      case "Disbursement":
        return "Giải ngân doanh thu";
      default:
        return type || "N/A";
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "ExtendCourse":
        return "blue";
      case "DistributeProfit":
        return "purple";
      case "GymCourse":
        return "green";
      case "Withdraw":
        return "orange";
      case "ProductOrder":
        return "cyan";
      default:
        return "default";
    }
  };

  // Get unique transaction types for filter
  const transactionTypes = [
    ...new Set(transactions.map((t) => t.transactionType).filter(Boolean)),
  ];

  const columns = [
    {
      title: "Mã Đơn Hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      align: "left",
      width: 120,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm mã đơn hàng"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.orderCode || "")
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase()),
      render: (orderCode) => (
        <span className="font-mono text-sm font-semibold text-blue-600">
          {orderCode || "N/A"}
        </span>
      ),
    },
    {
      title: "Khách Hàng",
      key: "customer",
      align: "center",
      width: 200,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm tên khách hàng"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.customerName || "")
          .toLowerCase()
          .includes(value.toLowerCase()),
      render: (record) => (
        <div className="flex items-center gap-2 justify-start">
          <img
            src={record.customerAvatarUrl || defaultAvatar}
            alt={record.customerName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-left">
            <div className="font-medium">
              {record.customerName || "Chưa có thông tin"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Loại Giao Dịch",
      dataIndex: "transactionType",
      key: "transactionType",
      align: "center",
      width: 150,
      filters: transactionTypes.map((type) => ({
        text: getTransactionTypeText(type),
        value: type,
      })),
      onFilter: (value, record) => record.transactionType === value,
      render: (type) => (
        <Tag color={getTransactionTypeColor(type)}>
          {getTransactionTypeText(type)}
        </Tag>
      ),
    },
    {
      title: "Số Tiền Thanh Toán",
      dataIndex: "totalPaidAmount",
      key: "totalPaidAmount",
      align: "center",
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm số tiền"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.totalPaidAmount || 0)
          .toString()
          .includes(value),
      render: (value) => (
        <span className="font-bold text-green-600">
          {value !== null && value !== undefined
            ? value.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })
            : "N/A"}
        </span>
      ),
    },
    {
      title: "Lợi Nhuận",
      dataIndex: "profitAmount",
      key: "profitAmount",
      align: "center",
      width: 130,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm lợi nhuận"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.profitAmount || 0)
          .toString()
          .includes(value),
      render: (value) => (
        <span className="font-bold text-orange-600">
          {value !== null && value !== undefined
            ? value.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })
            : "N/A"}
        </span>
      ),
    },
    {
      title: "Số Tiền Rút",
      dataIndex: "withdrawalAmount",
      key: "withdrawalAmount",
      align: "center",
      width: 130,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm số tiền rút"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.withdrawalAmount || 0)
          .toString()
          .includes(value),
      render: (value) => (
        <span className="font-bold text-purple-600">
          {value !== null && value !== undefined
            ? value.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })
            : "N/A"}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm ngày (DD/MM/YYYY)"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.createdAt
          ? formatDateTime(record.createdAt).includes(value)
          : false,
      render: (date) => (
        <div className="text-sm text-gray-600">
          {date ? formatDateTime(date) : "N/A"}
        </div>
      ),
    },
  ];

  const filteredData = transactions.filter((item) => {
    const matchesSearch = searchText
      ? (item.transactionId?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.orderCode?.toString() || "").includes(searchText) ||
        (item.customerName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.transactionType?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (
          getTransactionTypeText(item.transactionType)?.toLowerCase() || ""
        ).includes(searchText.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "all" || 
      item.transactionType?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: transactions.length,
    totalRevenue: transactions.reduce(
      (sum, t) => sum + (t.totalPaidAmount || 0),
      0
    ),
    totalProfit: transactions.reduce(
      (sum, t) => sum + (t.profitAmount || 0),
      0
    ),
    totalWithdrawal: transactions.reduce(
      (sum, t) => sum + (t.withdrawalAmount || 0),
      0
    ),
    productOrders: transactions.filter(
      (t) => t.transactionType === "ProductOrder"
    ).length,
    extendCourse: transactions.filter(
      (t) => t.transactionType === "ExtendCourse"
    ).length,
  };

  // Withdrawal request functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const renderSignedAmount = (value, positiveClass = "", negativeClass = "") => {
    const amount = value || 0;
    const isPositive = amount >= 0;
    const displayValue = formatCurrency(Math.abs(amount));

    return (
      <span className={isPositive ? positiveClass : negativeClass}>
        {isPositive ? "+" : "-"} {displayValue}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status) => {
    const statusConfig = {
      Pending: "Chờ duyệt",
      AdminApproved: "Đã duyệt",
      Completed: "Đã xác nhận",
      Resolved: "Đã xử lý",
      Rejected: "Đã từ chối",
    };
    return statusConfig[status] || status;
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      Pending: { color: "gold", text: "Chờ duyệt" },
      AdminApproved: { color: "blue", text: "Đã duyệt" },
      Completed: { color: "green", text: "Đã xác nhận" },
      Resolved: { color: "green", text: "Đã xử lý" },
      Rejected: { color: "red", text: "Đã từ chối" },
    };
    const config = statusConfig[status] || {
      color: "default",
      text: status,
    };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Handle create withdrawal request
  const handleCreateWithdrawal = async (values) => {
    setLoadingCreateWithdrawal(true);
    try {
      await paymentService.createWithdrawalRequest({
        amount: values.amount,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        accountName: values.accountName,
        note: values.note || "Rut tien",
      });
      toast.success("Tạo yêu cầu rút tiền thành công!");
      setIsModalCreateWithdrawalOpen(false);
      formCreateWithdrawal.resetFields();
      fetchWithdrawalRequests(
        withdrawalPagination.current,
        withdrawalPagination.pageSize
      );
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo yêu cầu rút tiền"
      );
    } finally {
      setLoadingCreateWithdrawal(false);
    }
  };

  // Handle confirm withdrawal request (only for Approved status)
  const handleConfirmWithdrawal = async (id) => {
    Modal.confirm({
      title: "Xác nhận rút tiền",
      content: "Bạn có chắc chắn muốn xác nhận yêu cầu rút tiền này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      okType: "primary",
      onOk: async () => {
        try {
          await paymentService.confirmWithdrawalRequest(id);
          toast.success("Xác nhận yêu cầu rút tiền thành công!");
          fetchWithdrawalRequests(
            withdrawalPagination.current,
            withdrawalPagination.pageSize
          );
          setIsModalWithdrawalDetailOpen(false);
          setSelectedWithdrawalRequest(null);
        } catch (error) {
          console.error("Error confirming withdrawal request:", error);
          toast.error("Không thể xác nhận yêu cầu rút tiền");
        }
      },
    });
  };

  // View withdrawal details
  const handleViewWithdrawalDetails = (record) => {
    setSelectedWithdrawalRequest(record);
    setIsModalWithdrawalDetailOpen(true);
  };

  // Get unique statuses for withdrawal filter
  const uniqueWithdrawalStatuses = [
    ...new Set(withdrawalRequests.map((w) => w.status).filter(Boolean)),
  ];
  const uniqueBanks = [
    ...new Set(withdrawalRequests.map((w) => w.bankName).filter(Boolean)),
  ];

  // Withdrawal columns
  const withdrawalColumns = [
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm số tiền"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.amount || 0)
          .toString()
          .includes(value),
      render: (amount) => (
        <div className="font-semibold text-green-600 text-lg">
          {formatCurrency(amount)}
        </div>
      ),
    },
    {
      title: "Ngân hàng",
      key: "bank",
      align: "left",
      width: 200,
      filters: uniqueBanks.map((bank) => ({
        text: bank,
        value: bank,
      })),
      onFilter: (value, record) => record.bankName === value,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.bankName}</div>
          <div className="text-xs text-gray-600">{record.accountNumber}</div>
          <div className="text-xs text-gray-500">{record.accountName}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      filters: uniqueWithdrawalStatuses.map((status) => ({
        text: getStatusText(status),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm ngày (DD/MM/YYYY)"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.createdAt
          ? formatDateTime(record.createdAt).includes(value)
          : false,
      render: (date) => (
        <div className="text-sm text-gray-600">{formatDateTime(date)}</div>
      ),
    },
  ];

  // Get unique values for pending columns filters
  const uniquePendingTypes = [
    ...new Set(pendingItems.map((p) => p.transactionType).filter(Boolean)),
  ];
  const uniqueCourseNames = [
    ...new Set(pendingItems.map((p) => p.courseName).filter(Boolean)),
  ];
  const uniqueCustomerNames = [
    ...new Set(pendingItems.map((p) => p.customerFullName).filter(Boolean)),
  ];

  // Wallet detail columns
  const pendingColumns = [
    {
      title: "Ngày giao dịch",
      dataIndex: ["transactionDetail", "transactionDate"],
      key: "transactionDate",
      align: "center",
      width: 120,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm ngày (DD/MM/YYYY)"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.transactionDetail?.transactionDate
          ? formatDateTime(record.transactionDetail.transactionDate).includes(value)
          : false,
      render: (date) => (
        <div className="text-sm text-gray-700">{formatDateTime(date)}</div>
      ),
    },
    {
      title: "Khóa học",
      dataIndex: "courseName",
      key: "courseName",
      align: "left",
      width: 200,
      filters: uniqueCourseNames.map((name) => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.courseName === value,
      render: (value) => value || "N/A",
    },
    {
      title: "Khách hàng",
      dataIndex: "customerFullName",
      key: "customerFullName",
      align: "left",
      width: 140,
      filters: uniqueCustomerNames.map((name) => ({
        text: name,
        value: name,
      })),
      onFilter: (value, record) => record.customerFullName === value,
      render: (value) => value || "N/A",
    },
    {
      title: "Loại giao dịch",
      dataIndex: "transactionType",
      key: "transactionType",
      align: "center",
      width: 170,
      filters: uniquePendingTypes.map((type) => ({
        text: getTransactionTypeText(type),
        value: type,
      })),
      onFilter: (value, record) => record.transactionType === value,
      render: (type) => getTransactionTypeText(type),
    },
    {
      title :"Thông tin chi tiết",
      dataIndex: "transactionDetail",
      key: "transactionDetail",
      align: "left",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm mô tả"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.transactionDetail?.description || "")
          .toLowerCase()
          .includes(value.toLowerCase()),
      render: (value) => value.description || "N/A",
    },
    {
      title: "Số tiền giao dịch",
      dataIndex: "totalProfit",
      key: "totalProfit",
      align: "center",
      width: 180,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm số tiền"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.totalProfit || 0)
          .toString()
          .includes(value),
      render: (value) =>
        renderSignedAmount(
          value,
          "font-semibold text-green-600",
          "font-semibold text-red-600"
        ),
    },
  ];

  // Get unique values for simple wallet columns filters
  const uniqueAvailableTypes = [
    ...new Set(availableItems.map((a) => a.transactionType).filter(Boolean)),
  ];
  const uniqueDisbursementTypes = [
    ...new Set(disbursementItems.map((d) => d.transactionType).filter(Boolean)),
  ];

  const simpleWalletColumns = [
    {
      title: "Ngày giao dịch",
      dataIndex: "transactionDate",
      key: "transactionDate",
      align: "center",
      width: 180,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm ngày (DD/MM/YYYY)"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.transactionDate
          ? formatDateTime(record.transactionDate).includes(value)
          : false,
      render: (date) => (
        <div className="text-sm text-gray-700">{formatDateTime(date)}</div>
      ),
    },
    {
      title: "Loại giao dịch",
      dataIndex: "transactionType",
      key: "transactionType",
      align: "center",
      filters: [...new Set([...uniqueAvailableTypes, ...uniqueDisbursementTypes])].map((type) => ({
        text: getTransactionTypeText(type),
        value: type,
      })),
      onFilter: (value, record) => record.transactionType === value,
      render: (type) => getTransactionTypeText(type),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      align: "left",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm mô tả"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.description || "")
          .toLowerCase()
          .includes(value.toLowerCase()),
      render: (value) => value || "N/A",
    },
    {
      title: "Số tiền giao dịch",
      dataIndex: "totalProfit",
      key: "totalProfit",
      align: "center",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Tìm số tiền"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Tìm
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        (record.totalProfit || 0)
          .toString()
          .includes(value),
      render: (value) =>
        renderSignedAmount(
          value,
          "font-semibold text-green-600",
          "font-semibold text-red-600"
        ),
    },
  ];

  const filteredWithdrawals = withdrawalRequests.filter((item) => {
    const matchesSearch = withdrawalSearchText
      ? (item.accountFullName?.toLowerCase() || "").includes(
          withdrawalSearchText.toLowerCase()
        ) ||
        (item.accountName?.toLowerCase() || "").includes(
          withdrawalSearchText.toLowerCase()
        ) ||
        (item.bankName?.toLowerCase() || "").includes(
          withdrawalSearchText.toLowerCase()
        ) ||
        (item.accountNumber || "").includes(withdrawalSearchText)
      : true;


    return matchesSearch;
  });

  const hasUnresolvedWithdrawal = withdrawalRequests.some(
    (item) => item.status !== "Resolved" && item.status !== "Rejected"
  );

  // Reload all data (transactions, wallet, withdrawals)
  const handleReloadAll = () => {
    fetchTransactions();
    fetchWalletBalance();
    fetchWithdrawalRequests(1, withdrawalPagination.pageSize);
    fetchPendingBalanceDetails();
    fetchAvailableBalanceDetails();
    fetchDisbursementDetails();
  };

  // Filter controls UI
  const transactionFilters = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Button
        icon={<ReloadOutlined />}
        onClick={handleReloadAll}
        size="middle"
      >
        Làm mới
      </Button>
      <Input
        placeholder="Tìm kiếm theo mã GD, khách hàng, loại giao dịch..."
        prefix={<SearchOutlined />}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: 280 }}
        allowClear
        size="middle"
      />

      <Select
        placeholder="Lọc theo loại giao dịch"
        value={statusFilter}
        onChange={setStatusFilter}
        style={{ width: 200 }}
        size="middle"
      >
        <Select.Option value="all">Tất cả loại</Select.Option>
        <Select.Option value="ProductOrder">Đơn hàng</Select.Option>
        <Select.Option value="ExtendCourse">Gia hạn khóa học</Select.Option>
        <Select.Option value="GymCourse">Gói tập Gym</Select.Option>
        <Select.Option value="Withdraw">Rút tiền</Select.Option>
        <Select.Option value="DistributeProfit">
          Phân phối lợi nhuận
        </Select.Option>
      </Select>

      <Button
        icon={<ImStatsBars />}
        className="bg-[#FF914D] text-white border-0 hover:bg-[#e8823d]"
        size="middle"
      >
        Xuất báo cáo
      </Button>
    </div>
  );

  const withdrawalFilters = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Button
        icon={<ReloadOutlined />}
        onClick={handleReloadAll}
        size="middle"
      >
        Làm mới
      </Button>
      <Input
        placeholder="Tìm kiếm theo tên, ngân hàng, số tài khoản..."
        prefix={<SearchOutlined />}
        value={withdrawalSearchText}
        onChange={(e) => setWithdrawalSearchText(e.target.value)}
        style={{ width: 280 }}
        allowClear
        size="middle"
      />
      {/* <Select
        value={withdrawalStatusFilter}
        onChange={setWithdrawalStatusFilter}
        style={{ width: 180 }}
        size="middle"
      >
        <Select.Option value="All">Tất cả trạng thái</Select.Option>
        <Select.Option value="Pending">Chờ duyệt</Select.Option>
        <Select.Option value="AdminApproved">Đã duyệt</Select.Option>
        <Select.Option value="Completed">Đã xác nhận</Select.Option>
        <Select.Option value="Rejected">Đã từ chối</Select.Option>
      </Select> */}

      <Button
        type="primary"
        icon={<PlusOutlined />}
        size="middle"
        onClick={() => setIsModalCreateWithdrawalOpen(true)}
        className="border-0 bg-[#ED2A46] text-white hover:bg-[#e43e56]"
        disabled={hasUnresolvedWithdrawal}
      >
        {hasUnresolvedWithdrawal
          ? "Bạn đã có yêu cầu đang chờ xử lý"
          : "Tạo Yêu Cầu Rút Tiền"}
      </Button>
    </div>
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
          }
          tip="Đang tải giao dịch..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className=" min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-4">
          <MdPayment />
          Quản Lý Giao Dịch
        </h1>

        {/* Wallet Balance Row */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12}>
            <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Số dư khả dụng
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-emerald-600">
                    {loadingWalletBalance
                      ? "Đang tải..."
                      : formatCurrency(walletBalance.totalAvailableBalance)}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                  <DollarOutlined className="text-white text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Số dư đang xử lý
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-amber-600">
                    {loadingWalletBalance
                      ? "Đang tải..."
                      : formatCurrency(walletBalance.totalPendingBalance)}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                  <ClockCircleOutlined className="text-white text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-gray-600">Tổng giao dịch</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#ED2A46]">
              {stats.totalRevenue.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="text-gray-600">Tổng thanh toán</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalProfit.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="text-gray-600">Tổng lợi nhuận</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {disbursementTotalProfit.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="text-gray-600">Tổng rút tiền</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.productOrders}
            </div>
            <div className="text-gray-600">Đơn hàng</div>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "transactions",
                  label: (
            <span className="flex items-center gap-2">
                      <MdPayment />
                      Giao Dịch
            </span>
                  ),
                },
                {
                  key: "withdrawals",
                  label: (
                    <span className="flex items-center gap-2">
                      <MoneyCollectOutlined />
                      Yêu Cầu Rút Tiền
                    </span>
                  ),
                },
                {
                  key: "wallet",
                  label: (
                    <span className="flex items-center gap-2">
                      <FaMoneyBillWave />
                      Số Dư Ví
                    </span>
                  ),
                },
              ]}
            />

            <div className="w-full md:w-auto">
              {activeTab === "transactions"
                ? transactionFilters
                : activeTab === "withdrawals"
                ? withdrawalFilters
                : null}
            </div>
          </div>

          {activeTab === "transactions" ? (
            <ConfigProvider
              theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
            >
              <Table
                dataSource={filteredData}
                columns={columns}
                loading={loading}
                pagination={false}
                scroll={{ x: 800 }}
                size="middle"
                rowKey="transactionId"
                onRow={(record) => ({
                  onClick: () => {
                    fetchTransactionDetail(record.transactionId);
                  },
                  style: { cursor: "pointer" },
                })}
              />
            </ConfigProvider>
          ) : activeTab === "withdrawals" ? (
            <ConfigProvider
              theme={{
                components: {
                  Table: {
                    headerBg:
                      "linear-gradient(90deg, #FFE5E9 0%, #FFF0F2 100%)",
                    headerColor: "#333",
                    rowHoverBg: "#FFF9FA",
                  },
                },
              }}
            >
              <Table
                dataSource={filteredWithdrawals}
                columns={withdrawalColumns}
                loading={loadingWithdrawals}
                pagination={{
                  current: withdrawalPagination.current,
                  pageSize: withdrawalPagination.pageSize,
                  total: withdrawalPagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} yêu cầu`,
                  position: ["bottomCenter"],
                }}
                onChange={handleWithdrawalTableChange}
                className="rounded-lg overflow-hidden"
                scroll={{ x: 800 }}
                rowKey="id"
                onRow={(record) => ({
                  onClick: () => {
                    handleViewWithdrawalDetails(record);
                  },
                  style: { cursor: "pointer" },
                })}
              />
            </ConfigProvider>
          ) : (
            <WalletBalanceTab
              walletFilter={walletFilter}
              setWalletFilter={setWalletFilter}
              pendingTotalProfit={pendingTotalProfit}
              pendingItems={pendingItems}
              pendingColumns={pendingColumns}
              loadingPendingDetails={loadingPendingDetails}
              availableTotalProfit={availableTotalProfit}
              availableItems={availableItems}
              simpleWalletColumns={simpleWalletColumns}
              loadingAvailableDetails={loadingAvailableDetails}
              disbursementTotalProfit={disbursementTotalProfit}
              disbursementItems={disbursementItems}
              loadingDisbursementDetails={loadingDisbursementDetails}
              renderSignedAmount={renderSignedAmount}
            />
          )}
        </div>
      </Card>

      {/* Transaction Detail Modal - Enhanced UI */}
      <FitBridgeModal
        open={isModalTransactionDetailOpen}
        onCancel={() => {
          setIsModalTransactionDetailOpen(false);
          setSelectedTransaction(null);
        }}
        title="Chi Tiết Giao Dịch"
        titleIcon={<EyeOutlined />}
        width={950}
        logoSize="medium"
        bodyStyle={{ padding: "0", maxHeight: "75vh", overflowY: "auto" }}
      >
        {loadingDetail ? (
          <div className="flex justify-center items-center py-12">
            <Spin
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48, color: "#FF914D" }}
                  spin
                />
              }
              tip="Đang tải chi tiết..."
            />
          </div>
        ) : selectedTransaction ? (
          <div className="flex flex-col">
            {/* Header Section with Key Info */}
            <div className="bg-gradient-to-r from-[#FFF9FA] to-[#FFF5F0] p-6 border-b-2 border-gray-100">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <FaReceipt className="text-[#FF914D]" />
                      <span>Mã Đơn Hàng</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedTransaction.orderCode || "N/A"}
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <FaMoneyBillWave className="text-[#FF914D]" />
                      <span>Số Tiền Thanh Toán</span>
                    </div>
                    <div className="text-2xl font-bold text-[#ED2A46]">
                      {selectedTransaction.totalPaidAmount !== null &&
                      selectedTransaction.totalPaidAmount !== undefined
                        ? selectedTransaction.totalPaidAmount.toLocaleString(
                            "vi",
                            {
                            style: "currency",
                            currency: "VND",
                            }
                          )
                        : "N/A"}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Main Content */}
            <div className="p-6 flex flex-col gap-5 space-y-6">
              {/* Transaction Info Card */}
              <Card 
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaInfoCircle />
                    Thông Tin Giao Dịch
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="Mã Giao Dịch" span={2}>
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded inline-block">
                      {selectedTransaction.transactionId}
                    </div>
                  </Descriptions.Item>

                  {selectedTransaction.orderItemId && (
                    <Descriptions.Item label="Mã Mục Đơn Hàng" span={2}>
                      <div className="font-mono text-xs bg-blue-50 p-2 rounded inline-block">
                        {selectedTransaction.orderItemId}
                      </div>
                    </Descriptions.Item>
                  )}
                  
                  <Descriptions.Item label="Loại Giao Dịch">
                    <Tag 
                      color={getTransactionTypeColor(
                        selectedTransaction.transactionType
                      )}
                      className="text-sm px-3 py-1"
                    >
                      {getTransactionTypeText(
                        selectedTransaction.transactionType
                      )}
                    </Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Phương Thức">
                    <Tag
                      color="cyan"
                      icon={<MdPayment />}
                      className="text-sm px-3 py-1"
                    >
                      {selectedTransaction.paymentMethod || "N/A"}
                    </Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Số Tiền Thanh Toán">
                    <span className="text-lg font-bold text-[#ED2A46]">
                      {selectedTransaction.totalPaidAmount !== null &&
                      selectedTransaction.totalPaidAmount !== undefined
                        ? selectedTransaction.totalPaidAmount.toLocaleString(
                            "vi",
                            {
                            style: "currency",
                            currency: "VND",
                            }
                          )
                        : "N/A"}
                    </span>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Lợi Nhuận">
                    <span className="text-lg font-bold text-green-600">
                      {selectedTransaction.profitAmount !== null &&
                      selectedTransaction.profitAmount !== undefined
                        ? selectedTransaction.profitAmount.toLocaleString(
                            "vi",
                            {
                            style: "currency",
                            currency: "VND",
                            }
                          )
                        : "N/A"}
                    </span>
                  </Descriptions.Item>

                  {selectedTransaction.withdrawalAmount !== null &&
                    selectedTransaction.withdrawalAmount !== undefined && (
                    <Descriptions.Item label="Số Tiền Rút" span={2}>
                      <span className="text-lg font-bold text-purple-600">
                          {selectedTransaction.withdrawalAmount.toLocaleString(
                            "vi",
                            {
                          style: "currency",
                          currency: "VND",
                            }
                          )}
                      </span>
                    </Descriptions.Item>
                  )}
                  
                  <Descriptions.Item label="Ngày Tạo" span={2}>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {selectedTransaction.createdAt
                          ? new Date(
                              selectedTransaction.createdAt
                            ).toLocaleDateString("vi-VN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {selectedTransaction.createdAt
                          ? new Date(
                              selectedTransaction.createdAt
                            ).toLocaleTimeString("vi-VN")
                          : ""}
                      </span>
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Mô Tả" span={2}>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {selectedTransaction.description || "Không có mô tả"}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Customer Info Card */}
              <Card 
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaUserCircle />
                    Thông Tin Khách Hàng
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <img
                    src={selectedTransaction.customerAvatarUrl || defaultAvatar}
                    alt={selectedTransaction.customerName}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      Họ Tên Khách Hàng
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {selectedTransaction.customerName || "Chưa có thông tin"}
                    </div>
                    {selectedTransaction.customerId && (
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        ID: {selectedTransaction.customerId}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
        )}
      </FitBridgeModal>

      {/* Withdrawal Detail Modal - FitBridge style */}
      <FitBridgeModal
        open={isModalWithdrawalDetailOpen}
        onCancel={() => {
          setIsModalWithdrawalDetailOpen(false);
          setSelectedWithdrawalRequest(null);
        }}
        title="Chi Tiết Yêu Cầu Rút Tiền"
        titleIcon={<MoneyCollectOutlined />}
        width={800}
        logoSize="medium"
        bodyStyle={{ padding: 0, maxHeight: "75vh", overflowY: "auto" }}
      >
        {selectedWithdrawalRequest ? (
          <div className="flex flex-col">
            {/* Header with key info */}
            <div className="bg-gradient-to-r from-[#FFF9FA] to-[#FFF5F0] p-6 border-b-2 border-gray-100">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <FaMoneyBillWave className="text-[#FF914D]" />
                      <span>Số Tiền Yêu Cầu</span>
          </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedWithdrawalRequest.amount)}
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2 items-start md:items-end">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <CalendarOutlined className="text-[#FF914D]" />
                      <span>Ngày Tạo</span>
                    </div>
                    <div className="font-semibold text-gray-800">
                      {formatDateTime(selectedWithdrawalRequest.createdAt)}
                    </div>
                    <div className="mt-2">
                      {getStatusTag(selectedWithdrawalRequest.status)}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Main content */}
            <div className="p-6 flex flex-col gap-5 space-y-6">
              {/* Bank & account info */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <BankOutlined />
                    Thông Tin Ngân Hàng
                  </span>
                }
                bordered
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Ngân hàng">
                    <span className="font-semibold">
                      {selectedWithdrawalRequest.bankName}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tên tài khoản">
                    <span className="font-semibold">
                      {selectedWithdrawalRequest.accountName}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số tài khoản">
                    <span className="font-mono font-semibold">
                      {selectedWithdrawalRequest.accountNumber}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Proof image */}
              {selectedWithdrawalRequest.imageUrl && (
                <Card
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  title={
                    <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                      <FaInfoCircle />
                      Hình Ảnh Chứng Từ
                    </span>
                  }
                  bordered
                  style={{ borderColor: "#FFE5E9" }}
                >
                  <Image
                    src={selectedWithdrawalRequest.imageUrl}
                    alt="Withdrawal proof"
                    className="w-full rounded-lg"
                  />
                </Card>
              )}

              {/* Note / reason */}
              {selectedWithdrawalRequest.reason && (
                <Card
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  title={
                    <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                      <FaInfoCircle />
                      Lý Do / Ghi Chú
                    </span>
                  }
                  bordered
                  style={{ borderColor: "#FFE5E9" }}
                >
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedWithdrawalRequest.reason}
                  </p>
                </Card>
              )}
            </div>

            {/* Footer actions */}
            <div className="px-6 pb-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
              <Button
                onClick={() => {
                  setIsModalWithdrawalDetailOpen(false);
                  setSelectedWithdrawalRequest(null);
                }}
              >
                Đóng
              </Button>
              {selectedWithdrawalRequest?.status === "AdminApproved" && (
                <Button
                  key="confirm"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() =>
                    handleConfirmWithdrawal(selectedWithdrawalRequest.id)
                  }
                >
                  Xác Nhận Rút Tiền
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
        )}
      </FitBridgeModal>

      {/* Create Withdrawal Request Modal */}
      <Modal
        open={isModalCreateWithdrawalOpen}
        onCancel={() => {
          setIsModalCreateWithdrawalOpen(false);
          formCreateWithdrawal.resetFields();
        }}
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
              <MoneyCollectOutlined className="text-white text-xl" />
    </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Tạo Yêu Cầu Rút Tiền
              </h2>
              <p className="text-sm text-gray-500 m-0">
                Số dư khả dụng: {formatCurrency(walletBalance.totalAvailableBalance)}
              </p>
            </div>
          </div>
        }
        footer={null}
        width={700}
      >
        <Form
          form={formCreateWithdrawal}
          layout="vertical"
          requiredMark={false}
          onFinish={handleCreateWithdrawal}
        >
          <Form.Item
            label={
              <span className="text-base font-semibold text-gray-700">
                Số tiền rút (VNĐ)
              </span>
            }
            name="amount"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền" },
              {
                validator: (_, value) => {
                  if (value == null || value === "") return Promise.resolve();

                  const num = Number(value);
                  if (Number.isNaN(num)) {
                    return Promise.reject(
                      new Error("Vui lòng nhập số tiền hợp lệ")
                    );
                  }

                  if (num < 50000) {
                    return Promise.reject(
                      new Error("Số tiền tối thiểu là 50,000 VNĐ")
                    );
                  }
                  if (num > walletBalance.totalAvailableBalance) {
                    return Promise.reject(
                      new Error("Số tiền không được vượt quá số dư khả dụng")
                    );
                  }

                  if (num > 20000000) {
                    return Promise.reject(
                      new Error("Số tiền tối đa là 20,000,000 VNĐ")
                    );
                  }

                  

                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              placeholder="Nhập số tiền muốn rút"
              className="!w-full"
              size="large"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) =>
                value ? value.toString().replace(/[^\d]/g, "") : ""
              }
              suffix="VNĐ"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-base font-semibold text-gray-700">
                Tên ngân hàng
              </span>
            }
            name="bankName"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng" }]}
          >
            <Select
              showSearch
              placeholder="Chọn ngân hàng"
              style={{ width: "100%", height: 60 }}
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label || "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={banks.map((b) => ({
                label: (
                  <div className="flex items-center gap-3">
                    <img
                      src={b.logo}
                      alt={b.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">
                        {b.name} ({b.code})
                      </span>
                      <span className="text-xs text-gray-500">
                        {b.bankFullName}
                      </span>
                    </div>
                  </div>
                ),
                value: b.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-base font-semibold text-gray-700">
                Số tài khoản
              </span>
            }
            name="accountNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số tài khoản" },
              {
                pattern: /^[0-9]+$/,
                message: "Số tài khoản chỉ được chứa số",
              },
            ]}
          >
            <Input
              placeholder="Nhập số tài khoản"
              size="large"
              prefix={<BankOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-base font-semibold text-gray-700">
                Tên chủ tài khoản
              </span>
            }
            name="accountName"
            rules={[
              { required: true, message: "Vui lòng nhập tên chủ tài khoản" },
            ]}
          >
            <Input
              placeholder="Nhập tên chủ tài khoản"
              size="large"
              prefix={<UserOutlined className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-base font-semibold text-gray-700">
                Ghi chú (tùy chọn)
              </span>
            }
            name="note"
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập lý do hoặc ghi chú..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div className="text-center pt-6 border-t border-gray-200">
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setIsModalCreateWithdrawalOpen(false);
                  formCreateWithdrawal.resetFields();
                }}
                className="px-8"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                loading={loadingCreateWithdrawal}
                onClick={() => formCreateWithdrawal.submit()}
                className="px-8 bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-lg"
              >
                {loadingCreateWithdrawal ? "Đang xử lý..." : "Tạo Yêu Cầu"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
