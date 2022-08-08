import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CategoryModel } from '../shared/models/category.model';
import { CompanyModel } from '../shared/models/company.model';
import { JsonPageModel } from '../shared/models/JsonPage.model';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  public listCategory: CategoryModel[] = [];
  public listPages: CategoryModel[] = [];
  public listCategoryForm: CategoryModel[] = [];
  public listLanguages: any = {};
  public gdprTranslation: any = {};
  public gdprTranslatedText: string = '';
  public companyInfo: CompanyModel;
  public formFieldOrder: any = null;
  public listCategoryFields: CategoryModel[] = [];
  public listFormField: any[] = [];
  public listLeadForm: CategoryModel[] = [];
  public leadFieldLabelTranslation: any[] = [];
  public formFieldSortOrder: any = null;
  public activeCategory: CategoryModel = null;
  public pageClass: string = 'tcma-sb';
  public localizeData: any = null;
  public allowJava: boolean = false;
  public utmParams: any = null;
  public utmParams$: Subject<any> = new Subject<any>();
  public utmValues: string = '';
  public formSubmitting$: Subject<boolean> = new Subject<boolean>();
  public formSubmitting: boolean = false;
  public iframeLoad$: Subject<any> = new Subject<any>();
  public utmSource: any = {
    name: 'lead_source',
    id: 'lead_source',
    value: 'showcase',
  };
  public utmMedium: any = {
    name: 'medium',
    id: 'medium',
    value: 'showcase',
  };
  public utmCampaign: any = {
    name: 'campaign_name',
    id: 'campaign_name',
    value: 'showcase',
  };
  public utmTopic: any = {
    name: 'topic',
    id: 'topic',
    value: '',
  };
  public utmReferringPartner: any = {
    name: 'referringpartner',
    id: 'referringpartner',
    value: '',
  };
  public utmReferringUser: any = {
    name: 'referringuser',
    id: 'referringuser',
    value: '',
  };
  public utmLeadType: any = {
    name: 'leadtype',
    id: 'leadtype',
    value: '',
  };
  public editingPageItems: JsonPageModel[] = [];
  public cspShowcaseHomeId: string = '';
  public partnerEnv: string = '';
  public partnerContext: string = '';
  constructor() {
    this.utmParams$.subscribe((x) => {
      if (typeof x.params == 'undefined' || x.params.length == 0) return;
      let utmElementValue = '';
      for (const [key, value] of Object.entries(x.params)) {
        let tmpValue = value + '';
        if (key.indexOf('utm_') > -1) {
          if (utmElementValue != '') utmElementValue += ' - ';
          tmpValue = tmpValue.replace(/-/gi, ' ');
          utmElementValue += tmpValue;
          switch (key) {
            case 'utm_source':
              this.utmSource.value = tmpValue;
              break;
            case 'utm_medium':
              this.utmMedium.value = tmpValue;
              break;
            case 'utm_campaign':
              this.utmCampaign.value = tmpValue;
              break;
            default:
              this.utmTopic.value = tmpValue;
          }
        }
        if (key == 'referringpartner' && /\S/.test(tmpValue))
          this.utmReferringPartner.value = tmpValue;
        if (key == 'referringuser' && /\S/.test(tmpValue))
          this.utmReferringUser.value = tmpValue;
        if (key == 'leadtype' && /\S/.test(tmpValue))
          this.utmLeadType.value = tmpValue;
      }
      if (utmElementValue != '') this.utmValues = utmElementValue;
    });
  }
  public replaceCspCode(injectedHtmlString: string): string {
    if (this.companyInfo == undefined) {
      injectedHtmlString = injectedHtmlString.replace(/{consumer:.+}/gi, '');
      return injectedHtmlString;
    }
    for (var key in this.companyInfo) {
      if (typeof this.companyInfo[key] != 'object') {
        injectedHtmlString = injectedHtmlString.replace(
          new RegExp(`{consumer:f${key}}`, 'gi'),
          this.companyInfo[key]
        );
      }
    }

    injectedHtmlString = injectedHtmlString.replace(
      /{consumer:fconsumerid}/gi,
      this.companyInfo.id
    );
    injectedHtmlString = injectedHtmlString.replace(
      /{fctanguageid}/gi,
      this.companyInfo.defaultLanguageId + ''
    );

    for (var i = 0; i < this.companyInfo.companyParameters.length; i++) {
      injectedHtmlString = injectedHtmlString.replace(
        new RegExp(
          `{consumer:f${this.companyInfo.companyParameters[i].name}}`,
          'gi'
        ),
        this.companyInfo.companyParameters[i].value
      );
    }
    injectedHtmlString = injectedHtmlString.replace(/{consumer:.+}/gi, '');

    return injectedHtmlString;
  }
}
