import type { Dispatch, SetStateAction } from 'react';

/**
 * Remove the special file blocks from a text string.
 */
export function removeAllFileBlocks(text: string): string {
  const pattern = /\n\n=== File: .*? ===\n[\s\S]*?\n=== EndFile: .*? ===\n\n/g;
  return text.replace(pattern, '');
}

/**
 * Inject file blocks into the Task Description text.
 *
 * Replaces any existing file blocks with fresh ones from `selectedFiles`.
 */
export function updateTaskDescriptionWithFileBlocks(
  descRef: {
    getContent: () => string;
    setContent: Dispatch<SetStateAction<string>>;
  },
  selectedFiles: Record<string, string>,
): string {
  const currentText = descRef.getContent();
  // Remove any old file blocks
  const cleaned = removeAllFileBlocks(currentText);

  // Build file block strings for each selected file
  const fileBlocks = Object.entries(selectedFiles)
    .map(
      ([fp, content]) =>
        `\n\n=== File: ${fp} ===\n${content}\n=== EndFile: ${fp} ===\n\n`,
    )
    .join('');

  // Combine the cleaned content with all the new file blocks
  const newContent = cleaned + fileBlocks;

  // Set the new content once
  descRef.setContent(newContent);

  return newContent;
}
