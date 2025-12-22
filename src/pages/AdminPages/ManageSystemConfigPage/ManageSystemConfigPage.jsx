import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FitBridgeModal from "../../../components/FitBridgeModal";
import {
  LoadingOutlined,
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import systemconfigService from "../../../services/systemconfigService";

const { TextArea } = Input;

export default function ManageSystemConfigPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const dataTypeOptions = [
    { label: "String", value: "String" },
    { label: "Int", value: "Int" },
    { label: "Decimal", value: "Decimal" },
    { label: "Double", value: "Double" },
    { label: "Boolean", value: "Boolean" },
  ];

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const response = await systemconfigService.getSystemConfigs();
      if (response.status === "200" && response.data) {
        setConfigs(response.data);
      }
    } catch (error) {
      console.error("Error fetching system configs:", error);
      toast.error(
        error.response?.data?.message ||
          "Lỗi khi tải danh sách cấu hình hệ thống"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleAddConfig = async (values) => {
    setLoadingAdd(true);

    const requestData = {
      key: values.key,
      value: values.value?.toString() || "",
      description: values.description || "",
      dataType: values.dataType,
    };

    try {
      await systemconfigService.createSystemConfig(requestData);
      toast.success("Thêm cấu hình hệ thống thành công");
      fetchConfigs();
      setIsModalAddOpen(false);
      formAdd.resetFields();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi thêm cấu hình hệ thống thất bại"
      );
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleEditConfig = async (values) => {
    setLoadingEdit(true);

    const requestData = {
      key: values.key,
      value: values.value?.toString() || "",
      description: values.description || "",
      dataType: values.dataType,
    };

    try {
      await systemconfigService.updateSystemConfig(
        selectedConfig.id,
        requestData
      );
      toast.success("Cập nhật cấu hình hệ thống thành công");
      fetchConfigs();
      setIsModalEditOpen(false);
      formEdit.resetFields();
      setSelectedConfig(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Lỗi cập nhật cấu hình hệ thống thất bại"
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  const getDataTypeColor = (dataType) => {
    const colors = {
      String: "blue",
      Int: "green",
      Decimal: "orange",
      Double: "purple",
      Boolean: "red",
    };
    return colors[dataType] || "default";
  };

  const renderValueInput = (dataType) => {
    switch (dataType) {
      case "Int":
        return (
          <Form.Item
            name="value"
            rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
          >
            <InputNumber
              placeholder="Nhập số nguyên"
              className="!w-full rounded-lg"
              min={0}
            />
          </Form.Item>
        );
      case "Decimal":
      case "Double":
        return (
          <Form.Item
            name="value"
            rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
          >
            <InputNumber
              placeholder="Nhập số thập phân"
              className="!w-full rounded-lg"
              min={0}
              step={0.01}
              precision={2}
            />
          </Form.Item>
        );
      case "Boolean":
        return (
          <Form.Item
            name="value"
            rules={[{ required: true, message: "Vui lòng chọn giá trị" }]}
            valuePropName="checked"
            getValueFromEvent={(checked) => checked.toString()}
            getValueProps={(value) => ({ checked: value === "true" })}
          >
            <Switch checkedChildren="True" unCheckedChildren="False" />
          </Form.Item>
        );
      default:
        return (
          <Form.Item
            name="value"
            rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
          >
            <Input placeholder="Nhập giá trị" className="!w-full rounded-lg" />
          </Form.Item>
        );
    }
  };

  const columns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      align: "left",
      render: (text) => <div className="font-medium text-gray-900">{text}</div>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      align: "center",
      render: (value) => (
        <div className="text-sm font-medium text-gray-700">{value}</div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "left",
      render: (text) => (
        <div className="text-sm text-gray-600 max-w-md">{text}</div>
      ),
    },
    {
      title: "Data Type",
      dataIndex: "dataType",
      key: "dataType",
      align: "center",
      render: (dataType) => (
        <Tag color={getDataTypeColor(dataType)} className="px-3 py-1">
          {dataType}
        </Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      align: "center",
      width: 120,
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-orange-600 hover:bg-orange-50"
              onClick={() => {
                setSelectedConfig(record);
                formEdit.setFieldsValue({
                  key: record.key,
                  value:
                    record.dataType === "Boolean"
                      ? record.value === "true"
                      : record.dataType === "Int" ||
                        record.dataType === "Decimal" ||
                        record.dataType === "Double"
                      ? parseFloat(record.value)
                      : record.value,
                  description: record.description,
                  dataType: record.dataType,
                });
                setIsModalEditOpen(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = configs.filter((item) => {
    const matchesSearch = searchText
      ? item.key?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.value
          ?.toString()
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesSearch;
  });

  if (loading && configs.length === 0) {
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] mb-2 flex items-center gap-2">
          <SettingOutlined />
          Quản Lý Cấu Hình Hệ Thống
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi các cấu hình hệ thống
        </p>
      </div>

      <div className="">
        {/* Main Content Card */}
        <Card className="border-0 shadow-lg">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Tìm kiếm theo key, value, description..."
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
                className="rounded-lg"
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalAddOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 rounded-lg"
            >
              Thêm Cấu Hình
            </Button>
          </div>

          {/* Results Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-orange-600">
                {filteredData.length}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{configs.length}</span> cấu hình
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
            </span>
          </div>

          {/* Table */}
          <ConfigProvider
            theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
          >
            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} mục`,
                position: ["bottomCenter"],
                className: "custom-pagination",
              }}
              className="rounded-lg overflow-hidden"
              scroll={{ x: 1200 }}
              rowKey="id"
              loading={loading}
              size="middle"
            />
          </ConfigProvider>
        </Card>
      </div>

      {/* Add Config Modal */}
      <FitBridgeModal
        open={isModalAddOpen}
        onCancel={() => {
          setIsModalAddOpen(false);
          formAdd.resetFields();
        }}
        title="Thêm Cấu Hình Mới"
        titleIcon={<SettingOutlined />}
        width={600}
        logoSize="medium"
        bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button
              onClick={() => {
                setIsModalAddOpen(false);
                formAdd.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={loadingAdd}
              onClick={() => formAdd.submit()}
              className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
            >
              Thêm Cấu Hình
            </Button>
          </div>
        }
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddConfig}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-5"
        >
          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">Key</p>}
            name="key"
            rules={[{ required: true, message: "Vui lòng nhập key" }]}
          >
            <Input
              placeholder="Nhập key (ví dụ: ProfitDistributionDays)"
              className="!w-full rounded-lg"
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Data Type</p>
            }
            name="dataType"
            rules={[{ required: true, message: "Vui lòng chọn data type" }]}
          >
            <Select
              placeholder="Chọn data type"
              className="!w-full rounded-lg"
              options={dataTypeOptions}
              onChange={() => {
                formAdd.setFieldValue("value", undefined);
              }}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.dataType !== currentValues.dataType
            }
          >
            {({ getFieldValue }) => {
              const dataType = getFieldValue("dataType");
              return (
                <Form.Item
                  label={
                    <p className="text-xl font-bold text-[#ED2A46]">Value</p>
                  }
                >
                  {renderValueInput(dataType)}
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Description</p>
            }
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập description" }]}
          >
            <TextArea
              placeholder="Nhập mô tả"
              rows={4}
              className="!w-full rounded-lg"
            />
          </Form.Item>
        </Form>
      </FitBridgeModal>

      {/* Edit Config Modal */}
      <FitBridgeModal
        open={isModalEditOpen}
        onCancel={() => {
          setIsModalEditOpen(false);
          formEdit.resetFields();
          setSelectedConfig(null);
        }}
        title="Chỉnh Sửa Cấu Hình"
        titleIcon={<SettingOutlined />}
        width={600}
        logoSize="medium"
        bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button
              onClick={() => {
                setIsModalEditOpen(false);
                formEdit.resetFields();
                setSelectedConfig(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={loadingEdit}
              onClick={() => formEdit.submit()}
              className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
            >
              Cập Nhật Cấu Hình
            </Button>
          </div>
        }
      >
        <Form
          form={formEdit}
          layout="vertical"
          requiredMark={false}
          onFinish={handleEditConfig}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-5"
        >
          <Form.Item
            label={<p className="text-xl font-bold text-[#ED2A46]">Key</p>}
            name="key"
            rules={[{ required: true, message: "Vui lòng nhập key" }]}
          >
            <Input
              placeholder="Nhập key"
              className="!w-full rounded-lg"
              disabled
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Data Type</p>
            }
            name="dataType"
            rules={[{ required: true, message: "Vui lòng chọn data type" }]}
          >
            <Select
              placeholder="Chọn data type"
              className="!w-full rounded-lg"
              options={dataTypeOptions}
              disabled
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.dataType !== currentValues.dataType
            }
          >
            {({ getFieldValue }) => {
              const dataType = getFieldValue("dataType");
              return (
                <Form.Item
                  label={
                    <p className="text-xl font-bold text-[#ED2A46]">Value</p>
                  }
                >
                  {renderValueInput(dataType)}
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Description</p>
            }
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập description" }]}
          >
            <TextArea
              placeholder="Nhập mô tả"
              rows={4}
              className="!w-full rounded-lg"
            />
          </Form.Item>
        </Form>
      </FitBridgeModal>
    </div>
  );
}
