import React from "react";
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

const { Option } = Select;

export default function CreateProductDetailModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  weights,
  flavours,
  creating,
  imageUrl,
  onImageUpload,
  onImageRemove,
}) {
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Disable dates in the past (before today)
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      title={
        <div className="flex items-center gap-2 text-lg">
          <PlusOutlined className="text-orange-500" />
          <span>Tạo Lô Hàng Mới</span>
        </div>
      }
      width={900}
      footer={null}
      className="create-detail-modal"
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
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
                required
              >
                <div className="flex flex-col items-center gap-2">
                  {!imageUrl ? (
                    <Upload
                      action="https://api-fitbridge.srv840734.hstgr.cloud/api/v1/uploads"
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      showUploadList={false}
                      onChange={(info) => {
                        if (info.file.status === 'uploading') {
                          // Optional: Handle uploading state
                          console.log('Uploading:', info.file);
                        }
                        if (info.file.status === 'done') {
                          // Get the image URL from response
                          const imageUrl = info.file.response?.data || info.file.response;
                          onImageUpload(imageUrl);
                        }
                        if (info.file.status === 'error') {
                          console.error('Upload error:', info.file.error);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <UploadOutlined
                          style={{ fontSize: 24 }}
                          className="text-purple-500"
                        />
                        <div style={{ marginTop: 8 }} className="text-sm">
                          Tải ảnh lên
                        </div>
                      </div>
                    </Upload>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="border-2 border-purple-200 rounded-lg p-2 bg-white">
                        <Image
                          src={imageUrl}
                          width={140}
                          height={140}
                          className="object-cover rounded"
                          preview={true}
                        />
                      </div>
                      <div className="text-xs text-center text-green-600">
                        ✓ Đã tải lên
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

        {/* Action Buttons */}
        <Form.Item className="mb-0">
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button size="large" onClick={handleCancel} className="px-6">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating}
              size="large"
              icon={<CheckCircleOutlined />}
              className="bg-gradient-to-r from-orange-400 to-orange-500 border-0 px-8 shadow-lg hover:shadow-xl"
            >
              Tạo Lô Hàng
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
