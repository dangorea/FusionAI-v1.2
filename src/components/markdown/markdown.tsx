import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { Form, Input, Modal, Tooltip } from 'antd';
import {
  BoldOutlined,
  CheckSquareOutlined,
  CodeOutlined,
  FileTextOutlined,
  ItalicOutlined,
  LinkOutlined,
  MinusOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TaskList from '@tiptap/extension-task-list';
import { Markdown } from 'tiptap-markdown';
import type { Level } from '@tiptap/extension-heading/src/heading';

import CustomTaskItem from './custom-task-item';
import { absolutize, isValidUrl, openExternal } from './url-utils';

import styles from './markdown-editor.module.scss';

export interface MarkdownEditorHandle {
  getMarkdown(): string;
}

export interface MarkdownEditorProps {
  value: string;
  mode?: 'edit' | 'preview';

  onChange(md: string): void;
}

export const MarkdownEditor = forwardRef<
  MarkdownEditorHandle,
  MarkdownEditorProps
>(({ value, onChange, mode = 'edit' }, ref) => {
  const isPreview = mode === 'preview';

  const editorRef = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Underline,
      TaskList,
      CustomTaskItem,
      Markdown.configure({ html: true, tightLists: true }),
    ],
    content: value,
    editable: !isPreview,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown());
    },
    editorProps: isPreview
      ? {
          handleDOMEvents: {
            click(_view, ev) {
              const el = ev.target as HTMLElement;
              if (el.tagName === 'A') {
                ev.preventDefault();
                ev.stopPropagation();
                openExternal(absolutize((el as HTMLAnchorElement).href));
                return true;
              }
              return false;
            },
          },
        }
      : {},
  });

  useEffect(() => {
    if (!editorRef) return;
    if (editorRef.storage.markdown.getMarkdown() !== value) {
      editorRef.commands.setContent(value);
    }
  }, [value, editorRef]);

  useImperativeHandle(
    ref,
    () => ({
      getMarkdown: () => editorRef?.storage.markdown.getMarkdown() ?? value,
    }),
    [editorRef, value],
  );

  const [, force] = useState(0);
  useEffect(() => {
    if (!editorRef) return;
    const h = () => {
      force((n) => n + 1);
    };
    editorRef.on('selectionUpdate', h);
    return () => {
      editorRef.off('selectionUpdate', h);
    };
  }, [editorRef]);

  const [form] = Form.useForm<{ label: string; url: string }>();
  const urlValue = Form.useWatch('url', form) ?? '';
  const urlTouched = form.isFieldTouched('url');
  const urlOk = isValidUrl(urlValue);
  const saveDisabled = !urlOk;

  const [linkOpen, setLinkOpen] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  const btn = (
    icon: React.ReactNode,
    action: () => void,
    title?: string,
    active = false,
  ) => (
    <Tooltip title={title} key={title}>
      <button
        type="button"
        className={active ? styles.active : ''}
        onMouseDown={(e) => {
          e.preventDefault();
          action();
        }}
      >
        {icon}
      </button>
    </Tooltip>
  );

  const Toolbar = !isPreview && editorRef && (
    <div className={styles.toolbar}>
      {btn(
        <BoldOutlined />,
        () => editorRef.chain().focus().toggleBold().run(),
        'Bold',
        editorRef.isActive('bold'),
      )}
      {btn(
        <ItalicOutlined />,
        () => editorRef.chain().focus().toggleItalic().run(),
        'Italic',
        editorRef.isActive('italic'),
      )}
      {btn(
        <UnderlineOutlined />,
        () => editorRef.chain().focus().toggleUnderline().run(),
        'Underline',
        editorRef.isActive('underline'),
      )}
      {btn(
        <StrikethroughOutlined />,
        () => editorRef.chain().focus().toggleStrike().run(),
        'Strikethrough',
        editorRef.isActive('strike'),
      )}
      {btn(
        <CodeOutlined />,
        () => editorRef.chain().focus().toggleCode().run(),
        'Code',
        editorRef.isActive('code'),
      )}
      {([1, 2, 3, 4, 5, 6] as Level[]).map((level) =>
        btn(
          <span className={styles.headingIcon}>H{level}</span>,
          () => editorRef.chain().focus().toggleHeading({ level }).run(),
          `Heading ${level}`,
          editorRef.isActive('heading', { level }),
        ),
      )}
      {btn(
        <FileTextOutlined />,
        () => editorRef.chain().focus().toggleBlockquote().run(),
        'Block quote',
        editorRef.isActive('blockquote'),
      )}
      {btn(
        <CodeOutlined />,
        () => editorRef.chain().focus().toggleCodeBlock().run(),
        'Code block',
        editorRef.isActive('codeBlock'),
      )}
      {btn(
        <MinusOutlined />,
        () => editorRef.chain().focus().setHorizontalRule().run(),
        'Horizontal rule',
      )}
      {btn(
        <UnorderedListOutlined />,
        () => editorRef.chain().focus().toggleBulletList().run(),
        'Bullet list',
        editorRef.isActive('bulletList'),
      )}
      {btn(
        <OrderedListOutlined />,
        () => editorRef.chain().focus().toggleOrderedList().run(),
        'Ordered list',
        editorRef.isActive('orderedList'),
      )}
      {btn(
        <CheckSquareOutlined />,
        () => editorRef.chain().focus().toggleTaskList().run(),
        'Task list',
        editorRef.isActive('taskList'),
      )}
      {btn(
        <LinkOutlined />,
        () => {
          const sel = editorRef.state.selection;
          const hasSel = sel && !sel.empty && sel.to > sel.from;
          setHasSelection(hasSel || editorRef.isActive('link'));
          form.setFieldsValue({
            url: editorRef.getAttributes('link').href || '',
            label: '',
          });
          setLinkOpen(true);
          setTimeout(() => {
            form.getFieldInstance?.('url')?.focus?.();
          }, 100);
        },
        'Insert / edit link',
        editorRef.isActive('link'),
      )}
      {btn(
        <UndoOutlined />,
        () => editorRef.chain().focus().undo().run(),
        'Undo',
      )}
      {btn(
        <RedoOutlined />,
        () => editorRef.chain().focus().redo().run(),
        'Redo',
      )}
    </div>
  );

  const handleOk = () => {
    const { url = '', label = '' } = form.getFieldsValue();
    if (!isValidUrl(url)) return;
    const finalUrl = absolutize(url.trim());

    if (!finalUrl) {
      editorRef?.chain().focus().extendMarkRange('link').unsetLink().run();
    } else if (hasSelection) {
      editorRef
        ?.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: finalUrl })
        .run();
    } else {
      const text = label.trim() || finalUrl;
      editorRef
        ?.chain()
        .focus()
        .insertContent([
          {
            type: 'text',
            text,
            marks: [{ type: 'link', attrs: { href: finalUrl } }],
          },
        ])
        .run();
    }
    setLinkOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      {Toolbar}
      <EditorContent
        editor={editorRef}
        className={styles.editor}
        disabled={isPreview}
      />

      <Modal
        title="Insert link"
        open={linkOpen}
        onCancel={() => setLinkOpen(false)}
        onOk={handleOk}
        okText="Save"
        destroyOnClose
        okButtonProps={{ disabled: saveDisabled }}
      >
        <Form
          form={form}
          layout="vertical"
          validateTrigger={['onChange', 'onBlur']}
        >
          {!hasSelection && (
            <Form.Item name="label" label="Label (optional)">
              <Input placeholder="Link text" />
            </Form.Item>
          )}

          <Form.Item
            name="url"
            label="URL"
            validateStatus={urlTouched && !urlOk ? 'error' : undefined}
            help={urlTouched && !urlOk ? 'Please enter a valid URL' : undefined}
          >
            <Input placeholder="https://example.com" autoComplete="off" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';
export default MarkdownEditor;
