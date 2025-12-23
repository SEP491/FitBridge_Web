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
  Avatar,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FaUsers, FaFilter } from "react-icons/fa";
import { ImStatsBars } from "react-icons/im";
import { MdFitnessCenter } from "react-icons/md";
import gymService from "../../../services/gymServices";
import FitBridgeModal from "../../../components/FitBridgeModal";

export default function ManageGymCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalCustomerDetailOpen, setIsModalCustomerDetailOpen] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchCustomers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await gymService.getCustomersOfGym({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage, totalPages } = response.data;
      setCustomers(items);
      console.log("Customers:", items);
      setPagination({
        current: currentPage,
        pageSize,
        total,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Lỗi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleTableChange = (pagination) => {
    fetchCustomers(pagination.current, pagination.pageSize);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "Expired":
        return "red";
      case "Pending":
        return "orange";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Active":
        return "Đang hoạt động";
      case "Expired":
        return "Hết hạn";
      case "Pending":
        return "Chờ xử lý";
      default:
        return status;
    }
  };

  const getGenderText = (gender) => {
    return gender === "Male" ? "Nam" : gender === "Female" ? "Nữ" : "Khác";
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "avatarUrl",
      key: "avatarUrl",
      align: "center",
      width: 80,
      render: (avatarUrl, record) => (
        <Avatar
          size={50}
          src={avatarUrl}
          icon={!avatarUrl && <UserOutlined />}
          alt={record.fullName}
        />
      ),
    },
    {
      title: "Họ và Tên",
      dataIndex: "fullName",
      key: "fullName",
      align: "center",
      render: (name) => <span className="font-medium">{name || "N/A"}</span>,
    },
    {
      title: "Số Điện Thoại",
      dataIndex: "phone",
      key: "phone",
      align: "center",
    },
    {
      title: "Giới Tính",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      render: (gender) => getGenderText(gender),
    },
    {
      title: "Gói Tập",
      dataIndex: "packageName",
      key: "packageName",
      align: "center",
      render: (packageName) => (
        <span className="text-blue-600 font-medium">
          {packageName || "N/A"}
        </span>
      ),
    },
    {
      title: "Huấn Luyện Viên",
      dataIndex: "ptName",
      key: "ptName",
      align: "center",
      render: (ptName) => ptName || "Không có",
    },
    {
      title: "Buổi Còn Lại",
      dataIndex: "ptGymAvailableSession",
      key: "ptGymAvailableSession",
      align: "center",
      render: (sessions) => (
        <span
          className={`font-bold ${
            sessions <= 2 ? "text-red-600" : "text-green-600"
          }`}
        >
          {sessions}
        </span>
      ),
    },
    {
      title: "Ngày Hết Hạn",
      dataIndex: "expirationDate",
      key: "expirationDate",
      align: "center",
      render: (date) => {
        const expirationDate = new Date(date);
        const today = new Date();
        const isExpiringSoon =
          (expirationDate - today) / (1000 * 60 * 60 * 24) <= 7;

        return (
          <span className={isExpiringSoon ? "text-red-600 font-medium" : ""}>
            {date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"}
          </span>
        );
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Ngày Tham Gia",
      dataIndex: "joinedAt",
      key: "joinedAt",
      align: "center",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
  ];

  const filteredData = customers.filter((item) => {
    const matchesSearch = searchText
      ? (item.fullName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.phone?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (item.packageName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.ptName?.toLowerCase() || "").includes(searchText.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesGender =
      genderFilter === "all" || item.gender === genderFilter;

    return matchesSearch && matchesStatus && matchesGender;
  });

  // Calculate statistics
  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "Active").length,
    expired: customers.filter((c) => c.status === "Expired").length,
    male: customers.filter((c) => c.gender === "Male").length,
    female: customers.filter((c) => c.gender === "Female").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
          }
          tip="Đang tải khách hàng..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-4">
          <FaUsers />
          Quản Lý Khách Hàng
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-gray-600">Tổng khách hàng</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <div className="text-gray-600">Đang hoạt động</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.expired}
            </div>
            <div className="text-gray-600">Hết hạn</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#4169E1]">
              {stats.male}
            </div>
            <div className="text-gray-600">Nam</div>
          </Card>
          <Card className="text-center">
            <div className="text-2xl font-bold text-[#FF69B4]">
              {stats.female}
            </div>
            <div className="text-gray-600">Nữ</div>
          </Card>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <ConfigProvider
          theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
        >
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Input
                placeholder="Tìm kiếm theo tên, SĐT, gói tập, PT..."
                prefix={<SearchOutlined />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 320 }}
                allowClear
                size="middle"
              />

              <Select
                placeholder="Lọc theo trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 180 }}
                size="middle"
              >
                <Select.Option value="all">Tất cả</Select.Option>
                <Select.Option value="Active">Đang hoạt động</Select.Option>
                <Select.Option value="Expired">Hết hạn</Select.Option>
                <Select.Option value="Pending">Chờ xử lý</Select.Option>
              </Select>

              <Select
                placeholder="Lọc theo giới tính"
                value={genderFilter}
                onChange={setGenderFilter}
                style={{ width: 150 }}
                size="middle"
              >
                <Select.Option value="all">Tất cả</Select.Option>
                <Select.Option value="Male">Nam</Select.Option>
                <Select.Option value="Female">Nữ</Select.Option>
              </Select>
            </div>

            <Button
              icon={<ImStatsBars />}
              className="bg-[#FF914D] text-white border-0 hover:bg-[#e8823d]"
              size="middle"
            >
              Xuất báo cáo
            </Button>
          </div>

          <Table
            dataSource={filteredData}
            columns={columns}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              position: ["bottomCenter"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} khách hàng`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            size="middle"
            onRow={(record) => ({
              onClick: () => {
                setSelectedCustomer(record);
                setIsModalCustomerDetailOpen(true);
              },
              style: { cursor: "pointer" },
            })}
          />
        </ConfigProvider>
      </Card>

      {/* Customer Detail Modal */}
      <FitBridgeModal
        open={isModalCustomerDetailOpen}
        onCancel={() => setIsModalCustomerDetailOpen(false)}
        title="Chi Tiết Khách Hàng"
        titleIcon={<UserOutlined />}
        width={900}
        logoSize="medium"
        bodyStyle={{ padding: 0, maxHeight: "75vh", overflowY: "auto" }}
      >
        {selectedCustomer ? (
          <div className="flex flex-col">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-[#FFF9FA] to-[#FFF5F0] p-6 border-b-2 border-gray-100">
              <div className="flex items-center gap-4">
                <Avatar
                  size={80}
                  src={selectedCustomer.avatarUrl}
                  icon={!selectedCustomer.avatarUrl && <UserOutlined />}
                  className="border-2 border-white shadow-md"
                />
                <div>
                  <div className="text-sm text-gray-500">Họ và tên</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {selectedCustomer.fullName || "Chưa có thông tin"}
                  </div>
                  <div className="mt-2">
                    <Tag color={getStatusColor(selectedCustomer.status)}>
                      {getStatusText(selectedCustomer.status)}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 flex flex-col gap-5 space-y-6">
              {/* Personal Info */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title="Thông tin cá nhân"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Số điện thoại</div>
                    <div className="font-medium">
                      {selectedCustomer.phone || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Giới tính</div>
                    <div className="font-medium">
                      {getGenderText(selectedCustomer.gender)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ngày sinh</div>
                    <div className="font-medium">
                      {selectedCustomer.dob
                        ? new Date(selectedCustomer.dob).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ngày tham gia</div>
                    <div className="font-medium">
                      {selectedCustomer.joinedAt
                        ? new Date(
                            selectedCustomer.joinedAt
                          ).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Package Info */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title="Thông tin gói tập"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Tên gói</div>
                    <div className="font-medium text-blue-600">
                      {selectedCustomer.packageName || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Huấn luyện viên</div>
                    <div className="font-medium">
                      {selectedCustomer.ptName || "Không có"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ngày hết hạn</div>
                    <div className="font-medium text-red-600">
                      {selectedCustomer.expirationDate
                        ? new Date(
                            selectedCustomer.expirationDate
                          ).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Số buổi còn lại</div>
                    <div
                      className={`font-bold text-lg ${
                        selectedCustomer.ptGymAvailableSession <= 2
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {selectedCustomer.ptGymAvailableSession} buổi
                    </div>
                  </div>
                </div>
              </Card>

              {/* Transaction Info */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title="Thông tin giao dịch"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">
                      Mã giao dịch gần nhất
                    </div>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                      {selectedCustomer.latestCustomerPurchasedId || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Trạng thái gói</div>
                    <div className="mt-1">
                      <Tag color={getStatusColor(selectedCustomer.status)}>
                        {getStatusText(selectedCustomer.status)}
                      </Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
        )}
      </FitBridgeModal>
    </div>
  );
}
