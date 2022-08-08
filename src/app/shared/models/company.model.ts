export class CompanyModel {
    id: string;
    companyName: string;
    address1: string;
    address2: string;
    city: string;
    zipCode: string;
    state: string;
    country: string;
    county: string;
    websiteUrl: string;
    isConsumer: boolean;
    isSupplier: boolean;
    defaultLanguageId: number;
    fallbackLanguageId?: number;
    languageCode: string;
    parentId: string;
    parentCompanyName: string;
    companyContact: CompanyContactodel;
    companyParameters: CompanyParameterodel[];
    externalId: number;
    parentLegacyId: number;
}

export class CompanyContactodel {
    firstName: string;
    middleName: string;
    lastName: string;
    emailAddress: string;
    mobile: string;
    telephone: string;
    department: string;
    notes: string;
}

export class CompanyParameterodel {
    propName: string;
    name: string;
    value: string;
}