import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { CategoryModel } from './shared/models/category.model';
import { CspdataService } from './services/cspdata.service';
import { CommonService } from './services/common.service';
import { GlobalService } from './services/global.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

declare var PUB_DATA: any;
declare var SHOWCASE_SETTINGS: any;
declare var SUPPLIER_PARAMS: any;
declare var googleTagId: any;
declare var cspConsumerInfo: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = '';
  
  public rawCategory: CategoryModel[] = [];

  constructor(public sanitizer: DomSanitizer, private _dataService: CspdataService,
    private _commonService: CommonService, public gl: GlobalService,
    private _router: Router, private _activeRoute: ActivatedRoute) {
    this._checkFailedUriParam();
    if (window.location.href.indexOf('#csp_page:') > -1) {
      let showcaseLink = window.location.href.split('#csp_page:');
      if (typeof (showcaseLink[1]) == 'undefined')
        showcaseLink[1] = '';
      let redirectTo = `${window.location.pathname}${showcaseLink[1]}`;
      if (showcaseLink[0].indexOf('?') > -1) {
        let queryParam = showcaseLink[0].split('?')[1];
        redirectTo += `?${queryParam}`;
      }
      redirectTo = redirectTo.replace('//', '/');
      this._router.navigateByUrl(redirectTo);
    }
    if (window.location.href.indexOf('languageid/') > -1) {
      let langId = window.location.href.split('languageid/')[1];
      if (typeof (langId) != undefined && !isNaN(parseInt(langId))) {
        PUB_DATA.languageId = parseInt(langId);
      }
    }
    
    this._loadCspConsumerInfo();
    this._loadShowcaseSettings();
    // this._loadLocalize();
    this._commonService.initIframeResized();
  }

  ngOnInit() {
    this._activeRoute.queryParamMap.subscribe(params => {
      // console.log('params',params);
      
      this.gl.utmParams = { ...params.keys, ...params };
      this.gl.utmParams$.next(this.gl.utmParams);
    })
  }

  // private _loadLocalize(): void {
  //   this._dataService.getGdprLocalize().subscribe((x) => {
  //     let localizeData = x.find((l: any) => l.id == PUB_DATA.languageId);
  //     this.gl.localizeData = localizeData ?? null;
  //   });
  // }

  private _loadCspConsumerInfo(): void {
    let consumerSub = this._dataService.getCompanyInfo(PUB_DATA.companyId).subscribe(x => {
      if (x==null){
        this._router.navigateByUrl('showcase');
      }
      else {
      consumerSub.unsubscribe();
      let phoneInfo = x.companyParameters.find(x => x.name == 'Personalize_Contact_Phonenumber');
      this.gl.partnerEnv = x.companyParameters.find(x => x.name == 'PRM_Environment')?.value;
      this.gl.partnerContext = x.companyParameters.find(x => x.name == 'PRM_Context')?.value;
            
      cspConsumerInfo = {
        "companies_Id": typeof (x.externalId) != 'undefined' ? x.externalId : PUB_DATA.companyId,
        "companyname": x.companyName,
        "country": x.country,
        "lId": PUB_DATA.languageId,
        "sId": typeof (x.parentLegacyId) != 'undefined' ? x.parentLegacyId : x.parentId,
        "sName": x.parentCompanyName,
        "lng": x.languageCode,
        "lngDesc": "",
        "phoneNumber": phoneInfo != undefined ? phoneInfo.value : x.companyContact.telephone
      };
      if (window.location.host.indexOf('localhost') > -1) {
        cspConsumerInfo["companyname"] = cspConsumerInfo["companyname"].replace(/test_/gi, '');
      }
      
      this._dataService.subjectCompanyInfo.next(x);
    }
    });
  }

  private _loadShowcaseSettings(): void {
    if (typeof (SUPPLIER_PARAMS) != 'undefined' && SUPPLIER_PARAMS != null) {
      let paramHomeId = SUPPLIER_PARAMS.find(x => x.name == 'CSP_Showcase_HomeId');
      if (paramHomeId != undefined)
        this.gl.cspShowcaseHomeId = paramHomeId.value;
    }

    if (typeof (SHOWCASE_SETTINGS) != 'undefined' && SHOWCASE_SETTINGS != null) {
      let gtId = SHOWCASE_SETTINGS.find(x => x.name == 'Google_Tag_ID');
      googleTagId = gtId != undefined ? gtId['value'] : googleTagId;
    }
  }
  // private removeExternalLinkElements() : void {
	// 	var linkElements = document.querySelectorAll( "link[ rel ~= 'icon' i]" );
	// 	for ( var linkElement of Array.from( linkElements ) ) {
	// 		linkElement.parentNode.removeChild( linkElement );
	// 	}
	// }

  // private addFavicon(href: string): void {
  //   this.removeExternalLinkElements()
  //   let link = document.createElement('link');
  //   link.rel = 'icon';
  //   link.href = href;
  //   document.getElementsByTagName('head')[0].appendChild(link);
  // }
  
  private _checkFailedUriParam() {
    if (window.location.href.indexOf('-#') == -1) return;
    let redirectTo = window.location.href.replace('-#', '?');
    if (window.location.href.indexOf('?') > -1 && window.location.href.indexOf('-#') > window.location.href.indexOf('?'))
      redirectTo = window.location.href.replace('-#', '&');
    
    window.location.href = redirectTo;
  }
}
