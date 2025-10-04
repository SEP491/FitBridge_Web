# FitBridgeModal Component

A reusable modal component with FitBridge branding that extends Ant Design's Modal with consistent styling and company logo.

## Features

- ✅ FitBridge logo in header
- ✅ Consistent brand styling
- ✅ Customizable title with icons
- ✅ Multiple logo sizes
- ✅ Custom scrollbar styling
- ✅ Blur backdrop effect
- ✅ Easy to maintain and extend
- ✅ All Ant Design Modal props supported

## Import

```javascript
import FitBridgeModal from '../../../components/FitBridgeModal';
// or
import { FitBridgeModal } from '../../../components/FitBridgeModal';
```

## Basic Usage

```javascript
<FitBridgeModal
  open={isModalOpen}
  onCancel={() => setIsModalOpen(false)}
  title="Modal Title"
>
  <p>Your modal content here</p>
</FitBridgeModal>
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | boolean | false | Whether the modal is visible |
| `onCancel` | function | - | Callback when modal is closed |
| `title` | string/ReactNode | - | Modal title text |
| `children` | ReactNode | - | Modal content |

### Styling Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `titleIcon` | ReactNode | - | Icon to display next to title |
| `titleColor` | string | "#ED2A46" | Color of the title text |
| `logoSize` | "small" \| "medium" \| "large" | "small" | Size of the FitBridge logo |
| `width` | number | 600 | Modal width in pixels |
| `centered` | boolean | true | Whether to center the modal |

### Advanced Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `footer` | ReactNode | null | Custom footer content |
| `closable` | boolean | true | Whether to show close button |
| `maskClosable` | boolean | true | Whether clicking mask closes modal |
| `className` | string | "" | Additional CSS class |
| `bodyStyle` | object | {} | Custom body styles |
| `headerStyle` | object | {} | Custom header styles |

## Examples

### Basic Modal
```javascript
<FitBridgeModal
  open={isOpen}
  onCancel={() => setIsOpen(false)}
  title="Simple Modal"
>
  <p>This is a basic modal with FitBridge branding.</p>
</FitBridgeModal>
```

### Modal with Icon and Custom Size
```javascript
import { PlusOutlined } from '@ant-design/icons';

<FitBridgeModal
  open={isAddModalOpen}
  onCancel={() => setIsAddModalOpen(false)}
  title="Add New Item"
  titleIcon={<PlusOutlined />}
  width={800}
  logoSize="medium"
>
  <Form>
    {/* Your form content */}
  </Form>
</FitBridgeModal>
```

### Detail Modal
```javascript
import { EyeOutlined } from '@ant-design/icons';

<FitBridgeModal
  open={isDetailModalOpen}
  onCancel={() => setIsDetailModalOpen(false)}
  title="Item Details"
  titleIcon={<EyeOutlined />}
  width={700}
  logoSize="large"
>
  <div>
    {/* Your detail content */}
  </div>
</FitBridgeModal>
```

### Edit Modal
```javascript
import { EditOutlined } from '@ant-design/icons';

<FitBridgeModal
  open={isEditModalOpen}
  onCancel={() => setIsEditModalOpen(false)}
  title="Edit Item"
  titleIcon={<EditOutlined />}
  titleColor="#52c41a"
  logoSize="medium"
>
  <Form onFinish={handleEdit}>
    {/* Your edit form */}
  </Form>
</FitBridgeModal>
```

### Custom Footer
```javascript
<FitBridgeModal
  open={isModalOpen}
  onCancel={() => setIsModalOpen(false)}
  title="Custom Footer Modal"
  footer={
    <div className="text-center">
      <Button onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button type="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </div>
  }
>
  <p>Modal with custom footer</p>
</FitBridgeModal>
```

## Logo Sizes

- **small**: 32x32px (default)
- **medium**: 48x48px
- **large**: 64x64px

## Styling

The component includes custom CSS for:
- Header gradient background
- Custom scrollbar with FitBridge colors
- Blur backdrop effect
- Rounded corners and shadows
- Hover effects on close button

## Migration from Ant Design Modal

Replace your existing Modal imports and usage:

**Before:**
```javascript
import { Modal } from 'antd';

<Modal
  open={open}
  onCancel={onCancel}
  title={
    <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
      <IconComponent />
      Title Text
    </p>
  }
  footer={null}
  width={600}
>
```

**After:**
```javascript
import FitBridgeModal from '../../../components/FitBridgeModal';

<FitBridgeModal
  open={open}
  onCancel={onCancel}
  title="Title Text"
  titleIcon={<IconComponent />}
  width={600}
>
```

## Benefits

1. **Consistency**: All modals across the app have the same branding
2. **Maintainability**: Single component to update for design changes
3. **Developer Experience**: Simpler props, no need to style headers manually
4. **Brand Recognition**: FitBridge logo is always visible
5. **Responsive**: Works well on all screen sizes
6. **Accessibility**: Maintains all Ant Design accessibility features