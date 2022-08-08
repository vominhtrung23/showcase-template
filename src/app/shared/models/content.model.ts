export class ContentModel {
  public id: string;
  public contentMainId: string;
  public data: any;
  public contentIdentifier: string;
  public categoryId: string;
  public parentId: string;
  public languageId: number;
  public stageId: number;
  public supplierId: string;
  public contentTypeId: number;
  public projectId: string;
  public sortOrder?: number;
  public getContentProperty(paramName: string): string {
    let jsonParam = JSON.parse(this.data);
    return typeof jsonParam[paramName] != 'undefined'
      ? jsonParam[paramName]
      : '';
  }
  public get statusFormfieldType(): string {
    return this.getContentProperty('statusFormfieldType');
  }
}
