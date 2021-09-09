import React, { useEffect, useMemo, useState } from "react";
import { Paragraph } from "@contentful/forma-36-react-components";
import { FieldAPI, FieldExtensionSDK } from "@contentful/app-sdk";
import { Field } from "@contentful/default-field-editors";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

interface FieldProps {
  sdk: FieldExtensionSDK;
}

type ComponentType = "web" | "mobile" | undefined;

const CustomField = (props: FieldProps) => {
  const { sdk } = props;

  // Auto resize app iframe
  useEffect(() => {
    sdk.window.startAutoResizer();

    return () => {
      sdk.window.stopAutoResizer();
    };
  }, [sdk.window]);

  const booleanToComponentType = (
    componentTypeBool: boolean | undefined
  ): ComponentType => {
    return componentTypeBool === undefined
      ? undefined
      : componentTypeBool === true
      ? "web"
      : "mobile";
  };

  const [componentType, setComponentType] = useState<ComponentType>(
    booleanToComponentType(sdk.field.getValue())
  );

  useEffect(() => {
    sdk.field.onValueChanged((newValue) => {
      setComponentType(booleanToComponentType(newValue));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Screenshot
  const screenshotField = sdk.entry.fields.screenshot;

  (screenshotField as unknown as FieldAPI).locale = sdk.locales.default;
  (screenshotField as unknown as FieldAPI).setInvalid = () => false;
  (screenshotField as unknown as FieldAPI).onSchemaErrorsChanged =
    () => () => {};

  // Code editor
  const codeSnippetValue = useMemo(() => {
    return sdk.entry.fields.codeSnippet.getValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentType]);

  return (
    <div className="f36-padding-bottom--4xl">
      <Field sdk={sdk} widgetId="boolean" />

      <div className="f36-padding-top--l">
        {componentType === undefined ? (
          <Paragraph>Please choose the component type</Paragraph>
        ) : componentType === "mobile" ? (
          <Field
            sdk={{
              ...sdk,
              field: screenshotField as unknown as FieldAPI,
            }}
            widgetId={
              sdk.editor.editorInterface.controls?.find(
                (control) => control.fieldId === "screenshot"
              )?.widgetId ?? "assetLinkEditor"
            }
          />
        ) : (
          <CodeMirror
            value={codeSnippetValue}
            height="200px"
            // @ts-ignore
            extensions={[javascript({ jsx: true })]}
            onChange={(value) => {
              sdk.entry.fields.codeSnippet.setValue(value);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CustomField;
