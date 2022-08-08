import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser'
import { CompanyModel } from '../shared/models/company.model';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'cspCode'
})
export class CspCodePipe implements PipeTransform {
  private _injectedHtmlString: string = '';
  private _consumerData: CompanyModel;

  constructor(private sanitized: DomSanitizer) {}

  transform(value: any, args: CompanyModel): any {
    if (typeof(args) == 'undefined') {
      return this.sanitized.bypassSecurityTrustHtml(value);
    }
    this._consumerData = args;
    this._injectedHtmlString = value;
    this._setMandatoryFormField();
    this._replaceCspCode();
    this._replaceCspUrl();

    return this.sanitized.bypassSecurityTrustHtml(this._injectedHtmlString);
  }

  private _setMandatoryFormField() {
    this._injectedHtmlString = this._injectedHtmlString.replace(/valtype="mandatoryField"/gi, 'valtype="mandatoryField" required');
  }

  private _replaceCspCode(): void {
    for (var key in this._consumerData) {
      if (typeof (this._consumerData[key]) != 'object') {
        this._injectedHtmlString = this._injectedHtmlString.replace(new RegExp(`{consumer:f${key}}`, 'gi'), this._consumerData[key]);
      }
    }

    this._injectedHtmlString = this._injectedHtmlString.replace(/{consumer:fconsumerid}/gi, this._consumerData.id);
    this._injectedHtmlString = this._injectedHtmlString.replace(/{fctanguageid}/gi, this._consumerData.defaultLanguageId + '');
    
    for (var i = 0; i < this._consumerData.companyParameters.length; i++) {
      this._injectedHtmlString = this._injectedHtmlString.replace(new RegExp(`{consumer:f${this._consumerData.companyParameters[i].name}}`, 'gi'), this._consumerData.companyParameters[i].value);
    }
    this._injectedHtmlString = this._injectedHtmlString.replace(/{consumer:.+}/gi, '');
    this._injectedHtmlString = this._injectedHtmlString.replace(/src=''/gi, 'src=\'static/showcase/assets/images/csp-pixel.png\'');
    this._injectedHtmlString = this._injectedHtmlString.replace(/src=""/gi, 'src="static/showcase/assets/images/csp-pixel.png"');
  }

  private _replaceCspUrl(): void {
    this._injectedHtmlString = this._injectedHtmlString.replace(/"\/customer-resources\//gi, `"${environment.cspHost}/customer-resources/`);
    this._injectedHtmlString = this._injectedHtmlString.replace(/href="#\/category\//gi, 'href="category/');
  }

}
