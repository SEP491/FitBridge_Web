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
  Avatar,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FaEye, FaUsers, FaFilter } from "react-icons/fa";
import { ImStatsBars } from "react-icons/im";
import { MdFitnessCenter } from "react-icons/md";
import gymService from "../../../services/gymServices";

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
    {
      title: "Hành Động",
      key: "action",
      align: "center",
      width: 100,
      render: (text, record) => (
        <Tooltip title="Xem chi tiết">
          <FaEye
            onClick={() => {
              setSelectedCustomer(record);
              setIsModalCustomerDetailOpen(true);
            }}
            size={20}
            className="cursor-pointer text-blue-500 hover:text-blue-700"
          />
        </Tooltip>
      ),
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
    <div className="p-6">
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

      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        {/* Filters */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm theo tên, SĐT, gói tập, PT..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 320 }}
              allowClear
            />

            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
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
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="Male">Nam</Select.Option>
              <Select.Option value="Female">Nữ</Select.Option>
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
          scroll={{ x: 1400 }}
          size="middle"
        />
      </ConfigProvider>

      {/* Customer Detail Modal */}
      <Modal
        open={isModalCustomerDetailOpen}
        onCancel={() => setIsModalCustomerDetailOpen(false)}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <UserOutlined />
            Chi Tiết Khách Hàng
          </p>
        }
        footer={null}
        width={800}
      >
        {selectedCustomer && (
          <div className="space-y-4">
            <Card title="Thông tin cá nhân" size="small">
              <div className="flex items-center gap-6 mb-4">
                <Avatar
                  size={100}
                  src={selectedCustomer.avatarUrl}
                  icon={!selectedCustomer.avatarUrl && <UserOutlined />}
                />
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedCustomer.fullName}
                  </h3>
                  <Tag color={getStatusColor(selectedCustomer.status)}>
                    {getStatusText(selectedCustomer.status)}
                  </Tag>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Số điện thoại:</strong>
                  <div className="mt-1">{selectedCustomer.phone || "N/A"}</div>
                </div>
                <div>
                  <strong>Giới tính:</strong>
                  <div className="mt-1">
                    {getGenderText(selectedCustomer.gender)}
                  </div>
                </div>
                <div>
                  <strong>Ngày sinh:</strong>
                  <div className="mt-1">
                    {selectedCustomer.dob
                      ? new Date(selectedCustomer.dob).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Ngày tham gia:</strong>
                  <div className="mt-1">
                    {selectedCustomer.joinedAt
                      ? new Date(selectedCustomer.joinedAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Thông tin gói tập" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Tên gói:</strong>
                  <div className="mt-1 text-blue-600 font-medium">
                    {selectedCustomer.packageName || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Huấn luyện viên:</strong>
                  <div className="mt-1">
                    {selectedCustomer.ptName || "Không có"}
                  </div>
                </div>
                <div>
                  <strong>Ngày hết hạn:</strong>
                  <div className="mt-1 text-red-600 font-medium">
                    {selectedCustomer.expirationDate
                      ? new Date(
                          selectedCustomer.expirationDate
                        ).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Số buổi còn lại:</strong>
                  <div
                    className={`mt-1 font-bold text-lg ${
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

            <Card title="Thông tin giao dịch" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Mã giao dịch gần nhất:</strong>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    {selectedCustomer.latestCustomerPurchasedId || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Trạng thái gói:</strong>
                  <div className="mt-1">
                    <Tag color={getStatusColor(selectedCustomer.status)}>
                      {getStatusText(selectedCustomer.status)}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
