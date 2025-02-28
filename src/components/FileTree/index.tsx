import React from 'react';
import { FileTreeNode } from '../../ipc';
import styles from './FileTree.module.scss';

// function FileNode({ node }: { node: FileTreeNode }) {
//   // const onFileSelectionChanged = useCallback(() => {
//   //   toggleSelectedFiles([node.path]);
//   // }, [node.path, toggleSelectedFiles]);
//
//   return (
//     <li key={node.path}>
//       <input
//         type="checkbox"
//         id={`file-${node.path}`}
//         value={node.path}
//         // checked={selectedFiles.includes(node.path)}
//         // onChange={onFileSelectionChanged}
//       />
//       <label htmlFor={`file-${node.path}`}>{node.name}</label>
//     </li>
//   );
// }

type FileTreeProps = {
  treeData: FileTreeNode;
};

function TreeNode({ node }: { node: FileTreeNode }) {
  if (!node) return null;

  // const Component = NodesComponents[node.type];
  // return <Component node={node} />;
}

export function FileTree({ treeData }: FileTreeProps) {
  return (
    <div className={styles['tree-root']}>
      <TreeNode node={treeData} />
    </div>
  );
}

// function FolderNode({ node }: { node: FileTreeNode }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const checkboxRef = useRef<HTMLInputElement>(null);
//
//   const allDescendantFiles = fileTreeNodeToPathArray(node);
//   // const selectedCount = allDescendantFiles.filter((path) =>
//   //   selectedFiles.includes(path),
//   // ).length;
//   // const allSelected = /* selectedCount === */ allDescendantFiles.length;
//   const someSelected =
//     /* selectedCount > 0 && selectedCount < */ allDescendantFiles.length;
//
//   useEffect(() => {
//     if (checkboxRef.current) {
//       // checkboxRef.current.indeterminate = someSelected;
//     }
//   }, [someSelected]);
//
//   const onDirectorySelectionChanged = useCallback(() => {
//     // const _selectedFilesInNode = fileTreeNodeToPathArray(node);
//     // toggleSelectedFiles(selectedFilesInNode);
//   }, []);
//
//   const toggleOpen = useCallback(() => {
//     setIsOpen((prev) => !prev);
//   }, []);
//
//   return (
//     <li key={node.path}>
//       <details open={isOpen}>
//         <summary>
//           <input
//             type="checkbox"
//             ref={checkboxRef}
//             value={node.path}
//             // checked={allSelected}
//             onChange={onDirectorySelectionChanged}
//           />
//           <label htmlFor="first-name" onClick={toggleOpen}>
//             <FolderOpenOutlined style={{ fontSize: '16px' }} />
//             <span>{node.name}</span>
//           </label>
//         </summary>
//         {Array.isArray(node.children) && node.children.length > 0 && (
//           <ul>
//             {node.children.map((child) => (
//               <TreeNode key={child.path} node={child} />
//             ))}
//           </ul>
//         )}
//       </details>
//     </li>
//   );
// }

// const NodesComponents = {
//   file: FileNode,
//   directory: FolderNode,
// } as const;
