export interface TextBlockEntity {
  id: number;
  title: string;
  content: string;
}

export enum DBStores {
  TextBlocks = 'rules',
}
