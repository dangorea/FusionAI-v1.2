import React, { forwardRef, Ref, useImperativeHandle, useState } from 'react';
import { Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import './task-description-input.module.scss';

export interface TaskDescriptionInputProps {
  onSend?: (content: string) => void;
}

export interface TaskDescriptionInputRef {
  addExtraContent: (extra: string) => void;
  getContent: () => string;
  setContent: (value: string) => void;
}

const TaskDescriptionInput = forwardRef(
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
          border: '1px solid #D8DBF4',
          borderRadius: '8px',
          overflow: 'hidden',
          height: 'auto',
          minHeight: '100%',
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
            height: 'auto',
            minHeight: '90%',
            backgroundColor: '#EFF0FB',
          }}
        >
          <Input.TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your task description..."
            autoSize={{ minRows: 38, maxRows: 38 }}
            style={{
              border: 'none',
              background: 'transparent',
              resize: 'none',
              outline: 'none',
              boxShadow: 'none',
              padding: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px 16px',
            borderTop: '1px solid #eee',
            backgroundColor: '#EFF0FB',
          }}
        >
          <Button
            type="primary"
            shape="circle"
            icon={<SendOutlined />}
            onClick={handleSend}
            style={{ boxShadow: 'none' }}
          />
        </div>
      </div>
    );
  },
);

TaskDescriptionInput.displayName = 'TaskDescriptionInput';

export default TaskDescriptionInput;
