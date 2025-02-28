import { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import styles from './GPTReview.module.scss';

const HIGHLIGHT_COLOR_LOCAL = '#482320';
const HIGHLIGHT_COLOR_GPT = '#393e2d';

export function GPTReview() {
  const [localFileContent] = useState('');
  const [gptFileContent] = useState('');
  const [highlightedLocalLines] = useState<number[]>([]);
  const [highlightedGptLines] = useState<number[]>([]);

  // useEffect(() => {
  //   if (selectedGptFiles?.path) {
  //     // Get local file content
  //     window.api
  //       .getFilesContents([selectedGptFiles.path])
  //       .then((result) => {
  //         if (result.contents.length > 0) {
  //           const localContent = result.contents[0].content;
  //           const gptContent = selectedGptFiles.content;
  //           setLocalFileContent(localContent);
  //           setGptFileContent(gptContent);
  //
  //           // Compare contents and find added lines in GPT content
  //           const localLines = localContent.split('\n');
  //           const gptLines = gptContent.split('\n');
  //           const addedLines = gptLines.reduce((acc, line, index) => {
  //             if (!localLines.includes(line)) {
  //               acc.push(index + 1); // +1 because line numbers are 1-based
  //             }
  //             return acc;
  //           }, [] as number[]);
  //           setHighlightedGptLines(addedLines);
  //
  //           // Optionally, find removed or changed lines from local content
  //           const removedLines = localLines.reduce((acc, line, index) => {
  //             if (!gptLines.includes(line)) {
  //               acc.push(index + 1);
  //             }
  //             return acc;
  //           }, [] as number[]);
  //           setHighlightedLocalLines(removedLines);
  //         } else {
  //           setLocalFileContent('');
  //           setGptFileContent(selectedGptFiles.content);
  //           setHighlightedLocalLines([]);
  //           setHighlightedGptLines([]);
  //         }
  //       })
  //       .catch(() => {
  //         setLocalFileContent('');
  //         setGptFileContent(selectedGptFiles.content);
  //         setHighlightedLocalLines([]);
  //         setHighlightedGptLines([]);
  //       });
  //   }
  // }, [selectedGptFiles]);

  const language = /* selectedGptFiles?.path?.split('.').pop() || */ 'text';

  return (
    <div className={styles.splitViewContainer}>
      {localFileContent && (
        <div className={styles.codeViewerContainer}>
          <h3>Existing Source</h3>
          <SyntaxHighlighter
            language={language}
            showLineNumbers
            wrapLines
            style={vs2015}
            lineProps={(lineNumber) => ({
              style: {
                display: 'block',
                backgroundColor: highlightedLocalLines.includes(lineNumber)
                  ? HIGHLIGHT_COLOR_LOCAL
                  : undefined,
              },
            })}
          >
            {localFileContent}
          </SyntaxHighlighter>
        </div>
      )}
      <div className={styles.codeViewerContainer}>
        <h3>Generated source</h3>
        <SyntaxHighlighter
          language={language}
          showLineNumbers
          wrapLines
          style={vs2015}
          lineProps={(lineNumber) => ({
            style: {
              display: 'block',
              backgroundColor: highlightedGptLines.includes(lineNumber)
                ? HIGHLIGHT_COLOR_GPT
                : undefined,
            },
          })}
        >
          {gptFileContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
