import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Spin,
  Table,
  Row,
  Col,
  Statistic,
  Tag,
  Select,
  Modal,
  Descriptions,
  Timeline,
  Empty,
  Badge,
  Image,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  UserOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  BarcodeOutlined,
  TagOutlined,
  EyeOutlined,
  SyncOutlined,
  CarOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import orderService from "../../../services/orderServices";
import OrderDetailModal from "./OrderDetailModal";
import ShippingOrderModal from "./ShippingOrderModal";
import StatusUpdateModal from "./StatusUpdateModal";
import ShopAddressModal from "./ShopAddressModal";
import CancelOrderModal from "./CancelOrderModal";

const { Option } = Select;

// Mock data for orders

export default function ManageOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingRemarks, setShippingRemarks] = useState("");
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusDescription, setStatusDescription] = useState("");
  const [isShopAddressModalOpen, setIsShopAddressModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelComment, setCancelComment] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [summaryProductOrder, setSummaryProductOrder] = useState({});

  const fetchOrders = async (page = 1, pageSize = 10, filters = {}) => {
    setLoading(true);
    const params = {
      page: page,
      size: pageSize,
      sortOrder: "dsc",
      ...filters,
    };
    try {
      const response = await orderService.getAllOrders(params);
      const { items, total, totalPages } = response.data.productOrders;
      setOrders(items || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: total,
        totalPages: totalPages,
      });
    } catch {
      toast.error("Lấy danh sách đơn hàng thất bại. Vui lòng thử lại.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

 const fetchOrdersSummary = async () => {
    setLoading(true);
    const params = {
      doApplyPaging: false,
    };
    try {
      const response = await orderService.getAllOrders(params);
      setSummaryProductOrder(response.data.summaryProductOrder || {});
    } catch {
      toast.error("Lấy thống kê thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchOrdersSummary();
  }, []);


  const getStatusColor = (status) => {
    const colors = {
      Created: "gray",
      Pending: "orange",
      Processing: "blue",
      Assigning: "purple",
      Accepted: "geekblue",
      Shipping: "cyan",
      Arrived: "magenta",
      InReturn: "volcano",
      Returned: "red",
      CustomerNotReceived: "red",
      Finished: "lime",
      Cancelled: "red",
    };
    return colors[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      Created: <ClockCircleOutlined />,
      Pending: <ClockCircleOutlined />,
      Processing: <SyncOutlined spin />,
      Assigning: <UserOutlined />,
      Accepted: <CheckCircleOutlined />,
      Shipping: <CarOutlined />,
      Arrived: <EnvironmentOutlined />,
      InReturn: <CarOutlined />,
      Returned: <CloseCircleOutlined />,
      CustomerNotReceived: <CloseCircleOutlined />,
      Finished: <CheckCircleOutlined />,
      Cancelled: <CloseCircleOutlined />,
    };
    return icons[status] || <ClockCircleOutlined />;
  };

  const getPaymentMethodDisplay = (order) => {
    // Determine payment method based on checkoutUrl
    if (order?.checkoutUrl || selectedOrder?.checkoutUrl) {
      return "Chuyển Khoản";
    } else {
      return "Thanh Toán Khi Nhận Hàng";
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };
  console.log(selectedOrder);
  const handleUpdateStatus = async (orderId, status, description) => {
    try {
      await orderService.updateStatus(orderId, { status, description });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                currentStatus: status,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );
      toast.success(`Cập nhật trạng thái đơn hàng thành công!`);
      fetchOrders( pagination.current, pagination.pageSize, { status: status });
      fetchOrdersSummary();
      setIsStatusUpdateModalOpen(false);
      setNewStatus("");
      setStatusDescription("");
      setSelectedOrder(null);
      
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (searchText) filters.search = searchText;
      const response = await orderService.getAllOrders({
        page: pagination.current,
        size: pagination.pageSize,
        sortOrder: "dsc",
        ...filters,
      });
      const { items } = response.data.productOrders;
      setOrders(items || []);
      fetchOrders( pagination.current, pagination.pageSize, { status: status });
      fetchOrdersSummary();
      
      // Update selected order if it's open
      if (selectedOrder?.id === orderId) {
        const updatedOrder = items.find(order => order.id === orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }
    } catch {
      toast.error("Cập nhật trạng thái đơn hàng thất bại. Vui lòng thử lại.");
    }
  };

  const handleConfirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) {
      toast.error("Vui lòng chọn trạng thái mới!");
      return;
    }

    await handleUpdateStatus(selectedOrder.id, newStatus, statusDescription);
    setIsStatusUpdateModalOpen(false);
    setNewStatus("");
    setStatusDescription("");
  };

  const openStatusUpdateModal = (status) => {
    setNewStatus(status);
    setIsStatusUpdateModalOpen(true);
  };

  const openCancelOrderModal = () => {
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelOrder = async () => {
    if (!selectedOrder) return;
    
    if (!cancelComment || cancelComment.trim() === "") {
      toast.error("Vui lòng nhập lý do hủy đơn hàng!");
      return;
    }

    try {
      await orderService.cancelOrder(selectedOrder.id, { comment: cancelComment });

      toast.success(`Hủy đơn hàng thành công!`);
      
      fetchOrders( pagination.current, pagination.pageSize, { status: status });
      fetchOrdersSummary();
      setIsStatusUpdateModalOpen(false);
      setNewStatus("");
      setStatusDescription("");
      setSelectedOrder(null);
      setCancelComment("");
      // Fetch updated orders
      const filters = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (searchText) filters.search = searchText;
      const response = await orderService.getAllOrders({
        page: pagination.current,
        size: pagination.pageSize,
        sortOrder: "dsc",
        ...filters,
      });
      const { items } = response.data.productOrders;
      setOrders(items || []);
      
      fetchOrdersSummary();

      // Update selected order if it's open
      const updatedOrder = items.find(order => order.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
      
      setIsCancelModalOpen(false);
      setCancelComment("");
    } catch {
      toast.error("Hủy đơn hàng thất bại. Vui lòng thử lại.");
    }
  };

  const handleCancelOrder = () => {
    // This function is now replaced by openCancelOrderModal and handleConfirmCancelOrder
    // Kept for backward compatibility with OrderDetailModal
    openCancelOrderModal();
  };

  const handleCreateShippingOrder = async () => {
    if (!selectedOrder) return;

    try {
      const data = {
        orderId: selectedOrder.id,
        remarks: shippingRemarks || "string",
      };

      await orderService.createShippingOrder(data);
      toast.success("Tạo đơn giao hàng thành công!");
      fetchOrders( pagination.current, pagination.pageSize, { status: "Shipping" });
      fetchOrdersSummary();
      setIsShippingModalOpen(false);
      setIsCancelModalOpen(false);
      setIsStatusUpdateModalOpen(false);
      setNewStatus("");
      setStatusDescription("");
      setCancelComment("");
      setShippingRemarks("");
      setSelectedOrder(null); 
     
    } catch (error) {
      console.error("Error creating shipping order:", error);
      toast.error("Tạo đơn giao hàng thất bại. Vui lòng thử lại.");
    }
  };  

  const handleTableChange = (paginationConfig) => {
    const filters = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (searchText) filters.search = searchText;
    fetchOrders(paginationConfig.current, paginationConfig.pageSize, filters);
  };

  const handleFilterChange = () => {
    const filters = {};
    if (statusFilter !== "all") filters.status = statusFilter;
    if (searchText) filters.search = searchText;
    fetchOrders(1, pagination.pageSize, filters);
  };

  const columns = [
    {
      title: "Mã Đơn Hàng",
      dataIndex: "id",
      key: "id",
      width: 180,
      render: (text) => (
        <div className="flex items-center gap-2">
          <BarcodeOutlined className="text-blue-500" />
          <span className="font-mono text-xs font-medium text-gray-700">
            {text.substring(0, 8)}...
          </span>
        </div>
      ),
    },
    {
      title: "Khách Hàng",
      key: "customer",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">
            {record.shippingDetail?.receiverName}
          </div>
          <div className="text-xs text-gray-500">
            <PhoneOutlined className="mr-1" />
            {record.shippingDetail?.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: "Sản Phẩm",
      dataIndex: "orderItems",
      key: "orderItems",
      width: 120,
      align: "center",
      render: (items) => (
        <Badge count={items.length} showZero color="#FF914D">
          <ShoppingCartOutlined className="text-xl text-gray-600" />
        </Badge>
      ),
    },
    {
      title: "Tổng Tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      align: "right",
      render: (amount) => (
        <div className="font-semibold text-green-600 text-base">
          {amount.toLocaleString("vi-VN")} ₫
        </div>
      ),
    },
    {
      title: "Thanh Toán",
      key: "paymentMethod",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Tag icon={<CreditCardOutlined />} color="purple">
          {getPaymentMethodDisplay(record)}
        </Tag>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "currentStatus",
      key: "currentStatus",
      width: 130,
      align: "center",
      render: (status) => (
        <Tag
          icon={getStatusIcon(status)}
          color={getStatusColor(status)}
          className="px-3 py-1"
        >
          {status === "Created" && "Đã Tạo"}
          {status === "Pending" && "Chờ Xử Lý"}
          {status === "Processing" && "Đang Xử Lý"}
          {status === "Assigning" && "Đang Phân Công"}
          {status === "Accepted" && "Đã Chấp Nhận"}
          {status === "Shipping" && "Đang Giao Hàng"}
          {status === "Arrived" && "Đã Đến Nơi"}
          {status === "InReturn" && "Đang Hoàn Trả"}
          {status === "Returned" && "Đã Hoàn Trả"}
          {status === "CustomerNotReceived" && "Khách Không Nhận"}
          {status === "Finished" && "Hoàn Thành"}
          {status === "Cancelled" && "Đã Hủy"}
        </Tag>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      align: "center",
      render: (date) => (
        <div>
          <div className="text-xs text-gray-600">
            {new Date(date).toLocaleDateString("vi-VN")}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(date).toLocaleTimeString("vi-VN")}
          </div>
        </div>
      ),
    },
  ];

  // Filters are now handled server-side via API

  if (loading && orders.length === 0) {
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
    <>
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl flex gap-2 font-bold text-[#ED2A46] mb-2">
          <ShoppingOutlined />
            Quản Lý Đơn Hàng
          </h1>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("all");
                fetchOrders(1, pagination.pageSize, {});
              }}
            >
              <Statistic
                title="Tổng Đơn Hàng"
                value={summaryProductOrder?.totalProductOrders}
                prefix={<ShoppingCartOutlined style={{ color: "#FF914D" }} />}
                valueStyle={{
                  color: "#FF914D",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Created");
                fetchOrders(1, pagination.pageSize, { status: "Created" });
              }}
            >
              <Statistic
                title="Đã Tạo"
                value={summaryProductOrder?.totalCreated}
                prefix={<ClockCircleOutlined style={{ color: "#8c8c8c" }} />}
                valueStyle={{
                  color: "#8c8c8c",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Pending");
                fetchOrders(1, pagination.pageSize, { status: "Pending" });
              }}
            >
              <Statistic
                title="Chờ Xử Lý"
                value={summaryProductOrder?.totalPending}
                prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                valueStyle={{
                  color: "#faad14",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Processing");
                fetchOrders(1, pagination.pageSize, { status: "Processing" });
              }}
            >
              <Statistic
                title="Đang Xử Lý"
                value={summaryProductOrder?.totalProcessing}
                prefix={<SyncOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Assigning");
                fetchOrders(1, pagination.pageSize, { status: "Assigning" });
              }}
            >
              <Statistic
                title="Đang Phân Công"
                value={summaryProductOrder?.totalAssigning}
                prefix={<UserOutlined style={{ color: "#9254de" }} />}
                valueStyle={{
                  color: "#9254de",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Accepted");
                fetchOrders(1, pagination.pageSize, { status: "Accepted" });
              }}
            >
              <Statistic
                title="Đã Chấp Nhận"
                value={summaryProductOrder?.totalAccepted}
                prefix={<CheckCircleOutlined style={{ color: "#1677ff" }} />}
                valueStyle={{
                  color: "#1677ff",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Shipping");
                fetchOrders(1, pagination.pageSize, { status: "Shipping" });
              }}
            >
              <Statistic
                title="Đang Giao Hàng"
                value={summaryProductOrder?.totalShipping}
                prefix={<CarOutlined style={{ color: "#13c2c2" }} />}
                valueStyle={{
                  color: "#13c2c2",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Arrived");
                fetchOrders(1, pagination.pageSize, { status: "Arrived" });
              }}
            >
              <Statistic
                title="Đã Đến Nơi"
                value={summaryProductOrder?.totalArrived}
                prefix={<EnvironmentOutlined style={{ color: "#eb2f96" }} />}
                valueStyle={{
                  color: "#eb2f96",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("InReturn");
                fetchOrders(1, pagination.pageSize, { status: "InReturn" });
              }}
            >
              <Statistic
                title="Đang Hoàn Trả"
                value={ summaryProductOrder?.totalInReturn}
                prefix={<CarOutlined style={{ color: "#fa541c" }} />}
                valueStyle={{
                  color: "#fa541c",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Returned");
                fetchOrders(1, pagination.pageSize, { status: "Returned" });
              }}
            >
              <Statistic
                title="Đã Hoàn Trả"
                value={summaryProductOrder?.totalReturned}
                prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{
                  color: "#ff4d4f",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("CustomerNotReceived");
                fetchOrders(1, pagination.pageSize, { status: "CustomerNotReceived" });
              }}
            >
              <Statistic
                title="Khách Không Nhận"
                value={summaryProductOrder?.totalCustomerNotReceived}
                prefix={<CloseCircleOutlined style={{ color: "#cf1322" }} />}
                valueStyle={{
                  color: "#cf1322",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Finished");
                fetchOrders(1, pagination.pageSize, { status: "Finished" });
              }}
            >
              <Statistic
                title="Hoàn Thành"
                value={summaryProductOrder?.totalFinished}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                setStatusFilter("Cancelled");
                fetchOrders(1, pagination.pageSize, { status: "Cancelled" });
              }}
            >
              <Statistic
                title="Đã Hủy"
                value={summaryProductOrder?.totalCancelled}
                prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
                valueStyle={{
                  color: "#ff4d4f",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Doanh Thu"
                value={summaryProductOrder?.totalRevenue}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
                suffix="₫"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Lợi Nhuận"
                value={summaryProductOrder?.totalProfit}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
                suffix="₫"
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card className="border-0 shadow-lg">
          {/* Filters and Search */}
          <div className="flex flex-row mb-6 justify-between">
          <div className="flex flex-col gap-4 ">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Tìm kiếm theo mã đơn, tên khách hàng, số điện thoại..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleFilterChange}
                style={{ width: 400 }}
                allowClear
                onClear={handleFilterChange}
                className="rounded-lg"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  const filters = {};
                  if (value !== "all") filters.status = value;
                  if (searchText) filters.search = searchText;
                  fetchOrders(1, pagination.pageSize, filters);
                }}
                style={{ width: 180 }}
                className="rounded-lg"
                placeholder="Trạng thái"
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="Created">Đã Tạo</Option>
                <Option value="Pending">Chờ Xử Lý</Option>
                <Option value="Processing">Đang Xử Lý</Option>
                <Option value="Assigning">Đang Phân Công</Option>
                <Option value="Accepted">Đã Chấp Nhận</Option>
                <Option value="Shipping">Đang Giao Hàng</Option>
                <Option value="Arrived">Đã Đến Nơi</Option>
                <Option value="InReturn">Đang Hoàn Trả</Option>
                <Option value="Returned">Đã Hoàn Trả</Option>
                <Option value="CustomerNotReceived">Khách Không Nhận</Option>
                <Option value="Finished">Hoàn Thành</Option>
                <Option value="Cancelled">Đã Hủy</Option>
              </Select>
              <Select
                value={paymentFilter}
                onChange={setPaymentFilter}
                style={{ width: 200 }}
                className="rounded-lg"
                placeholder="Phương thức thanh toán"
              >
                <Option value="all">Tất cả phương thức</Option>
                <Option value="CreditCard">Thẻ Tín Dụng</Option>
                <Option value="BankTransfer">Chuyển Khoản</Option>
                <Option value="COD">Thanh Toán Khi Nhận</Option>
                <Option value="Wallet">Ví Điện Tử</Option>
              </Select>
            </div>
          </div>
          <div>
            <Button
              type="primary"
              className="bg-orange-500 hover:bg-orange-600 rounded-lg"
              onClick={() => setIsShopAddressModalOpen(true)}
            >
              Thông Tin Cửa Hàng
            </Button>
          </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-orange-600">
                {orders.length}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{pagination.total}</span> đơn hàng
              {searchText && (
                <span>
                  {" "}
                  | Tìm kiếm: "
                  <span className="font-semibold text-blue-600">
                    {searchText}
                  </span>
                  "
                </span>
              )}
            </span>
          </div>

          {/* Table */}
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
              dataSource={orders}
              columns={columns}
              className="rounded-lg overflow-hidden"
              scroll={{ x: 1200 }}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} mục`,
                position: ["bottomCenter"],
                className: "custom-pagination",
              }}
              onChange={handleTableChange}
              onRow={(record) => ({
                onClick: () => handleViewDetails(record),
                style: { cursor: "pointer" },
              })}
            />
          </ConfigProvider>
        </Card>
      </div>


      {/* Create Shipping Order Modal */}
      <ShippingOrderModal
        isOpen={isShippingModalOpen}
        onClose={() => {
          setIsShippingModalOpen(false);
          setShippingRemarks("");
        }}
        onConfirm={handleCreateShippingOrder}
        shippingRemarks={shippingRemarks}
        setShippingRemarks={setShippingRemarks}
        selectedOrder={selectedOrder}
      />

      {/* Update Status Modal */}
      <StatusUpdateModal
        isOpen={isStatusUpdateModalOpen}
        onClose={() => {
          setIsStatusUpdateModalOpen(false);
          setNewStatus("");
          setStatusDescription("");
        }}
        onConfirm={handleConfirmStatusUpdate}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        statusDescription={statusDescription}
        setStatusDescription={setStatusDescription}
        selectedOrder={selectedOrder}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
      />

      {/* Shop Address Modal */}
      <ShopAddressModal
        isOpen={isShopAddressModalOpen}
        onClose={() => setIsShopAddressModalOpen(false)}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelComment("");
        }}
        onConfirm={handleConfirmCancelOrder}
        cancelComment={cancelComment}
        setCancelComment={setCancelComment}
        selectedOrder={selectedOrder}
      />
         {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        selectedOrder={selectedOrder}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        getPaymentMethodDisplay={getPaymentMethodDisplay}
        handleCancelOrder={handleCancelOrder}
        openStatusUpdateModal={openStatusUpdateModal}
        setIsShippingModalOpen={setIsShippingModalOpen}
      />

      <style jsx>{`
        .ant-descriptions-item-label {
          font-weight: 500;
          color: #666;
        }
        .custom-pagination .ant-pagination-item-active {
          background: #ff914d;
          border-color: #ff914d;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }
        .custom-pagination .ant-pagination-item:hover {
          border-color: #ff914d;
        }
        .custom-pagination .ant-pagination-item:hover a {
          color: #ff914d;
        }
      `}</style>
    </>
  );
}
