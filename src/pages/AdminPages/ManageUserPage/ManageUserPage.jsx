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
  Avatar,
  Spin,
  ConfigProvider,
  Tooltip,
  Descriptions,
  Divider,
} from "antd";
import {
  SearchOutlined,
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
  CalendarOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { FaUserCircle, FaInfoCircle, FaMapMarkerAlt } from "react-icons/fa";
import FitBridgeModal from "../../../components/FitBridgeModal";
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

const { Option } = Select;

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    maleUsers: 0,
    femaleUsers: 0,
    activeUsers: 0,
  });
  const [position, setPosition] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

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
  const openModal = async (type, user = null) => {
    setModalType(type);
    setModalVisible(true);
    
    if (user && type === "view") {
      setSelectedUser(user);
      const gender = user.gender || (user.isMale !== undefined ? (user.isMale ? "Male" : "Female") : undefined);
      
      let addressToDisplay = user.address === "Unknown" ? "" : user.address;
      
      // Set map position if coordinates exist
      if (user.latitude && user.longitude) {
        const userPosition = { lat: user.latitude, lng: user.longitude };
        setPosition(userPosition);
        setMapCenter(userPosition);
        
        // If no valid address but has coordinates, fetch address from coordinates
        if (!addressToDisplay || addressToDisplay === "") {
          setLoadingAddress(true);
          // Set initial form values with loading message
          form.setFieldsValue({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            dob: user.dob ? dayjs(user.dob) : null,
            weight: user.weight || 0,
            height: user.height || 0,
            gender: gender === "Unknown" ? undefined : gender,
            address: "Đang lấy địa chỉ...",
            isActive: user.isActive ? "Hoạt động" : "Không hoạt động",
            createdAt: user.createdAt ? dayjs(user.createdAt).format("DD/MM/YYYY HH:mm") : "N/A",
            latitude: user.latitude || null,
            longitude: user.longitude || null,
          });
          
          try {
            const results = await getGeocode({ 
              location: { lat: user.latitude, lng: user.longitude } 
            });
            
            if (results && results.length > 0) {
              addressToDisplay = results[0].formatted_address;
              // Update only the address field after fetching
              form.setFieldsValue({
                address: addressToDisplay,
              });
              toast.success("Đã lấy địa chỉ từ tọa độ thành công!");
            } else {
              form.setFieldsValue({
                address: "Không tìm thấy địa chỉ",
              });
            }
          } catch (error) {
            console.error("Error getting address from coordinates:", error);
            form.setFieldsValue({
              address: "Không thể lấy địa chỉ",
            });
          } finally {
            setLoadingAddress(false);
          }
        } else {
          // Set form values normally if address exists
          form.setFieldsValue({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            dob: user.dob ? dayjs(user.dob) : null,
            weight: user.weight || 0,
            height: user.height || 0,
            gender: gender === "Unknown" ? undefined : gender,
            address: addressToDisplay,
            isActive: user.isActive ? "Hoạt động" : "Không hoạt động",
            createdAt: user.createdAt ? dayjs(user.createdAt).format("DD/MM/YYYY HH:mm") : "N/A",
            latitude: user.latitude || null,
            longitude: user.longitude || null,
          });
        }
      } else {
        setPosition(null);
        setMapCenter(center);
        
        // Set form values without coordinates
        form.setFieldsValue({
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          dob: user.dob ? dayjs(user.dob) : null,
          weight: user.weight || 0,
          height: user.height || 0,
          gender: gender === "Unknown" ? undefined : gender,
          address: addressToDisplay || "Chưa có địa chỉ",
          isActive: user.isActive ? "Hoạt động" : "Không hoạt động",
          createdAt: user.createdAt ? dayjs(user.createdAt).format("DD/MM/YYYY HH:mm") : "N/A",
          latitude: user.latitude || null,
          longitude: user.longitude || null,
        });
      }
    } else {
      setSelectedUser(null);
      form.resetFields();
      setPosition(null);
      setMapCenter(center);
      setLoadingAddress(false);
    }
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = (location) => {
    setPosition({ lat: location.lat, lng: location.lng });
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  // Get address from latitude and longitude (Reverse Geocoding)
  const getAddressFromLatLng = async (lat, lng) => {
    try {
      
      const results = await getGeocode({ 
        location: { lat, lng } 
      });
      
      if (results && results.length > 0) {
        const address = results[0].formatted_address;
        
        // Update form with the address
        form.setFieldsValue({
          address: address,
          latitude: lat,
          longitude: lng,
        });

        // Update map position
        setPosition({ lat, lng });
        setMapCenter({ lat, lng });

        toast.success("Đã lấy địa chỉ từ tọa độ thành công!");
        return address;
      } else {
        toast.error("Không tìm thấy địa chỉ cho tọa độ này");
        return null;
      }
    } catch (error) {
      console.error("Error getting address from coordinates:", error);
      toast.error("Không thể lấy địa chỉ từ tọa độ");
      return null;
    }
  };

  // Handle modal submission
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (modalType === "add") {
        // Map form fields to API structure
        const apiData = {
          email: values.email,
          phoneNumber: values.phone,
          password: values.password,
          fullName: values.fullName,
          isTestAccount: values.isTestAccount || false,
          longitude: parseFloat(values.longitude) || 0,
          latitude: parseFloat(values.latitude) || 0,
        };

        try {
          const response = await adminService.createUserAccount(apiData);
          if (response.status === "200" || response.status === 200 || response.status === "201" || response.status === 201) {
            toast.success("Thêm người dùng thành công");
            setModalVisible(false);
            form.resetFields();
            setPosition(null);
            setMapCenter(center);
            fetchUsers(pagination.current, pagination.pageSize, searchText);
          } else {
            toast.error("Không thể thêm người dùng");
          }
        } catch (error) {
          console.error("Error adding user:", error);
          toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi thêm người dùng");
        }
      }
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  // Handle user ban/unban
  const handleBanUnban = async (userId, currentStatus) => {
    const isBanning = currentStatus; // If user is active, we want to ban them
    
    Modal.confirm({
      title: isBanning ? "Xác nhận cấm người dùng" : "Xác nhận mở cấm người dùng",
      content: isBanning
        ? "Bạn có chắc chắn muốn cấm người dùng này? Người dùng sẽ không thể truy cập hệ thống."
        : "Bạn có chắc chắn muốn mở cấm cho người dùng này? Người dùng sẽ có thể truy cập lại hệ thống.",
      okText: isBanning ? "Cấm" : "Mở cấm",
      cancelText: "Hủy",
      okType: isBanning ? "danger" : "primary",
      centered: true,
      icon: <StopOutlined style={{ color: isBanning ? "#ff4d4f" : "#52c41a" }} />,
      onOk: async () => {
        try {
          const response = await adminService.banUnbanUser({
            userIdBanUnbanList: [userId],
            isBan: isBanning
          });

          if (response.status === "200" || response.status === 200) {
            toast.success(isBanning ? "Cấm người dùng thành công" : "Mở cấm người dùng thành công");
            fetchUsers(pagination.current, pagination.pageSize, searchText);
          } else {
            toast.error(isBanning ? "Không thể cấm người dùng" : "Không thể mở cấm người dùng");
          }
        } catch (error) {
          console.error("Error ban/unban user:", error);
          toast.error(isBanning ? "Đã xảy ra lỗi khi cấm người dùng" : "Đã xảy ra lỗi khi mở cấm người dùng");
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
  if (loading && users.length === 0) {
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

  // Table columns configuration
  const columns = [
    {
      title: "Thông Tin Người Dùng",
      dataIndex: "fullName",
      key: "fullName",
      width: 280,
      render: (text, record) => {
        const isMale = record.isMale !== undefined ? record.isMale : (record.gender === "Male");
        const isFemale = record.isMale !== undefined ? !record.isMale : (record.gender === "Female");
        
        return (
          <div className="flex items-center gap-3">
            <Avatar
              size={45}
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
              <div className="font-medium text-gray-900 mb-1">
                {text || "N/A"}
              </div>
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <MailOutlined className="mr-1" />
                {record.email || "N/A"}
              </div>
              <div className="flex items-center text-xs text-gray-500">
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
      title: "Hành Động",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button
          type={record.isActive ? "default" : "primary"}
          danger={record.isActive}
          icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click event
            handleBanUnban(record.id, record.isActive);
          }}
          size="small"
        >
          {record.isActive ? "Cấm" : "Mở cấm"}
        </Button>
      ),
    },
  ];

  return (
    <APIProvider apiKey={import.meta.env.VITE_API_KEY_GOOGLE}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-2">
            <UserOutlined />
            Quản Lý Người Dùng
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi tất cả người dùng trong hệ thống
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.totalUsers}
            </div>
            <div className="text-gray-600 text-sm">Tổng người dùng</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-green-600">
              {statistics.activeUsers}
            </div>
            <div className="text-gray-600 text-sm">Đang hoạt động</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-[#1890ff]">
              {statistics.maleUsers}
            </div>
            <div className="text-gray-600 text-sm">Nam</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-[#eb2f96]">
              {statistics.femaleUsers}
            </div>
            <div className="text-gray-600 text-sm">Nữ</div>
          </Card>
        </div>

        <ConfigProvider
          theme={{
            components: {
              Table: {
                headerBg: "#FFE5E9",
              },
            },
          }}
        >
          {/* Filters */}
          <Card
            style={{marginBottom: 20}}
            title={
              <span className="flex items-center gap-2">
                <SearchOutlined /> Tìm kiếm
              </span>
            }
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại, địa chỉ..."
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 350 }}
              />

              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-[#FF914D] border-0 hover:bg-[#e8823d]"
                onClick={() => openModal("add")}
              >
                Thêm Người Dùng
              </Button>
            </div>
          </Card>

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
              position: ["bottomCenter"],
              size: "middle",
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} người dùng`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 800 }}
            size="middle"
            onRow={(record) => ({
              onClick: () => openModal("view", record),
              style: { cursor: "pointer" },
            })}
          />
        </ConfigProvider>

      </div>

      {/* User Detail Modal - Enhanced UI */}
      {modalType === "view" ? (
        <FitBridgeModal
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setPosition(null);
            setMapCenter(center);
            setLoadingAddress(false);
            form.resetFields();
          }}
          title="Chi Tiết Người Dùng"
          titleIcon={<EyeOutlined />}
          width={950}
          logoSize="medium"
          bodyStyle={{ padding: "0", maxHeight: "75vh", overflowY: "auto" }}
        >
          {form.getFieldsValue() && (
            <div className="flex flex-col">
              {/* Header Section with Key Info */}
              <div className="bg-gradient-to-r from-[#FFF9FA] to-[#FFF5F0] p-6 border-b-2 border-gray-100">
                <div className="flex items-center gap-6">
                  <Avatar
                    size={100}
                    src={selectedUser?.avatarUrl}
                    icon={<UserOutlined />}
                    style={{
                      backgroundColor: form.getFieldValue("gender") === "Male"
                        ? "#1890ff"
                        : form.getFieldValue("gender") === "Female"
                        ? "#eb2f96"
                        : "#666",
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-[#ED2A46] mb-2">
                      {form.getFieldValue("fullName") || "N/A"}
                    </h2>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Tag
                        color={
                          form.getFieldValue("gender") === "Male"
                            ? "blue"
                            : form.getFieldValue("gender") === "Female"
                            ? "pink"
                            : "default"
                        }
                        icon={
                          form.getFieldValue("gender") === "Male" ? (
                            <ManOutlined />
                          ) : form.getFieldValue("gender") === "Female" ? (
                            <WomanOutlined />
                          ) : (
                            <UserOutlined />
                          )
                        }
                        className="text-sm px-3 py-1"
                      >
                        {form.getFieldValue("gender") === "Male"
                          ? "Nam"
                          : form.getFieldValue("gender") === "Female"
                          ? "Nữ"
                          : "Chưa cập nhật"}
                      </Tag>
                      <Tag
                        icon={
                          form.getFieldValue("isActive") === "Hoạt động" ? (
                            <CheckCircleOutlined />
                          ) : (
                            <StopOutlined />
                          )
                        }
                        color={
                          form.getFieldValue("isActive") === "Hoạt động"
                            ? "success"
                            : "error"
                        }
                        className="text-sm px-3 py-1"
                      >
                        {form.getFieldValue("isActive")}
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-6 flex flex-col gap-5 space-y-6">
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
                    <Descriptions.Item
                      label={
                        <span>
                          <UserOutlined /> Họ Tên
                        </span>
                      }
                      span={2}
                    >
                      <div className="font-semibold text-gray-800">
                        {form.getFieldValue("fullName") || "N/A"}
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={
                        <span>
                          <MailOutlined /> Email
                        </span>
                      }
                    >
                      <span className="text-blue-600">
                        {form.getFieldValue("email") || "N/A"}
                      </span>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={
                        <span>
                          <PhoneOutlined /> Số Điện Thoại
                        </span>
                      }
                    >
                      <span className="font-semibold">
                        {form.getFieldValue("phone") || "Chưa cập nhật"}
                      </span>
                    </Descriptions.Item>

                    <Descriptions.Item
                      label={
                        <span>
                          <CalendarOutlined /> Ngày Sinh
                        </span>
                      }
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {form.getFieldValue("dob")
                            ? form.getFieldValue("dob").format("DD/MM/YYYY")
                            : "N/A"}
                        </span>
                        {form.getFieldValue("dob") && (
                          <span className="text-xs text-gray-500">
                            {new Date().getFullYear() -
                              form.getFieldValue("dob").year()}{" "}
                            tuổi
                          </span>
                        )}
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Giới Tính">
                      <Tag
                        color={
                          form.getFieldValue("gender") === "Male"
                            ? "blue"
                            : form.getFieldValue("gender") === "Female"
                            ? "pink"
                            : "default"
                        }
                        icon={
                          form.getFieldValue("gender") === "Male" ? (
                            <ManOutlined />
                          ) : form.getFieldValue("gender") === "Female" ? (
                            <WomanOutlined />
                          ) : (
                            <UserOutlined />
                          )
                        }
                      >
                        {form.getFieldValue("gender") === "Male"
                          ? "Nam"
                          : form.getFieldValue("gender") === "Female"
                          ? "Nữ"
                          : "Chưa cập nhật"}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Cân Nặng">
                      <span className="font-semibold">
                        {form.getFieldValue("weight") > 0
                          ? `${form.getFieldValue("weight")} kg`
                          : "N/A"}
                      </span>
                    </Descriptions.Item>

                    <Descriptions.Item label="Chiều Cao">
                      <span className="font-semibold">
                        {form.getFieldValue("height") > 0
                          ? `${form.getFieldValue("height")} cm`
                          : "N/A"}
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Account Info Card */}
                <Card
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  title={
                    <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                      <FaInfoCircle />
                      Thông Tin Tài Khoản
                    </span>
                  }
                  bordered={true}
                  style={{ borderColor: "#FFE5E9" }}
                >
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Trạng Thái">
                      <Tag
                        icon={
                          form.getFieldValue("isActive") === "Hoạt động" ? (
                            <CheckCircleOutlined />
                          ) : (
                            <StopOutlined />
                          )
                        }
                        color={
                          form.getFieldValue("isActive") === "Hoạt động"
                            ? "success"
                            : "error"
                        }
                        className="px-3 py-1"
                      >
                        {form.getFieldValue("isActive")}
                      </Tag>
                    </Descriptions.Item>

                    <Descriptions.Item label="Ngày Tạo Tài Khoản">
                      <div className="font-semibold text-gray-700">
                        {form.getFieldValue("createdAt") || "N/A"}
                      </div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Location Card */}
                <Card
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  title={
                    <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                      <FaMapMarkerAlt />
                      Thông Tin Vị Trí
                    </span>
                  }
                  bordered={true}
                  style={{ borderColor: "#FFE5E9" }}
                >
                  <Descriptions column={1} bordered size="small">
                    <Descriptions.Item label="Địa Chỉ" span={2}>
                      <div className="text-gray-700 bg-gray-50 p-2 rounded flex items-center gap-2">
                        {loadingAddress && <LoadingOutlined className="text-blue-500" />}
                        {form.getFieldValue("address") || "Chưa có địa chỉ"}
                      </div>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tọa Độ">
                      <div className="flex gap-4">
                        <span className="text-sm">
                          <strong>Vĩ độ:</strong>{" "}
                          {form.getFieldValue("latitude") || "N/A"}
                        </span>
                        <span className="text-sm">
                          <strong>Kinh độ:</strong>{" "}
                          {form.getFieldValue("longitude") || "N/A"}
                        </span>
                      </div>
                    </Descriptions.Item>
                  </Descriptions>

                  <div className="mt-4">
                    <div className="font-semibold text-gray-700 mb-2">
                      Vị trí trên bản đồ
                    </div>
                    <div
                      className="border rounded-lg overflow-hidden shadow-sm"
                      style={{ height: "300px" }}
                    >
                      <Map
                        defaultCenter={center}
                        center={mapCenter}
                        zoom={position ? 17 : 13}
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
                    <div className="text-gray-500 text-sm mt-2">
                      {position
                        ? "Vị trí hiện tại của người dùng"
                        : "Người dùng chưa có thông tin vị trí"}
                    </div>
                  </div>
                </Card>

                {/* Physical Stats Card */}
                <Card
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  title={
                    <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                      <IdcardOutlined />
                      Chỉ Số Cơ Thể
                    </span>
                  }
                  bordered={true}
                  style={{ borderColor: "#FFE5E9" }}
                >
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {form.getFieldValue("weight") > 0
                              ? form.getFieldValue("weight")
                              : "N/A"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Cân Nặng (kg)
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {form.getFieldValue("height") > 0
                              ? form.getFieldValue("height")
                              : "N/A"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Chiều Cao (cm)
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-orange-600 mb-2">
                            {form.getFieldValue("weight") > 0 &&
                            form.getFieldValue("height") > 0
                              ? (
                                  form.getFieldValue("weight") /
                                  Math.pow(
                                    form.getFieldValue("height") / 100,
                                    2
                                  )
                                ).toFixed(1)
                              : "N/A"}
                          </div>
                          <div className="text-sm text-gray-600">BMI</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </FitBridgeModal>
      ) : (
        <FitBridgeModal
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
            setPosition(null);
            setMapCenter(center);
          }}
          title="Thêm Người Dùng Mới"
          titleIcon={<PlusOutlined />}
          width={950}
          logoSize="medium"
          footer={
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <Button
                size="large"
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setPosition(null);
                  setMapCenter(center);
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleModalSubmit}
                className="bg-[#FF914D] border-0 hover:bg-[#e8823d]"
              >
                Thêm Người Dùng
              </Button>
            </div>
          }
          bodyStyle={{ padding: "0", maxHeight: "70vh", overflowY: "auto" }}
        >
          <Form form={form} layout="vertical">
            <div className="p-6 space-y-6">
              {/* Account Information Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <LockOutlined />
                    Thông Tin Tài Khoản
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="fullName"
                      label={
                        <span className="font-semibold">
                          <UserOutlined /> Họ và Tên
                        </span>
                      }
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên" },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="Nhập họ và tên đầy đủ"
                        prefix={<UserOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="email"
                      label={
                        <span className="font-semibold">
                          <MailOutlined /> Email
                        </span>
                      }
                      rules={[
                        { type: "email", message: "Email không hợp lệ" },
                        { required: true, message: "Vui lòng nhập email" },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="example@email.com"
                        prefix={<MailOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="phone"
                      label={
                        <span className="font-semibold">
                          <PhoneOutlined /> Số Điện Thoại
                        </span>
                      }
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập số điện thoại",
                        },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="0912345678"
                        prefix={<PhoneOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="password"
                      label={
                        <span className="font-semibold">
                          <LockOutlined /> Mật Khẩu
                        </span>
                      }
                      rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu" },
                        {
                          min: 6,
                          message: "Mật khẩu phải có ít nhất 6 ký tự",
                        },
                      ]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                        prefix={<LockOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="isTestAccount"
                      label={
                        <span className="font-semibold">
                          <IdcardOutlined /> Loại Tài Khoản
                        </span>
                      }
                      initialValue={false}
                    >
                      <Select size="large" placeholder="Chọn loại tài khoản">
                        <Option value={false}>
                          <span className="flex items-center gap-2">
                            <CheckCircleOutlined className="text-green-500" />
                            Tài khoản Thật
                          </span>
                        </Option>
                        <Option value={true}>
                          <span className="flex items-center gap-2">
                            <IdcardOutlined className="text-orange-500" />
                            Tài khoản Test
                          </span>
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Personal Information Card */}
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
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="dob"
                      label={
                        <span className="font-semibold">
                          <CalendarOutlined /> Ngày Sinh
                        </span>
                      }
                    >
                      <DatePicker
                        size="large"
                        placeholder="Chọn ngày sinh"
                        className="w-full"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="gender"
                      label={
                        <span className="font-semibold">
                          <UserOutlined /> Giới Tính
                        </span>
                      }
                    >
                      <Select size="large" placeholder="Chọn giới tính">
                        <Option value="Male">
                          <span className="flex items-center gap-2">
                            <ManOutlined className="text-blue-500" />
                            Nam
                          </span>
                        </Option>
                        <Option value="Female">
                          <span className="flex items-center gap-2">
                            <WomanOutlined className="text-pink-500" />
                            Nữ
                          </span>
                        </Option>
                        <Option value="Other">
                          <span className="flex items-center gap-2">
                            <UserOutlined className="text-gray-500" />
                            Khác
                          </span>
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="weight"
                      label={
                        <span className="font-semibold">
                          ⚖️ Cân Nặng (kg)
                        </span>
                      }
                    >
                      <InputNumber
                        size="large"
                        placeholder="Nhập cân nặng"
                        min={0}
                        max={500}
                        className="w-full"
                        addonAfter="kg"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="height"
                      label={
                        <span className="font-semibold">
                          📏 Chiều Cao (cm)
                        </span>
                      }
                    >
                      <InputNumber
                        size="large"
                        placeholder="Nhập chiều cao"
                        min={0}
                        max={300}
                        className="w-full"
                        addonAfter="cm"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              {/* Location Information Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaMapMarkerAlt />
                    Thông Tin Vị Trí
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="address"
                      label={
                        <span className="font-semibold">
                          <EnvironmentOutlined /> Địa Chỉ
                        </span>
                      }
                    >
                      <PlacesAutocomplete
                        onSelect={handlePlaceSelect}
                        formInstance={form}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="latitude"
                      label={
                        <span className="font-semibold">📍 Vĩ Độ (Latitude)</span>
                      }
                    >
                      <Input
                        size="large"
                        placeholder="VD: 10.762622"
                        type="number"
                        step="any"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="longitude"
                      label={
                        <span className="font-semibold">
                          📍 Kinh Độ (Longitude)
                        </span>
                      }
                    >
                      <Input
                        size="large"
                        placeholder="VD: 106.660172"
                        type="number"
                        step="any"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Button
                      type="dashed"
                      size="large"
                      icon={<EnvironmentOutlined />}
                      onClick={async () => {
                        const lat = form.getFieldValue("latitude");
                        const lng = form.getFieldValue("longitude");
                        if (lat && lng) {
                          await getAddressFromLatLng(lat, lng);
                        } else {
                          toast.error("Vui lòng nhập cả vĩ độ và kinh độ");
                        }
                      }}
                      className="w-full mb-4 border-[#FF914D] text-[#FF914D] hover:bg-[#FFF5F0]"
                    >
                      🔄 Lấy Địa Chỉ từ Tọa Độ
                    </Button>
                  </Col>
                  <Col span={24}>
                    <div className="mb-2">
                      <div className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-lg">🗺️</span>
                        Xem Vị Trí Trên Bản Đồ
                      </div>
                      <div
                        className="border-2 border-[#FFE5E9] rounded-lg overflow-hidden shadow-md"
                        style={{ height: "350px" }}
                      >
                        <Map
                          defaultCenter={center}
                          // center={mapCenter}
                          
                          defaultZoom={13}
                          gestureHandling={"greedy"}
                          disableDefaultUI={true}
                          mapId="user-location-map"
                          onClick={async (e) => {
                            if (e.detail.latLng) {
                              const { lat, lng } = e.detail.latLng;
                              await getAddressFromLatLng(lat, lng);
                            }
                          }}
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
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mt-3 rounded">
                        <p className="text-sm text-blue-700 flex items-start gap-2">
                          <span className="text-lg">💡</span>
                          <span>
                            <strong>Hướng dẫn:</strong> Click vào bản đồ để chọn vị trí và tự động lấy địa chỉ, hoặc nhập tọa độ thủ công rồi nhấn nút "Lấy Địa Chỉ từ Tọa Độ"
                          </span>
                        </p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Form>
        </FitBridgeModal>
      )}
    </APIProvider>
  );
}
