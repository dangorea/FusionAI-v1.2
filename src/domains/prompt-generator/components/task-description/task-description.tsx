import type { CSSProperties, Ref } from 'react';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Button, Input } from 'antd';
import { EditOutlined, PictureOutlined, SendOutlined } from '@ant-design/icons';
import type { DropdownRef } from '../../../../components';
import { Dropdown, VoiceInput } from '../../../../components';
import './task-description.module.scss';
import type { DropdownOption } from '../../../../components/dropdown/dropdown';

export interface TaskDescriptionInputRef {
  addExtraContent: (extra: string) => void;
  getContent: () => string;
  setContent: (value: string) => void;
}

export interface TaskDescriptionInputProps {
  onSend?: (content: string) => void;
  onContentChange?: (content: string) => void;
  mode?: 'big' | 'small';
  preview?: boolean;
  style?: CSSProperties;
  dropdownProviderRef?: Ref<DropdownRef>;
  onDropdownProviderChange?: (value: string | string[]) => void;
  disableSend?: boolean;
  dropdownOptions?: DropdownOption[];
  defaultDropdownValue?: string;
  personalityOptions?: DropdownOption[];
  personalityDefaultDropDownValue?: string | string[];
  onPersonalityChange?: (value: string | string[]) => void;
  personalityDropdownRef?: Ref<DropdownRef>;
  onEdit?: () => void;
  onMount?: (api: TaskDescriptionInputRef) => void;
  onImagesButtonClick?: () => void;
}

