export class CategoryModel {
    id: string;
    contentMainId?: string;
    legacyId?: number;
    parentId: string;
    categoryText: string;
    description: string;
    active: boolean;
    externalCategoryCode: string;
    isSubscribable: boolean;
    displayOrder: string;
    data: string;
    modifiedAt? : string;
}