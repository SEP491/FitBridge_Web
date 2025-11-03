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
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingOutlined, SearchOutlined, EyeOutlined } from "@ant-design/icons";
import { FaMoneyBillWave, FaFilter, FaUserCircle, FaInfoCircle, FaReceipt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { ImStatsBars } from "react-icons/im";
import transactionService from "../../../services/transactionServices";
import FitBridgeModal from "../../../components/FitBridgeModal";
import defaultAvatar from "../../../assets/LogoColor.png";

export default function ManageGymTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalTransactionDetailOpen, setIsModalTransactionDetailOpen] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchTransactions = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await transactionService.getGymOwnerTransaction({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage, totalPages } = response.data;
      setTransactions(items || []);
      setPagination({
        current: currentPage,
        pageSize,
        total: total || 0,
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

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchTransactions(newPagination.current, newPagination.pageSize);
  };

  const fetchTransactionDetail = async (transactionId) => {
    setLoadingDetail(true);
    try {
      const response = await transactionService.getGymOwnerTransactionDetails(transactionId);
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
        return "Gia hạn khóa học";
      case "DistributeProfit":
        return "Phân phối lợi nhuận";
      case "GymCourse":
        return "Gói tập Gym";
      case "Withdraw":
        return "Rút tiền";
      case "ProductOrder":
        return "Đơn hàng sản phẩm";
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

  const columns = [
    {
      title: "Mã Đơn Hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      align: "left",
      width: 120,
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
      sorter: (a, b) => (a.totalPaidAmount || 0) - (b.totalPaidAmount || 0),
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
      sorter: (a, b) => (a.profitAmount || 0) - (b.profitAmount || 0),
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
      sorter: (a, b) => (a.withdrawalAmount || 0) - (b.withdrawalAmount || 0),
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
  ];

  const filteredData = transactions.filter((item) => {
    const matchesSearch = searchText
      ? (item.transactionId?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (item.orderCode?.toString() || "").includes(searchText) ||
        (item.customerName?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (item.transactionType?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (getTransactionTypeText(item.transactionType)?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        )
      : true;

    const matchesStatus =
      statusFilter === "all" || 
      item.transactionType?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: transactions.length,
    totalRevenue: transactions.reduce((sum, t) => sum + (t.totalPaidAmount || 0), 0),
    totalProfit: transactions.reduce((sum, t) => sum + (t.profitAmount || 0), 0),
    totalWithdrawal: transactions.reduce((sum, t) => sum + (t.withdrawalAmount || 0), 0),
    productOrders: transactions.filter((t) => t.transactionType === "ProductOrder").length,
    extendCourse: transactions.filter((t) => t.transactionType === "ExtendCourse").length,
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-4">
          <MdPayment />
          Quản Lý Giao Dịch
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
              {stats.totalWithdrawal.toLocaleString("vi", {
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

      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        {/* Filters */}
        <Card
          style={{marginBottom: 20}}
          title={
            <span className="flex items-center gap-2">
              <FaFilter /> Bộ lọc
            </span>
          }
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full">
              <Input
                placeholder="Tìm kiếm theo mã GD, khách hàng, loại giao dịch..."
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 350 }}
                allowClear
              />

              <Select
                placeholder="Lọc theo loại giao dịch"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
              >
                <Select.Option value="all">Tất cả loại</Select.Option>
                <Select.Option value="ProductOrder">Đơn hàng</Select.Option>
                <Select.Option value="ExtendCourse">Gia hạn khóa học</Select.Option>
                <Select.Option value="GymCourse">Gói tập Gym</Select.Option>
                <Select.Option value="Withdraw">Rút tiền</Select.Option>
                <Select.Option value="DistributeProfit">Phân phối lợi nhuận</Select.Option>
              </Select>
            </div>

            <Button
              icon={<ImStatsBars />}
              className="bg-[#FF914D] text-white border-0 hover:bg-[#e8823d]"
            >
              Xuất báo cáo
            </Button>
          </div>
        </Card>

        <Table
          dataSource={filteredData}
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
              fetchTransactionDetail(record.transactionId);
            },
            style: { cursor: "pointer" },
          })}
        />
      </ConfigProvider>

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
                      {selectedTransaction.totalPaidAmount !== null && selectedTransaction.totalPaidAmount !== undefined
                        ? selectedTransaction.totalPaidAmount.toLocaleString("vi", {
                            style: "currency",
                            currency: "VND",
                          })
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
                      color={getTransactionTypeColor(selectedTransaction.transactionType)}
                      className="text-sm px-3 py-1"
                    >
                      {getTransactionTypeText(selectedTransaction.transactionType)}
                    </Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Phương Thức">
                    <Tag color="cyan" icon={<MdPayment />} className="text-sm px-3 py-1">
                      {selectedTransaction.paymentMethod || "N/A"}
                    </Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Số Tiền Thanh Toán">
                    <span className="text-lg font-bold text-[#ED2A46]">
                      {selectedTransaction.totalPaidAmount !== null && selectedTransaction.totalPaidAmount !== undefined
                        ? selectedTransaction.totalPaidAmount.toLocaleString("vi", {
                            style: "currency",
                            currency: "VND",
                          })
                        : "N/A"}
                    </span>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Lợi Nhuận">
                    <span className="text-lg font-bold text-green-600">
                      {selectedTransaction.profitAmount !== null && selectedTransaction.profitAmount !== undefined
                        ? selectedTransaction.profitAmount.toLocaleString("vi", {
                            style: "currency",
                            currency: "VND",
                          })
                        : "N/A"}
                    </span>
                  </Descriptions.Item>

                  {selectedTransaction.withdrawalAmount !== null && selectedTransaction.withdrawalAmount !== undefined && (
                    <Descriptions.Item label="Số Tiền Rút" span={2}>
                      <span className="text-lg font-bold text-purple-600">
                        {selectedTransaction.withdrawalAmount.toLocaleString("vi", {
                          style: "currency",
                          currency: "VND",
                        })}
                      </span>
                    </Descriptions.Item>
                  )}
                  
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
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu
          </div>
        )}
      </FitBridgeModal>
    </div>
  );
}
