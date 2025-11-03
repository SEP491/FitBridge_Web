import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Select,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Typography,
  Spin,
  ConfigProvider,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  UserAddOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  ManOutlined,
  WomanOutlined,
  PhoneOutlined,
  MailOutlined,
  LoadingOutlined,
  PlusOutlined,
  StopOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import adminService from "../../../services/adminServices";
import toast from "react-hot-toast";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

// Custom Places Autocomplete Component
function PlacesAutocomplete({ onSelect, formInstance }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      componentRestrictions: { country: "vn" }, // Restrict to Vietnam
    },
    debounce: 300,
    initOnMount: true,
  });

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);

      onSelect({
        address: address,
        lat: lat,
        lng: lng,
      });

      formInstance.setFieldsValue({
        address: address,
        latitude: lat,
        longitude: lng,
      });

      toast.success("Đã chọn địa chỉ và tọa độ thành công!");
    } catch (error) {
      console.error("Error: ", error);
      toast.error("Không thể lấy tọa độ cho địa chỉ này");
    }
  };

  const options = data.map(({ place_id, description }) => ({
    value: description,
    label: description,
    key: place_id,
  }));

  return (
    <Select
      showSearch
      value={value || undefined}
      placeholder={
        ready ? "Nhập địa chỉ để tìm kiếm..." : "Đang tải Google Maps..."
      }
      size="large"
      style={{ width: "100%" }}
      defaultActiveFirstOption={false}
      suffixIcon={<EnvironmentOutlined />}
      filterOption={false}
      onSearch={(val) => setValue(val)}
      onSelect={handleSelect}
      notFoundContent={
        !ready ? (
          <div style={{ padding: "8px", color: "#999" }}>Đang tải...</div>
        ) : status === "OK" && data.length === 0 ? (
          <div style={{ padding: "8px", color: "#999" }}>
            Không tìm thấy địa chỉ
          </div>
        ) : null
      }
      disabled={!ready}
      options={options}
      loading={!ready}
    />
  );
}

