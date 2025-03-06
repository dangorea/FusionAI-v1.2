import React, { useState } from 'react';
import { createTwoFilesPatch } from 'diff';
import { parseDiff } from 'react-diff-view';
import 'react-diff-view/style/index.css';

export interface CodeComment {
  id: string;
  startLine: number;
  endLine: number;
  comment: string;
}

export interface CodeViewerProps {
  /** Content of the original file */
  originalFile: string;
  /** Content of the file to compare */
  comparisonFile: string;
  /**
   * Callback called whenever a new comment is added.
   * Returns the updated list of comments.
   */
  onCommentsUpdate?: (comments: CodeComment[]) => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  originalFile,
  comparisonFile,
  onCommentsUpdate,
}) => {
  // List of comments added by the user.
  const [comments, setComments] = useState<CodeComment[]>([]);
  // Manage the active line selection (start and optional end).
  const [activeRange, setActiveRange] = useState<{
    start: number;
    end?: number;
  } | null>(null);
  // Local state for the comment text.
  const [commentText, setCommentText] = useState<string>('');

  // Generate a diff patch between the two files.
  const diffText = createTwoFilesPatch(
    'Original',
    'Modified',
    originalFile,
    comparisonFile,
  );
  console.log(diffText);
  const files = parseDiff(diffText);
  // We assume one file diff for simplicity.
  const fileDiff = files[0];

  /**
   * Handles a click on a line number.
   * If no range is active, mark this line as the start.
   * If a start exists but no end, set this line as the end.
   * Otherwise, reset with the clicked line as the new start.
   */
  const handleLineClick = (lineNumber: number) => {
    if (!activeRange) {
      setActiveRange({ start: lineNumber });
    } else if (activeRange && activeRange.end === undefined) {
      setActiveRange({ start: activeRange.start, end: lineNumber });
    } else {
      setActiveRange({ start: lineNumber });
    }
  };

  /**
   * When the user adds a comment, create a new comment entry.
   */
  const handleAddComment = () => {
    if (activeRange && commentText.trim()) {
      const newComment: CodeComment = {
        id: new Date().toISOString(),
        startLine: activeRange.start,
        endLine: activeRange.end ? activeRange.end : activeRange.start,
        comment: commentText.trim(),
      };
      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      setActiveRange(null);
      setCommentText('');
      if (onCommentsUpdate) {
        onCommentsUpdate(updatedComments);
      }
    }
  };

  return (
    <div>
      {/* Render each diff hunk manually in a table */}
      <div
        style={{
          overflowX: 'auto',
          border: '1px solid #ccc',
          marginBottom: '1rem',
        }}
      >
        {fileDiff.hunks.map((hunk, hunkIndex) => (
          <table
            key={hunkIndex}
            style={{ width: '100%', borderCollapse: 'collapse' }}
          >
            <tbody>
              {/* Hunk header */}
              <tr>
                <td
                  colSpan={3}
                  style={{ backgroundColor: '#f7f7f7', padding: '0.5rem' }}
                >
                  @@ {hunk.content} @@
                </td>
              </tr>
              {hunk.lines.map((line, lineIndex) => {
                // Determine which line number to display (prefer newNumber).
                const lineNumber =
                  line.newNumber !== null ? line.newNumber : line.oldNumber;
                // Set background color based on line type.
                let backgroundColor = '#fff';
                if (line.type === 'insert') backgroundColor = '#e6ffed';
                else if (line.type === 'delete') backgroundColor = '#ffeef0';

                return (
                  <tr key={lineIndex} style={{ backgroundColor }}>
                    {/* Gutter cell for new line number */}
                    <td
                      style={{
                        width: '50px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        borderRight: '1px solid #ddd',
                      }}
                      onClick={() =>
                        lineNumber !== null && handleLineClick(lineNumber)
                      }
                    >
                      {line.newNumber !== null
                        ? line.newNumber
                        : line.oldNumber}
                    </td>
                    {/* Gutter cell for old line number */}
                    <td
                      style={{ width: '50px', borderRight: '1px solid #ddd' }}
                    >
                      {line.oldNumber !== null ? line.oldNumber : ''}
                    </td>
                    {/* Code content */}
                    <td style={{ padding: '0.5rem', fontFamily: 'monospace' }}>
                      {line.content}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ))}
      </div>

      {/* Show a comment input block when a line or range is selected */}
      {activeRange && (
        <div style={{ marginBottom: '1rem' }}>
          <div>
            Commenting on line {activeRange.start}
            {activeRange.end ? ` to ${activeRange.end}` : ''}
          </div>
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your comment..."
            style={{ width: '100%', marginBottom: '0.5rem' }}
          />
          <button onClick={handleAddComment}>Add Comment</button>
        </div>
      )}

      {/* Display the list of comments */}
      <div>
        <h4>Comments</h4>
        {comments.length === 0 && <div>No comments added.</div>}
        <ul>
          {comments.map((c) => (
            <li key={c.id}>
              Lines {c.startLine}
              {c.endLine !== c.startLine ? ` - ${c.endLine}` : ''}: {c.comment}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CodeViewer;
