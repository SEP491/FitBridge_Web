import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  Space,
  Switch,
  Table,
  Row,
  Col,
  Statistic,
  Badge,
  Tag,
  Tooltip,
  Avatar,
  Typography,
  Divider,
  Spin,
  Upload,
  Select,
  Descriptions,
  Modal,
  DatePicker,
  TimePicker,
} from "antd";
import React, { useEffect, useState } from "react";
import adminService from "../../../services/adminServices";
import authService from "../../../services/authServices";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  UserOutlined,
  FireOutlined,
  CalendarOutlined,
  QrcodeOutlined,
  BankOutlined,
  GlobalOutlined,
  StopOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  FaDumbbell,
  FaInfoCircle,
  FaBuilding,
  FaUserCircle,
} from "react-icons/fa";
import { IoBarbell, IoLocationSharp } from "react-icons/io5";
import FitBridgeModal from "../../../components/FitBridgeModal";
import defaultAvatar from "../../../assets/LogoColor.png";
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

const { Title, Text } = Typography;
const { Option } = Select;
console.log("Api key google", import.meta.env.VITE_API_KEY_GOOGLE);
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
    initOnMount: true, // Initialize immediately when component mounts
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

export default function ManageGymPage() {
  const [gym, setGym] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalAddGymOpen, setIsModalAddGymOpen] = useState(false);
  const [isModalGymDetailOpen, setIsModalGymDetailOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [formAdd] = Form.useForm();
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [mainImageList, setMainImageList] = useState({});
  const [imagesList, setImagesList] = useState([]);
  const [position, setPosition] = useState(null);
  const [statistics, setStatistics] = useState({
    totalGyms: 0,
    hotResearchGyms: 0,
    normalGyms: 0,
    averageYear: 0,
  });

  const center = {
    lat: 10.762622,
    lng: 106.660172,
  };

  const [mapCenter, setMapCenter] = useState(center);

  // Function to remap API response data to match component expectations
  const remapGymData = (gymData) => {
    // Extract year from gymFoundationDate or createdAt
    const getYear = (dateString) => {
      if (!dateString) return null;
      try {
        return new Date(dateString).getFullYear();
      } catch {
        return null;
      }
    };

    const foundationYear = getYear(gymData.gymFoundationDate);
    const createdYear = getYear(gymData.createdAt);
    const since = foundationYear || createdYear || null;

    // Get main image from gymImages array or avatarUrl
    const mainImage =
      gymData.gymImages && gymData.gymImages.length > 0
        ? gymData.gymImages[0]
        : gymData.avatarUrl || null;

    // Get additional images (skip first one if it's used as mainImage)
    const images =
      gymData.gymImages && gymData.gymImages.length > 1
        ? gymData.gymImages.slice(1)
        : [];

    return {
      ...gymData,
      // Map fields to match component expectations
      mainImage: mainImage,
      images: images,
      address: gymData.businessAddress,
      representName: gymData.fullName,
      since: since,
      // Keep original fields for backward compatibility
      businessAddress: gymData.businessAddress,
      fullName: gymData.fullName,
    };
  };

  const fetchGym = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllGymOwners({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage } = response.data;

      // Remap the data to match component expectations
      const remappedItems = items.map(remapGymData);

      setGym(remappedItems);

      const hotResearchCount = remappedItems.filter(
        (gym) => gym.hotResearch
      ).length;
      const avgYear =
        remappedItems.length > 0
          ? Math.round(
              remappedItems.reduce((sum, gym) => sum + (gym.since || 2020), 0) /
                remappedItems.length
            )
          : 0;

      setStatistics({
        totalGyms: total,
        hotResearchGyms: hotResearchCount,
        normalGyms: total - hotResearchCount,
        averageYear: avgYear,
      });

      setPagination({
        current: currentPage,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("Error fetching gyms:", error);
      toast.error("Lỗi khi lấy danh sách phòng gym");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGym();
  }, []);

  const handleDelete = async (id) => {
    // Keep confirm using AntD Modal for destructive action but keep styling minimal
    // This confirmation dialog is separate from main content modals
    import("antd").then(({ Modal }) => {
      Modal.confirm({
        title: "Xác nhận xóa phòng gym",
        content:
          "Bạn có chắc chắn muốn xóa phòng gym này? Hành động này không thể hoàn tác.",
        okText: "Xóa",
        cancelText: "Hủy",
        okType: "danger",
        centered: true,
        icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
        onOk: async () => {
          try {
            await adminService.deleteGym(id);
            fetchGym();
            toast.success("Đã xóa phòng gym thành công");
          } catch (error) {
            console.error("Error deleting gym:", error);
            toast.error(
              error.response?.data?.message || "Không thể xóa phòng gym"
            );
          }
        },
      });
    });
  };

  const handleBanUnban = async (gymOwnerId, currentStatus) => {
    const isBanning = currentStatus; // If gym owner is active, we want to ban them

    Modal.confirm({
      title: isBanning ? "Xác nhận cấm chủ gym" : "Xác nhận mở cấm chủ gym",
      content: isBanning
        ? "Bạn có chắc chắn muốn cấm chủ gym này? Chủ gym sẽ không thể truy cập hệ thống."
        : "Bạn có chắc chắn muốn mở cấm cho chủ gym này? Chủ gym sẽ có thể truy cập lại hệ thống.",
      okText: isBanning ? "Cấm" : "Mở cấm",
      cancelText: "Hủy",
      okType: isBanning ? "danger" : "primary",
      centered: true,
      icon: (
        <StopOutlined style={{ color: isBanning ? "#ff4d4f" : "#52c41a" }} />
      ),
      onOk: async () => {
        try {
          const response = await adminService.banUnbanUser({
            userIdBanUnbanList: [gymOwnerId],
            isBan: isBanning,
          });

          if (response.status === "200" || response.status === 200) {
            toast.success(
              isBanning ? "Cấm chủ gym thành công" : "Mở cấm chủ gym thành công"
            );
            fetchGym(pagination.current, pagination.pageSize);
          } else {
            toast.error(
              isBanning ? "Không thể cấm chủ gym" : "Không thể mở cấm chủ gym"
            );
          }
        } catch (error) {
          console.error("Error ban/unban gym owner:", error);
          toast.error(
            isBanning
              ? "Đã xảy ra lỗi khi cấm chủ gym"
              : "Đã xảy ra lỗi khi mở cấm chủ gym"
          );
        }
      },
    });
  };

  const columns = [
    {
      title: "Thông Tin Phòng Gym",
      dataIndex: "gymName",
      key: "gymName",
      width: 120,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <img
            src={record.mainImage || defaultAvatar}
            alt={text}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-left">
            <div className="font-medium">
              {text}
              {record.hotResearch && (
                <Tag color="red" className="ml-1" icon={<FireOutlined />}>
                  HOT
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Địa Chỉ",
      dataIndex: "businessAddress",
      key: "businessAddress",
      width: 120,
      render: (address) => (
        <div className="flex items-center text-gray-700">
          <EnvironmentOutlined className="mr-1 text-red-500" />
          <span className="text-sm">{address || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Người Đại Diện",
      key: "contact",
      width: 70,
      align: "center",
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center text-gray-700">
            <UserOutlined className="mr-1 text-green-500" />
            <span className="font-medium text-sm">
              {record.fullName || "N/A"}
            </span>
          </div>
          <div className="flex items-center text-gray-500 text-xs">
            <PhoneOutlined className="mr-1 text-blue-500" />
            <span>{record.phone || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Hoạt Động",
      dataIndex: "since",
      key: "since",
      width: 40,
      align: "center",
      render: (since) => (
        <div className="flex items-center justify-center">
          <CalendarOutlined className="mr-1 text-orange-500" />
          <span className="font-semibold">{since || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "hotResearch",
      key: "hotResearch",
      width: 50,
      align: "center",
      render: (hotResearch) => (
        <Tag
          color={hotResearch ? "red" : "default"}
          icon={hotResearch ? <FireOutlined /> : null}
        >
          {hotResearch ? "HOT" : "Thường"}
        </Tag>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      width: 180,
      align: "center",
      render: (text, record) => (
        <Space>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              danger
              className="hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record.id);
              }}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "Cấm chủ gym" : "Mở cấm chủ gym"}>
            <Button
              type={record.isActive ? "default" : "primary"}
              danger={record.isActive}
              icon={
                record.isActive ? <StopOutlined /> : <CheckCircleOutlined />
              }
              onClick={(e) => {
                e.stopPropagation();
                handleBanUnban(record.id, record.isActive);
              }}
              size="small"
            >
              {record.isActive ? "Cấm" : "Mở cấm"}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    fetchGym(pagination.current, pagination.pageSize);
  };

  const filteredData = searchText
    ? gym.filter(
        (item) =>
          (item.gymName?.toLowerCase() || "").includes(
            searchText.toLowerCase()
          ) ||
          (item.address?.toLowerCase() || "").includes(
            searchText.toLowerCase()
          ) ||
          (item.representName?.toLowerCase() || "").includes(
            searchText.toLowerCase()
          )
      )
    : gym;

  const handleAddGym = async (values) => {
    setLoadingAdd(true);

    const formData = new FormData();

    // Basic account information
    formData.append("email", values.email || "");
    formData.append("phoneNumber", values.phone || "");
    formData.append("password", values.password || "");
    formData.append("fullName", values.representName || "");
    formData.append("gymName", values.gymName || "");
    formData.append("taxCode", values.taxCode || "");
    formData.append("role", "GymOwner");
    formData.append("isTestAccount", false);

    // Location information
    formData.append("longitude", values.longitude || 0);
    formData.append("latitude", values.latitude || 0);

    // Citizen ID files - handle file list from Ant Design Upload
    if (
      values.frontCitizenIdFile &&
      Array.isArray(values.frontCitizenIdFile) &&
      values.frontCitizenIdFile.length > 0
    ) {
      const frontFile = values.frontCitizenIdFile[0];
      console.log("Front file object:", frontFile);
      if (frontFile.originFileObj) {
        console.log("Appending frontCitizenIdFile from originFileObj");
        formData.append("frontCitizenIdFile", frontFile.originFileObj);
      } else if (frontFile instanceof File) {
        console.log("Appending frontCitizenIdFile as File");
        formData.append("frontCitizenIdFile", frontFile);
      } else {
        console.warn(
          "Front file does not have originFileObj or is not a File:",
          frontFile
        );
      }
    } else {
      console.warn(
        "No frontCitizenIdFile found or empty array:",
        values.frontCitizenIdFile
      );
    }

    if (
      values.backCitizenIdFile &&
      Array.isArray(values.backCitizenIdFile) &&
      values.backCitizenIdFile.length > 0
    ) {
      const backFile = values.backCitizenIdFile[0];
      console.log("Back file object:", backFile);
      if (backFile.originFileObj) {
        console.log("Appending backCitizenIdFile from originFileObj");
        formData.append("backCitizenIdFile", backFile.originFileObj);
      } else if (backFile instanceof File) {
        console.log("Appending backCitizenIdFile as File");
        formData.append("backCitizenIdFile", backFile);
      } else {
        console.warn(
          "Back file does not have originFileObj or is not a File:",
          backFile
        );
      }
    } else {
      console.warn(
        "No backCitizenIdFile found or empty array:",
        values.backCitizenIdFile
      );
    }

    formData.append("citizenIdNumber", values.citizenIdNumber || "");
    formData.append("identityCardPlace", values.identityCardPlace || "");
    formData.append(
      "citizenCardPermanentAddress",
      values.citizenCardPermanentAddress || ""
    );
    // Format date for API (YYYY-MM-DD format)
    if (values.identityCardDate) {
      const dateValue = values.identityCardDate.format
        ? values.identityCardDate.format("YYYY-MM-DD")
        : values.identityCardDate;
      formData.append("identityCardDate", dateValue);
    } else {
      formData.append("identityCardDate", "");
    }
    formData.append("businessAddress", values.address || "");
    // Format time for API (HH:mm format)
    if (values.openTime) {
      const openTimeValue = values.openTime.format
        ? values.openTime.format("HH:mm")
        : values.openTime;
      formData.append("openTime", openTimeValue);
    } else {
      formData.append("openTime", "");
    }
    if (values.closeTime) {
      const closeTimeValue = values.closeTime.format
        ? values.closeTime.format("HH:mm")
        : values.closeTime;
      formData.append("closeTime", closeTimeValue);
    } else {
      formData.append("closeTime", "");
    }

    try {
      // Debug: Log form values to verify files are captured
      console.log("Form values:", {
        frontCitizenIdFile: values.frontCitizenIdFile,
        backCitizenIdFile: values.backCitizenIdFile,
        identityCardDate: values.identityCardDate,
      });

      // Debug: Log FormData entries
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      const response = await authService.register(formData);
      console.log("Add Gym Response Data:", response);
      toast.success("Thêm phòng gym thành công!");
      fetchGym();
      setIsModalAddGymOpen(false);
      formAdd.resetFields();
      // Clear file lists explicitly
      formAdd.setFieldsValue({
        frontCitizenIdFile: [],
        backCitizenIdFile: [],
      });
      setPosition(null);
      setMapCenter(center);
      setMainImageList({});
      setImagesList([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể thêm phòng gym");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handlePlaceSelect = (location) => {
    setPosition({ lat: location.lat, lng: location.lng });
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  // Get address from latitude and longitude (Reverse Geocoding)
  const getAddressFromLatLng = async (lat, lng) => {
    try {
      const results = await getGeocode({
        location: { lat, lng },
      });

      if (results && results.length > 0) {
        const address = results[0].formatted_address;

        // Update form with the address
        formAdd.setFieldsValue({
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

  return (
    <APIProvider apiKey={import.meta.env.VITE_API_KEY_GOOGLE}>
      <div className="">
        <div className="">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-2">
              <UserOutlined />
              Quản Lý Phòng Gym
            </h1>
          </div>

          {/* Statistics Cards */}
          <Row gutter={[20, 20]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">
                      Tổng Số Phòng Gym
                    </span>
                  }
                  value={statistics.totalGyms}
                  prefix={<HomeOutlined className="text-blue-500" />}
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: "28px",
                    fontWeight: "bold",
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100">
                <Statistic
                  title={
                    <span className="text-gray-600 font-medium">
                      Hot Research
                    </span>
                  }
                  value={statistics.hotResearchGyms}
                  prefix={<FireOutlined className="text-red-500" />}
                  valueStyle={{
                    color: "#ff4d4f",
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
                      Phòng Gym Thường
                    </span>
                  }
                  value={statistics.normalGyms}
                  prefix={<BankOutlined className="text-green-500" />}
                  valueStyle={{
                    color: "#52c41a",
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
              theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
            >
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex-1 max-w-md">
                  <Input
                    placeholder="Tìm kiếm theo tên gym, địa chỉ, người đại diện..."
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
                  onClick={() => setIsModalAddGymOpen(true)}
                >
                  Thêm Phòng Gym
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
                  <span className="font-semibold">{statistics.totalGyms}</span>{" "}
                  phòng gym
                  {searchText && (
                    <span className="ml-2">
                      | Tìm kiếm: "
                      <span className="font-semibold text-blue-600">
                        {searchText}
                      </span>
                      "
                    </span>
                  )}
                </Text>
              </div>

              {/* Table */}
              <Table
                rowKey="id"
                dataSource={filteredData}
                columns={columns}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} mục`,
                  position: ["bottomCenter"],
                }}
                onChange={handleTableChange}
                className="rounded-lg overflow-hidden"
                scroll={{ x: 1000 }}
                size="middle"
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedGym(record);
                    setIsModalGymDetailOpen(true);
                  },
                  style: { cursor: "pointer" },
                })}
              />
            </ConfigProvider>
          </Card>
        </div>
      </div>

      {/* Gym Detail Modal */}
      <FitBridgeModal
        open={isModalGymDetailOpen}
        onCancel={() => setIsModalGymDetailOpen(false)}
        title="Chi Tiết Phòng Gym"
        titleIcon={<EyeOutlined />}
        width={950}
        logoSize="medium"
        bodyStyle={{ padding: "0", maxHeight: "75vh", overflowY: "auto" }}
      >
        {selectedGym && (
          <div className="flex flex-col">
            {/* Header Section with Key Info */}
            <div className="bg-gradient-to-r from-[#FFF9FA] to-[#FFF5F0] p-6 border-b-2 border-gray-100">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <FaDumbbell className="text-[#FF914D]" />
                      <span>Tên Phòng Gym</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedGym.gymName || "N/A"}
                      {selectedGym.hotResearch && (
                        <Tag
                          color="red"
                          className="ml-2"
                          icon={<FireOutlined />}
                        >
                          HOT
                        </Tag>
                      )}
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <CalendarOutlined className="text-[#FF914D]" />
                      <span>Hoạt Động Từ</span>
                    </div>
                    <div className="text-2xl font-bold text-[#ED2A46]">
                      Năm {selectedGym.since || "N/A"}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Main Content */}
            <div className="p-6 flex flex-col gap-5 space-y-6">
              {/* Gym Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaInfoCircle />
                    Thông Tin Phòng Gym
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="Tên Phòng Gym" span={2}>
                    <div className="font-semibold text-lg">
                      {selectedGym.gymName || "N/A"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Hoạt Động Từ">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-orange-500" />
                      <span className="font-semibold">
                        Năm {selectedGym.since || "N/A"}
                      </span>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Trạng Thái">
                    <Tag
                      color={selectedGym.hotResearch ? "red" : "default"}
                      icon={selectedGym.hotResearch ? <FireOutlined /> : null}
                      className="text-sm px-3 py-1"
                    >
                      {selectedGym.hotResearch ? "Hot Research" : "Bình thường"}
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Địa Chỉ" span={2}>
                    <div className="flex items-center gap-2">
                      <EnvironmentOutlined className="text-red-500" />
                      <span>{selectedGym.address || "N/A"}</span>
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Owner Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaUserCircle />
                    Thông Tin Chủ Sở Hữu
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Tên Người Đại Diện">
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-green-500" />
                      <span className="font-medium text-base">
                        {selectedGym.fullName ||
                          selectedGym.representName ||
                          "Chưa có thông tin"}
                      </span>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Số Điện Thoại">
                    <div className="flex items-center gap-2">
                      <PhoneOutlined className="text-blue-500" />
                      <span>{selectedGym.phone || "Chưa có thông tin"}</span>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Mã Số Thuế">
                    <div className="font-mono text-xs bg-orange-50 p-2 rounded inline-block">
                      {selectedGym.taxCode || "Chưa có thông tin"}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Trạng Thái Tài Khoản">
                    <Tag
                      color={selectedGym.isActive ? "green" : "red"}
                      icon={
                        selectedGym.isActive ? (
                          <CheckCircleOutlined />
                        ) : (
                          <StopOutlined />
                        )
                      }
                      className="text-sm px-3 py-1"
                    >
                      {selectedGym.isActive ? "Đang Hoạt Động" : "Bị Cấm"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Images Card */}
              {(selectedGym.mainImage ||
                (selectedGym.images && selectedGym.images.length > 0)) && (
                <Card
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  title={
                    <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                      <FaBuilding />
                      Hình Ảnh Phòng Gym
                    </span>
                  }
                  bordered={true}
                  style={{ borderColor: "#FFE5E9" }}
                >
                  <div className="space-y-4">
                    {selectedGym.mainImage && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">
                          Ảnh Đại Diện
                        </div>
                        <img
                          src={selectedGym.mainImage}
                          alt="Main gym"
                          className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                      </div>
                    )}

                    {selectedGym.images && selectedGym.images.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">
                          Ảnh Bổ Sung
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {selectedGym.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`Gym ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg shadow-md hover:scale-105 transition-transform"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </FitBridgeModal>

      {/* Add Gym Modal */}
      <FitBridgeModal
        open={isModalAddGymOpen}
        onCancel={() => {
          setIsModalAddGymOpen(false);
          formAdd.resetFields();
          // Clear file lists explicitly
          formAdd.setFieldsValue({
            frontCitizenIdFile: [],
            backCitizenIdFile: [],
          });
          setPosition(null);
          setMapCenter(center);
          setMainImageList({});
          setImagesList([]);
        }}
        title="Thêm Phòng Gym Mới"
        titleIcon={<IoBarbell />}
        width={950}
        logoSize="medium"
        footer={null}
        bodyStyle={{ padding: 0, maxHeight: "75vh", overflowY: "auto" }}
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddGym}
          className="max-h-[70vh] justify-between flex gap-4 flex-col overflow-y-auto py-6 overflow-x-hidden"
        >
          {/* Section 1: Account Information */}
          <Card
            size="small"
            className="mb-4 shadow-sm"
            title={
              <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                <UserOutlined />
                Thông Tin Tài Khoản
              </span>
            }
            bordered={true}
            style={{ borderColor: "#FFE5E9" }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Số điện thoại
                    </span>
                  }
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập số điện thoại",
                    },
                    { pattern: /^[0-9]+$/, message: "Vui lòng chỉ nhập số" },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="09XXXXXXXX"
                    maxLength={10}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">Email</span>
                  }
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input
                    prefix={<GlobalOutlined className="text-gray-400" />}
                    placeholder="example@email.com"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={
                <span className="font-semibold text-gray-700">Mật khẩu</span>
              }
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" size="large" />
            </Form.Item>
          </Card>

          {/* Section 2: Gym Information */}
          <Card
            size="small"
            className="mb-4 shadow-sm"
            title={
              <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                <FaDumbbell />
                Thông Tin Phòng Gym
              </span>
            }
            bordered={true}
            style={{ borderColor: "#FFE5E9" }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Tên Phòng Gym
                    </span>
                  }
                  name="gymName"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên phòng gym",
                    },
                  ]}
                >
                  <Input
                    prefix={<FaDumbbell className="text-gray-400" />}
                    placeholder="Tên phòng gym"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Hoạt động từ năm
                    </span>
                  }
                  name="since"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập năm hoạt động",
                    },
                  ]}
                >
                  <Input
                    prefix={<CalendarOutlined className="text-gray-400" />}
                    placeholder="2025"
                    type="number"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Tên người đại diện
                    </span>
                  }
                  name="representName"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên người đại diện",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Nguyễn Văn A"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Mã số thuế
                    </span>
                  }
                  name="taxCode"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã số thuế" },
                  ]}
                >
                  <Input
                    prefix={<BankOutlined className="text-gray-400" />}
                    placeholder="ABC1234567"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 3: Location & Map */}
          <Card
            size="small"
            className="mb-4 shadow-sm"
            title={
              <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                <EnvironmentOutlined />
                Vị Trí & Bản Đồ
              </span>
            }
            bordered={true}
            style={{ borderColor: "#FFE5E9" }}
          >
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Địa chỉ kinh doanh
                    </span>
                  }
                  name="address"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                >
                  <PlacesAutocomplete
                    onSelect={handlePlaceSelect}
                    formInstance={formAdd}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Hidden fields for coordinates */}
            <Form.Item name="longitude" hidden>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="latitude" hidden>
              <Input type="hidden" />
            </Form.Item>

            <div className="mb-2">
              <Text className="font-semibold text-gray-700 block mb-2">
                Xem vị trí trên bản đồ
              </Text>
              <div
                className="border rounded-lg overflow-hidden shadow-sm"
                style={{ height: "350px" }}
              >
                <Map
                  defaultCenter={center}
                  center={mapCenter}
                  defaultZoom={13}
                  zoom={position ? 15 : 13}
                  gestureHandling={"greedy"}
                  disableDefaultUI={false}
                  mapId="gym-location-map"
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
              <Text className="text-gray-500 text-xs mt-2 block">
                💡 Click vào bản đồ để chọn vị trí và lấy địa chỉ tự động
              </Text>
            </div>
          </Card>

          {/* Section 4: CCCD Information */}
          <Card
            size="small"
            className="mb-4 shadow-sm"
            title={
              <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                <FaUserCircle />
                Thông Tin CCCD
              </span>
            }
            bordered={true}
            style={{ borderColor: "#FFE5E9" }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">Số CCCD</span>
                  }
                  name="citizenIdNumber"
                  rules={[
                    { required: true, message: "Vui lòng nhập số CCCD" },
                    { pattern: /^[0-9]{12}$/, message: "CCCD phải có 12 số" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="079204029889"
                    maxLength={12}
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Nơi Cấp CCCD
                    </span>
                  }
                  name="identityCardPlace"
                  rules={[
                    { required: true, message: "Vui lòng nhập nơi cấp CCCD" },
                  ]}
                >
                  <Input
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                    placeholder="Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Ngày Cấp CCCD
                    </span>
                  }
                  name="identityCardDate"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn ngày cấp CCCD",
                    },
                  ]}
                >
                  <DatePicker
                    size="large"
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    placeholder="Chọn ngày cấp CCCD"
                    suffixIcon={<CalendarOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Địa Chỉ Thường Trú (Theo CCCD)
                    </span>
                  }
                  name="citizenCardPermanentAddress"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập địa chỉ thường trú",
                    },
                  ]}
                >
                  <Input
                    prefix={<EnvironmentOutlined className="text-gray-400" />}
                    placeholder="Địa chỉ theo CCCD"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Ảnh CCCD Mặt Trước
                    </span>
                  }
                  name="frontCitizenIdFile"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng tải lên ảnh CCCD mặt trước",
                    },
                  ]}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    {(formAdd.getFieldValue("frontCitizenIdFile")?.length ||
                      0) >= 1 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Mặt Trước</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Ảnh CCCD Mặt Sau
                    </span>
                  }
                  name="backCitizenIdFile"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => {
                    if (Array.isArray(e)) {
                      return e;
                    }
                    return e?.fileList;
                  }}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng tải lên ảnh CCCD mặt sau",
                    },
                  ]}
                >
                  <Upload
                    listType="picture-card"
                    maxCount={1}
                    beforeUpload={() => false}
                    accept="image/*"
                  >
                    {(formAdd.getFieldValue("backCitizenIdFile")?.length ||
                      0) >= 1 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Mặt Sau</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Section 5: Business Information */}
          <Card
            size="small"
            className="mb-4 shadow-sm"
            title={
              <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                <CalendarOutlined />
                Thông Tin Kinh Doanh
              </span>
            }
            bordered={true}
            style={{ borderColor: "#FFE5E9" }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Giờ Mở Cửa
                    </span>
                  }
                  name="openTime"
                  rules={[
                    { required: true, message: "Vui lòng nhập giờ mở cửa" },
                  ]}
                >
                  <TimePicker
                    size="large"
                    style={{ width: "100%" }}
                    format="HH:mm"
                    placeholder="Chọn giờ mở cửa"
                    suffixIcon={<CalendarOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span className="font-semibold text-gray-700">
                      Giờ Đóng Cửa
                    </span>
                  }
                  name="closeTime"
                  rules={[
                    { required: true, message: "Vui lòng nhập giờ đóng cửa" },
                  ]}
                >
                  <TimePicker
                    size="large"
                    style={{ width: "100%" }}
                    format="HH:mm"
                    placeholder="Chọn giờ đóng cửa"
                    suffixIcon={<CalendarOutlined className="text-gray-400" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <div className="text-center pt-6 border-t mt-6">
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setIsModalAddGymOpen(false);
                  formAdd.resetFields();
                  // Clear file lists explicitly
                  formAdd.setFieldsValue({
                    frontCitizenIdFile: [],
                    backCitizenIdFile: [],
                  });
                  setPosition(null);
                  setMapCenter(center);
                  setMainImageList({});
                  setImagesList([]);
                }}
                className="px-8"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                loading={loadingAdd}
                onClick={() => formAdd.submit()}
                className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-8 shadow-lg"
              >
                {loadingAdd ? "Đang thêm..." : "Thêm Phòng Gym"}
              </Button>
            </Space>
          </div>
        </Form>
      </FitBridgeModal>
    </APIProvider>
  );
}
