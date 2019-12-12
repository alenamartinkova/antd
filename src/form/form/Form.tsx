import * as React from "react";
import * as moment from "moment";

import {
  FormProps as AFormProps,
  FormComponentProps,
  WrappedFormUtils
} from "antd/lib/form/Form";

import { Form as AForm } from "antd";
import { observer } from "mobx-react";

export interface FormProps extends AFormProps {
  render: (context: FormContext) => React.ReactNode;
  initialValues?: { [key: string]: any };
  valuesTransformFn?: (values: any) => Promise<any>;
  onSave?: (values: any, context: FormContext) => Promise<void>;
  onValidationError?: (err: Error, context: FormContext) => Promise<void>;
}

interface FormState {}

export interface FormContext {
  form: WrappedFormUtils;
  formComponent: FormComponent;
  initialValues: { [key: string]: any };
}

@observer
export class FormComponent extends React.Component<
  FormProps & FormComponentProps,
  FormState
> {
  isForceUpdated = false;

  resetFields = () => {
    const { form } = this.props;
    if (form) {
      form.resetFields();
    }
  };

  sanitizeValues(values: { [key: string]: any }): { [key: string]: any } {
    let _values: { [key: string]: any } = {};
    for (let key of Object.keys(values)) {
      const value = values[key];
      if (value === null) {
        _values[key] = null;
      } else if (
        value instanceof Date ||
        (typeof value === "string" &&
          moment(value, "YYYY-MM-DDTHH:mm:ss.SSS[Z]", true).isValid())
      ) {
        // we need to remove milliseconds as it's not possible to store them in some database engines (MySQL)
        // we are also checking by moment because form return dates as strings
        _values[key] =
          moment(value)
            .toISOString()
            .split(".")[0] + ".000Z";
      } else if (value instanceof Array) {
        _values[key] = value;
      } else if (typeof value === "object") {
        _values[key] = this.sanitizeValues(value);
      } else {
        _values[key] = value;
      }
    }
    return _values;
  }

  public submit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    const { form, initialValues } = this.props;

    const formContext: FormContext = {
      form,
      formComponent: this,
      initialValues: initialValues || {}
    };
    return new Promise((resolve, reject) => {
      if (typeof form === "undefined") {
        return resolve();
      }
      form.validateFields(async (err, values) => {
        if (this.props.valuesTransformFn) {
          values = await this.props.valuesTransformFn(values);
        }
        values = this.sanitizeValues(values);

        if (err) {
          if (this.props.onValidationError) {
            this.props.onValidationError(err, formContext);
          }
          reject(err);
        } else {
          form.setFieldsValue(values);
          if (this.props.onSave) {
            await this.props.onSave(values, formContext);
          }
          resolve();
        }
      });
    });
  };

  updateFieldValues(values: any) {
    const { form } = this.props;
    if (typeof form === "undefined") {
      return;
    }
    const keys = Object.keys(form.getFieldsValue());

    let newValues: { [key: string]: any } = {};
    for (let key of keys) {
      newValues[key] = values[key];
    }
    form.setFieldsValue(newValues);
  }

  render() {
    const {
      form,
      initialValues,
      onSave,
      onValidationError,
      render,
      ...formProps
    } = this.props;

    // const formItemLayout =
    //   this.props.layout === 'horizontal'
    //     ? {
    //         labelCol: { span: 4 },
    //         wrapperCol: { span: 14 }
    //       }
    //     : null;
    // const buttonItemLayout = formLayout === 'horizontal' ? {
    //   wrapperCol: { span: 14, offset: 4 },
    // } : null;

    const formContext: FormContext = {
      form,
      formComponent: this,
      initialValues: initialValues || {}
    };

    return (
      <AForm onSubmit={this.submit} {...formProps}>
        {render(formContext)}
      </AForm>
    );
  }
}

export const Form = AForm.create<FormProps & FormComponentProps>()(
  FormComponent
);