export default function ManageUserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(""); // "add", "view"
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    activeUsers: 0,
  });
  const [position, setPosition] = useState(null);

  const center = {
    lat: 10.762622,
    lng: 106.660172,
  };

  const [mapCenter, setMapCenter] = useState(center);

  // Fetch users data
  const fetchUsers = async (page = 1, size = 10, search = "") => {
    setLoading(true);
    try {
      const params = {
        page: page,
        size: size,
      };

      if (search) {
        params.search = search;
      }

      const response = await adminService.getAllCustomers(params);

      if (response.status === "200") {
        const {
          items,
          total,
          page: currentPage,
          size: pageSize,
          totalPages,
        } = response.data;

        setUsers(items);
        setPagination({
          current: currentPage,
          pageSize: pageSize,
          total: total,
          totalPages: totalPages,
        });

        // Update statistics
        const maleCount = items.filter((user) => 
          user.isMale !== undefined ? user.isMale : user.gender === "Male"
        ).length;
        const femaleCount = items.filter((user) => 
          user.isMale !== undefined ? user.isMale === false : user.gender === "Female"
        ).length;
        const activeCount = items.filter(
          (user) => user.isActive === true
        ).length;

        setStatistics({
          totalUsers: total,
          maleUsers: maleCount,
          femaleUsers: femaleCount,
          activeUsers: activeCount,
        });
      } else {
        toast.error("Không thể tải danh sách người dùng");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Đã xảy ra lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    fetchUsers(pagination.current, pagination.pageSize, searchText);
  };

  // Open modal for different actions
  const openModal = (type, user = null) => {
    setModalType(type);
    setModalVisible(true);

    if (user && type === "view") {
      const gender = user.gender || (user.isMale !== undefined ? (user.isMale ? "Male" : "Female") : undefined);
      
      // Set map position if coordinates exist
      if (user.latitude && user.longitude) {
        const userPosition = { lat: user.latitude, lng: user.longitude };
        setPosition(userPosition);
        setMapCenter(userPosition);
      } else {
        setPosition(null);
        setMapCenter(center);
      }
      
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob ? dayjs(user.dob) : null,
        weight: user.weight || 0,
        height: user.height || 0,
        gender: gender === "Unknown" ? undefined : gender,
        address: user.address === "Unknown" ? "" : user.address,
        isActive: user.isActive ? "Hoạt động" : "Không hoạt động",
        createdAt: user.createdAt ? dayjs(user.createdAt).format("DD/MM/YYYY HH:mm") : "N/A",
        latitude: user.latitude || null,
        longitude: user.longitude || null,
      });
    } else {
      form.resetFields();
      setPosition(null);
      setMapCenter(center);
    }
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = (location) => {
    setPosition({ lat: location.lat, lng: location.lng });
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  // Handle modal submission
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      };

      if (modalType === "add") {
        // Add user API call - using adminService
        try {
          const response = await adminService.createUser(formData);
          if (response.status === "200" || response.status === "201") {
            toast.success("Thêm người dùng thành công");
            fetchUsers(pagination.current, pagination.pageSize, searchText);
          } else {
            toast.error("Không thể thêm người dùng");
          }
        } catch (error) {
          console.error("Error adding user:", error);
          toast.error("Đã xảy ra lỗi khi thêm người dùng");
        }
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  // Handle user deletion
  // Handle user ban
  const handleBan = async (userId) => {
    Modal.confirm({
      title: "Xác nhận cấm người dùng",
      content:
        "Bạn có chắc chắn muốn cấm người dùng này? Người dùng sẽ không thể truy cập hệ thống.",
      okText: "Cấm",
      cancelText: "Hủy",
      okType: "danger",
      centered: true,
      icon: <StopOutlined style={{ color: "#ff4d4f" }} />,
      onOk: async () => {
        try {
          const response = await adminService.banUser(userId);

          if (response.status === "200") {
            toast.success("Cấm người dùng thành công");
            fetchUsers(pagination.current, pagination.pageSize, searchText);
          } else {
            toast.error("Không thể cấm người dùng");
          }
        } catch (error) {
          console.error("Error banning user:", error);
          toast.error("Đã xảy ra lỗi khi cấm người dùng");
        }
      },
    });
  };

  // Filter users based on search text
  const filteredData = searchText
    ? users.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.address?.toLowerCase().includes(searchText.toLowerCase())
      )
    : users;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen ">
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

  // Table columns configuration
  const columns = [
    {
      title: "Thông Tin Người Dùng",
      dataIndex: "fullName",
      key: "fullName",
      width: 300,
      render: (text, record) => {
        const isMale = record.isMale !== undefined ? record.isMale : (record.gender === "Male");
        const isFemale = record.isMale !== undefined ? !record.isMale : (record.gender === "Female");
        
        return (
          <div className="flex items-center gap-3">
            <Avatar
              size={50}
              src={record.avatarUrl}
              icon={<UserOutlined />}
              style={{
                backgroundColor: record.avatarUrl ? undefined : (
                  isMale
                    ? "#1890ff"
                    : isFemale
                    ? "#eb2f96"
                    : "#666"
                ),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {!record.avatarUrl && (
                isMale ? (
                  <ManOutlined />
                ) : isFemale ? (
                  <WomanOutlined />
                ) : (
                  <UserOutlined />
                )
              )}
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900 text-base mb-1">
                {text || "N/A"}
              </div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <MailOutlined className="mr-1" />
                {record.email || "N/A"}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <PhoneOutlined className="mr-1" />
                {record.phone || "N/A"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Thông Tin Cá Nhân",
      key: "personal",
      width: 250,
      render: (_, record) => (
        <div className="space-y-2">
          <div className="flex items-center text-gray-700">
            <span className="text-sm">
              <strong>Ngày sinh:</strong>{" "}
              {record.dob ? dayjs(record.dob).format("DD/MM/YYYY") : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              <strong>Cân nặng:</strong>{" "}
              {record.weight > 0 ? `${record.weight} kg` : "N/A"}
            </span>
            <span className="text-sm text-gray-700">
              <strong>Chiều cao:</strong>{" "}
              {record.height > 0 ? `${record.height} cm` : "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Giới Tính",
      dataIndex: "isMale",
      key: "gender",
      width: 120,
      render: (isMale, record) => {
        const gender = record.gender || (isMale !== undefined ? (isMale ? "Male" : "Female") : null);
        const isMaleValue = isMale !== undefined ? isMale : (gender === "Male");
        const isFemaleValue = isMale !== undefined ? !isMale : (gender === "Female");
        
        return (
          <Tag
            color={
              isMaleValue ? "blue" : isFemaleValue ? "pink" : "gray"
            }
            icon={
              isMaleValue ? (
                <ManOutlined />
              ) : isFemaleValue ? (
                <WomanOutlined />
              ) : (
                <UserOutlined />
              )
            }
          >
            {isMaleValue
              ? "Nam"
              : isFemaleValue
              ? "Nữ"
              : "Chưa cập nhật"}
          </Tag>
        );
      },
    },
    
    {
      title: "Trạng Thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (createdAt) => (
        <span className="text-sm text-gray-700">
          {createdAt ? dayjs(createdAt).format("DD/MM/YYYY HH:mm") : "N/A"}
        </span>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => openModal("view", record)}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
          <Tooltip title="Cấm người dùng">
            <Button
              type="link"
              icon={<StopOutlined />}
              onClick={() => handleBan(record.id)}
              className="text-red-600 hover:text-red-800"
              disabled={!record.isActive}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <APIProvider apiKey={import.meta.env.VITE_API_KEY_GOOGLE}>
      <div className="">
        <div className="">
          {/* Header */}
          <div className="">
            <Title
              level={2}
              className="text-gray-900 mb-2 flex items-center gap-3"
            >
              <UserOutlined className="text-orange-500" />
              Quản Lý Người Dùng
            </Title>
            <Text className="text-gray-600 text-base">
              Quản lý và theo dõi tất cả người dùng trong hệ thống
            </Text>
          </div>

        {/* Statistics Cards */}
        <Row gutter={[20, 20]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title={
                  <span className="text-gray-600 font-medium">
                    Tổng Người Dùng
                  </span>
                }
                value={statistics.totalUsers}
                prefix={<UserOutlined className="text-blue-500" />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
              <Statistic
                title={
                  <span className="text-gray-600 font-medium">
                    Người Dùng Hoạt Động
                  </span>
                }
                value={statistics.activeUsers}
                prefix={<UserAddOutlined className="text-green-500" />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
              <Statistic
                title={<span className="text-gray-600 font-medium">Nam</span>}
                value={statistics.maleUsers}
                prefix={<ManOutlined className="text-blue-500" />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-pink-50 to-pink-100">
              <Statistic
                title={<span className="text-gray-600 font-medium">Nữ</span>}
                value={statistics.femaleUsers}
                prefix={<WomanOutlined className="text-pink-500" />}
                valueStyle={{
                  color: "#eb2f96",
                  fontSize: "28px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Card className="border-0 shadow-xl">
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
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex-1 max-w-md">
                <Input
                  placeholder="Tìm kiếm theo tên, email, số điện thoại, địa chỉ..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                  className="rounded-lg shadow-sm"
                />
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 rounded-lg px-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => openModal("add")}
              >
                Thêm Người Dùng
              </Button>
            </div>

            {/* Results Summary */}
            <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
              <Text className="text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-orange-600">
                  {filteredData.length}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-semibold text-blue-600">
                  {pagination.total}
                </span>{" "}
                người dùng
                {searchText && (
                  <>
                    {" "}
                    cho từ khóa "
                    <span className="font-semibold text-blue-600">
                      {searchText}
                    </span>
                    "
                  </>
                )}
              </Text>
            </div>

            {/* Users Table */}
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} trong tổng số ${total} người dùng`,
              }}
              onChange={handleTableChange}
              className="bg-white"
              scroll={{ x: 1200 }}
            />
          </ConfigProvider>
        </Card>

        {/* User Modal */}
        <Modal
          title={
            modalType === "add" ? "Thêm Người Dùng Mới" : "Chi Tiết Người Dùng"
          }
          open={modalVisible}
          onOk={modalType === "add" ? handleModalSubmit : undefined}
          onCancel={() => {
            setModalVisible(false);
            setPosition(null);
            setMapCenter(center);
          }}
          okText={modalType === "add" ? "Thêm Người Dùng" : undefined}
          cancelText="Hủy"
          footer={
            modalType === "view"
              ? [
                  <Button key="close" onClick={() => {
                    setModalVisible(false);
                    setPosition(null);
                    setMapCenter(center);
                  }}>
                    Đóng
                  </Button>,
                ]
              : undefined
          }
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            disabled={modalType === "view"}
            className="mt-4"
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="fullName"
                  label="Họ và Tên"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên" },
                  ]}
                >
                  <Input placeholder="Nhập họ và tên" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { type: "email", message: "Email không hợp lệ" },
                    { required: true, message: "Vui lòng nhập email" },
                  ]}
                >
                  <Input placeholder="Nhập email" prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Số Điện Thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                >
                  <Input
                    placeholder="Nhập số điện thoại"
                    prefix={<PhoneOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="dob" label="Ngày Sinh">
                  <DatePicker
                    placeholder="Chọn ngày sinh"
                    className="w-full"
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gender" label="Giới Tính">
                  <Select placeholder="Chọn giới tính">
                    <Option value="Male">Nam</Option>
                    <Option value="Female">Nữ</Option>
                    <Option value="Other">Khác</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="weight" label="Cân Nặng (kg)">
                  <InputNumber
                    placeholder="Nhập cân nặng"
                    min={0}
                    max={500}
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="height" label="Chiều Cao (cm)">
                  <InputNumber
                    placeholder="Nhập chiều cao"
                    min={0}
                    max={300}
                    className="w-full"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="address" label="Địa Chỉ">
                  {modalType === "add" ? (
                    <PlacesAutocomplete
                      onSelect={handlePlaceSelect}
                      formInstance={form}
                    />
                  ) : (
                    <Input.TextArea placeholder="Nhập địa chỉ" rows={3} disabled />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="latitude" label="Vĩ Độ">
                  <Input
                    placeholder={modalType === "add" ? "Sẽ tự động điền khi chọn địa chỉ" : "Chưa có dữ liệu"}
                    type="number"
                    step="any"
                    disabled
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="longitude" label="Kinh Độ">
                  <Input
                    placeholder={modalType === "add" ? "Sẽ tự động điền khi chọn địa chỉ" : "Chưa có dữ liệu"}
                    type="number"
                    step="any"
                    disabled
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </Form.Item>
              </Col>
              {modalType === "view" && (
                <>
                  <Col span={12}>
                    <Form.Item name="isActive" label="Trạng Thái Tài Khoản">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="createdAt" label="Ngày Tạo Tài Khoản">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                </>
              )}
              <Col span={24}>
                <div className="mb-4">
                  <Text className="font-semibold text-gray-700 block mb-2">
                    Xem vị trí trên bản đồ
                  </Text>
                  <div
                    className="border rounded-lg overflow-hidden shadow-sm"
                    style={{ height: "300px" }}
                  >
                    <Map
                      defaultCenter={center}
                      center={mapCenter}
                      defaultZoom={13}
                      zoom={position ? 15 : 13}
                      gestureHandling={"greedy"}
                      disableDefaultUI={false}
                      mapId="user-location-map"
                    >
                      {position && (
                        <AdvancedMarker position={position}>
                          <Pin
                            background={"#FF914D"}
                            borderColor={"#FF6B35"}
                            glyphColor={"#FFFFFF"}
                          />
                        </AdvancedMarker>
                      )}
                    </Map>
                  </div>
                  <Text className="text-gray-500 text-sm mt-2">
                    {modalType === "add" 
                      ? "Vị trí sẽ tự động hiển thị khi bạn chọn địa chỉ" 
                      : position 
                        ? "Vị trí hiện tại của người dùng"
                        : "Người dùng chưa có thông tin vị trí"}
                  </Text>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal>
        </div>
      </div>
    </APIProvider>
  );
}
