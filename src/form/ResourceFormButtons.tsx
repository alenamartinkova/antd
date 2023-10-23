import * as React from 'react';

import { Button, Form, Popconfirm } from 'antd';

import { FormInstance } from 'antd/lib/form';

export interface ResourceFormButtonsProps {
  form: FormInstance<any>;
}

export class ResourceFormButtons extends React.Component<
  ResourceFormButtonsProps
> {
  render() {
    const { form } = this.props;
    const hasChanges = form.isFieldsTouched();

    return (
      <Form.Item
        wrapperCol={{
          xs: { span: 24, offset: 0 },
          sm: { span: 16, offset: 8 },
        }}
      >
        <Button
          disabled={!hasChanges}
          type="primary"
          onClick={() => form.submit()}
        >
          Save
        </Button>
        <Popconfirm
          title="Reset?"
          cancelText="No"
          okText="Yes"
          onConfirm={() => form.resetFields()}
        >
          <Button disabled={!hasChanges} style={{ marginLeft: 8 }}>
            Reset
          </Button>
        </Popconfirm>
      </Form.Item>
    );
  }
}
