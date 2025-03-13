import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Button, Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';

export interface TaskDescriptionInputProps {
  onSend?: (content: string) => void;
  onContentChange?: (content: string) => void;
  mode?: 'big' | 'small';
}

export interface TaskDescriptionInputRef {
  addExtraContent: (extra: string) => void;
  getContent: () => string;
  setContent: (value: string) => void;
}

export const TaskDescription = forwardRef(
  (props: TaskDescriptionInputProps, ref) => {
    const { onSend, onContentChange, mode = 'big' } = props;
    const [content, setContent] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

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
    }, []);

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

    if (mode === 'small') {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            padding: '8px 16px',
            backgroundColor: '#EFF0FB',
            borderRadius: '8px',
          }}
        >
          <Input.TextArea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onContentChange?.(e.target.value);
            }}
            placeholder="Write your task description..."
            autoSize={{ minRows: 1, maxRows: 10 }}
            style={{
              border: 'none',
              background: 'transparent',
              resize: 'none',
              outline: 'none',
              boxShadow: 'none',
              flexGrow: 1,
              marginRight: '8px',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
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
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh',
          height: '100%',
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
            flexDirection: 'column',
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
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              onContentChange?.(e.target.value);
            }}
            placeholder="Write your task description..."
            autoSize={false}
            style={{
              border: 'none',
              background: 'transparent',
              resize: 'none',
              outline: 'none',
              boxShadow: 'none',
              width: '100%',
              overflow: 'auto',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '8px 16px',
            borderBottomRightRadius: '7px',
            borderBottomLeftRadius: '7px',
            backgroundColor: '#EFF0FB',
            border: '1px solid #D8DBF4',
            borderTop: 'none',
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
