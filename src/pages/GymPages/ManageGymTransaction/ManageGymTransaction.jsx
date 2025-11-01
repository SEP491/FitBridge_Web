import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Modal,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import { FaEye, FaMoneyBillWave, FaFilter } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { ImStatsBars } from "react-icons/im";
import transactionService from "../../../services/transactionServices";

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
      const response = await transactionService.getTransactions({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage, totalPages } = response.data;
      setTransactions(items);
      console.log("Transactions:", items);
      setPagination({
        current: currentPage,
        pageSize,
        total,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Lỗi tải danh sách giao dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleTableChange = (pagination) => {
    fetchTransactions(pagination.current, pagination.pageSize);
  };

  const fetchTransactionDetail = async (transactionId) => {
    setLoadingDetail(true);
    try {
      const response = await transactionService.getTransactionsDetails(transactionId);
      setSelectedTransaction(response.data);
      setIsModalTransactionDetailOpen(true);
    } catch (error) {
      console.error("Error fetching transaction detail:", error);
      toast.error("Lỗi tải chi tiết giao dịch");
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "COMPLETED":
      case "SUCCESS":
        return "green";
      case "PENDING":
        return "orange";
      case "FAILED":
        return "red";
      case "CANCELLED":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
      case "COMPLETED":
      case "SUCCESS":
        return "Thành công";
      case "PENDING":
        return "Đang xử lý";
      case "FAILED":
        return "Thất bại";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
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

  const handleUpdateTransactionStatus = async (transactionId, newStatus) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn ${
        newStatus?.toUpperCase() === "SUCCESS" ? "xác nhận" : "hủy"
      } giao dịch này không?`,
      onOk: async () => {
        try {
          await transactionService.updateTransactionStatus(
            transactionId,
            newStatus
          );
          fetchTransactions(pagination.current, pagination.pageSize);
          toast.success(
            `${
              newStatus?.toUpperCase() === "SUCCESS" ? "Xác nhận" : "Hủy"
            } giao dịch thành công`
          );
        } catch (error) {
          console.error("Error updating transaction:", error);
          toast.error(
            error.response?.data?.message || "Lỗi cập nhật trạng thái giao dịch"
          );
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã Giao Dịch",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: 150,
      render: (id) => (
        <Tooltip title={id}>
          <span className="font-mono text-xs">{id?.substring(0, 8)}...</span>
        </Tooltip>
      ),
    },
    {
      title: "Mã Đơn Hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      align: "center",
      width: 120,
      render: (orderCode) => (
        <span className="font-mono text-sm">{orderCode || "N/A"}</span>
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
      title: "Số Tiền",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      width: 130,
      render: (value) =>
        value?.toLocaleString("vi", {
          style: "currency",
          currency: "VND",
        }) || "0 VNĐ",
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
      filters: [
        { text: "Thành công", value: "Success" },
        { text: "Đang xử lý", value: "Pending" },
        { text: "Thất bại", value: "Failed" },
      ],
      onFilter: (value, record) => 
        record.status?.toUpperCase() === value.toUpperCase(),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 150,
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Hành Động",
      key: "action",
      align: "center",
      width: 200,
      fixed: "right",
      render: (text, record) => (
        <div className="flex justify-center items-center gap-2">
          <Tooltip title="Xem chi tiết">
            <FaEye
              onClick={() => fetchTransactionDetail(record.id)}
              size={20}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
            />
          </Tooltip>

          {record.status?.toUpperCase() === "PENDING" && (
            <>
              <Tooltip title="Xác nhận giao dịch">
                <Button
                  size="small"
                  type="primary"
                  onClick={() =>
                    handleUpdateTransactionStatus(record.id, "Success")
                  }
                  className="bg-green-500 hover:bg-green-600 border-0"
                >
                  Xác nhận
                </Button>
              </Tooltip>

              <Tooltip title="Hủy giao dịch">
                <Button
                  size="small"
                  danger
                  onClick={() =>
                    handleUpdateTransactionStatus(record.id, "Failed")
                  }
                >
                  Hủy
                </Button>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  const filteredData = transactions.filter((item) => {
    const matchesSearch = searchText
      ? (item.id?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (item.orderCode?.toString() || "").includes(searchText) ||
        (item.transactionType?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (getTransactionTypeText(item.transactionType)?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        )
      : true;

    const matchesStatus =
      statusFilter === "all" || 
      item.status?.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => 
      t.status?.toUpperCase() === "SUCCESS" || t.status?.toUpperCase() === "COMPLETED"
    ).length,
    pending: transactions.filter((t) => 
      t.status?.toUpperCase() === "PENDING"
    ).length,
    failed: transactions.filter((t) => 
      t.status?.toUpperCase() === "FAILED"
    ).length,
    totalRevenue: transactions
      .filter((t) => 
        t.status?.toUpperCase() === "SUCCESS" || t.status?.toUpperCase() === "COMPLETED"
      )
      .reduce((sum, t) => sum + (t.amount || 0), 0),
  };

  if (loading) {
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
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
            <div className="text-gray-600">Thành công</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-gray-600">Đang xử lý</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
            <div className="text-gray-600">Thất bại</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#ED2A46]">
              {stats.totalRevenue.toLocaleString("vi", {
                style: "currency",
                currency: "VND",
              })}
            </div>
            <div className="text-gray-600">Doanh thu</div>
          </Card>
        </div>
      </div>

      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        {/* Filters */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm theo mã GD, mã đơn hàng, loại giao dịch..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 350 }}
              allowClear
            />

            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="Success">Thành công</Select.Option>
              <Select.Option value="Pending">Đang xử lý</Select.Option>
              <Select.Option value="Failed">Thất bại</Select.Option>
            </Select>
          </div>

          <Button
            icon={<ImStatsBars />}
            className="!bg-[#FF914D] !text-white !border-0 hover:!bg-[#e8823d]"
          >
            Xuất báo cáo
          </Button>
        </div>

        <Table
          dataSource={filteredData}
          columns={columns}
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
          scroll={{ x: 1200 }}
          size="middle"
        />
      </ConfigProvider>

      {/* Transaction Detail Modal */}
      <Modal
        open={isModalTransactionDetailOpen}
        onCancel={() => {
          setIsModalTransactionDetailOpen(false);
          setSelectedTransaction(null);
        }}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <FaMoneyBillWave />
            Chi Tiết Giao Dịch
          </p>
        }
        footer={null}
        width={800}
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
          <div className="space-y-4">
            <Card title="Thông tin giao dịch" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <strong>Mã giao dịch:</strong>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                    {selectedTransaction.id}
                  </div>
                </div>
                <div>
                  <strong>Mã đơn hàng:</strong>
                  <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                    {selectedTransaction.orderCode || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Phương thức thanh toán:</strong>
                  <div className="mt-1">
                    <Tag color="blue">
                      {selectedTransaction.paymentMethod || "N/A"}
                    </Tag>
                  </div>
                </div>
                <div>
                  <strong>Loại giao dịch:</strong>
                  <div className="mt-1">
                    <Tag color={getTransactionTypeColor(selectedTransaction.transactionType)}>
                      {getTransactionTypeText(selectedTransaction.transactionType)}
                    </Tag>
                  </div>
                </div>
                <div>
                  <strong>Trạng thái:</strong>
                  <div className="mt-1">
                    <Tag color={getStatusColor(selectedTransaction.status)}>
                      {getStatusText(selectedTransaction.status)}
                    </Tag>
                  </div>
                </div>
                <div>
                  <strong>Số tiền:</strong>
                  <div className="text-lg font-bold text-[#ED2A46] mt-1">
                    {selectedTransaction.amount?.toLocaleString("vi", {
                      style: "currency",
                      currency: "VND",
                    }) || "0 VNĐ"}
                  </div>
                </div>
                {selectedTransaction.profitAmount !== null && selectedTransaction.profitAmount !== undefined && (
                  <div>
                    <strong>Lợi nhuận:</strong>
                    <div className="text-lg font-bold text-green-600 mt-1">
                      {selectedTransaction.profitAmount?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      }) || "0 VNĐ"}
                    </div>
                  </div>
                )}
                <div>
                  <strong>Ngày tạo:</strong>
                  <div className="mt-1">
                    {selectedTransaction.createdAt
                      ? new Date(selectedTransaction.createdAt).toLocaleString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </div>
                </div>
                {selectedTransaction.description && (
                  <div className="col-span-2">
                    <strong>Mô tả:</strong>
                    <div className="bg-gray-50 p-3 rounded mt-1 text-gray-700">
                      {selectedTransaction.description}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {selectedTransaction.withdrawalRequest && (
              <Card title="Thông tin yêu cầu rút tiền" size="small" className="border-orange-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Mã yêu cầu:</strong>
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                      {selectedTransaction.withdrawalRequest.id || "N/A"}
                    </div>
                  </div>
                  <div>
                    <strong>Trạng thái yêu cầu:</strong>
                    <div className="mt-1">
                      <Tag color={getStatusColor(selectedTransaction.withdrawalRequest.status)}>
                        {getStatusText(selectedTransaction.withdrawalRequest.status)}
                      </Tag>
                    </div>
                  </div>
                  {selectedTransaction.withdrawalRequest.bankName && (
                    <>
                      <div>
                        <strong>Ngân hàng:</strong>
                        <div className="mt-1">{selectedTransaction.withdrawalRequest.bankName}</div>
                      </div>
                      <div>
                        <strong>Số tài khoản:</strong>
                        <div className="font-mono mt-1">{selectedTransaction.withdrawalRequest.accountNumber || "N/A"}</div>
                      </div>
                      <div className="col-span-2">
                        <strong>Tên tài khoản:</strong>
                        <div className="mt-1">{selectedTransaction.withdrawalRequest.accountName || "N/A"}</div>
                      </div>
                    </>
                  )}
                  {selectedTransaction.withdrawalRequest.reason && (
                    <div className="col-span-2">
                      <strong>Lý do:</strong>
                      <div className="bg-gray-50 p-3 rounded mt-1 text-gray-700">
                        {selectedTransaction.withdrawalRequest.reason}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {selectedTransaction.status?.toUpperCase() === "PENDING" && (
              <div className="flex justify-center gap-4 pt-4">
                <Button
                  type="primary"
                  className="bg-green-500 hover:bg-green-600 border-0"
                  onClick={() => {
                    handleUpdateTransactionStatus(
                      selectedTransaction.id,
                      "Success"
                    );
                    setIsModalTransactionDetailOpen(false);
                  }}
                >
                  Xác nhận giao dịch
                </Button>
                <Button
                  danger
                  onClick={() => {
                    handleUpdateTransactionStatus(
                      selectedTransaction.id,
                      "Failed"
                    );
                    setIsModalTransactionDetailOpen(false);
                  }}
                >
                  Hủy giao dịch
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu
          </div>
        )}
      </Modal>
    </div>
  );
}
