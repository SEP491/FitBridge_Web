import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Space,
  Tag,
  InputNumber,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import contractService from "../../../services/contractService";
import ContractTemplate from "../../../components/ContractTemplate/ContractTemplate";
import SignaturePad from "../../../components/SignaturePad/SignaturePad";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const ManageContractPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [previewContract, setPreviewContract] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [adminSignature, setAdminSignature] = useState(null);
  const [signing, setSigning] = useState(false);
  const [form] = Form.useForm();
  const contractRef = useRef();

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await contractService.getAllContracts();
      setContracts(response.data?.items || []);
    } catch (error) {
      message.error("Không thể tải danh sách hợp đồng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        customerId: values.customerId,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        fullName: values.gymOwnerName,
        identityCardNumber: values.identityCardNumber || "",
        identityCardDate: values.identityCardDate
          ? values.identityCardDate.format("YYYY-MM-DD")
          : values.startDate.format("YYYY-MM-DD"),
        identityCardPlace: values.identityCardPlace || "",
        permanentAddress: values.gymAddress,
        phoneNumber: values.gymOwnerPhone,
        taxCode: values.taxCode || "",
      };

      await contractService.createContract(payload);
      message.success("Tạo hợp đồng thành công!");
      fetchContracts();

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Không thể tạo hợp đồng");
      console.error(error);
    }
  };

  const handleViewPDF = async (contract) => {
    if (contract.contractUrl || contract.pdfFileId) {
      try {
        const url = contract.contractUrl || contract.pdfFileId;
        window.open(url, "_blank");
      } catch (error) {
        message.error("Không thể xem hợp đồng");
        console.error("View PDF error:", error);
      }
    } else {
      // Nếu chưa có PDF, hiển thị preview modal
      handlePreviewContract(contract);
    }
  };

  const handlePreviewContract = (contract) => {
    setPreviewContract(contract);
    setIsPreviewVisible(true);
  };

  const handleOpenSignatureModal = (contract) => {
    setSelectedContract(contract);
    setAdminSignature(contract.companySignatureUrl || null);
    setIsSignatureModalVisible(true);
  };

  const handleAdminSignatureSave = (signatureData) => {
    setAdminSignature(signatureData);
    message.success("Đã lưu chữ ký");
  };

  // Helper function to convert base64 to Blob
  const base64ToBlob = (base64String) => {
    const parts = base64String.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  const handleSignAsAdmin = async () => {
    if (!adminSignature) {
      message.warning("Vui lòng ký vào hợp đồng trước!");
      return;
    }

    setSigning(true);
    try {
      // Convert base64 signature to Blob
      const signatureBlob = base64ToBlob(adminSignature);

      // Prepare FormData - PUT /api/v1/contracts
      const formData = new FormData();
      formData.append("contractId", selectedContract.id);
      formData.append(
        "companySignatureUrl",
        signatureBlob,
        `admin_signature_${selectedContract.id}.png`
      );

      // Call API to update contract
      await contractService.updateContract(formData);

      message.success("Ký hợp đồng thành công!");
      setIsSignatureModalVisible(false);
      setAdminSignature(null);
      setSelectedContract(null);
      fetchContracts();
    } catch (error) {
      message.error("Không thể ký hợp đồng. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadPreviewPDF = async () => {
    if (!contractRef.current || !previewContract) return;

    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`hop_dong_${previewContract.contractNumber || "preview"}.pdf`);
      message.success("Tải xuống thành công!");
    } catch (error) {
      message.error("Không thể tải xuống hợp đồng");
      console.error("Download preview error:", error);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      Created: { color: "blue", text: "Đã tạo" },
      CompanySigned: { color: "orange", text: "Công ty đã ký" },
      CustomerSigned: { color: "cyan", text: "Khách hàng đã ký" },
      BothSigned: { color: "green", text: "Đã ký đầy đủ" },
      Finished: { color: "purple", text: "Hoàn tất" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "ID Hợp đồng",
      dataIndex: "id",
      key: "id",
      render: (id) => id.substring(0, 15) + "...",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Loại hợp đồng",
      dataIndex: "contractType",
      key: "contractType",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Hoa hồng (%)",
      dataIndex: "commissionPercentage",
      key: "commissionPercentage",
      render: (value) => `${value}%`,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "contractStatus",
      key: "contractStatus",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewPDF(record)}
          >
            Xem
          </Button>
          {record.contractStatus === "Created" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenSignatureModal(record)}
            >
              Ký
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-5 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold m-0">Quản lý hợp đồng</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateContract}
        >
          Tạo hợp đồng mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contracts}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1500 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} hợp đồng`,
        }}
      />

      <Modal
        title="Tạo hợp đồng mới"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
        okText="Tạo hợp đồng"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="customerId"
            label="Customer ID (Gym Owner ID)"
            rules={[{ required: true, message: "Vui lòng nhập Customer ID" }]}
          >
            <Input placeholder="Nhập Customer ID của Gym Owner" />
          </Form.Item>

          <Form.Item
            name="gymOwnerName"
            label="Tên chủ sở hữu (Full Name)"
            rules={[
              { required: true, message: "Vui lòng nhập tên chủ sở hữu" },
            ]}
          >
            <Input placeholder="Nhập tên chủ sở hữu" />
          </Form.Item>

          <Form.Item name="identityCardNumber" label="Số CMND/CCCD">
            <Input placeholder="Nhập số CMND/CCCD" />
          </Form.Item>

          <Form.Item name="identityCardDate" label="Ngày cấp CMND/CCCD">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item name="identityCardPlace" label="Nơi cấp CMND/CCCD">
            <Input placeholder="Nhập nơi cấp" />
          </Form.Item>

          <Form.Item
            name="gymOwnerPhone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="gymAddress"
            label="Địa chỉ thường trú (Permanent Address)"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
          >
            <TextArea rows={2} placeholder="Nhập địa chỉ thường trú" />
          </Form.Item>

          <Form.Item name="taxCode" label="Mã số thuế">
            <Input placeholder="Nhập mã số thuế (nếu có)" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Xem trước hợp đồng"
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setIsPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPreviewPDF}
          >
            Tải xuống PDF
          </Button>,
        ]}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {previewContract && (
            <ContractTemplate
              ref={contractRef}
              contractData={previewContract}
              signature={null}
            />
          )}
        </div>
      </Modal>

      {/* Admin Signature Modal */}
      <Modal
        title="Ký hợp đồng (Admin)"
        open={isSignatureModalVisible}
        onCancel={() => {
          setIsSignatureModalVisible(false);
          setAdminSignature(null);
          setSelectedContract(null);
        }}
        width={900}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsSignatureModalVisible(false);
              setAdminSignature(null);
              setSelectedContract(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="sign"
            type="primary"
            loading={signing}
            onClick={handleSignAsAdmin}
            disabled={!adminSignature}
          >
            Xác nhận ký
          </Button>,
        ]}
      >
        <div className="mb-5">
          {selectedContract && (
            <div>
              <p>
                <strong>Hợp đồng:</strong>{" "}
                {selectedContract.id?.substring(0, 15)}...
              </p>
              <p>
                <strong>Khách hàng:</strong> {selectedContract.fullName}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {getStatusTag(selectedContract.contractStatus)}
              </p>
            </div>
          )}
        </div>

        <div className="mb-5">
          <SignaturePad
            onSave={handleAdminSignatureSave}
            title="Chữ ký của Admin"
          />
        </div>

        {adminSignature && (
          <div className="mt-5 text-center">
            <p className="font-semibold mb-2">Xem trước chữ ký:</p>
            <img
              src={adminSignature}
              alt="Admin Signature Preview"
              className="max-w-md border border-gray-300 rounded p-2 inline-block"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageContractPage;
