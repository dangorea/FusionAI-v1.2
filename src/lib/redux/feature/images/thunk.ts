import { createAsyncThunk } from '@reduxjs/toolkit';
import { notification } from 'antd';
import * as imagesApi from '../../../../api/images';
import { addImagesToContext } from '../../../../api/context';
import type { ImageMetadata } from '../../../../api/images';

export const fetchImagesThunk = createAsyncThunk<
  ImageMetadata[],
  { orgSlug: string; projectId: string }
>('images/fetchImages', async ({ orgSlug, projectId }, { rejectWithValue }) => {
  try {
    return await imagesApi.listImages(orgSlug, projectId);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch images');
  }
});

export const uploadImageThunk = createAsyncThunk<
  imagesApi.UploadImageResponse,
  { orgSlug: string; projectId: string; file: File }
>(
  'images/uploadImage',
  async ({ orgSlug, projectId, file }, { rejectWithValue }) => {
    try {
      return await imagesApi.uploadImage(orgSlug, projectId, file);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to upload image');
    }
  }
);

export const deleteImageThunk = createAsyncThunk<
  string,
  { orgSlug: string; projectId: string; imageId: string }
>(
  'images/deleteImage',
  async ({ orgSlug, projectId, imageId }, { rejectWithValue }) => {
    try {
      await imagesApi.deleteImage(orgSlug, projectId, imageId);
      return imageId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete image');
    }
  }
);

export const addImagesToContextThunk = createAsyncThunk<
  void,
  { contextId: string; projectId: string; imageIds: string[] }
>(
  'images/addToContext',
  async ({ contextId, projectId, imageIds }, { rejectWithValue }) => {
    try {
      await addImagesToContext(contextId, imageIds);
      notification.success({
        message: 'Images added',
        description: 'Images have been successfully added to the context',
      });
    } catch (error: any) {
      notification.error({
        message: 'Failed to add images',
        description: error.message || 'Failed to add images to context',
      });
      return rejectWithValue(error.message || 'Failed to add images to context');
    }
  }
);