import type { TextBlockType } from '../text-blocks/types';

export interface SourceFileType {
  path: string;
  content: string;
}

export interface ImageReferenceType {
  id: string;
  url: string;
  fileName: string;
}

export interface ContextType {
  id: string;
  sourceFiles: SourceFileType[];
  textBlocks: TextBlockType[];
  images?: ImageReferenceType[];
}
