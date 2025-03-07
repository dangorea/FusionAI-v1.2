import type { Ref } from 'react';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';

export interface TaskDescriptionInputProps {
  onSend?: (content: string) => void;
}

export interface TaskDescriptionInputRef {
  addExtraContent: (extra: string) => void;
  getContent: () => string;
  setContent: (value: string) => void;
}

export const TaskDescription = forwardRef(
  (props: TaskDescriptionInputProps, ref: Ref<TaskDescriptionInputRef>) => {
    const { onSend } = props;
    const [content, setContent] = useState('');

    useImperativeHandle(ref, () => ({
      addExtraContent: (extra: string) => {
        setContent((prev) => (prev ? `${prev}${extra}` : extra));
      },
      getContent: () => content,
      setContent: (value: string) => setContent(value),
    }));

    const handleSend = () => {
      if (onSend) {
        onSend(content);
      }
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #D8DBF4',
          borderRadius: '8px',
          maxHeight: '90vh',
          height: '100%',
        }}
      >
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid #eee',
            fontWeight: 'bold',
            fontSize: '16px',
          }}
        >
          Task Description
        </div>
        <div
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            backgroundColor: '#EFF0FB',
          }}
        >
          <Input.TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your task description..."
            autoSize={{ minRows: 10, maxRows: 20 }}
            style={{
              border: 'none',
              background: 'transparent',
              resize: 'none',
              outline: 'none',
              boxShadow: 'none',
              width: '100%',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px 16px',
            borderTop: '1px solid #eee',
            borderBottomRightRadius: '7px',
            borderBottomLeftRadius: '7px',
            backgroundColor: '#EFF0FB',
          }}
        >
          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            onClick={handleSend}
          />
        </div>
      </div>
    );
  },
);

TaskDescription.displayName = 'TaskDescription';
