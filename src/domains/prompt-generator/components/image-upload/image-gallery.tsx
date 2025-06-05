import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Image,
  message,
  Modal,
  Progress,
  Spin,
  Tooltip,
  Upload,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { useAppDispatch, useAppSelector } from '../../../../lib/redux/hook';
import {
  deleteImageThunk,
  fetchImagesThunk,
  uploadImageThunk,
} from '../../../../lib/redux/feature/images/thunk';
import {
  selectAllImages,
  selectImagesLoading,
} from '../../../../lib/redux/feature/images/selectors';
import { selectSelectedOrganizationEntity } from '../../../../lib/redux/feature/organization/selectors';
import { selectSelectedProjectId } from '../../../../lib/redux/feature/projects/selectors';
import styles from './styles.module.scss';

export interface ImageGalleryProps {
  visible: boolean;
  onClose: () => void;
  selectedImageIds: string[];
  setSelectedImageIds: (ids: string[]) => void;
}

export function ImageGallery({
  visible,
  onClose,
  selectedImageIds,
  setSelectedImageIds,
}: ImageGalleryProps) {
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] =
    useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );

  const dispatch = useAppDispatch();
  const organization = useAppSelector(selectSelectedOrganizationEntity);
  const projectId = useAppSelector(selectSelectedProjectId);
  const images = useAppSelector(selectAllImages);
  const loading = useAppSelector(selectImagesLoading);

  useEffect(() => {
    if (visible && organization?.slug && projectId) {
      dispatch(fetchImagesThunk({ orgSlug: organization.slug, projectId }));
    }
  }, [visible, dispatch, organization?.slug, projectId]);

  const handleCheckboxChange = (imageId: string, checked: boolean) => {
    const nextIds = checked
      ? [...selectedImageIds, imageId]
      : selectedImageIds.filter((id) => id !== imageId);

    setSelectedImageIds(nextIds);
  };

  const showDeleteConfirm = (imageId: string) => {
    setImageToDelete(imageId);
    setConfirmDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete || !organization?.slug || !projectId) {
      setConfirmDeleteModalVisible(false);
      return;
    }

    try {
      await dispatch(
        deleteImageThunk({
          orgSlug: organization.slug,
          projectId,
          imageId: imageToDelete,
        }),
      ).unwrap();
      message.success('Image deleted successfully');
    } catch (error) {
      message.error('Failed to delete image');
    } finally {
      setConfirmDeleteModalVisible(false);
      setImageToDelete(null);
    }
  };

  const handleRefreshImages = () => {
    if (organization?.slug && projectId) {
      dispatch(fetchImagesThunk({ orgSlug: organization.slug, projectId }));
    }
  };

  const uploadFile = async (file: RcFile) => {
    if (!organization?.slug || !projectId) {
      message.error('Missing organization or project information');
      return;
    }

    let progressInterval: NodeJS.Timeout | undefined;

    try {
      setUploadProgress((prev) => ({ ...prev, [file.uid]: 0 }));

      // Start with initial progress
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[file.uid] || 0;
          if (currentProgress < 90) {
            return {
              ...prev,
              [file.uid]: currentProgress + Math.floor(Math.random() * 10),
            };
          }
          return prev;
        });
      }, 200);

      await dispatch(
        uploadImageThunk({
          orgSlug: organization.slug as string,
          projectId,
          file,
        }),
      ).unwrap();

      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress((prev) => ({ ...prev, [file.uid]: 100 }));

      // Remove file from uploading list after successful upload
      setTimeout(() => {
        setUploadingFiles((prev) =>
          prev.filter((item) => item.uid !== file.uid),
        );
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.uid];
          return newProgress;
        });
      }, 1000);

      message.success(`${file.name} uploaded successfully`);

      // Refresh the image gallery
      handleRefreshImages();
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress((prev) => ({ ...prev, [file.uid]: 0 }));
      message.error(`Failed to upload ${file.name}`);
      console.error('Upload failed:', error);
    }
  };

  const beforeUpload = (file: RcFile) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(`${file.name} is not an image file`);
      return Upload.LIST_IGNORE;
    }

    // Validate file size (10MB)
    const isLessThan10MB = file.size / 1024 / 1024 < 10;
    if (!isLessThan10MB) {
      message.error(`${file.name} exceeds 10MB size limit`);
      return Upload.LIST_IGNORE;
    }

    // Add file to uploading list and start upload
    setUploadingFiles((prev) => [...prev, file]);
    uploadFile(file);

    // Return false to prevent default upload behavior
    return false;
  };

  const handleRemoveUploading = (file: UploadFile) => {
    setUploadingFiles((prev) => prev.filter((item) => item.uid !== file.uid));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[file.uid];
      return newProgress;
    });
  };

  const footerButtons = [
    <Upload
      key="upload"
      accept="image/*"
      multiple
      showUploadList={false}
      beforeUpload={beforeUpload}
      customRequest={({ onSuccess }) => onSuccess && onSuccess('ok')}
    >
      <Button icon={<UploadOutlined />}>Upload Images</Button>
    </Upload>,
  ];

  return (
    <Modal
      title="Image Gallery"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={footerButtons}
    >
      {/* Uploading files section */}
      {uploadingFiles.length > 0 && (
        <div className={styles.uploadingSection}>
          <div className={styles.uploadingSectionTitle}>Uploading Images</div>
          <div className={styles.uploadingList}>
            {uploadingFiles.map((file) => {
              const progress = uploadProgress[file.uid] || 0;
              return (
                <div key={file.uid} className={styles.uploadingItem}>
                  <div className={styles.uploadingItemInfo}>
                    <div className={styles.uploadingItemName}>{file.name}</div>
                    <Button
                      type="text"
                      size="small"
                      disabled={progress === 100}
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveUploading(file)}
                    />
                  </div>
                  <Progress
                    percent={progress}
                    size="small"
                    status={progress === 100 ? 'success' : 'active'}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.galleryContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading images...</div>
          </div>
        ) : images.length === 0 ? (
          <Empty
            description="No images available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Upload
              accept="image/*"
              multiple
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={({ onSuccess }) => {
                if (onSuccess) onSuccess('ok');
              }}
            >
              <Button type="primary" icon={<PlusOutlined />}>
                Upload Images
              </Button>
            </Upload>
          </Empty>
        ) : (
          <div className={styles.imagesGrid}>
            {images.map((image) => (
              <Card
                key={image.id}
                className={styles.imageCard}
                actions={[
                  <DeleteOutlined
                    key="delete"
                    onClick={() => showDeleteConfirm(image.id)}
                  />,
                ]}
                hoverable
              >
                <div className={styles.imageCardContent}>
                  <div className={styles.imageCheckbox}>
                    <Checkbox
                      checked={selectedImageIds.includes(image.id)}
                      onChange={(e) =>
                        handleCheckboxChange(image.id, e.target.checked)
                      }
                    />
                  </div>
                  <Image
                    src={image.url}
                    alt={image.fileName}
                    className={styles.thumbnailImage}
                    preview={{
                      src: image.url,
                    }}
                  />
                  <Tooltip title={image.fileName}>
                    <div className={styles.imageFileName}>{image.fileName}</div>
                  </Tooltip>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title="Confirm Delete"
        open={confirmDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setConfirmDeleteModalVisible(false);
          setImageToDelete(null);
        }}
      >
        <p>
          Are you sure you want to delete this image? This action cannot be
          undone.
        </p>
      </Modal>
    </Modal>
  );
}
