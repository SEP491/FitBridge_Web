import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Switch, Row, Col, Card, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined, GiftOutlined, DeleteOutlined } from '@ant-design/icons';
import FitBridgeModal from '../FitBridgeModal';

/**
 * FitBridgeModal Usage Examples
 * This component demonstrates various ways to use the FitBridgeModal component
 */
const FitBridgeModalExamples = () => {
  const [modalStates, setModalStates] = useState({
    add: false,
    edit: false,
    detail: false,
    confirm: false,
    large: false,
  });

  const [form] = Form.useForm();

  const openModal = (type) => {
    setModalStates(prev => ({ ...prev, [type]: true }));
  };

  const closeModal = (type) => {
    setModalStates(prev => ({ ...prev, [type]: false }));
    if (type === 'add' || type === 'edit') {
      form.resetFields();
    }
  };

  const handleSubmit = (values) => {
    console.log('Form values:', values);
    // Handle form submission here
    closeModal('add');
    closeModal('edit');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">FitBridgeModal Examples</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => openModal('add')}
          className="h-12"
        >
          Add Modal
        </Button>
        
        <Button 
          icon={<EditOutlined />}
          onClick={() => openModal('edit')}
          className="h-12"
        >
          Edit Modal
        </Button>
        
        <Button 
          icon={<EyeOutlined />}
          onClick={() => openModal('detail')}
          className="h-12"
        >
          Detail Modal
        </Button>
        
        <Button 
          icon={<DeleteOutlined />}
          onClick={() => openModal('confirm')}
          danger
          className="h-12"
        >
          Confirm Modal
        </Button>
        
        <Button 
          icon={<GiftOutlined />}
          onClick={() => openModal('large')}
          className="h-12"
        >
          Large Modal
        </Button>
      </div>

      {/* Add Modal Example */}
      <FitBridgeModal
        open={modalStates.add}
        onCancel={() => closeModal('add')}
        title="Add New Item"
        titleIcon={<PlusOutlined />}
        width={600}
        logoSize="medium"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="pt-4"
        >
          <Form.Item
            label="Item Name"
            name="name"
            rules={[{ required: true, message: 'Please input item name!' }]}
          >
            <Input placeholder="Enter item name" />
          </Form.Item>
          
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: 'Please input price!' }]}
          >
            <InputNumber
              className="w-full"
              placeholder="Enter price"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea 
              placeholder="Enter description"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          
          <Form.Item
            label="Active Status"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => closeModal('add')}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="bg-gradient-to-r from-orange-500 to-red-500"
            >
              Create Item
            </Button>
          </div>
        </Form>
      </FitBridgeModal>

      {/* Edit Modal Example */}
      <FitBridgeModal
        open={modalStates.edit}
        onCancel={() => closeModal('edit')}
        title="Edit Item"
        titleIcon={<EditOutlined />}
        titleColor="#52c41a"
        width={600}
        logoSize="medium"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="pt-4"
          initialValues={{
            name: "Sample Item",
            price: 150000,
            description: "This is a sample item for editing",
            isActive: true
          }}
        >
          <Form.Item
            label="Item Name"
            name="name"
            rules={[{ required: true, message: 'Please input item name!' }]}
          >
            <Input placeholder="Enter item name" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Price"
                name="price"
                rules={[{ required: true, message: 'Please input price!' }]}
              >
                <InputNumber
                  className="w-full"
                  placeholder="Enter price"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Active Status"
                name="isActive"
                valuePropName="checked"
              >
                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea 
              placeholder="Enter description"
              autoSize={{ minRows: 3, maxRows: 5 }}
            />
          </Form.Item>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => closeModal('edit')}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className="bg-gradient-to-r from-green-500 to-green-600"
            >
              Update Item
            </Button>
          </div>
        </Form>
      </FitBridgeModal>

      {/* Detail Modal Example */}
      <FitBridgeModal
        open={modalStates.detail}
        onCancel={() => closeModal('detail')}
        title="Item Details"
        titleIcon={<EyeOutlined />}
        width={700}
        logoSize="large"
      >
        <div className="pt-4">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Item Name"
                      value="Premium Package"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Price"
                      value={500000}
                      formatter={(value) => `${value?.toLocaleString('vi')}₫`}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Status"
                      value="Active"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Description">
                <p>This is a detailed description of the premium package. It includes all the features and benefits that customers will receive when they purchase this package.</p>
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Additional Information">
                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>Created:</strong> October 4, 2025</p>
                    <p><strong>Last Updated:</strong> October 4, 2025</p>
                  </Col>
                  <Col span={12}>
                    <p><strong>Category:</strong> Premium</p>
                    <p><strong>Availability:</strong> In Stock</p>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </FitBridgeModal>

      {/* Confirmation Modal Example */}
      <FitBridgeModal
        open={modalStates.confirm}
        onCancel={() => closeModal('confirm')}
        title="Confirm Deletion"
        titleIcon={<DeleteOutlined />}
        titleColor="#ff4d4f"
        width={500}
        logoSize="small"
      >
        <div className="pt-4 text-center">
          <div className="mb-6">
            <DeleteOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
          </div>
          <h3 className="text-lg font-semibold mb-4">Are you sure you want to delete this item?</h3>
          <p className="text-gray-600 mb-6">This action cannot be undone. The item will be permanently removed.</p>
          
          <div className="flex justify-center gap-3">
            <Button onClick={() => closeModal('confirm')}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              danger
              onClick={() => {
                console.log('Item deleted');
                closeModal('confirm');
              }}
            >
              Delete Item
            </Button>
          </div>
        </div>
      </FitBridgeModal>

      {/* Large Modal Example */}
      <FitBridgeModal
        open={modalStates.large}
        onCancel={() => closeModal('large')}
        title="Comprehensive Data Management"
        titleIcon={<GiftOutlined />}
        width={1000}
        logoSize="large"
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        <div className="pt-4">
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <Card title="Section 1" size="small">
                <Form layout="vertical">
                  <Form.Item label="Field 1">
                    <Input placeholder="Enter value" />
                  </Form.Item>
                  <Form.Item label="Field 2">
                    <InputNumber className="w-full" placeholder="Enter number" />
                  </Form.Item>
                  <Form.Item label="Field 3">
                    <Input.TextArea placeholder="Enter description" />
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Section 2" size="small">
                <Form layout="vertical">
                  <Form.Item label="Option 1">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="Option 2">
                    <Switch defaultChecked />
                  </Form.Item>
                  <Form.Item label="Comments">
                    <Input.TextArea placeholder="Additional comments" />
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            <Col span={24}>
              <Card title="Statistics Overview" size="small">
                <Row gutter={16}>
                  <Col span={6}>
                    <Statistic title="Total Items" value={1234} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Active" value={1000} valueStyle={{ color: '#52c41a' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Inactive" value={234} valueStyle={{ color: '#ff4d4f' }} />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Revenue" value={15000000} formatter={(value) => `${value?.toLocaleString('vi')}₫`} />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          
          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button onClick={() => closeModal('large')}>
              Cancel
            </Button>
            <Button type="primary">
              Save Changes
            </Button>
          </div>
        </div>
      </FitBridgeModal>
    </div>
  );
};

export default FitBridgeModalExamples;