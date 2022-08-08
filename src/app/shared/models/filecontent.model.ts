export interface FileContent {
  filePath?: string;
  contentMime?: FileContentMime | string;
  content?: string;
}

export interface FileContentParams {
  filePath: string;
}
export interface FileContentState {
  fileContent: FileContent | undefined;
  fileName: string;
  loading: boolean;
}

export enum FileContentMime {
  FAVICON = 'image/x-icon',
  CSS = 'text/css',
  JS = 'application/javascript',
  JSON = 'application/json',
}

export enum FilePath {
  FAVICON = 'css/favicon.ico',
  CSS = 'css/custom.css',
  JS = 'js/custom.js',
  LOCALIZE = 'jsons/gdpr-localize.json',
  FILE_FIELD_SORT = 'jsons/form-field-order.json',
}

export interface FileCustom {
  name?: string;
  type?: FileContentMime;
  path?: FilePath;
}