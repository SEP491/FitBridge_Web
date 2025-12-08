import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Button,
  Upload,
  Select,
  message,
  Avatar,
  Row,
  Col,
  Divider,
  Spin,
  Badge,
  Typography,
  Space,
  Tag,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  UploadOutlined,
  SaveOutlined,
  CameraOutlined,
  EditOutlined,
  CalendarOutlined,
  ManOutlined,
  WomanOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/features/userSlice";
import profileService from "../../services/profileService";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function ProfilePage() {
  const user = useSelector(selectUser);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [frontCitizenId, setFrontCitizenId] = useState(null);
  const [backCitizenId, setBackCitizenId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backPreview, setBackPreview] = useState(null);
  const [frontCitizenFile, setFrontCitizenFile] = useState(null);
  const [backCitizenFile, setBackCitizenFile] = useState(null);
  const [imagesToAdd, setImagesToAdd] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await profileService.getProfile();
      const data = response.data;
      setProfileData(data);
      setAvatarUrl(data.avatarUrl);
      setFrontCitizenId(data.frontCitizenIdUrl);
      setBackCitizenId(data.backCitizenIdUrl);
      const combinedImages = [
        ...(data.freelancePtImages || []),
        ...(data.gymImages || []),
        ...(data.images || []),
        ...(data.galleryImages || []),
      ];
      setExistingImages(Array.from(new Set(combinedImages)));
      setImagesToRemove([]);

      // Set form values based on role
      if (user?.role === "GymOwner") {
        form.setFieldsValue({
          // Representative info
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          dob: data.dob ? dayjs(data.dob) : null,
          citizenIdNumber: data.citizenIdNumber,
          identityCardPlace: data.identityCardPlace,
          citizenCardPermanentAddress: data.citizenCardPermanentAddress,
          identityCardDate: data.identityCardDate
            ? dayjs(data.identityCardDate)
            : null,
          // Gym info
          gymName: data.gymName,
          gymDescription: data.gymDescription,
          taxCode: data.taxCode,
          gymFoundationDate: data.gymFoundationDate
            ? dayjs(data.gymFoundationDate)
            : null,
          openTime: data.openTime ? dayjs(data.openTime, "HH:mm:ss") : null,
          closeTime: data.closeTime ? dayjs(data.closeTime, "HH:mm:ss") : null,
          businessAddress: data.businessAddress,
        });
      } else if (user?.role === "FreelancePT") {
        form.setFieldsValue({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          dob: data.dob ? dayjs(data.dob) : null,
          gender: data.gender,
          weight: data.weight,
          height: data.height,
          bio: data.bio,
          ptMaxCourse: data.ptMaxCourse,
          ptCurrentCourse: data.ptCurrentCourse,
          citizenIdNumber: data.citizenIdNumber,
          identityCardPlace: data.identityCardPlace,
          citizenCardPermanentAddress: data.citizenCardPermanentAddress,
          identityCardDate: data.identityCardDate
            ? dayjs(data.identityCardDate)
            : null,
          businessAddress: data.businessAddress,
        });
      }
    } catch (error) {
      message.error("Không thể tải thông tin cá nhân");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const formData = new FormData();
      const appendIfPresent = (key, value) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value);
        }
      };

      appendIfPresent("id", user?.id);

      // Shared identity fields
      appendIfPresent("citizenIdNumber", values.citizenIdNumber);
      appendIfPresent("identityCardPlace", values.identityCardPlace);
      appendIfPresent(
        "citizenCardPermanentAddress",
        values.citizenCardPermanentAddress
      );
      appendIfPresent(
        "identityCardDate",
        values.identityCardDate
          ? values.identityCardDate.format("YYYY-MM-DD")
          : null
      );

      if (frontCitizenFile) {
        formData.append("frontCitizenIdFile", frontCitizenFile);
      }
      if (backCitizenFile) {
        formData.append("backCitizenIdFile", backCitizenFile);
      }

      imagesToAdd.forEach((file) => {
        const rawFile = file.originFileObj || file;
        formData.append("imagesToAdd", rawFile);
      });

      imagesToRemove.forEach((url) => {
        formData.append("imagesToRemove", url);
      });

      // Add role-specific fields
      if (user?.role === "GymOwner") {
        appendIfPresent("dob", values.dob ? values.dob.toISOString() : null);
        appendIfPresent("gymDescription", values.gymDescription);
        appendIfPresent(
          "gymFoundationDate",
          values.gymFoundationDate
            ? values.gymFoundationDate.format("YYYY-MM-DD")
            : null
        );
        appendIfPresent("gymName", values.gymName);
        appendIfPresent("taxCode", values.taxCode);
        appendIfPresent(
          "openTime",
          values.openTime ? values.openTime.format("HH:mm:ss") : null
        );
        appendIfPresent(
          "closeTime",
          values.closeTime ? values.closeTime.format("HH:mm:ss") : null
        );
      } else if (user?.role === "FreelancePT") {
        appendIfPresent("fullName", values.fullName);
        appendIfPresent("email", values.email);
        appendIfPresent("phone", values.phone);
        appendIfPresent("gender", values.gender);
        appendIfPresent("bio", values.bio);
        appendIfPresent("dob", values.dob ? values.dob.toISOString() : null);
        appendIfPresent("weight", values.weight || 0);
        appendIfPresent("height", values.height || 0);
        appendIfPresent("ptMaxCourse", values.ptMaxCourse);
        appendIfPresent("ptCurrentCourse", values.ptCurrentCourse);
      }

      await profileService.updateProfile(formData);
      message.success("Cập nhật thông tin thành công!");
      setIsEditMode(false);
      setImagesToAdd([]);
      setImagesToRemove([]);
      setFrontCitizenFile(null);
      setBackCitizenFile(null);
      setFrontPreview(null);
      setBackPreview(null);
      fetchProfile();
    } catch (error) {
      message.error("Không thể cập nhật thông tin");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await profileService.updateAvatar(formData);
      setAvatarUrl(response.data);
      message.success("Tải ảnh đại diện thành công!");
      return false;
    } catch (error) {
      message.error("Không thể tải ảnh lên");
      console.error(error);
      return false;
    }
  };

  const handleCitizenIdUpload = (file, type) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "front") {
        setFrontPreview(e.target.result);
      } else {
        setBackPreview(e.target.result);
      }
    };
    reader.readAsDataURL(file);

    if (type === "front") {
      setFrontCitizenFile(file);
      setFrontCitizenId(null);
    } else {
      setBackCitizenFile(file);
      setBackCitizenId(null);
    }

    message.info("Ảnh sẽ được gửi khi bạn lưu thay đổi");
    return false;
  };

  const handleImagesChange = ({ fileList }) => {
    setImagesToAdd(fileList);
  };

  const toggleRemoveImage = (url) => {
    setImagesToRemove((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const renderImagesSection = () => (
    <Col xs={24}>
      <Card
        type="inner"
        title={<Text strong>Hình ảnh</Text>}
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          background: "#fafafa",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Upload
            listType="picture-card"
            multiple
            accept="image/*"
            fileList={imagesToAdd}
            beforeUpload={() => false}
            onChange={handleImagesChange}
            disabled={!isEditMode}
          >
            {isEditMode && "+ Thêm hình"}
          </Upload>
          <Text type="secondary">
            Ảnh sẽ được tải lên khi bạn lưu thay đổi.
          </Text>
        </div>

        {["FreelancePT", "GymOwner"].includes(user?.role) &&
          existingImages.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Divider orientation="left">
                {user?.role === "FreelancePT"
                  ? "Hình ảnh Freelance PT"
                  : "Hình ảnh phòng tập"}
              </Divider>
              <Row gutter={[16, 16]}>
                {existingImages.map((url) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={url}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt="Hình ảnh"
                          src={url}
                          style={{ height: 180, objectFit: "cover" }}
                        />
                      }
                      actions={
                        isEditMode
                          ? [
                              <span
                                key="remove"
                                style={{
                                  color: imagesToRemove.includes(url)
                                    ? "#ff4d4f"
                                    : "inherit",
                                }}
                                onClick={() => toggleRemoveImage(url)}
                              >
                                {imagesToRemove.includes(url)
                                  ? "Hoàn tác xóa"
                                  : "Xóa hình"}
                              </span>,
                            ]
                          : undefined
                      }
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}
      </Card>
    </Col>
  );

  const renderGymOwnerFields = () => (
    <>
      {/* Representative Information Section */}
      <Col xs={24}>
        <Divider
          orientation="left"
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#1890ff",
            marginTop: "24px",
          }}
        >
          <Space>
            <UserOutlined />
            <span>Thông tin người đại diện</span>
          </Space>
        </Divider>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="fullName"
          label={
            <Text strong>
              <UserOutlined /> Họ và tên
            </Text>
          }
        >
          <Input
            disabled
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập họ và tên"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="email"
          label={
            <Text strong>
              <MailOutlined /> Email
            </Text>
          }
        >
          <Input
            disabled
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập email"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="phone"
          label={
            <Text strong>
              <PhoneOutlined /> Số điện thoại
            </Text>
          }
        >
          <Input
            disabled
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập số điện thoại"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="dob"
          label={
            <Text strong>
              <CalendarOutlined /> Ngày sinh
            </Text>
          }
        >
          <DatePicker
            style={{ width: "100%", borderRadius: "8px" }}
            size="large"
            format="DD/MM/YYYY"
            disabled={!isEditMode}
            placeholder="Chọn ngày sinh"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="citizenIdNumber"
          label={
            <Text strong>
              <IdcardOutlined /> Số CCCD
            </Text>
          }
        >
          <Input
            disabled={!isEditMode}
            maxLength={12}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập số CCCD"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="identityCardDate"
          label={
            <Text strong>
              <CalendarOutlined /> Ngày cấp CCCD
            </Text>
          }
        >
          <DatePicker
            style={{ width: "100%", borderRadius: "8px" }}
            size="large"
            format="DD/MM/YYYY"
            disabled={!isEditMode}
            placeholder="Chọn ngày cấp"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="identityCardPlace"
          label={
            <Text strong>
              <EnvironmentOutlined /> Nơi cấp CCCD
            </Text>
          }
        >
          <Input
            disabled={!isEditMode}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập nơi cấp"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="citizenCardPermanentAddress"
          label={
            <Text strong>
              <HomeOutlined /> Địa chỉ thường trú
            </Text>
          }
        >
          <Input
            disabled={!isEditMode}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập địa chỉ thường trú"
          />
        </Form.Item>
      </Col>

      <Col xs={24}>
        <Card
          type="inner"
          title={
            <Text strong>
              <IdcardOutlined /> Hình ảnh CCCD
            </Text>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            background: "#fafafa",
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <div>
                <Text strong style={{ display: "block", marginBottom: "12px" }}>
                  Mặt trước
                </Text>
                {isEditMode && (
                  <Upload
                    beforeUpload={(file) =>
                      handleCitizenIdUpload(file, "front")
                    }
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      size="large"
                      style={{ borderRadius: "8px", marginBottom: "12px" }}
                    >
                      Tải ảnh mặt trước
                    </Button>
                  </Upload>
                )}
                {(frontPreview || frontCitizenId) && (
                  <div style={{ marginTop: "12px" }}>
                    <img
                      src={frontPreview || frontCitizenId}
                      alt="CCCD mặt trước"
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "auto",
                        opacity: frontPreview ? 0.7 : 1,
                      }}
                    />
                    {frontPreview && (
                      <Text
                        type="secondary"
                        style={{ display: "block", marginTop: "8px" }}
                      >
                        <Spin size="small" /> Đang tải lên...
                      </Text>
                    )}
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div>
                <Text strong style={{ display: "block", marginBottom: "12px" }}>
                  Mặt sau
                </Text>
                {isEditMode && (
                  <Upload
                    beforeUpload={(file) => handleCitizenIdUpload(file, "back")}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      size="large"
                      style={{ borderRadius: "8px", marginBottom: "12px" }}
                    >
                      Tải ảnh mặt sau
                    </Button>
                  </Upload>
                )}
                {(backPreview || backCitizenId) && (
                  <div style={{ marginTop: "12px" }}>
                    <img
                      src={backPreview || backCitizenId}
                      alt="CCCD mặt sau"
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "auto",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        opacity: backPreview ? 0.7 : 1,
                      }}
                    />
                    {backPreview && (
                      <Text
                        type="secondary"
                        style={{ display: "block", marginTop: "8px" }}
                      >
                        <Spin size="small" /> Đang tải lên...
                      </Text>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Gym Information Section */}
      <Col xs={24}>
        <Divider
          orientation="left"
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#1890ff",
            marginTop: "24px",
          }}
        >
          <Space>
            <ShopOutlined />
            <span>Thông tin phòng tập</span>
          </Space>
        </Divider>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="gymName"
          label={
            <Text strong>
              <ShopOutlined /> Tên phòng tập
            </Text>
          }
        >
          <Input
            disabled={!isEditMode}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập tên phòng tập"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="taxCode"
          label={
            <Text strong>
              <FileTextOutlined /> Mã số thuế
            </Text>
          }
        >
          <Input
            disabled={!isEditMode}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập mã số thuế"
          />
        </Form.Item>
      </Col>

      <Col xs={24}>
        <Form.Item
          name="gymDescription"
          label={
            <Text strong>
              <FileTextOutlined /> Mô tả phòng tập
            </Text>
          }
        >
          <TextArea
            rows={4}
            disabled={!isEditMode}
            style={{ borderRadius: "8px" }}
            placeholder="Nhập mô tả về phòng tập"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="gymFoundationDate"
          label={
            <Text strong>
              <CalendarOutlined /> Ngày thành lập
            </Text>
          }
        >
          <DatePicker
            style={{ width: "100%", borderRadius: "8px" }}
            size="large"
            format="DD/MM/YYYY"
            disabled={!isEditMode}
            placeholder="Chọn ngày thành lập"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="businessAddress"
          label={
            <Text strong>
              <EnvironmentOutlined /> Địa chỉ kinh doanh
            </Text>
          }
        >
          <Input
            disabled={!isEditMode}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập địa chỉ kinh doanh"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="openTime"
          label={
            <Text strong>
              <ClockCircleOutlined /> Giờ mở cửa
            </Text>
          }
        >
          <TimePicker
            style={{ width: "100%", borderRadius: "8px" }}
            size="large"
            format="HH:mm"
            disabled={!isEditMode}
            placeholder="Chọn giờ mở cửa"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="closeTime"
          label={
            <Text strong>
              <ClockCircleOutlined /> Giờ đóng cửa
            </Text>
          }
        >
          <TimePicker
            style={{ width: "100%", borderRadius: "8px" }}
            size="large"
            format="HH:mm"
            disabled={!isEditMode}
            placeholder="Chọn giờ đóng cửa"
          />
        </Form.Item>
      </Col>
    </>
  );

  const renderFreelancePTFields = () => (
    <>
      <Col xs={24}>
        <Divider
          orientation="left"
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#1890ff",
            marginTop: "24px",
          }}
        >
          <Space>
            <UserOutlined />
            <span>Thông tin cá nhân</span>
          </Space>
        </Divider>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="fullName"
          label={
            <Text strong>
              <UserOutlined /> Họ và tên
            </Text>
          }
        >
          <Input
            disabled={!(isEditMode && user?.role === "FreelancePT")}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập họ và tên"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="email"
          label={
            <Text strong>
              <MailOutlined /> Email
            </Text>
          }
        >
          <Input
            disabled={!(isEditMode && user?.role === "FreelancePT")}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập email"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="phone"
          label={
            <Text strong>
              <PhoneOutlined /> Số điện thoại
            </Text>
          }
        >
          <Input
            disabled={!(isEditMode && user?.role === "FreelancePT")}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập số điện thoại"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="dob"
          label={
            <Text strong>
              <CalendarOutlined /> Ngày sinh
            </Text>
          }
        >
          <DatePicker
            style={{ width: "100%", borderRadius: "8px" }}
            size="large"
            format="DD/MM/YYYY"
            disabled={!isEditMode}
            placeholder="Chọn ngày sinh"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item name="gender" label={<Text strong>Giới tính</Text>}>
          <Select
            disabled={!(isEditMode && user?.role === "FreelancePT")}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Chọn giới tính"
            options={[
              { label: "Nam", value: "Male" },
              { label: "Nữ", value: "Female" },
            ]}
            suffixIcon={
              profileData?.gender === "Male" ? (
                <ManOutlined />
              ) : (
                <WomanOutlined />
              )
            }
          />
        </Form.Item>
      </Col>

      <Col xs={24}>
        <Divider
          orientation="left"
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#1890ff",
            marginTop: "16px",
          }}
        >
          <Space>
            <CheckCircleOutlined />
            <span>Thông tin huấn luyện</span>
          </Space>
        </Divider>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item name="height" label={<Text strong>Chiều cao</Text>}>
          <Input
            type="number"
            disabled={!isEditMode}
            suffix="cm"
            min={0}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập chiều cao"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item name="weight" label={<Text strong>Cân nặng</Text>}>
          <Input
            type="number"
            disabled={!isEditMode}
            suffix="kg"
            min={0}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập cân nặng"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="ptMaxCourse"
          label={<Text strong>Số học viên tối đa</Text>}
        >
          <Input
            type="number"
            disabled={!isEditMode}
            min={0}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập số học viên tối đa"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="ptCurrentCourse"
          label={<Text strong>Số học viên hiện tại</Text>}
        >
          <Input
            type="number"
            disabled={!isEditMode}
            min={0}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập số học viên hiện tại"
          />
        </Form.Item>
      </Col>

      <Col xs={24}>
        <Form.Item name="bio" label={<Text strong>Giới thiệu bản thân</Text>}>
          <TextArea
            rows={4}
            disabled={!isEditMode}
            style={{ borderRadius: "8px" }}
            placeholder="Chia sẻ đôi nét về bạn"
          />
        </Form.Item>
      </Col>

      <Col xs={24}>
        <Divider
          orientation="left"
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#1890ff",
            marginTop: "24px",
          }}
        >
          <Space>
            <IdcardOutlined />
            <span>Thông tin CCCD</span>
          </Space>
        </Divider>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="citizenIdNumber"
          label={
            <Text strong>
              <IdcardOutlined /> Số CCCD
            </Text>
          }
        >
          <Input
            disabled={!isEditMode}
            maxLength={12}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập số CCCD"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="identityCardDate"
          label={
            <Text strong>
              <CalendarOutlined /> Ngày cấp CCCD
            </Text>
          }
        >
          <DatePicker
            style={{ width: "100%", borderRadius: "8px" }}
            size="large"
            format="DD/MM/YYYY"
            disabled={!isEditMode}
            placeholder="Chọn ngày cấp"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="identityCardPlace"
          label={
            <Text strong>
              <EnvironmentOutlined /> Nơi cấp CCCD
            </Text>
          }
        >
          <Input
            disabled={!isEditMode}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập nơi cấp"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="citizenCardPermanentAddress"
          label={
            <Text strong>
              <HomeOutlined /> Địa chỉ thường trú
            </Text>
          }
        >
          <Input
            disabled={!isEditMode}
            size="large"
            style={{ borderRadius: "8px" }}
            placeholder="Nhập địa chỉ thường trú"
          />
        </Form.Item>
      </Col>

      <Col xs={24} md={12}>
        <Form.Item
          name="businessAddress"
          label={
            <Text strong>
              <EnvironmentOutlined /> Địa chỉ hoạt động
            </Text>
          }
        >
          <Input disabled size="large" style={{ borderRadius: "8px" }} />
        </Form.Item>
      </Col>

      <Col xs={24}>
        <Card
          type="inner"
          title={
            <Text strong>
              <IdcardOutlined /> Hình ảnh CCCD
            </Text>
          }
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            background: "#fafafa",
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <div>
                <Text strong style={{ display: "block", marginBottom: "12px" }}>
                  Mặt trước
                </Text>
                {isEditMode && (
                  <Upload
                    beforeUpload={(file) =>
                      handleCitizenIdUpload(file, "front")
                    }
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      size="large"
                      style={{ borderRadius: "8px", marginBottom: "12px" }}
                    >
                      Tải ảnh mặt trước
                    </Button>
                  </Upload>
                )}
                {(frontPreview || frontCitizenId) && (
                  <div style={{ marginTop: "12px" }}>
                    <img
                      src={frontPreview || frontCitizenId}
                      alt="CCCD mặt trước"
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "auto",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        opacity: frontPreview ? 0.7 : 1,
                      }}
                    />
                    {frontPreview && (
                      <Text
                        type="secondary"
                        style={{ display: "block", marginTop: "8px" }}
                      >
                        <Spin size="small" /> Đang tải lên...
                      </Text>
                    )}
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div>
                <Text strong style={{ display: "block", marginBottom: "12px" }}>
                  Mặt sau
                </Text>
                {isEditMode && (
                  <Upload
                    beforeUpload={(file) => handleCitizenIdUpload(file, "back")}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button
                      icon={<UploadOutlined />}
                      size="large"
                      style={{ borderRadius: "8px", marginBottom: "12px" }}
                    >
                      Tải ảnh mặt sau
                    </Button>
                  </Upload>
                )}
                {(backPreview || backCitizenId) && (
                  <div style={{ marginTop: "12px" }}>
                    <img
                      src={backPreview || backCitizenId}
                      alt="CCCD mặt sau"
                      style={{
                        width: "100%",
                        maxWidth: "400px",
                        height: "auto",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        opacity: backPreview ? 0.7 : 1,
                      }}
                    />
                    {backPreview && (
                      <Text
                        type="secondary"
                        style={{ display: "block", marginTop: "8px" }}
                      >
                        <Spin size="small" /> Đang tải lên...
                      </Text>
                    )}
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Card>
      </Col>
    </>
  );

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      <div>
        <div style={{}}>
          {/* Header Section */}
          <div
            style={{
              marginBottom: "32px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0, marginBottom: "8px" }}>
                Thông tin cá nhân
              </Title>
              <Text type="secondary" style={{ fontSize: "15px" }}>
                Quản lý thông tin cá nhân và cập nhật hồ sơ của bạn
              </Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={isEditMode ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => {
                if (isEditMode) {
                  form.submit();
                } else {
                  setIsEditMode(true);
                }
              }}
              loading={saving}
              style={{
                borderRadius: "8px",
                height: "44px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              {isEditMode ? "Lưu thay đổi" : "Chỉnh sửa"}
            </Button>
          </div>

          {/* Avatar Section */}
          <Card
            style={{
              background: "linear-gradient(135deg, #FF914D 0%, #FF3A50 100%)",
              marginBottom: "32px",
              borderRadius: "12px",
              border: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ position: "relative" }}>
                <Badge
                  count={
                    <div
                      style={{
                        background: "white",
                        borderRadius: "50%",
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <Upload
                        beforeUpload={handleAvatarUpload}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <CameraOutlined
                          style={{ fontSize: "20px", color: "#1890ff" }}
                        />
                      </Upload>
                    </div>
                  }
                  offset={[-8, 100]}
                >
                  <Avatar
                    size={120}
                    src={avatarUrl}
                    icon={!avatarUrl && <UserOutlined />}
                    style={{
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                </Badge>
              </div>
              <div style={{ flex: 1 }}>
                <Title
                  level={3}
                  style={{ color: "white", margin: 0, marginBottom: "8px" }}
                >
                  {profileData?.fullName || "Người dùng"}
                </Title>
                <Space direction="vertical" size={4}>
                  <Text
                    style={{ color: "rgba(255,255,255,0.9)", fontSize: "15px" }}
                  >
                    <MailOutlined /> {profileData?.email}
                  </Text>
                  <div>
                    {profileData?.isActive === "True" ? (
                      <Tag
                        icon={<CheckCircleOutlined />}
                        color="success"
                        style={{ borderRadius: "6px" }}
                      >
                        Đang hoạt động
                      </Tag>
                    ) : (
                      <Tag
                        icon={<CloseCircleOutlined />}
                        color="error"
                        style={{ borderRadius: "6px" }}
                      >
                        Không hoạt động
                      </Tag>
                    )}
                  </div>
                </Space>
              </div>
            </div>
          </Card>

          {/* Form Section */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Row gutter={[24, 8]}>
              {/* Role-specific Fields */}
              {user?.role === "GymOwner" && renderGymOwnerFields()}
              {user?.role === "FreelancePT" && renderFreelancePTFields()}
              {renderImagesSection()}
            </Row>

            {isEditMode && (
              <>
                <Divider style={{ marginTop: "32px", marginBottom: "24px" }} />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                  }}
                >
                  <Button
                    size="large"
                    onClick={() => {
                      setIsEditMode(false);
                      form.resetFields();
                      fetchProfile();
                    }}
                    style={{
                      borderRadius: "8px",
                      height: "44px",
                      paddingLeft: "24px",
                      paddingRight: "24px",
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<SaveOutlined />}
                    loading={saving}
                    style={{
                      borderRadius: "8px",
                      height: "44px",
                      paddingLeft: "24px",
                      paddingRight: "24px",
                    }}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
