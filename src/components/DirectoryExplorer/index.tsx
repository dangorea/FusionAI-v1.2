import { Card, Divider, Empty } from 'antd';
import { CardHeader } from '../common';
import styles from './DirectoryExplorer.module.scss';
import { useAppSelector } from '../../lib/redux/hook';
import { selectSelectedProjectId } from '../../lib/redux/feature/projects/selectors';

export function DirectoryExplorer() {
  const selectedProjectId = useAppSelector(selectSelectedProjectId);

  if (!selectedProjectId) {
    return (
      <Card className={styles.card}>
        <CardHeader title="Directory Explorer" />
        <Divider />
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No Project Selected"
        />
      </Card>
    );
  }

  return (
    <Card className={styles.card}>
      <CardHeader
        title="Directory Explorer"
        // actions={
        //   selectedFiles.length === 0
        //     ? []
        //     : [
        //         {
        //           title: 'Reset',
        //           icon: ClearOutlined,
        //           onClick: () => {
        //             if (selectedFiles.length > 0) {
        //               toggleSelectedFiles(selectedFiles);
        //             }
        //           },
        //         },
        //       ]
        // }
      />
      <Divider />
      <div className={styles['card-content']}>
        {/* {fileTree ? ( */}
        {/*  <FileTree treeData={fileTree} /> */}
        {/* ) : ( */}
        {/*  <Empty */}
        {/*    image={Empty.PRESENTED_IMAGE_SIMPLE} */}
        {/*    description="No Files Selected" */}
        {/*  /> */}
        {/* )} */}
      </div>
    </Card>
  );
}
