import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Divider,
  Row,
  Col,
  Descriptions,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";
import {
  FaMoneyBillWave,
  FaFilter,
  FaUsers,
  FaBuilding,
  FaUserCircle,
  FaInfoCircle,
  FaReceipt,
} from "react-icons/fa";
import { MdPayment, MdAdminPanelSettings } from "react-icons/md";
import { ImStatsBars } from "react-icons/im";
import transactionService from "../../../services/transactionServices";
import adminService from "./../../../services/adminServices";
import defaultAvatar from "../../../assets/LogoColor.png";
import FitBridgeModal from "../../../components/FitBridgeModal";
const { RangePicker } = DatePicker;

export default function ManageTransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalTransactionDetailOpen, setIsModalTransactionDetailOpen] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [gymFilter, setGymFilter] = useState("all");
  const [gyms, setGyms] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Helper to build filters safely
  const buildFilters = () => ({
    status: statusFilter,
    gymId: gymFilter,
    startDate: dateRange?.[0]?.isValid?.() && dateRange[0].format("YYYY-MM-DD"),
    endDate: dateRange?.[1]?.isValid?.() && dateRange[1].format("YYYY-MM-DD"),
    search: searchText,
  });

  // Fetch all transactions for admin
  const fetchTransactions = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllTransactions({
        page,
        size: pageSize,
        sortOrder:'dsc'
      });

      const { items, total, page: currentPage, totalPages } = response.data;
      setTransactions(items || []);
      setPagination({
        current: currentPage,
        pageSize,
        total,
        totalPages,
      });
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

  // Fetch gyms for filter dropdown
  const fetchGyms = async (page = 1, pageSize = 10000) => {
    try {
      const response = await adminService.getAllGym({
        page,
        size: pageSize,
      });
      setGyms(response.data.items || []);
    } catch (error) {
      console.error("Error fetching gyms:", error);
      toast.error(
        error?.response?.data?.message ||
          "Lỗi tải danh sách phòng gym, vui lòng thử lại sau."
      );
      setGyms([]);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchGyms();
  }, []);

  // Only trigger fetch if gyms loaded (for gymFilter) and not loading
  useEffect(() => {
    if (loading) return;
    const filters = buildFilters();
    fetchTransactions(pagination.current, pagination.pageSize, filters);
    // eslint-disable-next-line
  }, [statusFilter, gymFilter, dateRange, searchText]);

  const handleTableChange = (newPagination) => {
    const filters = buildFilters();
    fetchTransactions(newPagination.current, newPagination.pageSize, filters);
  };



  const handleExportReport = async () => {
    setLoading(true);
    try {
      const filters = buildFilters();
      const response = await transactionService.exportTransactionReport(
        filters
      );

      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transaction-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Xuất báo cáo thành công");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error(
        error?.response?.data?.message ||
          "Lỗi xuất báo cáo, vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 20,
      sorter: (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA - dateB;
      },
      render: (date) => (
        <div>
          <div>{date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"}</div>
          <div className="text-xs text-gray-500">
            {date ? new Date(date).toLocaleTimeString("vi-VN") : ""}
          </div>
        </div>
      ),
    },
    // {
    //   title: "Mã Giao Dịch",
    //   dataIndex: "transactionId",
    //   key: "transactionId",
    //   align: "center",
    //   width: 150,
    //   render: (id) => (
    //     <Tooltip title={id}>
    //       <span className="font-mono text-xs">
    //         {id ? id.substring(0, 8) + "..." : "N/A"}
    //       </span>
    //     </Tooltip>
    //   ),
    // },
    {
      title: "Mã Đơn Hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      align: "center",
      width: 20,
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
      width: 120,
      render: (record) => (
        <div className="flex items-center gap-2 justify-start">
            <img
              src={record.customerAvatarUrl ? record.customerAvatarUrl : defaultAvatar }
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
      width: 70,
      render: (type) => (
        <Tag color={type === "ProductOrder" ? "blue" : "purple"}>
          {type === "ProductOrder" ? "Đơn Hàng" : type || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Số Tiền",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      width: 40,
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
      render: (value) => (
        <span className="font-bold text-green-600">
          {value?.toLocaleString("vi", {
            style: "currency",
            currency: "VND",
          }) || "0 VNĐ"}
        </span>
      ),
    },
    {
      title: "Lợi Nhuận",
      dataIndex: "profitAmount",
      key: "profitAmount",
      align: "center",
      width: 40,
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
      title: "Phương Thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      align: "center",
      width: 50,
      render: (method) => (
        <Tag color="cyan" icon={<MdPayment />}>
          {method || "N/A"}
        </Tag>
      ),
    },
  ];

  // Calculate statistics - handle empty arrays safely
  const stats = {
    total: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    totalProfit: transactions.reduce((sum, t) => sum + (t.profitAmount || 0), 0),
    productOrders: transactions.filter((t) => t.transactionType === "ProductOrder").length,
    payOSPayments: transactions.filter((t) => t.paymentMethod === "PayOS").length,
    averageAmount: transactions.length > 0 
      ? transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length 
      : 0,
  };

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
          <MdAdminPanelSettings />
          Quản Lý Giao Dịch (Admin)
        </h1>

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
            <div className="text-gray-600">Tổng doanh thu</div>
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
              {stats.productOrders}
            </div>
            <div className="text-gray-600">Đơn hàng</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.averageAmount.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="text-gray-600">Trung bình/GD</div>
          </Card>
        </div>
      </div>

      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        {/* Advanced Filters */}
        <Card
          className="mb-4"
          title={
            <span className="flex items-center gap-2">
              <FaFilter /> Bộ lọc nâng cao
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm kiếm theo mã giao dịch, gym..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />

            <Select
              placeholder="Lọc theo loại giao dịch"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Select.Option value="all">Tất cả loại</Select.Option>
              <Select.Option value="ProductOrder">Đơn hàng</Select.Option>
            </Select>

            <Select
              placeholder="Lọc theo phòng gym"
              value={gymFilter}
              onChange={setGymFilter}
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              notFoundContent={gyms.length === 0 ? "Không có phòng gym" : null}
            >
              <Select.Option value="all">Tất cả phòng gym</Select.Option>
              {gyms.map((gym) => (
                <Select.Option key={gym.id} value={gym.id}>
                  {gym.gymName}
                </Select.Option>
              ))}
            </Select>

            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              value={dateRange}
              onChange={(dates) => {
                if (!dates || dates.length !== 2) {
                  setDateRange([]);
                } else {
                  setDateRange(dates);
                }
              }}
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button
              icon={<ImStatsBars />}
              onClick={handleExportReport}
              className="bg-[#FF914D] text-white border-0 hover:bg-[#e8823d]"
              loading={loading}
            >
              Xuất báo cáo Excel
            </Button>
          </div>
        </Card>

        <Table
          dataSource={transactions}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ["bottomCenter"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} giao dịch`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }}
          size="middle"
          rowKey="transactionId"
          onRow={(record) => ({
            onClick: () => {
              setSelectedTransaction(record);
              setIsModalTransactionDetailOpen(true);
            },
            style: { cursor: "pointer" },
          })}
        />
      </ConfigProvider>

      {/* Transaction Detail Modal - Enhanced UI */}
      <FitBridgeModal
        open={isModalTransactionDetailOpen}
        onCancel={() => setIsModalTransactionDetailOpen(false)}
        title="Chi Tiết Giao Dịch"
        titleIcon={<EyeOutlined />}
        width={950}
        logoSize="medium"
        bodyStyle={{ padding: "0", maxHeight: "75vh", overflowY: "auto" }}
      >
        {selectedTransaction && (
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
                      <span>Tổng Tiền</span>
                    </div>
                    <div className="text-2xl font-bold text-[#ED2A46]">
                      {selectedTransaction.amount?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      }) || "0 VNĐ"}
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
                  
                  <Descriptions.Item label="Loại Giao Dịch">
                    <Tag 
                      color={selectedTransaction.transactionType === "ProductOrder" ? "blue" : "purple"}
                      className="text-sm px-3 py-1"
                    >
                      {selectedTransaction.transactionType === "ProductOrder" ? "Đơn Hàng" : selectedTransaction.transactionType || "N/A"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Lợi Nhuận" span={2}>
                    <span className="text-lg font-bold text-green-600">
                      {selectedTransaction.profitAmount !== null && selectedTransaction.profitAmount !== undefined
                        ? selectedTransaction.profitAmount.toLocaleString("vi", {
                            style: "currency",
                            currency: "VND",
                          })
                        : "N/A"}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phương Thức">
                    <Tag color="cyan" icon={<MdPayment />} className="text-sm px-3 py-1">
                      {selectedTransaction.paymentMethod || "N/A"}
                    </Tag>
                  </Descriptions.Item>
                  
                  {/* <Descriptions.Item label="Số Tiền">
                    <span className="text-lg font-bold text-[#ED2A46]">
                      {selectedTransaction.amount?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      }) || "0 VNĐ"}
                    </span>
                  </Descriptions.Item> */}
                  
                  
                  
                  <Descriptions.Item label="Ngày Tạo" span={2}>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {selectedTransaction.createdAt
                          ? new Date(selectedTransaction.createdAt).toLocaleDateString("vi-VN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {selectedTransaction.createdAt
                          ? new Date(selectedTransaction.createdAt).toLocaleTimeString("vi-VN")
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
                    <div className="text-sm text-gray-500 mb-1">Họ Tên Khách Hàng</div>
                    <div className="text-xl font-bold text-gray-800">
                      {selectedTransaction.customerName || "Chưa có thông tin"}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Related Info Card */}
              <Card 
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaBuilding />
                    Thông Tin Liên Quan
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="ID Đơn Hàng">
                    <div className="font-mono text-xs bg-blue-50 p-2 rounded inline-block">
                      {selectedTransaction.orderId || "N/A"}
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="ID Ví">
                    <div className="font-mono text-xs bg-green-50 p-2 rounded inline-block">
                      {selectedTransaction.walletId || "Chưa có thông tin"}
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="ID Yêu Cầu Rút Tiền">
                    <div className="font-mono text-xs bg-orange-50 p-2 rounded inline-block">
                      {selectedTransaction.withdrawalRequestId || "Chưa có yêu cầu rút tiền"}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          </div>
        )}
      </FitBridgeModal>
    </div>
  );
}
