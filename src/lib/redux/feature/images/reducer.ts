import { createSlice } from '@reduxjs/toolkit';
import type { ImageMetadata } from '../../../../api/images';
import { deleteImageThunk, fetchImagesThunk, uploadImageThunk } from './thunk';

export interface ImagesState {
  images: ImageMetadata[];
  loading: boolean;
  error: string | null;
}

const initialState: ImagesState = {
  images: [],
  loading: false,
  error: null,
};

const imagesSlice = createSlice({
  name: 'images',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Images
    builder.addCase(fetchImagesThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchImagesThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.images = action.payload;
    });
    builder.addCase(fetchImagesThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Upload Image
    builder.addCase(uploadImageThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadImageThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.images.push(action.payload);
    });
    builder.addCase(uploadImageThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Delete Image
    builder.addCase(deleteImageThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteImageThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.images = state.images.filter(
        (image) => image.id !== action.payload,
      );
    });
    builder.addCase(deleteImageThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

// export const {} = imagesSlice.actions;

export default imagesSlice.reducer;
