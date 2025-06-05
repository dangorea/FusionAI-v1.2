import TaskItem from '@tiptap/extension-task-item';
import { mergeAttributes } from '@tiptap/core';

/**
 * Task‑list item with custom HTML structure + classes so we can style it
 * exactly the way the original file did.
 */
const CustomTaskItem = TaskItem.extend({
  renderHTML({ HTMLAttributes }) {
    return [
      'li',
      mergeAttributes(HTMLAttributes, { class: 'task-item' }),
      [
        'label',
        { class: 'task-item-label' },
        [
          'input',
          {
            type: 'checkbox',
            checked: HTMLAttributes.checked ? '' : null,
            contenteditable: 'false',
          },
        ],
      ],
      [
        'span',
        mergeAttributes({
          class: 'task-item-content',
          'data-node-view-content': '',
        }),
        0,
      ],
    ];
  },
});

export default CustomTaskItem;
