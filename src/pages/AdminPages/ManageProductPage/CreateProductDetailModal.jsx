import React, { useState } from "react";
import {
  Modal,
  Form,
  Card,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  Input,
  Switch,
  Button,
  Upload,
  Image,
  Divider,
  Space,
} from "antd";
import {
  PlusOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShoppingOutlined,
  DollarOutlined,
  AppstoreOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import FitBridgeModal from "../../../components/FitBridgeModal";
import adminService from "../../../services/adminServices";

const { Option } = Select;

export default function CreateProductDetailModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  weights,
  flavours,
  creating,
  imageFile,
  onImageUpload,
  onImageRemove,
  onRefreshWeights,
  onRefreshFlavours,
}) {
  const [newWeightValue, setNewWeightValue] = useState(null);
  const [newWeightUnit, setNewWeightUnit] = useState("g");
  const [newFlavourName, setNewFlavourName] = useState("");
  const [addingWeight, setAddingWeight] = useState(false);
  const [addingFlavour, setAddingFlavour] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    setNewWeightValue(null);
    setNewWeightUnit("g");
    setNewFlavourName("");
    onClose();
  };

  const handleAddWeight = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Check if value is provided (can be 0, null, undefined, or empty string)
    if (newWeightValue === null || newWeightValue === undefined || newWeightValue === "" || !newWeightUnit || !newWeightUnit.trim()) {
      toast.error("Vui lòng nhập đầy đủ giá trị và đơn vị trọng lượng");
      return;
    }

    const value = typeof newWeightValue === 'number' ? newWeightValue : parseFloat(newWeightValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Giá trị trọng lượng phải là số dương");
      return;
    }

    setAddingWeight(true);
    try {
      const response = await adminService.createWeight({
        value: value,
        unit: newWeightUnit.trim(),
      });
      
      toast.success("Thêm trọng lượng thành công");
      setNewWeightValue(null);
      setNewWeightUnit("Gram");
      
      // Refresh weights list
      if (onRefreshWeights) {
        await onRefreshWeights();
      }
      
      // Set the newly created weight as selected
      if (response.data?.id) {
        form.setFieldsValue({ weightId: response.data.id });
      }
    } catch (error) {
      console.error("Error creating weight:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo trọng lượng");
    } finally {
      setAddingWeight(false);
    }
  };

  const handleAddFlavour = async (e) => {
    e.preventDefault();
    if (!newFlavourName.trim()) {
      toast.error("Vui lòng nhập tên hương vị");
      return;
    }

    setAddingFlavour(true);
    try {
      const response = await adminService.createNewFlavour({
        name: newFlavourName.trim(),
      });
      
      toast.success("Thêm hương vị thành công");
      setNewFlavourName("");
      
      // Refresh flavours list
      if (onRefreshFlavours) {
        await onRefreshFlavours();
      }
      
      // Set the newly created flavour as selected
      if (response.data?.id) {
        form.setFieldsValue({ flavourId: response.data.id });
      }
    } catch (error) {
      console.error("Error creating flavour:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo hương vị");
    } finally {
      setAddingFlavour(false);
    }
  };

  // Disable dates in the past (before today)
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  return (
    <FitBridgeModal
      open={isOpen}
      onCancel={handleCancel}
      title={
        <div className="flex items-center gap-2 text-lg">
          <span>Tạo Lô Hàng Mới</span>
        </div>
      }
      width={900}
      footer={
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button size="large" onClick={handleCancel} className="px-6">
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={creating}
            size="large"
            icon={<CheckCircleOutlined />}
            className="bg-gradient-to-r from-orange-400 to-orange-500 border-0 px-8 shadow-lg hover:shadow-xl"
          >
            Tạo Lô Hàng
          </Button>
        </div>
      }
      className="create-detail-modal"
    >
      <Form
        form={form}
        style={{ overflowY: "scroll", maxHeight: "60vh" }}
        layout="vertical"
        onFinish={onSubmit}
      >
        {/* Basic Info Section */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(to right, #FAF5FF, #FCE7F3)",
            borderColor: "#E9D5FF",
          }}
          title={
            <span style={{ color: "#7E22CE", fontWeight: 600 }}>
              <ShoppingOutlined style={{ marginRight: 8 }} />
              Thông Tin Cơ Bản
            </span>
          }
        >
          <Row gutter={16}>
            <Col span={5}>
              <Form.Item
                label={<span className="font-medium">Hình Ảnh Sản Phẩm</span>}
                name="image"
              >
                <div className="flex flex-col items-center gap-2">
                  {!imageFile ? (
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        onImageUpload(file);
                        return false; // Prevent auto upload
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <UploadOutlined
                          style={{ fontSize: 24 }}
                          className="text-purple-500"
                        />
                        <div style={{ marginTop: 8 }} className="text-sm">
                          Chọn ảnh
                        </div>
                      </div>
                    </Upload>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="border-2 border-purple-200 rounded-lg p-2 bg-white">
                        <Image
                          src={URL.createObjectURL(imageFile)}
                          width={140}
                          height={140}
                          className="object-cover rounded"
                          preview={true}
                        />
                      </div>
                      <div className="text-xs text-center text-green-600">
                        ✓ Đã chọn: {imageFile.name}
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={onImageRemove}
                        className="text-xs"
                      >
                        Xóa ảnh
                      </Button>
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
            <Col span={19}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="font-medium">Trọng Lượng</span>}
                    name="weightId"
                    rules={[
                      { required: true, message: "Vui lòng chọn trọng lượng" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn trọng lượng"
                      showSearch
                      size="large"
                      suffixIcon={
                        <AppstoreOutlined className="text-purple-500" />
                      }
                      dropdownRender={(menu) => (
                        <div onClick={(e) => e.stopPropagation()}>
                          {menu}
                          <Divider style={{ margin: "8px 0" }} />
                          <Space style={{ padding: "0 8px 4px" }} direction="vertical" size="small" className="w-full">
                            <Space size="small" className="w-full">
                              <InputNumber
                                placeholder="Giá trị"
                                value={newWeightValue}
                                onChange={(value) => setNewWeightValue(value ?? null)}
                                min={0}
                                step={1}
                                style={{ width: "100%" }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddWeight(e);
                                  }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onPressEnter={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAddWeight(e);
                                }}
                              />
                              <Select
                                value={newWeightUnit}
                                onChange={setNewWeightUnit}
                                style={{ width: "100%" }}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                getPopupContainer={(triggerNode) => triggerNode.parentElement}
                                options={[
                                  { value: "Gram", label: "g" },
                                  { value: "kg", label: "kg" },
                                  { value: "lb", label: "lb" },
                                  { value: "oz", label: "oz" },
                                ]}
                              />
                              <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddWeight(e);
                                }}
                                loading={addingWeight}
                                className="text-purple-600 hover:text-purple-700"
                              >
                                Thêm
                              </Button>
                            </Space>
                          </Space>
                        </div>
                      )}
                    >
                      {weights.map((weight) => (
                        <Option key={weight.id} value={weight.id}>
                          <span className="font-medium">
                            {weight.value} {weight.unit}
                          </span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="font-medium">Hương Vị</span>}
                    name="flavourId"
                    rules={[
                      { required: true, message: "Vui lòng chọn hương vị" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn hương vị"
                      showSearch
                      size="large"
                      suffixIcon={
                        <AppstoreOutlined className="text-purple-500" />
                      }
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <Divider style={{ margin: "8px 0" }} />
                          <Space style={{ padding: "0 8px 4px" }}>
                            <Input
                              placeholder="Tên hương vị mới"
                              value={newFlavourName}
                              onChange={(e) => setNewFlavourName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddFlavour(e);
                                }
                              }}
                            />
                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              onClick={handleAddFlavour}
                              loading={addingFlavour}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              Thêm
                            </Button>
                          </Space>
                        </>
                      )}
                    >
                      {flavours.map((flavour) => (
                        <Option key={flavour.id} value={flavour.id}>
                          <span className="font-medium">{flavour.name}</span>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="font-medium">Số Lượng</span>}
                    name="quantity"
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng" },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      placeholder="Nhập số lượng"
                      style={{ width: "100%" }}
                      size="large"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="font-medium">Hạn Sử Dụng</span>}
                    name="expirationDate"
                    rules={[
                      { required: true, message: "Vui lòng chọn hạn sử dụng" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD/MM/YYYY"
                      size="large"
                      placeholder="Chọn ngày hết hạn"
                      disabledDate={disabledDate}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* Pricing Section */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(to right, #FFFBEB, #FEF3C7)",
            borderColor: "#FED7AA",
          }}
          title={
            <span style={{ color: "#C2410C", fontWeight: 600 }}>
              <DollarOutlined style={{ marginRight: 8 }} />
              Thông Tin Giá
            </span>
          }
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={<span className="font-medium">Giá Gốc</span>}
                name="originalPrice"
                rules={[{ required: true, message: "Vui lòng nhập giá gốc" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  suffix="₫"
                  style={{ width: "100%" }}
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<span className="font-medium">Giá Hiển Thị</span>}
                name="displayPrice"
                rules={[
                  { required: true, message: "Vui lòng nhập giá hiển thị" },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  style={{ width: "100%" }}
                  size="large"
                  suffix="₫"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<span className="font-medium">Giá Sale</span>}
                name="salePrice"
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  suffix="₫"
                  style={{ width: "100%" }}
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Serving Info Section */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(to right, #F0FDF4, #D1FAE5)",
            borderColor: "#BBF7D0",
          }}
          title={
            <span style={{ color: "#15803D", fontWeight: 600 }}>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              Thông Tin Khẩu Phần & Dinh Dưỡng
            </span>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="font-medium">Kích Thước Khẩu Phần</span>
                }
                name="servingSizeInformation"
              >
                <Input suffix="gram" placeholder="VD: 30g" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="font-medium">Số Lần Dùng Mỗi Hộp</span>}
                name="servingsPerContainerInformation"
              >
                <Input suffix="lần" placeholder="VD: 33 lần" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={<span className="font-medium">Protein</span>}
                name="proteinPerServingGrams"
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  style={{ width: "100%" }}
                  size="large"
                  suffix="gram"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<span className="font-medium">Calories</span>}
                name="caloriesPerServingKcal"
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  style={{ width: "100%" }}
                  size="large"
                  suffix="kcal"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={<span className="font-medium">BCAA</span>}
                name="bcaaPerServingGrams"
              >
                <InputNumber
                  min={0}
                  placeholder="0"
                  style={{ width: "100%" }}
                  size="large"
                  suffix="gram"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Display Status */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(to right, #F9FAFB, #F1F5F9)",
            borderColor: "#E5E7EB",
          }}
        >
          <Form.Item
            label={
              <span className="font-medium text-base">Trạng Thái Hiển Thị</span>
            }
            name="isDisplayed"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren={
                <span className="flex items-center gap-1">
                  <CheckCircleOutlined /> Hiển thị
                </span>
              }
              unCheckedChildren={
                <span className="flex items-center gap-1">
                  <StopOutlined /> Ẩn
                </span>
              }
              size="default"
            />
          </Form.Item>
        </Card>
      </Form>
    </FitBridgeModal>
  );
}
