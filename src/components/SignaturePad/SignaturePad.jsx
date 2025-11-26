import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button, Modal } from "antd";
import { EditOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";

const SignaturePad = ({ onSave, title = "Chữ ký" }) => {
  const sigPad = useRef(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const clear = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
  };

  const save = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const signatureData = sigPad.current.toDataURL("image/png");
      onSave(signatureData);
      setIsModalVisible(false);
    } else {
      Modal.warning({
        title: "Thông báo",
        content: "Vui lòng ký trước khi lưu!",
      });
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    clear();
  };

  return (
    <>
      <Button type="primary" icon={<EditOutlined />} onClick={showModal}>
        {title}
      </Button>

      <Modal
        title={title}
        open={isModalVisible}
        onCancel={handleCancel}
        width={700}
        footer={[
          <Button key="clear" icon={<DeleteOutlined />} onClick={clear}>
            Xóa
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<CheckOutlined />}
            onClick={save}
          >
            Lưu chữ ký
          </Button>,
        ]}
      >
        <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-2.5 bg-gray-50">
          <SignatureCanvas
            ref={sigPad}
            penColor="black"
            canvasProps={{
              width: 650,
              height: 300,
              className:
                "w-full h-[300px] border border-gray-300 rounded bg-white cursor-crosshair",
            }}
            backgroundColor="white"
          />
        </div>
      </Modal>
    </>
  );
};

export default SignaturePad;
