import {
  Card,
  Input,
  Spin,
  Avatar,
  Tag,
  Row,
  Col,
  Tabs,
  Table,
  Space,
  ConfigProvider,
  DatePicker,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  UserOutlined,
  TrophyOutlined,
  ManOutlined,
  WomanOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import gymService from "../../../services/gymServices";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/features/userSlice";
import defaultAvatar from "../../../assets/LogoColor.png";
import dayjs from "dayjs";

export default function ManagePTSchedule() {
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedPT, setSelectedPT] = useState(null);
  const [registeredSlots, setRegisteredSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState("registered");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [bookingPagination, setBookingPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const user = useSelector(selectUser);

  const fetchPTGym = useCallback(
    async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const response = await gymService.getPTofGym({
          gymId: user.id,
          page: 1,
          size: 100, // Get all PTs for the list
        });
        const { items } = response.data;
        setPts(items || []);
      } catch (error) {
        console.error("Error fetching PTs:", error);
        toast.error("Lỗi khi tải danh sách PT");
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchPTGym();
  }, [fetchPTGym]);

  const filteredPTs = pts.filter((pt) => {
    const matchesSearch = searchText
      ? (pt.fullName?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (pt.email?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (pt.phone?.toLowerCase() || "").includes(searchText.toLowerCase())
      : true;

    return matchesSearch;
  });

  const getGenderColor = (gender) => {
    switch (gender) {
      case "Male":
        return "blue";
      case "Female":
        return "pink";
      default:
        return "default";
    }
  };

  // Fetch registered slots for selected PT
  const fetchRegisteredSlots = useCallback(
    async (gymPtId, page = 1, pageSize = 10) => {
      if (!gymPtId) return;

      setLoadingSlots(true);
      try {
        const params = {
          gymPtId,
          page,
          size: pageSize,
        };
        
        if (fromDate) {
          params.fromDate = dayjs(fromDate).format("YYYY-MM-DD");
        }
        if (toDate) {
          params.toDate = dayjs(toDate).format("YYYY-MM-DD");
        }

        const response = await gymService.getGymPTRegisterSlots(params);
        const { items, total, page: currentPage } = response.data;
        setRegisteredSlots(items || []);
        setPagination({
          current: currentPage || page,
          pageSize,
          total: total || 0,
        });
      } catch (error) {
        console.error("Error fetching registered slots:", error);
        toast.error("Lỗi khi tải danh sách slot đã đăng ký");
        setRegisteredSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [fromDate, toDate]
  );

  // Fetch bookings for selected PT
  const fetchBookings = useCallback(
    async (gymPtId, page = 1, pageSize = 10) => {
      if (!gymPtId) return;

      setLoadingBookings(true);
      try {
        const params = {
          gymPtId,
          page,
          size: pageSize,
        };
        
        if (fromDate) {
          params.fromDate = dayjs(fromDate).format("YYYY-MM-DD");
        }
        if (toDate) {
          params.toDate = dayjs(toDate).format("YYYY-MM-DD");
        }

        const response = await gymService.getGymPTBookings(params);
        const { items, total, page: currentPage } = response.data;
        setBookings(items || []);
        setBookingPagination({
          current: currentPage || page,
          pageSize,
          total: total || 0,
        });
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Lỗi khi tải danh sách đặt lịch");
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    },
    [fromDate, toDate]
  );

  // Handle PT selection
  const handlePTSelect = (pt) => {
    setSelectedPT(pt);
    setActiveTab("registered");
    fetchRegisteredSlots(pt.id);
    fetchBookings(pt.id);
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (selectedPT) {
      if (key === "registered") {
        fetchRegisteredSlots(selectedPT.id);
      } else if (key === "bookings") {
        fetchBookings(selectedPT.id);
      }
    }
  };

  // Refetch data when dates change
  useEffect(() => {
    if (selectedPT) {
      if (activeTab === "registered") {
        fetchRegisteredSlots(selectedPT.id, 1, pagination.pageSize);
      } else if (activeTab === "bookings") {
        fetchBookings(selectedPT.id, 1, bookingPagination.pageSize);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString.substring(0, 5); // Get HH:mm from HH:mm:ss
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Activated":
        return "success";
      case "Deactivated":
        return "default";
      default:
        return "default";
    }
  };

  // Get session status color
  const getSessionStatusColor = (status) => {
    switch (status) {
      case "Booked":
        return "blue";
      case "Completed":
        return "success";
      case "Cancelled":
        return "red";
      default:
        return "default";
    }
  };

  // Get session status text
  const getSessionStatusText = (status) => {
    switch (status) {
      case "Booked":
        return "Đã Đặt";
      case "Completed":
        return "Hoàn Thành";
      case "Cancelled":
        return "Đã Hủy";
      default:
        return status;
    }
  };

  // Booking columns
  const bookingColumns = [
    {
      title: "Khách Hàng",
      key: "customer",
      align: "left",
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={record.customerAvatarUrl || defaultAvatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#FF914D" }}
          />
          <div>
            <div className="font-medium text-gray-900">
              {record.customerName || "N/A"}
            </div>
            <div className="text-xs text-gray-500 font-mono">
              ID: {record.customerId?.substring(0, 8)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Slot",
      key: "slot",
      align: "left",
      width: 120,
      render: (_, record) => (
        <div className="font-semibold text-gray-900">
          {record.ptGymSlot?.slotName || "N/A"}
        </div>
      ),
    },
    {
      title: "Ngày",
      key: "date",
      align: "center",
      width: 150,
      sorter: (a, b) =>
        dayjs(a.ptGymSlot?.registerDate).unix() -
        dayjs(b.ptGymSlot?.registerDate).unix(),
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <CalendarOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
          <span className="text-sm font-medium mt-1">
            {formatDate(record.ptGymSlot?.registerDate)}
          </span>
        </div>
      ),
    },
    {
      title: "Thời Gian",
      key: "time",
      align: "center",
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <ClockCircleOutlined style={{ fontSize: "16px", color: "#52c41a" }} />
          <div className="text-sm font-medium mt-1">
            {formatTime(record.ptGymSlot?.startTime)} -{" "}
            {formatTime(record.ptGymSlot?.endTime)}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng Thái Slot",
      key: "slotStatus",
      align: "center",
      width: 100,
      render: (_, record) => (
        <Tag
          icon={<CheckCircleOutlined />}
          color={getStatusColor(record.ptGymSlot?.status)}
          className="px-3 py-1"
        >
          {record.ptGymSlot?.status === "Activated"
            ? "Đã Kích Hoạt"
            : record.ptGymSlot?.status}
        </Tag>
      ),
    },
    {
      title: "Trạng Thái Đặt Lịch",
      dataIndex: "sessionStatus",
      key: "sessionStatus",
      align: "center",
      width: 150,
      render: (status) => (
        <Tag
          color={getSessionStatusColor(status)}
          className="px-3 py-1 font-semibold"
        >
          {getSessionStatusText(status)}
        </Tag>
      ),
    },
  ];

  // Registered slots columns
  const registeredSlotsColumns = [
    {
      title: "Tên Slot",
      dataIndex: "slotName",
      key: "slotName",
      align: "left",
      width: 150,
      render: (text) => (
        <div className="font-semibold text-gray-900">{text || "N/A"}</div>
      ),
    },
    {
      title: "Ngày Đăng Ký",
      dataIndex: "registerDate",
      key: "registerDate",
      align: "center",
      width: 150,
      sorter: (a, b) =>
        dayjs(a.registerDate).unix() - dayjs(b.registerDate).unix(),
      render: (date) => (
        <div className="flex flex-col items-center">
          <CalendarOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
          <span className="text-sm font-medium mt-1">
            {formatDate(date)}
          </span>
        </div>
      ),
    },
    {
      title: "Thời Gian",
      key: "time",
      align: "center",
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col items-center">
          <ClockCircleOutlined style={{ fontSize: "16px", color: "#52c41a" }} />
          <div className="text-sm font-medium mt-1">
            {formatTime(record.startTime)} - {formatTime(record.endTime)}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 120,
      render: (status) => (
        <Tag
          icon={<CheckCircleOutlined />}
          color={getStatusColor(status)}
          className="px-3 py-1"
        >
          {status === "Activated" ? "Đã Kích Hoạt" : status}
        </Tag>
      ),
    },
  ];

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
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quản Lý Lịch PT
        </h1>
        <p className="text-gray-600">
          Quản lý và xem lịch làm việc của các huấn luyện viên
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {/* PT List Section */}
        <Col xs={24} lg={6}>
          <Card
            className="border-0 shadow-lg h-full"
            title={
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">
                  Danh Sách PT
                </span>
                <span className="text-sm text-gray-500">
                  {filteredPTs.length} PT
                </span>
              </div>
            }
          >
            {/* Search Bar */}
            <div className="mb-4">
              <Input
                placeholder="Tìm kiếm PT theo tên, email, số điện thoại..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="rounded-lg"
                size="large"
              />
            </div>

            {/* Scrollable PT Cards */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{ fontSize: 24, color: "#FF914D" }}
                        spin
                      />
                    }
                  />
                </div>
              ) : filteredPTs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchText
                    ? "Không tìm thấy PT nào"
                    : "Chưa có PT nào trong hệ thống"}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPTs.map((pt) => (
                    <Card
                      key={pt.id}
                      className={`border transition-all cursor-pointer ${
                        selectedPT?.id === pt.id
                          ? "border-orange-500 shadow-lg bg-orange-50"
                          : "border-gray-200 hover:border-orange-400 hover:shadow-md"
                      }`}
                      size="small"
                      onClick={() => handlePTSelect(pt)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          size={48}
                          src={pt.avatarUrl || defaultAvatar}
                          icon={<UserOutlined />}
                          style={{ backgroundColor: "#FF914D" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {pt.fullName || "Chưa cập nhật"}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MailOutlined className="text-xs" />
                            <span className="truncate">
                              {pt.email || "Chưa có email"}
                            </span>
                          </div>
                          {pt.phone && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <PhoneOutlined className="text-xs" />
                              <span>{pt.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Tag
                              color={getGenderColor(pt.gender)}
                              icon={
                                pt.gender === "Male" ? (
                                  <ManOutlined />
                                ) : (
                                  <WomanOutlined />
                                )
                              }
                              className="text-xs"
                            >
                              {pt.gender === "Male" ? "Nam" : "Nữ"}
                            </Tag>
                            {pt.experience && (
                              <Tag
                                icon={<TrophyOutlined />}
                                color="orange"
                                className="text-xs"
                              >
                                {pt.experience} năm
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Schedule Section */}
        <Col xs={24} lg={18}>
          <Card
            className="border-0 shadow-lg h-full"
            title={
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">
                  Lịch Làm Việc
                  {selectedPT && (
                    <span className="ml-2 text-base font-normal text-gray-600">
                      - {selectedPT.fullName}
                    </span>
                  )}
                </span>
              </div>
            }
          >
            {!selectedPT ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <UserOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>Chọn một PT để xem lịch làm việc</p>
                </div>
              </div>
            ) : (
              <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                tabBarExtraContent={{
                  right: (
                    <Space size="middle" className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Từ ngày:
                        </span>
                        <DatePicker
                          value={fromDate}
                          onChange={(date) => {
                            setFromDate(date);
                            // Reset pagination when date changes
                            setPagination((prev) => ({ ...prev, current: 1 }));
                            setBookingPagination((prev) => ({ ...prev, current: 1 }));
                          }}
                          format="DD/MM/YYYY"
                          placeholder="Chọn ngày bắt đầu"
                          className="rounded-lg"
                          size="middle"
                          allowClear
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                          Đến ngày:
                        </span>
                        <DatePicker
                          value={toDate}
                          onChange={(date) => {
                            setToDate(date);
                            // Reset pagination when date changes
                            setPagination((prev) => ({ ...prev, current: 1 }));
                            setBookingPagination((prev) => ({ ...prev, current: 1 }));
                          }}
                          format="DD/MM/YYYY"
                          placeholder="Chọn ngày kết thúc"
                          className="rounded-lg"
                          size="middle"
                          allowClear
                          disabledDate={(current) => {
                            if (fromDate) {
                              return current && current < dayjs(fromDate).startOf("day");
                            }
                            return false;
                          }}
                        />
                      </div>
                    </Space>
                  ),
                }}
                items={[
                  {
                    key: "registered",
                    label: (
                      <span className="flex items-center gap-2">
                        <CalendarOutlined />
                        Slot Đã Đăng Ký
                      </span>
                    ),
                    children: (
                      <div>
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
                            dataSource={registeredSlots}
                            columns={registeredSlotsColumns}
                            loading={loadingSlots}
                            pagination={{
                              current: pagination.current,
                              pageSize: pagination.pageSize,
                              total: pagination.total,
                              showSizeChanger: true,
                              showQuickJumper: true,
                              showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} slot`,
                              position: ["bottomCenter"],
                            }}
                            onChange={(newPagination) => {
                              fetchRegisteredSlots(
                                selectedPT.id,
                                newPagination.current,
                                newPagination.pageSize
                              );
                            }}
                            className="rounded-lg overflow-hidden"
                            scroll={{ x: 600 }}
                            size="middle"
                            rowKey="ptGymSlotId"
                          />
                        </ConfigProvider>
                      </div>
                    ),
                  },
                  {
                    key: "bookings",
                    label: (
                      <span className="flex items-center gap-2">
                        <ClockCircleOutlined />
                        Danh Sách Đặt Lịch
                      </span>
                    ),
                    children: (
                      <div>
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
                            dataSource={bookings}
                            columns={bookingColumns}
                            loading={loadingBookings}
                            pagination={{
                              current: bookingPagination.current,
                              pageSize: bookingPagination.pageSize,
                              total: bookingPagination.total,
                              showSizeChanger: true,
                              showQuickJumper: true,
                              showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} đặt lịch`,
                              position: ["bottomCenter"],
                            }}
                            onChange={(newPagination) => {
                              fetchBookings(
                                selectedPT.id,
                                newPagination.current,
                                newPagination.pageSize
                              );
                            }}
                            className="rounded-lg overflow-hidden"
                            scroll={{ x: 1000 }}
                            size="middle"
                            rowKey={(record) =>
                              `${record.ptGymSlot?.ptGymSlotId}-${record.customerId}`
                            }
                          />
                        </ConfigProvider>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

