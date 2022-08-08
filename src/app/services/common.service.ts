import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import 'jquery';
import { GlobalService } from './global.service';
declare var PUB_DATA: any;
declare var _tag: any;
declare var CSP_WT_TRACKING_URL: any;
declare var loadGConversion: any;
declare var cspConsumerInfo: any;
declare var CspReportLib: any;
declare var WebTrends: any;

declare global {
  interface JQuery {
    iframed(object1, object2, object3, object4): JQuery;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  public srcWebTrends: string = environment.libWebTrends;
  constructor(private _glService: GlobalService) {

  }

  initCspReport(): void {
    if (cspConsumerInfo.companyname == '') return;
    if (_tag == null) {
      this.loadDynmicallyScript(this.srcWebTrends).then(() => {
        window['initWebtrendsTag']();
        this._appendCspReportLib();
      });
      return;
    }
    this._appendCspReportLib();
  }

  public setPageTitle(newTitle: string): void {
    $('head title').text(newTitle);
  }

  public wtFormSubmit(formSubmitData: any, conversionValue: string, categoryTitle: string, categoryId: number): any {
    if (typeof (CspReportLib) != 'undefined') {
      var olDCSext = CspReportLib.wt.DCSext;
      CspReportLib.wt.DCSext["ConversionShown"] = null;
      CspReportLib.wt.DCSext["ConversionClick"] = conversionValue;
      CspReportLib.wt.DCSext["ConversionType"] = conversionValue;
      CspReportLib.wt.DCSext["ConversionContent"] = conversionValue;
      CspReportLib.wt.dcsMultiTrack();
      CspReportLib.wt.DCSext = olDCSext;
    }
    formSubmitData.push({
      name: 'categoryid',
      id: 'categoryid',
      value: categoryId
    });
    formSubmitData.push({
      name: 'categorytitle',
      id: 'categorytitle',
      value: categoryTitle
    });
    if (typeof (WebTrends) != 'undefined') {
      var wtInstance = new WebTrends();
      wtInstance.dcsFPC();
      if (typeof (wtInstance.WT.vtvs) != 'undefined') {
        formSubmitData.push({
          name: 'sessionid',
          id: 'sessionid',
          value: wtInstance.WT.vtvs
        });
      }
      if (typeof (wtInstance.WT.vtid) != 'undefined') {
        formSubmitData.push({
          name: 'visitorid',
          id: 'visitorid',
          value: wtInstance.WT.vtid
        });
      }
    }
    if (this._glService.utmValues != '') {
      formSubmitData.push({
        name: 'utmtags',
        id: 'utmtags',
        value: this._glService.utmValues
      });
    }

    if (this._glService.utmSource != undefined) formSubmitData.push(this._glService.utmSource);
    if (this._glService.utmMedium != undefined) formSubmitData.push(this._glService.utmMedium);
    if (this._glService.utmCampaign != undefined) formSubmitData.push(this._glService.utmCampaign);
    if (this._glService.utmTopic != undefined) formSubmitData.push(this._glService.utmTopic);
    if (this._glService.utmReferringPartner != undefined) formSubmitData.push(this._glService.utmReferringPartner);
    if (this._glService.utmReferringUser != undefined) formSubmitData.push(this._glService.utmReferringUser);
    if (this._isHasValue(this._glService.utmLeadType)) formSubmitData.push(this._glService.utmLeadType);
    let checkFormTitle = formSubmitData.find(x => x.id == 'subject');
    if (checkFormTitle == undefined) {
      formSubmitData.push({
        name: 'subject',
        id: 'subject',
        value: `Contact Us from Showcase`
      });
    }

    return formSubmitData;
  }

  public loadDynmicallyScript(scrScript: string): Promise<any> {
    var script = document.createElement('script');
    script.src = scrScript;
    script.async = false;
    document.head.appendChild(script);
    return new Promise<any>((resolve, reject) => {
      script.onload = resolve;
    });
  }

  public initGoogleConversion(): void {
    try {
      loadGConversion();
    }
    catch (exc) { }
  }

  public initIframeResized(): void {

    try {
      var Instanceid = 1;
      var iframeName = window.name;
      if (!iframeName) iframeName = "_opt" + Instanceid;
      jQuery(document).iframed("startClient", iframeName, "", function () {
        var hold = $('#tcma-sb').height();
        return {
          x: 665,
          y: hold < 500 ? 1000 : hold
        };
      });
    } catch (ex) {
      console.log(ex);
    };
  }

  private _appendCspReportLib(): void {
    $('head #csp-report-lib').remove();
    if ($('head #csp-report-lib').length > 0) return;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "csp-report-lib";
    script.src = environment.libCspReport;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  private _isEmptyString = (data: string): boolean => typeof data === "string" && data.trim().length == 0
  private _isHasValue = (utm: any): boolean => !this._isEmptyString(utm?.value)
}