export const TaskDescription = forwardRef(
  (props: TaskDescriptionInputProps, ref) => {
    const {
      onSend,
      onContentChange,
      onEdit,
      mode = 'big',
      preview = false,
      style,
      onMount,
      dropdownProviderRef,
      personalityDropdownRef,
      onDropdownProviderChange,
      disableSend,
      dropdownOptions,
      defaultDropdownValue,
      personalityOptions = [],
      onPersonalityChange,
      personalityDefaultDropDownValue,
      onImagesButtonClick,
    } = props;

    const [content, setContent] = useState<string>('');

    const containerRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (!containerRef.current || preview || mode === 'small') return;
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const containerHeight = entry.contentRect.height;
          if (textAreaRef.current) {
            textAreaRef.current.style.height = `${containerHeight}px`;
          }
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, [preview, mode]);

    const api: TaskDescriptionInputRef = {
      addExtraContent: (extra: string) => {
        setContent((prev) => (prev ? `${prev}${extra}` : extra));
      },
      getContent: () => content,
      setContent: (value: string) => setContent(value),
    };

    useImperativeHandle(ref, () => api, [api]);

    useEffect(() => {
      if (onMount) {
        onMount(api);
      }
    }, []);

    const handleSend = () => {
      if (onSend) {
        onSend(content);
      }
    };

    const commonTextAreaStyle: React.CSSProperties = preview
      ? {
          border: 'none',
          background: 'transparent',
          resize: 'none',
          outline: 'none',
          boxShadow: 'none',
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }
      : {
          border: 'none',
          background: 'transparent',
          resize: 'none',
          outline: 'none',
          boxShadow: 'none',
          width: '100%',
        };

    const textAreaProps = {
      value: content,
      disabled: preview,
      readOnly: preview,
      onChange: !preview
        ? (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setContent(e.target.value);
            onContentChange?.(e.target.value);
          }
        : undefined,
    };

    const handleVoiceTranscription = (text: string) => {
      setContent((prev) => (prev ? `${prev} ${text}` : text));
      onContentChange?.(`${content} ${text}`);
    };

    const handlePersonalityChange = (value: string | string[]) => {
      onPersonalityChange?.(value);
    };

    if (mode === 'small') {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: preview ? 'row' : 'column',
            alignItems: preview ? 'center' : undefined,
            padding: '8px 16px',
            backgroundColor: '#EFF0FB',
            borderRadius: '8px',
            ...style,
          }}
        >
          <Input.TextArea
            {...textAreaProps}
            placeholder={!preview ? 'Write your task description...' : ''}
            autoSize={
              preview ? { minRows: 1, maxRows: 1 } : { minRows: 1, maxRows: 10 }
            }
            style={{
              ...commonTextAreaStyle,
              flexGrow: 1,
              marginRight: preview ? 0 : '8px',
              whiteSpace: preview ? 'nowrap' : 'normal',
              overflowX: preview ? 'hidden' : 'auto',
              overflowY: 'auto',
              textOverflow: preview ? 'ellipsis' : 'unset',
              lineHeight: '1.4',
            }}
          />
          {preview ? (
            <Button
              type="text"
              size="large"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
            />
          ) : null}
          {!preview && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Dropdown
                  ref={dropdownProviderRef}
                  options={dropdownOptions ?? []}
                  defaultValue={defaultDropdownValue}
                  onChange={onDropdownProviderChange}
                />
                <Dropdown
                  ref={personalityDropdownRef}
                  options={personalityOptions ?? []}
                  defaultValue={personalityDefaultDropDownValue}
                  fallbackOption={{
                    value: '__fallback__',
                    label: 'Choose a personality',
                  }}
                  buttonOptions={[
                    {
                      value: '__create__',
                      label: 'Create a personality',
                      onClick: () => {
                        // your custom action here
                        console.log('Create a personality clicked');
                      },
                    },
                  ]}
                  onChange={handlePersonalityChange}
                  dropDownStyle={{
                    width: '10%',
                  }}
                  multiSelect
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                {onImagesButtonClick && (
                  <Button
                    icon={<PictureOutlined />}
                    onClick={onImagesButtonClick}
                    style={{ marginRight: 8 }}
                  >
                    Images
                  </Button>
                )}
                <VoiceInput
                  onTranscriptionComplete={handleVoiceTranscription}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  disabled={disableSend}
                  style={{ marginLeft: 8 }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh',
          height: '100%',
          ...style,
        }}
      >
        <div
          style={{
            padding: '0 0 16px 0',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          Task Description
        </div>
        <div
          ref={containerRef}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            padding: '16px',
            overflow: 'hidden',
            backgroundColor: '#EFF0FB',
            borderTopRightRadius: '8px',
            borderTopLeftRadius: '8px',
            border: '1px solid #D8DBF4',
            borderBottom: 'none',
            height: '100%',
          }}
        >
          <Input.TextArea
            ref={(node) => {
              if (node) {
                textAreaRef.current = node.resizableTextArea?.textArea || null;
              }
            }}
            {...textAreaProps}
            placeholder={!preview ? 'Write your task description...' : ''}
            autoSize={false}
            style={{
              ...commonTextAreaStyle,
              height: preview ? 'auto' : undefined,
            }}
          />
        </div>
        {!preview && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              borderBottomRightRadius: '7px',
              borderBottomLeftRadius: '7px',
              backgroundColor: '#EFF0FB',
              border: '1px solid #D8DBF4',
              borderTop: 'none',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Dropdown
                ref={dropdownProviderRef}
                options={dropdownOptions ?? []}
                defaultValue={defaultDropdownValue}
                onChange={onDropdownProviderChange}
              />
              <Dropdown
                ref={personalityDropdownRef}
                options={personalityOptions ?? []}
                defaultValue={personalityDefaultDropDownValue}
                fallbackOption={{
                  value: '__fallback__',
                  label: 'Choose a personality',
                }}
                buttonOptions={[
                  {
                    value: '__create__',
                    label: 'Create a personality',
                    onClick: () => {
                      // your custom action here
                      console.log('Create a personality clicked');
                    },
                  },
                ]}
                onChange={handlePersonalityChange}
                dropDownStyle={{
                  width: '10%',
                }}
                multiSelect
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {onImagesButtonClick && (
                <Button
                  icon={<PictureOutlined />}
                  onClick={onImagesButtonClick}
                  style={{ marginRight: 8 }}
                >
                  Images
                </Button>
              )}
              <VoiceInput onTranscriptionComplete={handleVoiceTranscription} />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={disableSend}
                style={{ marginLeft: 8 }}
              />
            </div>
          </div>
        )}
      </div>
    );
  },
);

TaskDescription.displayName = 'TaskDescription';
