import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Card,
  Row,
  Col,
} from "antd";
import {
  FormOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TagOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";

const { Option } = Select;

export default function UpdateProductModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  brands,
  mainCategories,
  filteredSubCategories,
  selectedCategoryId,
  onRefreshSubCategories,
  updating,
}) {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 text-lg">
          <FormOutlined className="text-orange-500" />
          <span>Cập Nhật Sản Phẩm</span>
        </div>
      }
      width={800}
      footer={null}
      className="update-product-modal"
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {/* Basic Info Section */}
        <Card
          size="small"
          className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
          title={
            <span className="text-blue-700 font-semibold">
              <ShoppingOutlined className="mr-2" />
              Thông Tin Cơ Bản
            </span>
          }
        >
          <Form.Item
            label={<span className="font-medium">Tên Sản Phẩm</span>}
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên sản phẩm" },
            ]}
          >
            <Input placeholder="Nhập tên sản phẩm" size="large" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium">Mô Tả</span>}
            name="description"
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập mô tả sản phẩm"
              className="text-base"
            />
          </Form.Item>
        </Card>

        {/* Category & Brand Section */}
        <Card
          size="small"
          className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
          title={
            <span className="text-purple-700 font-semibold">
              <AppstoreOutlined className="mr-2" />
              Phân Loại
            </span>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="font-medium">Thương Hiệu</span>}
                name="brandId"
                rules={[
                  { required: true, message: "Vui lòng chọn thương hiệu" },
                ]}
              >
                <Select
                  placeholder="Chọn thương hiệu"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                  suffixIcon={
                    <AppstoreOutlined className="text-purple-500" />
                  }
                >
                  {brands.map((brand) => (
                    <Option key={brand.id} value={brand.id}>
                      <span className="font-medium">{brand.name}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="font-medium">Danh Mục Chính</span>}
                name="categoryId"
                rules={[
                  { required: true, message: "Vui lòng chọn danh mục chính" },
                ]}
              >
                <Select
                  placeholder="Chọn danh mục chính"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                  suffixIcon={
                    <AppstoreOutlined className="text-purple-500" />
                  }
                  onChange={(value) => {
                    if (onRefreshSubCategories) {
                      onRefreshSubCategories(value);
                    }
                    form.setFieldsValue({ subCategoryId: undefined });
                  }}
                >
                  {mainCategories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      <span className="font-medium">{category.name}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<span className="font-medium">Danh Mục Phụ</span>}
                name="subCategoryId"
                rules={[
                  { required: true, message: "Vui lòng chọn danh mục phụ" },
                ]}
              >
                <Select
                  placeholder="Chọn danh mục phụ"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                  suffixIcon={
                    <AppstoreOutlined className="text-purple-500" />
                  }
                  disabled={!selectedCategoryId}
                >
                  {filteredSubCategories.map((subCat) => (
                    <Option key={subCat.id} value={subCat.id}>
                      <span className="font-medium">{subCat.name}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Origin & Protein Section */}
        <Card
          size="small"
          className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          title={
            <span className="text-green-700 font-semibold">
              <TagOutlined className="mr-2" />
              Nguồn Gốc & Thành Phần
            </span>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="font-medium">Xuất Xứ</span>}
                name="countryOfOrigin"
              >
                <Input placeholder="Nhập quốc gia xuất xứ" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="font-medium">Nguồn Protein</span>}
                name="proteinSources"
              >
                <Input placeholder="VD: Whey, Casein" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Display Status Section */}
        <Card
          size="small"
          className="mb-4 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200"
        >
          <Form.Item
            label={
              <span className="font-medium text-base">
                Trạng Thái Hiển Thị
              </span>
            }
            name="isDisplayed"
            valuePropName="checked"
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
            <Button
              size="large"
              onClick={onClose}
              className="px-6"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updating}
              size="large"
              icon={<CheckCircleOutlined />}
              className="bg-gradient-to-r from-orange-400 to-orange-500 border-0 px-8 shadow-lg hover:shadow-xl"
            >
              Cập Nhật
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
