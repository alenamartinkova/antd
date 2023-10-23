import * as React from 'react';

import { Alert, Form } from 'antd';
import { FormInstance, FormProps } from 'antd/lib/form/Form';

import { Resource } from 'webpanel-data';
import { ValidateErrorEntity } from 'rc-field-form/lib/interface';

export interface ResourceFormProps extends FormProps {
  formResource: Resource;
  // render: (context: FormContext) => React.ReactNode;
  onSuccess?: () => void;
  onFailure?: (validationError: ValidateErrorEntity) => void;
  onValuesChange?: (values: any) => void;
  formRef?: React.MutableRefObject<FormInstance | null>;
}

export const ResourceForm = (props: ResourceFormProps) => {
  const {
    onSuccess,
    onFailure,
    onValuesChange,
    formResource,
    formRef,
    ...formProps
  } = props;

  const [form] = Form.useForm();

  if (formRef) {
    formRef.current = form;
  }

  const onFinish = async (values: any) => {
    try {
      await props.formResource.save(values);
      if (onSuccess) {
        onSuccess();
      }
      form.resetFields();
    } catch (error) {
      displayError(error);
    }
  };

  const onFinishFailed = async (err: ValidateErrorEntity) => {
    displayError(err);
  };

  const displayError = (err: ValidateErrorEntity) => {
    if (onFailure) {
      onFailure(err);
    }
  };

  const alert = formResource.error && (
    <Alert
      message={<div>Failed to load resource {formResource.error.message}</div>}
      type="error"
    />
  );

  return (
    <>
      {alert}
      {
        <Form
          key={`resource_form_${formResource.name}_${
            formResource.data ? 'loaded' : 'loading'
          }`}
          onValuesChange={onValuesChange}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          form={form}
          initialValues={formResource.data}
          {...formProps}
        >
          {props.children}
        </Form>
      }
    </>
  );
};
