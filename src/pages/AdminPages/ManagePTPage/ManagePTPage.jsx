import {
  ConfigProvider,
  Input,
  Spin,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Button,
  Select,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Progress,
  Descriptions,
} from "antd";
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  HomeOutlined,
  TrophyOutlined,
  PlusOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ManOutlined,
  WomanOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { FaUserCircle, FaInfoCircle, FaDumbbell } from "react-icons/fa";
import FitBridgeModal from "../../../components/FitBridgeModal";
import defaultAvatar from "../../../assets/LogoColor.png";

const { Option } = Select;

export default function ManagePTPage() {
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ptType, setPtType] = useState("gym"); // "gym" or "freelance"
  const [selectedPT, setSelectedPT] = useState(null);
  const [isModalPTDetailOpen, setIsModalPTDetailOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [statistics, setStatistics] = useState({
    totalPTs: 0,
    activePTs: 0,
    inactivePTs: 0,
    totalExperience: 0,
  });

  const fetchGymPTs = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllGymPTs({ page, size: pageSize });
      const { items, total, page: currentPage, totalPages } = response.data;
      setPts(items || []);

      // Update statistics based on fetched data
      const activePTs = items?.filter((pt) => pt.isActive === true).length || 0;
      const inactivePTs = items?.filter((pt) => pt.isActive === false).length || 0;
      const totalExperience = items?.reduce((sum, pt) => sum + (pt.experience || 0), 0) || 0;

      setStatistics({
        totalPTs: total || 0,
        activePTs,
        inactivePTs,
        totalExperience,
      });

      setPagination({
        current: currentPage,
        pageSize,
        total: total || 0,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching Gym PTs:", error);
      toast.error("Lỗi tải danh sách Gym PT");
      setPts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFreelancePTs = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllFreelancePTs({ page, size: pageSize });
      const { items, total, page: currentPage, totalPages } = response.data;
      
      // Normalize Freelance PT data to match Gym PT structure
      const normalizedItems = items?.map(pt => ({
        ...pt,
        experience: pt.experienceYears || pt.experience || 0,
        isActive: true, // Freelance PTs are considered active if they're in the system
      })) || [];
      
      setPts(normalizedItems);

      // Update statistics based on fetched data
      const activePTs = normalizedItems?.filter((pt) => pt.isActive === true).length || 0;
      const inactivePTs = normalizedItems?.filter((pt) => pt.isActive === false).length || 0;
      const totalExperience = normalizedItems?.reduce((sum, pt) => sum + (pt.experience || 0), 0) || 0;

      setStatistics({
        totalPTs: total || 0,
        activePTs,
        inactivePTs,
        totalExperience,
      });

      setPagination({
        current: currentPage,
        pageSize,
        total: total || 0,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching Freelance PTs:", error);
      toast.error("Lỗi tải danh sách Freelance PT");
      setPts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPTs = (page = 1, pageSize = 10) => {
    if (ptType === "gym") {
      fetchGymPTs(page, pageSize);
    } else {
      fetchFreelancePTs(page, pageSize);
    }
  };

  useEffect(() => {
    fetchPTs();
    // eslint-disable-next-line
  }, [ptType]);

  const handleTableChange = (newPagination) => {
    fetchPTs(newPagination.current, newPagination.pageSize);
  };

  const getStatusColor = (status) => {
    if (status === "active" || status === true) return "success";
    return "default";
  };

  const columns = [
    {
      title: "Personal Trainer",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 250,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={record.avatarUrl || defaultAvatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#FF914D" }}
          />
          <div>
            <div className="font-medium text-gray-900">{text || "N/A"}</div>
            {record.email && (
              <div className="text-sm text-gray-500">{record.email}</div>
            )}
            {ptType === "freelance" && record.rating !== undefined && (
              <div className="text-xs text-yellow-600 flex items-center gap-1">
                ⭐ {record.rating.toFixed(1)} • {record.totalPurchased || 0} lượt mua
              </div>
            )}
          </div>
        </div>
      ),
    },
    ...(ptType === "gym" ? [{
      title: "Giới Tính",
      dataIndex: "isMale",
      key: "isMale",
      align: "center",
      width: 100,
      render: (isMale) => (
        <Tag color={isMale ? "blue" : "pink"} icon={isMale ? <ManOutlined /> : <WomanOutlined />}>
          {isMale ? "Nam" : "Nữ"}
        </Tag>
      ),
    },
    {
      title: "Liên Hệ",
      dataIndex: "phone",
      key: "phone",
      align: "center",
      width: 120,
      render: (text) => (
        <span className="text-gray-700">{text || "Chưa cập nhật"}</span>
      ),
    },
    {
      title: "Ngày Sinh",
      dataIndex: "dob",
      key: "dob",
      align: "center",
      width: 120,
      render: (date) => (
        <div className="flex flex-col items-center">
          <span>{date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"}</span>
          <span className="text-xs text-gray-500">
            {date ? `${new Date().getFullYear() - new Date(date).getFullYear()} tuổi` : ""}
          </span>
        </div>
      ),
    }] : []),
    ...(ptType === "freelance" ? [{
      title: "Giá Từ",
      dataIndex: "priceFrom",
      key: "priceFrom",
      align: "center",
      width: 130,
      sorter: (a, b) => (a.priceFrom || 0) - (b.priceFrom || 0),
      render: (price) => (
        <div className="flex flex-col items-center">
          <span className="text-green-600 font-bold">
            {price ? `${price.toLocaleString('vi-VN')}đ` : "N/A"}
          </span>
          <span className="text-xs text-gray-500">/ buổi</span>
        </div>
      ),
    },
    {
      title: "Đánh Giá",
      dataIndex: "rating",
      key: "rating",
      align: "center",
      width: 100,
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
      render: (rating) => (
        <div className="flex flex-col items-center">
          <span className="text-yellow-500 text-lg">⭐</span>
          <span className="text-sm font-bold">{rating?.toFixed(1) || "0.0"}</span>
        </div>
      ),
    },
    {
      title: "Lượt Mua",
      dataIndex: "totalPurchased",
      key: "totalPurchased",
      align: "center",
      width: 100,
      sorter: (a, b) => (a.totalPurchased || 0) - (b.totalPurchased || 0),
      render: (total) => (
        <div className="flex flex-col items-center">
          <span className="text-blue-600 font-bold text-lg">{total || 0}</span>
          <span className="text-xs text-gray-500">gói</span>
        </div>
      ),
    }] : []),
    {
      title: "Kinh Nghiệm",
      dataIndex: "experience",
      key: "experience",
      align: "center",
      width: 100,
      sorter: (a, b) => (a.experience || 0) - (b.experience || 0),
      render: (experience) => (
        <div className="flex flex-col items-center">
          <TrophyOutlined style={{ fontSize: "16px", color: "#FFD700" }} />
          <span className="text-sm font-bold text-orange-600">{experience || 0}</span>
          <span className="text-xs text-gray-500">năm</span>
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      width: 120,
      render: (isActive) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
          color={isActive ? "success" : "default"}
          className="px-3 py-1"
        >
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
  ];

  const filteredData = pts.filter((item) => {
    const matchesSearch = searchText
      ? (item.fullName?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (item.email?.toLowerCase() || "").includes(searchText.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.isActive === true) ||
      (statusFilter === "inactive" && item.isActive === false);

    return matchesSearch && matchesStatus;
  });

  if (loading && pts.length === 0) {
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
    <div className="p-6">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#ED2A46] mb-2">
            Quản Lý Personal Trainer
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi thông tin các huấn luyện viên cá nhân
          </p>
        </div>

        {/* PT Type Selection Header */}
        <Card className=" border-0 shadow-lg" style={{marginBottom:15}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TeamOutlined style={{ fontSize: "20px", color: "#FF914D" }} />
              <h3 className="text-lg font-semibold text-gray-800 m-0">Chọn Loại Personal Trainer</h3>
            </div>
          </div>
          
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div
                className={`relative border-3 rounded-lg cursor-pointer transition-all duration-300 overflow-hidden ${
                  ptType === "gym"
                    ? "border-[#FF914D] shadow-xl scale-[1.02]"
                    : "border-gray-200 shadow-md hover:border-[#FF914D] hover:shadow-lg"
                }`}
                onClick={() => setPtType("gym")}
              >
                {/* Selected Badge */}
                {ptType === "gym" && (
                  <div className="absolute top-0 right-0 bg-[#FF914D] text-white px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                    <CheckCircleOutlined />
                    <span className="text-xs font-semibold">Đang chọn</span>
                  </div>
                )}
                
                <div className={`p-5 ${ptType === "gym" ? "bg-gradient-to-br from-[#FFF9FA] via-[#FFF5F0] to-[#FFE5E9]" : "bg-white"}`}>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        ptType === "gym" 
                          ? "bg-[#FF914D] shadow-lg transform rotate-3" 
                          : "bg-gray-100"
                      }`}
                    >
                      <HomeOutlined
                        style={{
                          fontSize: "32px",
                          color: ptType === "gym" ? "white" : "#999",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-2xl font-bold mb-1 transition-colors ${
                          ptType === "gym" ? "text-[#ED2A46]" : "text-gray-600"
                        }`}
                      >
                        Gym PT
                      </h3>
                      <p className={`text-sm ${ptType === "gym" ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                        Huấn luyện viên phòng gym
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col xs={24} sm={12}>
              <div
                className={`relative border-3 rounded-lg cursor-pointer transition-all duration-300 overflow-hidden ${
                  ptType === "freelance"
                    ? "border-[#FF914D] shadow-xl scale-[1.02]"
                    : "border-gray-200 shadow-md hover:border-[#FF914D] hover:shadow-lg"
                }`}
                onClick={() => setPtType("freelance")}
              >
                {/* Selected Badge */}
                {ptType === "freelance" && (
                  <div className="absolute top-0 right-0 bg-[#FF914D] text-white px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                    <CheckCircleOutlined />
                    <span className="text-xs font-semibold">Đang chọn</span>
                  </div>
                )}
                
                <div className={`p-5 ${ptType === "freelance" ? "bg-gradient-to-br from-[#FFF9FA] via-[#FFF5F0] to-[#FFE5E9]" : "bg-white"}`}>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        ptType === "freelance" 
                          ? "bg-[#FF914D] shadow-lg transform rotate-3" 
                          : "bg-gray-100"
                      }`}
                    >
                      <UserOutlined
                        style={{
                          fontSize: "32px",
                          color: ptType === "freelance" ? "white" : "#999",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-2xl font-bold mb-1 transition-colors ${
                          ptType === "freelance" ? "text-[#ED2A46]" : "text-gray-600"
                        }`}
                      >
                        Freelance PT
                      </h3>
                      <p className={`text-sm ${ptType === "freelance" ? "text-gray-700 font-medium" : "text-gray-500"}`}>
                        Huấn luyện viên tự do
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng số PT"
                value={statistics.totalPTs}
                prefix={<UserOutlined style={{ color: "#FF914D" }} />}
                valueStyle={{
                  color: "#FF914D",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="PT Đang Hoạt Động"
                value={statistics.activePTs}
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
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="PT Không Hoạt Động"
                value={statistics.inactivePTs}
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
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Kinh Nghiệm"
                value={statistics.totalExperience}
                prefix={<TrophyOutlined style={{ color: "#1890ff" }} />}
                suffix="năm"
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card className="border-0 shadow-lg">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Tìm kiếm theo tên PT..."
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
                className="rounded-lg"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
                className="rounded-lg"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
                <Option value="busy">Bận</Option>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-orange-600">
                {filteredData.length}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{statistics.totalPTs}</span> PT
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
              {statusFilter !== "all" && (
                <span>
                  {" "}
                  | Lọc:{" "}
                  <Tag color={getStatusColor(statusFilter)} className="ml-1">
                    {statusFilter}
                  </Tag>
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
                  `${range[0]}-${range[1]} của ${total} PT`,
              }}
              onChange={handleTableChange}
              className="rounded-lg overflow-hidden"
              scroll={{ x: 1200 }}
              size="middle"
              rowKey="id"
              onRow={(record) => ({
                onClick: () => {
                  setSelectedPT(record);
                  setIsModalPTDetailOpen(true);
                },
                style: { cursor: "pointer" },
              })}
            />
          </ConfigProvider>
        </Card>
      </div>

      {/* PT Detail Modal - Enhanced UI */}
      <FitBridgeModal
        open={isModalPTDetailOpen}
        onCancel={() => setIsModalPTDetailOpen(false)}
        title="Chi Tiết Personal Trainer"
        titleIcon={<EyeOutlined />}
        width={900}
        logoSize="medium"
        bodyStyle={{ padding: "0", maxHeight: "75vh", overflowY: "auto" }}
      >
        {selectedPT && (
          <div className="flex flex-col">
            {/* Header Section with Key Info */}
            <div className="bg-gradient-to-r from-[#FFF9FA] to-[#FFF5F0] p-6 border-b-2 border-gray-100">
              <div className="flex items-center gap-6">
                <img
                  src={selectedPT.avatarUrl || defaultAvatar}
                  alt={selectedPT.fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-[#ED2A46] mb-2">
                    {selectedPT.fullName || "N/A"}
                  </h2>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Tag
                      color={selectedPT.isMale ? "blue" : "pink"}
                      icon={selectedPT.isMale ? <ManOutlined /> : <WomanOutlined />}
                      className="text-sm px-3 py-1"
                    >
                      {selectedPT.isMale ? "Nam" : "Nữ"}
                    </Tag>
                    <Tag
                      icon={selectedPT.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                      color={selectedPT.isActive ? "success" : "default"}
                      className="text-sm px-3 py-1"
                    >
                      {selectedPT.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                    <Tag color="orange" className="text-sm px-3 py-1">
                      <TrophyOutlined /> {selectedPT.experience || 0} năm kinh nghiệm
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 flex-col gap-5 flex space-y-6">
              {/* Personal Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaUserCircle />
                    Thông Tin Cá Nhân
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label={<span><IdcardOutlined /> ID</span>} span={2}>
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded inline-block">
                      {selectedPT.id}
                    </div>
                  </Descriptions.Item>
                <Descriptions.Item label="Trạng Thái">
                    <Tag
                      icon={selectedPT.isActive ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                      color={selectedPT.isActive ? "success" : "default"}
                      className="px-3 py-1"
                    >
                      {selectedPT.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={<span><UserOutlined /> Họ Tên</span>}>
                    <div className="font-semibold p-2 text-gray-800">
                      {selectedPT.fullName || "N/A"}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item span={2} label={<span><MailOutlined /> Email</span>}>
                    <span className="text-blue-600">{selectedPT.email || "N/A"}</span>
                  </Descriptions.Item>

                  <Descriptions.Item label={<span><PhoneOutlined /> Số Điện Thoại</span>}>
                    <span className="font-semibold">{selectedPT.phone || "Chưa cập nhật"}</span>
                  </Descriptions.Item>

                  <Descriptions.Item label={<span><CalendarOutlined /> Ngày Sinh</span>}>
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {selectedPT.dob
                          ? new Date(selectedPT.dob).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </span>
                      {selectedPT.dob && (
                        <span className="text-xs text-gray-500">
                          {new Date().getFullYear() - new Date(selectedPT.dob).getFullYear()} tuổi
                        </span>
                      )}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giới Tính">
                    <Tag
                      color={selectedPT.isMale ? "blue" : "pink"}
                      icon={selectedPT.isMale ? <ManOutlined /> : <WomanOutlined />}
                    >
                      {selectedPT.isMale ? "Nam" : "Nữ"}
                    </Tag>
                  </Descriptions.Item>
                  
                </Descriptions>
              </Card>

              {/* Professional Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaDumbbell />
                    Thông Tin Nghề Nghiệp
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label={<span><TrophyOutlined /> Kinh Nghiệm</span>}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-orange-600">
                        {selectedPT.experience || 0}
                      </span>
                      <span className="text-gray-600">năm</span>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label={<span><HomeOutlined /> Loại PT</span>}>
                    <Tag color={ptType === "gym" ? "blue" : "purple"} className="px-3 py-1">
                      {ptType === "gym" ? "Gym PT" : "Freelance PT"}
                    </Tag>
                  </Descriptions.Item>

                  {ptType === "gym" && selectedPT.gymOwnerId && (
                    <Descriptions.Item label="Gym Owner ID">
                      <div className="font-mono text-xs bg-blue-50 p-2 rounded inline-block">
                        {selectedPT.gymOwnerId}
                      </div>
                    </Descriptions.Item>
                  )}

                  {ptType === "freelance" && (
                    <>
                      <Descriptions.Item label="Giá Từ">
                        <span className="text-green-600 font-bold text-lg">
                          {selectedPT.priceFrom?.toLocaleString('vi-VN')}đ
                        </span>
                        <span className="text-gray-500 text-sm ml-2">/ buổi</span>
                      </Descriptions.Item>

                      <Descriptions.Item label="Đánh Giá">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">⭐</span>
                          <span className="text-xl font-bold text-yellow-600">
                            {selectedPT.rating?.toFixed(1) || "0.0"}
                          </span>
                          <span className="text-gray-500">/ 5.0</span>
                        </div>
                      </Descriptions.Item>

                      <Descriptions.Item label="Tổng Lượt Mua">
                        <span className="text-blue-600 font-bold text-xl">
                          {selectedPT.totalPurchased || 0}
                        </span>
                        <span className="text-gray-500 ml-2">gói đã bán</span>
                      </Descriptions.Item>

                      {selectedPT.goalTrainings && selectedPT.goalTrainings.length > 0 && (
                        <Descriptions.Item label="Mục Tiêu Huấn Luyện">
                          <div className="flex flex-wrap gap-2">
                            {selectedPT.goalTrainings.map((goal, index) => (
                              <Tag key={index} color="blue" className="px-2 py-1">
                                {goal}
                              </Tag>
                            ))}
                          </div>
                        </Descriptions.Item>
                      )}

                      {selectedPT.certifications && selectedPT.certifications.length > 0 && (
                        <Descriptions.Item label="Chứng Chỉ">
                          <div className="flex flex-wrap gap-2">
                            {selectedPT.certifications.map((cert, index) => (
                              <Tag key={index} color="green" icon={<CheckCircleOutlined />}>
                                Chứng chỉ {index + 1}
                              </Tag>
                            ))}
                          </div>
                        </Descriptions.Item>
                      )}

                      {selectedPT.description && (
                        <Descriptions.Item label="Mô Tả" span={2}>
                          <div className="text-gray-700 bg-gray-50 p-3 rounded">
                            {selectedPT.description}
                          </div>
                        </Descriptions.Item>
                      )}
                    </>
                  )}
                </Descriptions>
              </Card>

              {/* Additional Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaInfoCircle />
                    Thông Tin Bổ Sung
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={ptType === "freelance" ? 6 : 8}>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-[#FF914D] mb-2">
                          {selectedPT.experience || 0}
                        </div>
                        <div className="text-sm text-gray-600">Năm Kinh Nghiệm</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={ptType === "freelance" ? 6 : 8}>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {selectedPT.isActive ? "✓" : "✗"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedPT.isActive ? "Đang Hoạt Động" : "Ngừng Hoạt Động"}
                        </div>
                      </div>
                    </Col>
                    {ptType === "gym" && (
                      <Col xs={24} sm={8}>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl mb-2">
                            {selectedPT.isMale ? "👨" : "👩"}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedPT.isMale ? "Nam Giới" : "Nữ Giới"}
                          </div>
                        </div>
                      </Col>
                    )}
                    {ptType === "freelance" && (
                      <>
                        <Col xs={24} sm={6}>
                          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-yellow-500 mb-2">
                              ⭐ {selectedPT.rating?.toFixed(1) || "0.0"}
                            </div>
                            <div className="text-sm text-gray-600">Đánh Giá</div>
                          </div>
                        </Col>
                        <Col xs={24} sm={6}>
                          <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                              {selectedPT.totalPurchased || 0}
                            </div>
                            <div className="text-sm text-gray-600">Lượt Mua</div>
                          </div>
                        </Col>
                      </>
                    )}
                  </Row>
                </div>
              </Card>
            </div>
          </div>
        )}
      </FitBridgeModal>
    </div>
  );
}
