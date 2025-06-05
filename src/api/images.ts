import instance, { BASE_URL } from '../services/api';

const IMAGES_URL = (orgSlug: string, projectId: string) =>
  `${BASE_URL}/orgs/${orgSlug}/projects/${projectId}/images`;

export interface ImageMetadata {
  id: string;
  fileName: string;
  url: string;
  projectId: string;
  orgId: string;
  createdAt: Date;
}

export interface UploadImageResponse extends ImageMetadata {
  s3Key: string;
}

export const uploadImage = async (
  orgSlug: string,
  projectId: string,
  file: File
): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await instance.post<UploadImageResponse>(
    IMAGES_URL(orgSlug, projectId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

export const listImages = async (
  orgSlug: string,
  projectId: string
): Promise<ImageMetadata[]> => {
  const response = await instance.get<ImageMetadata[]>(IMAGES_URL(orgSlug, projectId));
  return response.data;
};

export const getImage = async (
  orgSlug: string,
  projectId: string,
  imageId: string
): Promise<ImageMetadata> => {
  const response = await instance.get<ImageMetadata>(`${IMAGES_URL(orgSlug, projectId)}/${imageId}`);
  return response.data;
};

export const deleteImage = async (
  orgSlug: string,
  projectId: string,
  imageId: string
): Promise<void> => {
  await instance.delete(`${IMAGES_URL(orgSlug, projectId)}/${imageId}`);
};