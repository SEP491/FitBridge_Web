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
} from "@ant-design/icons";
import orderService from "../../../services/orderServices";
import OrderDetailModal from "./OrderDetailModal";
import ShippingOrderModal from "./ShippingOrderModal";
import StatusUpdateModal from "./StatusUpdateModal";

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
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = async (page = 1, pageSize = 10, filters = {}) => {
    setLoading(true);
    const params = {
      page: page,
      size: pageSize,
      ...filters,
    };
    try {
      const response = await orderService.getAllOrders(params);
      const { items, total, totalPages } = response.data;
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

  useEffect(() => {
    fetchOrders();
  }, []);

  // Statistics
  const statistics = {
    totalOrders: pagination.total || 0,
    createdOrders:
      orders?.filter((o) => o.currentStatus === "Created").length || 0,
    pendingOrders:
      orders?.filter((o) => o.currentStatus === "Pending").length || 0,
    processingOrders:
      orders?.filter((o) => o.currentStatus === "Processing").length || 0,
    assigningOrders:
      orders?.filter((o) => o.currentStatus === "Assigning").length || 0,
    shippingOrders:
      orders?.filter((o) => o.currentStatus === "Shipping").length || 0,
    finishedOrders:
      orders?.filter((o) => o.currentStatus === "Finished").length || 0,
    cancelledOrders:
      orders?.filter((o) => o.currentStatus === "Cancelled").length || 0,
    totalRevenue:
      orders
        ?.filter((o) => o.currentStatus === "Finished")
        .reduce((sum, o) => sum + o.totalAmount, 0) || 0,
  };

  const getStatusColor = (status) => {
    const colors = {
      Created: "gray",
      Pending: "orange",
      Processing: "blue",
      Assigning: "purple",
      Shipping: "cyan",
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
      Shipping: <CarOutlined />,
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

      // Update selected order if it's open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          currentStatus: status,
          updatedAt: new Date().toISOString(),
        }));
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

  const handleCancelOrder = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                currentStatus: "Cancelled",
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );
      toast.success(`Hủy đơn hàng thành công!`);

      // Update selected order if it's open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          currentStatus: "Cancelled",
          updatedAt: new Date().toISOString(),
        }));
      }
    } catch {
      toast.error("Hủy đơn hàng thất bại. Vui lòng thử lại.");
    }
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

      setIsShippingModalOpen(false);
      setShippingRemarks("");
      fetchOrders(pagination.current, pagination.pageSize);
    } catch {
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
          {status === "Shipping" && "Đang Giao Hàng"}
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
    <div className="">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Đơn Hàng
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi tất cả đơn hàng trong hệ thống
          </p>
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
                value={statistics.totalOrders}
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
                setStatusFilter("Pending");
                fetchOrders(1, pagination.pageSize, { status: "Pending" });
              }}
            >
              <Statistic
                title="Chờ Xử Lý"
                value={statistics.pendingOrders}
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
                value={statistics.processingOrders}
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
                value={statistics.assigningOrders}
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
                setStatusFilter("Shipping");
                fetchOrders(1, pagination.pageSize, { status: "Shipping" });
              }}
            >
              <Statistic
                title="Đang Giao Hàng"
                value={statistics.shippingOrders}
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
                setStatusFilter("Finished");
                fetchOrders(1, pagination.pageSize, { status: "Finished" });
              }}
            >
              <Statistic
                title="Hoàn Thành"
                value={statistics.finishedOrders}
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
                value={statistics.cancelledOrders}
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
                value={statistics.totalRevenue}
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
          <div className="flex flex-col gap-4 mb-6">
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
                <Option value="Shipping">Đang Giao Hàng</Option>
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
    </div>
  );
}
