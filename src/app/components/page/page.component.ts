import { HostListener } from '@angular/core';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';

import { combineLatest, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';
import { CspdataService } from 'src/app/services/cspdata.service';
import { FormService } from 'src/app/services/form.service';
import { GlobalService } from 'src/app/services/global.service';
import { CategoryModel } from 'src/app/shared/models/category.model';
import { CompanyModel } from 'src/app/shared/models/company.model';
import { ContentModel } from 'src/app/shared/models/content.model';
import { JsonPageModel } from 'src/app/shared/models/JsonPage.model';
import { Paragraph } from 'src/app/shared/models/paragraph.model';

import { FormDialogComponent } from '../dialogs/form-dialog/form-dialog.component';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { FileContentMime, FilePath } from 'src/app/shared/models/filecontent.model';

declare var $: any;
declare var PUB_DATA: any;
declare var SUPPLIER_PARAMS: any;
declare var cspPageIndicator: any;
declare var cspConsumerInfo: any;
declare var cspCategoryText: any;

@Component({
  selector: '[app-page]',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { id: 'tcma-sb',"[attr.data-version]": "version", '[class]': 'pageClass'}
})
export class PageComponent implements OnInit, AfterViewInit {
  @Input() categoryData: CategoryModel[];
  version: string = require( '../../../../package.json').version;
  public cspConsumer: CompanyModel;
  public categoryList: CategoryModel[] = [];
  public categoryFormList: ContentModel[] = [];
  public crrCategory: CategoryModel;
  public pageContent: string = '';
  public isHtmlContent: boolean = false;
  public ytUrl: any;
  public parentItem: JsonPageModel = new JsonPageModel({
    name: 'parent',
    type: 'body',
    fxLayout: undefined,
    fxLayoutAlign: undefined,
  });
  public lstData: any;
  public pageLoaded: boolean = false;
  public isSafari: boolean = false;
  public excMsg: string = '';
  public categoryTitle: string = '';
  public crrCategoryId: string = '';
  public crrCategoryAlias: string = '';
  public pageClass: string = '';
  public formSubmitting: boolean = false;
  public fieldSelectValue: any[] = [];
  private _pageLoad: Subject<string> = new Subject<string>();
  private _pageIndicate: any = JSON.parse(cspPageIndicator);
  private _showcaseHash: string = '';
  private _langList: any = {};
  private _gdprLocalize: any;
  private _isInitReport: boolean = false;
  private _rootNode: CategoryModel;

  private _pageTemplate: JsonPageModel;
  public style: SafeStyle;
  public parentClass = 'tcma-sb';
  // @HostBinding('style') style: SafeStyle;
  styleElement = null;
  private _queryParams: any;
  private _socialData: any;

  constructor(
    private _dataService: CspdataService,
    private _routeActive: ActivatedRoute,
    private _router: Router,
    private _elementRef: ElementRef,
    private _dialog: MatDialog,
    private _formService: FormService,
    private _commonService: CommonService,
    private _glService: GlobalService,
    private _sanitizer: DomSanitizer,
    private el: ElementRef,
    private _http: HttpClient
  ) {
    this.crrCategory = new CategoryModel();
    this._langList.CspLanguage = [];
    this._isInitReport = false;
    this._router.events.subscribe((val) => {
      this.pageLoaded = false;
    });

    this._routeActive.params.subscribe((routerParams) => {
      this.crrCategoryId = '';
      this._isInitReport = false;
      this.crrCategoryAlias =
        typeof routerParams['id'] == 'undefined'
          ? this._glService.cspShowcaseHomeId
          : routerParams['id']?.toLowerCase();
      if (this.crrCategoryAlias == this._glService.cspShowcaseHomeId) {
        this.crrCategoryId = this.crrCategoryAlias;
        this.crrCategoryAlias = '';
      }
      if (this._pageTemplate != undefined) {
        this._loadPages(routerParams);
      }
    });
  }
  @HostListener('window:message', ['$event'])
  onMessage(event: any) {
    // console.log(event.data);
    // window.parent.postMessage(event.data, '*');
    this._resizeIframe(event.data);
  }
  ngOnInit() {
    let initData$ = combineLatest(
      this._dataService.getLanguageList(),
      this._dataService.getGdprLocalize(),
      // this._dataService.getGdprLocalizePrj(),
      this._dataService.getCompanyInfo(PUB_DATA['companyId']),
      this._dataService.getCategory(
        PUB_DATA['companyId'],
        parseInt(PUB_DATA['languageId'])
      ),
      this._routeActive.params,
      this._routeActive.queryParams
    ).pipe(
      map(
        ([
          langList,
          gdprLocalize,
          // gdprLocalizePrj,
          consumerInfo,
          rawCategories,
          routeActiveParams,
          routeQueryParams,
        ]) => {
          return {
            langList,
            gdprLocalize,
            // gdprLocalizePrj,
            consumerInfo,
            rawCategories,
            routeActiveParams,
            routeQueryParams,
          };
        }
      )
    );
    this._glService.iframeLoad$.subscribe((data) => {
      if (data) this._resizeIframe(data);
    });

    let basicData$ = initData$.subscribe((x) => {
      basicData$.unsubscribe();
      const rootCategory = x.rawCategories.find(
        (x: any) => x.parentId == null || x.parentId == undefined
      );
      this._formService
        .getForms(
          PUB_DATA['companyId'],
          15001,
          parseInt(PUB_DATA['languageId']),
          rootCategory?.id
        )
        .subscribe((lstForm) => {
          if (lstForm) this.categoryFormList = lstForm;
        });
      this._queryParams = x.routeQueryParams;
      if (
        typeof this._queryParams['socialtype'] != 'undefined' &&
        typeof this._queryParams['contentid'] != 'undefined'
      ) {
        this._dataService
          .getSociaContent(
            this._queryParams['companyid'],
            this._queryParams['contentid']
          )
          .subscribe((social) => {
            this._socialData = JSON.parse(social.contentData);

            this._loadPageData(x);
          });
      } else this._loadPageData(x);
    });

    // this._dataService.subjectCategoryForm.subscribe((f) => {
    //   this.categoryFormList = this._glService.listCategoryForm = f;
    // });
    this._pageLoad.subscribe(() => {
      this._handlingLinks();
      this._handleInlineForm();
      if (!this._isInitReport) {
        this._isInitReport = true;
        this._commonService.initCspReport();
        this._commonService.initGoogleConversion();
      }
    });

    if (typeof SUPPLIER_PARAMS !== 'undefined') {
      let allowJava = SUPPLIER_PARAMS.find((x) => x.name == 'Allow_Javascript');
      this._glService.allowJava = allowJava
        ? JSON.parse(allowJava.value)
        : true;
      let showcaseTheme = SUPPLIER_PARAMS.find(
        (x) => x.name == 'Showcase_Theme'
      );
      if (showcaseTheme) this._loadTheme(JSON.parse(showcaseTheme?.value));
    }
  }

  ngAfterViewInit(): void {
    let top = document.getElementById('top');
    if (top !== null) {
      top.scrollIntoView({ behavior: 'smooth', block: 'start' });
      top = null;
    }
  }

  openDialog(event: any, configData: any) {
    event.preventDefault();
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = 450;
    dialogConfig.maxWidth = 800;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = configData;
    // console.log('configData', configData);

    this._dialog.open(FormDialogComponent, dialogConfig);
  }

  _loadPageData(x: {
    langList: any;
    gdprLocalize: any;
    // gdprLocalizePrj: any;
    consumerInfo: CompanyModel;
    rawCategories: CategoryModel[];
    routeActiveParams: Params;
    routeQueryParams: any;
  }) {
    this.cspConsumer = this._glService.companyInfo = x.consumerInfo;
    this._langList = this._glService.listLanguages = x.langList;
    // this._gdprLocalize = this._glService.gdprTranslation =
    //   x.gdprLocalizePrj?.length > 0 ? x.gdprLocalizePrj : x.gdprLocalize;
    this._gdprLocalize = this._glService.gdprTranslation = x.gdprLocalize ?? {};
    this.categoryList = this._glService.listCategory = x.rawCategories;

    this._glService.gdprTranslatedText = this._getGdprText();

    let rootNote = (this._rootNode = this.categoryList.find(
      (x) => x.parentId == undefined || x.parentId == ''
    ));
    let leadRequests$ = combineLatest(
      this._dataService.getPageContent(
        PUB_DATA['companyId'],
        rootNote.id,
        parseInt(PUB_DATA['languageId']),
        15001
      ),
      this._dataService.getLeadFields(
        PUB_DATA['companyId'],
        parseInt(PUB_DATA['languageId'])
      )
    ).pipe(
      map(([leadForms, leadFields]) => {
        return { leadForms, leadFields };
      })
    );

    let leadData$ = leadRequests$.subscribe((lData) => {
      leadData$.unsubscribe();
      this._prepairLeadForms(lData.leadForms);
      this._pageTemplate =
        rootNote != undefined
          ? JSON.parse(rootNote.data['showcaseTemplate'])
          : [];
      if (this._pageTemplate != undefined) this._loadPages(x.routeActiveParams);
    });
  }

  private _prepairLeadForms(leadForms: CategoryModel[]) {
    leadForms.forEach((lForm) => {
      lForm.data = JSON.parse(lForm.data);
    });
    this._glService.listLeadForm = leadForms;
  }

  private _loadPages(routerParams: Params): void {
    this.categoryTitle = '';

    this._showcaseHash =
      typeof routerParams['any'] != 'undefined' ? routerParams['any'] : '';
    this.crrCategory =
      this.crrCategoryId == ''
        ? undefined
        : this.categoryList.find((x) => x.id == this.crrCategoryId);

    if (this.crrCategory == undefined) {
      this.crrCategory = this.categoryList.find((x) => {
        let categoryTitleData = x.categoryText
          .split(' ')
          .filter((t) => t != '' && t != '-');
        let categoryAlias = categoryTitleData
          .join('-')
          .replace(/[^0-9a-z\-]/gi, '')
          .toLowerCase();
        return categoryAlias == this.crrCategoryAlias;
      });
    }

    //TCMA-944 social deeplink issue
    if (this.crrCategory == undefined) {
      this.crrCategoryId =
        this._socialData != undefined &&
        typeof this._socialData['ShowcaseLink'] != 'undefined'
          ? this._socialData['ShowcaseLink']
          : '';
      this.crrCategory = this.categoryList.find(
        (x) => x.id == this.crrCategoryId
      );
    }

    //Category not found - redirect to Home
    if (this.crrCategory == undefined) {
      let routePath =
        this._showcaseHash != ''
          ? `${this._routeActive.snapshot.url[0].path}/${this._showcaseHash}`
          : this._routeActive.snapshot.url[0].path;
      this._router.navigate([routePath]);
      return;
    }
    // cspCategoryText = this.crrCategory.categoryText;
    this.pageClass = `tcma-sb prj-${PUB_DATA.projectName.replace(
      /\s/g,
      ''
    )} cat-${this.crrCategory.id}`;
    this.addCustomCssJsFav();
    this._glService.pageClass = this.pageClass;
    this._glService.activeCategory = this.crrCategory;
    if (typeof this.crrCategory.data['contentTitle'] != 'undefined')
      this.categoryTitle = this.crrCategory.data['contentTitle'];
    this._commonService.setPageTitle(this.categoryTitle);
    this._getPageContent();
  }

  private _getPageContent(): void {
    this.pageContent = '';
    this.lstData = {};
    this.pageLoaded = true;
    this._dataService
      .getPageContent(
        PUB_DATA.companyId,
        this.crrCategory.id,
        PUB_DATA.languageId
      )
      .subscribe((x: CategoryModel[]) => {
        this.pageLoaded = true;

        if (x.length == 0) return;
        // console.log('x',x);

        x.sort((obj1, obj2) => {
          if (Date.parse(obj1.modifiedAt) > Date.parse(obj2.modifiedAt)) {
            return 1;
          }
          if (Date.parse(obj1.modifiedAt) < Date.parse(obj2.modifiedAt)) {
            return -1;
          }
          return 0;
        });
        for (let pContent of x) {
          pContent.data = JSON.parse(pContent.data);
          try {
            this._glService.editingPageItems = JSON.parse(
              pContent.data['contentPage']
            ) as JsonPageModel[];
          } catch {
            this._glService.editingPageItems = [];
          }
        }

        this._loadIntoTemplate();
        this._handleInlineForm();
        if (!this._isInitReport) {
          this._isInitReport = true;
          this._commonService.initCspReport();
          this._commonService.initGoogleConversion();
        }

        setInterval(() => {
          $(document).click();
          // this._iframeListenerScrollToTop();
        }, 1000);
      });
  }
  private _iframeListenerScrollToTop() {
    let iframe = document.getElementsByTagName('iframe')[0];
    if (!iframe) return;
    iframe.onload = (evt) => {
      iframe.scrollIntoView();
    };
  }

  _loadIntoTemplate() {
    let crrTemplate = JSON.parse(this._rootNode.data['showcaseTemplate']);
    // console.log('crrTemplate', crrTemplate);
    // console.log('this._glService.editingPageItems', this._glService.editingPageItems);
    // if (
    //   this._glService.editingPageItems.find((x) => x.type == 'section') ==
    //   undefined
    // ) {
    //   this._glService.editingPageItems.forEach((pageItem) => {
    //     this._replaceInParent(pageItem, crrTemplate);
    //   });
    // } else {
    //   crrTemplate.children = this._glService.editingPageItems;
    // }
    this._glService.editingPageItems.forEach((item) => {
      this._setContent(crrTemplate, item.uId, item.properties);
    });

    crrTemplate.uId = 'body';
    this.parentItem = crrTemplate;
    this.parentItem.children = this.parentItem.children.filter((x) => {
      if (x.categoryIds) return x.categoryIds.includes(this.crrCategory.id);
      return false;
    });
  }
  private _setContent(object: JsonPageModel, uId: string, replace: any): any {
    if (object.uId == uId) object.properties = replace;
    else {
      if (object.children) {
        object.children.forEach((obj) => {
          this._setContent(obj, uId, replace);
        });
      }
    }
  }

  _replaceInParent(pageItem: JsonPageModel, parentItem: JsonPageModel) {
    if (
      parentItem == undefined ||
      typeof parentItem.children == 'undefined' ||
      parentItem.children.length == 0
    ) {
      return;
    }
    for (var i = 0; i < parentItem.children.length; i++) {
      if (parentItem.children[i].uId == pageItem.uId) {
        parentItem.children[i].properties = pageItem.properties;
        return;
      }
      this._replaceInParent(pageItem, parentItem.children[i]);
    }
  }

  private _loadInlineForm() {
    let sectionForm = this.lstData.filter((x) => x.name == 'section-form');
    for (let s of sectionForm) {
      console.log(s);
    }
  }

  private _handleNewJsonLink(): void {
    let aList = this._elementRef.nativeElement.getElementsByTagName('a');
    for (let aTag of aList) {
      this._wtLinkDecorating(aTag, '');
    }
  }

  private _handlingLinks(): void {
    let prefixUrl =
      this._showcaseHash != '' ? `showcase/${this._showcaseHash}/` : '';
    let aList = this._elementRef.nativeElement.getElementsByTagName('a');
    let tagToRemove: any = [];
    for (let aTag of aList) {
      try {
        aTag.removeAttribute('tabindex');
      } catch (exc) {}
      this._wtLinkDecorating(aTag, null);
      let aHref =
        aTag.getAttributeNode('href') == null
          ? ''
          : aTag.getAttributeNode('href').value;
      if (aHref.indexOf('d1.aspx') > -1) {
        let tmpHref = aHref.split('#/');
        aHref = tmpHref[tmpHref.length - 1];
        aTag.getAttributeNode('href').value = aHref;
      }

      if (
        aTag.getAttributeNode('class') != null &&
        aTag.getAttributeNode('class').value.indexOf('gated-assets') > -1
      ) {
        aTag.getAttributeNode('href').value = 'javascript: void(0)';
        aTag.setAttribute('relasset', btoa(aHref));
        this._wtLinkDecorating(aTag, 'asset-link');
        aTag.addEventListener(
          'click',
          (e, evt: MouseEvent) => {
            e.preventDefault();
            this.openDialog(e, {
              assetLink: e,
              cspConsumer: this.cspConsumer,
              categoryFormList: this.categoryFormList,
              trigger: new ElementRef(evt?.currentTarget),
            });
          },
          false
        );
      }

      if (aHref.indexOf('category/') > -1) {
        let cId = aHref.split('/');
        let categoryInfo = null;
        try {
          categoryInfo = this.categoryList.filter(
            (x) => x.legacyId == parseInt(cId[cId.length - 1])
          );
        } catch (exc) {
          console.log(exc);
        }

        let internalUrl = `${prefixUrl}${aHref}`;
        internalUrl = internalUrl.replace(/#\//g, '');
        aTag.getAttributeNode('href').value = internalUrl;
        if (categoryInfo == null || categoryInfo.length == 0) {
          tagToRemove.push(aTag);
        } else {
          this._wtLinkDecorating(aTag, 'link');
        }
        aTag.addEventListener(
          'click',
          (e) => {
            e.preventDefault();
            this._isInitReport = false;
            this._router.navigate([internalUrl]);
          },
          false
        );
      }
    }

    for (var i = tagToRemove.length - 1; i >= 0; i--) {
      tagToRemove[i].parentNode.removeChild(tagToRemove[i]);
    }
  }

  private _wtLinkDecorating(aTag: any, wtType: string): void {
    let aHref =
      aTag.getAttributeNode('href') == null
        ? ''
        : aTag.getAttributeNode('href').value;
    switch (wtType) {
      case 'link':
        let cId = aHref.split('/');
        let categoryInfo = null;
        try {
          categoryInfo = this.categoryList.filter(
            (x) => x.legacyId == parseInt(cId[cId.length - 1])
          );
        } catch (exc) {
          console.log(exc);
        }

        aTag.setAttribute('cspobj', 'REPORT');
        aTag.setAttribute('csptype', 'LINKS');
        if (categoryInfo != null && categoryInfo.length > 0)
          aTag.setAttribute(
            'cspenglishvalue',
            categoryInfo[0].data['contentTitle']
          );

        break;
      case 'asset-link':
        aHref =
          aTag.getAttributeNode('relasset') == null
            ? ''
            : aTag.getAttributeNode('relasset').value;
        var fileName = atob(aHref).split('/').pop().split('.').shift();
        aTag.setAttribute('cspobj', 'REPORT');
        aTag.setAttribute('csptype', 'DOWNLOADS');
        aTag.setAttribute('cspenglishvalue', fileName);
        break;
      default:
        if (aHref.indexOf(cspConsumerInfo.phoneNumber) > -1) {
          aTag.classList.add('gforwarding-trigger');
        }
        break;
    }
  }

  private _getGdprText(): string {
    let gdprText = '';
    try {
      let consumerLang = this._langList.CspLanguage.filter(
        (x) => parseInt(x.Id) == PUB_DATA.languageId
      );

      let consumerLangCode =
        typeof consumerLang[0] != 'undefined'
          ? consumerLang[0].LanguageCode
          : this._langList.CspLanguage[0].LanguageCode;
      let gdprRawText =
        typeof this._gdprLocalize[consumerLangCode] != 'undefined'
          ? this._gdprLocalize[consumerLangCode]
          : this._gdprLocalize['en'];
      if (gdprRawText.trim() == '') {
        gdprRawText =
          '&nbsp;I confirm, {companyname} is allowed to use my personal data to contact me. {companyname} is responsible for compliance with the applicable privacy regulations.';
      }
      gdprText = gdprRawText.replace(
        /{companyname}/g,
        this.cspConsumer?.companyName
      );
    } catch {}
    if (gdprText.trim() == '') {
      let gdprRawText =
        '&nbsp;I confirm, {companyname} is allowed to use my personal data to contact me. {companyname} is responsible for compliance with the applicable privacy regulations.';

      gdprText = gdprRawText.replace(
        /{companyname}/g,
        this.cspConsumer?.companyName
      );
    }
    return gdprText;
  }
  private _handleInlineForm(): void {
    if (!this._gdprLocalize) {
      this._dataService.getGdprLocalize().subscribe(() => {
        this._buildInlineForm();
      });
    } else {
      setTimeout(() => {
        this._buildInlineForm();
      }, 500);
    }
  }

  private _buildInlineForm(): void {
    let gdprText = this._getGdprText();
      $('.render-contact-form').each(function () {
        let numberPattern = /\d+/g;
        if ($(this).find('#gdpr-confirmation').length == 0) {
          var newDiv = $('<div>')
            .addClass('object button form-group')
            .attr('mandatory', true);
          newDiv.html(`<div class="tieContactUsFormFieldCheckboxBlock w-full flex justify-center object form-row mt-2">
                        <input type="checkbox" name="gdpr-confirmation" class="tieValidate csp-form-field" id="gdpr-confirmation"
                            valtype="mandatoryField" error="GDPR confirmation field is required" value="" required="" hidden>
                        <label for="gdpr-confirmation" class="material-icons cursor-pointer ico-checked text-secondary">
                          check_box
                        </label>
                        <label for="gdpr-confirmation" class="material-icons cursor-pointer ico-uncheck opacity-50">
                          check_box_outline_blank
                        </label>
                        <label class="ml-1" for="gdpr-confirmation">${gdprText}</label>
                      </div>`);
          newDiv.insertBefore($(this).find('.object:last'));
        }
        if ($(this).find('form').length == 0) {
          var formId = $(this).find('div:first').attr('class');
          var formCategoryId = formId.match(numberPattern).join('');
          var formHtml = $(this).html();
          $(this).html(
            '<form class="csp-inline-form" id="' +
              formId +
              '" categoryFormId="' +
              formCategoryId +
              '">' +
              formHtml +
              '</form>'
          );
        }
      });

      this._bindingFormEvent();
  }

  private _bindingFormEvent() {
    let formList = this._elementRef.nativeElement.getElementsByTagName('form');
    let fIndex = 1;
    for (let form of formList) {
      
      for (let fField of form.getElementsByClassName('object')) {
        if (
          fField.getAttributeNode('mandatory') != null &&
          fField.getAttributeNode('mandatory').value.toLowerCase() == 'false' &&
          fField.getElementsByClassName('csp-form-field').length > 0
        ) {
          fField
            .getElementsByClassName('csp-form-field')[0]
            .removeAttribute('required');
        }

        if (
          typeof fField.getElementsByClassName('csp-form-field')[0] !=
          'undefined'
        )
          fField
            .getElementsByClassName('csp-form-field')[0]
            .setAttribute('tabindex', fIndex);
        else {
          try {
            fField
              .getElementsByTagName('input')[0]
              .setAttribute('tabindex', fIndex);
            fField
              .getElementsByTagName('select')[0]
              .setAttribute('tabindex', fIndex);
            fField.getElementsByTagName('select')[0].selectedIndex = 0;
          } catch (exc) {
            /* fField
              .getElementsByTagName('input')[0]
              .setAttribute('tabindex', fIndex); */
          }
        }

        let inputEl = fField.getElementsByTagName('input')[0];
        if (
          inputEl != undefined &&
          inputEl.getAttributeNode('type').value == 'checkbox' &&
          inputEl.getAttributeNode('id').value.indexOf('gdpr') > -1
        ) {
          inputEl.addEventListener('change', (e) => {
            e.srcElement.setAttribute('value', 'true');
            if (!e.target.checked) {
              e.srcElement.setAttribute('value', 'false');
            }
          });
        }
        if (
          inputEl != undefined &&
          inputEl.getAttributeNode('type').value == 'button' &&
          inputEl.getAttributeNode('class').value.indexOf('submit') > -1
        ) {
          inputEl.addEventListener('click', (e) => {
            if (form.reportValidity()) {
              form.dispatchEvent(new Event('submit'));
            }
          });
        }

        fIndex++;
      }

      form.addEventListener('submit', (e) => {
        if (!this.pageLoaded) return false;
        this.pageLoaded = false;
        this.formSubmitting = true;

        let testForm = false;
        let form = e.srcElement;
        let categoryId = form.getAttributeNode('categoryFormId').value;
        const formTitle = form.getAttributeNode('categoryFormName').value;
        let formCategory = this.categoryFormList.filter(
          // (x) => x.legacyId == parseInt(categoryId)
          (x) => x.categoryId == categoryId
        );
        if (formCategory.length == 0) {
          formCategory = this.categoryFormList.filter(
            (x) => x.id == categoryId
          );
        }
        // console.log('formSubmitData', e.srcElement.getElementsByTagName('input'));
        const elements = e.srcElement.getElementsByTagName('input');
        let arrCheckbox = [];
        for (const el of elements) {
          if (el.type == 'checkbox' && el.name != 'gdpr-confirmation')
            arrCheckbox.push(el);
        }
        arrCheckbox = arrCheckbox.map((el) => ({
          name: el.name,
          value: el.checked.toString(),
          id: el.id,
        }));
        let formSubmitData = $(e.srcElement).serializeArray();
        formSubmitData.filter((x: any) => x.value.indexOf('ignore') > -1);
        for (let finalField of formSubmitData) {
          if (typeof finalField.id == 'undefined')
            finalField.id = finalField.name
              .replace(/[^A-Za-z]/g, '')
              .toLowerCase();
          if (finalField.value.indexOf('test') > -1) testForm = true;
        }
        formSubmitData = formSubmitData.filter((x: any) => x.id != 'subject');
        formSubmitData.push({
          name: 'subject',
          id: 'subject',
          value: formTitle ?? 'Contact Us from Showcase',
        });
        formSubmitData = _.unionBy(arrCheckbox, formSubmitData, 'id');
        // console.log('formSubmitData', formSubmitData);

        formSubmitData = this._commonService.wtFormSubmit(
          formSubmitData,
          'ContactUs',
          this.categoryTitle,
          this.crrCategory.legacyId
        );

        let leadPostData = {
          companyId: this.cspConsumer?.id,
          isTest: testForm,
          data: JSON.stringify(formSubmitData),
        };
        let trigger = new ElementRef(e?.currentTarget);
        // this.openDialog(e, {
        //   assetLink: null,
        //   cspConsumer: this.cspConsumer,
        //   categoryFormList: this.categoryFormList,
        //   formId: categoryId,
        //   submitSucceed: true,
        //   trigger: trigger,
        // });

        this._formService.submit(leadPostData).subscribe(() => {
          this.pageLoaded = true;
          form.reset();

          this.openDialog(e, {
            assetLink: null,
            cspConsumer: this.cspConsumer,
            categoryFormList: this.categoryFormList,
            formId: categoryId,
            submitSucceed: true,
            trigger: trigger,
          });
        });
      });
    }
  }
  private _loadTheme(theme: any): void {
    if (!theme || !theme.colors) {
      return;
    }
    const primary = this._getColor(
      theme.colors.find((x: any) => x.name === 'primary')
    );
    const secondary = this._getColor(
      theme.colors.find((x: any) => x.name === 'secondary')
    );
    const tertiary = this._getColor(
      theme.colors.find((x: any) => x.name === 'tertiary')
    );
    let importFontFace = '';
    let cssParagraphs = '';
    theme.paragraphs?.forEach((p: Paragraph) => {
      cssParagraphs += this._getParagraphCss(p);
      if (p.id == this.parentClass)
        importFontFace = this._renderFonts(p.fontUrl);
    });

    this.style = this._sanitizer.bypassSecurityTrustHtml(
      this._minifyCSS(`
    <style>
    ${importFontFace}
    </style>
    <style>
      .${this.parentClass} {
        --primary-contrast: ${primary.contrast};
        --primary-light: ${primary.light};
        --primary:${primary.default};
        --primary-dark: ${primary.dark};

        --secondary-contrast: ${secondary.contrast};
        --secondary-light: ${secondary.light};
        --secondary:${secondary.default};
        --secondary-dark: ${secondary.dark};

        --tertiary-contrast: ${tertiary.contrast};
        --tertiary-light: ${tertiary.light};
        --tertiary:${tertiary.default};
        --tertiary-dark: ${tertiary.dark};
      }
    </style>
    <style>
      ${cssParagraphs}
    </style>`)
    );
  }

  private _minifyCSS(css: string) {
    return css
      .replace(/([^0-9a-zA-Z\.#])\s+/g, '$1')
      .replace(/\s([^0-9a-zA-Z\.#]+)/g, '$1')
      .replace(/;}/g, '}')
      .replace(/\/\*.*?\*\//g, '');
  }

  private _renderFonts(urls: string[] | undefined): string {
    if (!urls) return '';
    urls = urls.filter((x) => this._validatorUrl(x));
    let str = '';
    urls.forEach((url) => {
      if (url.toLowerCase().includes('googleapis'))
        str += `@import url('${url}');`;
      else str += this._createFontFace(url);
    });
    return str;
  }

  private _getFileName(url: string) {
    let fileName = url.substring(url.lastIndexOf('/') + 1, url.length);
    return fileName.substring(0, fileName.lastIndexOf('.'));
  }

  public _validatorUrl(url: any) {
    let expression =
      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    let regex = new RegExp(expression);
    return url.match(regex);
  }

  private _createFontFace(fontLink: string) {
    let url = fontLink;
    // if (url.toLowerCase().includes('/static/customer-resources/')) {
    //   let path = url.substring(url.lastIndexOf('/customer-resources'));
    //   url = 'https://prodtcma.blob.core.windows.net' + path;
    // }
    let arr = url.split('|').map((s) => s.trim());
    arr.filter((x) => !this._validatorUrl(x));
    let name = this._getFileName(arr[0])
      ? this._getFileName(arr[0])
      : 'ErrorName';

    let fontStyle = 'font-style: normal;';

    let fontWeight = 'font-weight: normal;';
    let fontEot = '';
    let notFontEot = `src: local('${name}'),`;
    arr.forEach((url) => {
      let ext = url.substring(url.lastIndexOf('.') + 1, url.length);
      switch (ext.toLowerCase().trim()) {
        case 'eot':
          fontEot = `src: url('${url}');`;
          break;
        case 'eot?#iefix':
          notFontEot += `url('${url}') format('embedded-opentype'),`;
          break;
        case 'otf':
          notFontEot += `url('${url}') format('opentype'),`;
          break;
        case 'woff':
          notFontEot += `url('${url}') format('woff'),`;
          break;
        case 'woff2':
          notFontEot += `url('${url}') format('woff2'),`;
          break;
        case 'ttf':
          notFontEot += `url('${url}') format('truetype'),`;
          break;
        case 'svg#' + name:
          notFontEot += `url('${url}') format('svg'),`;
          break;
        default:
          notFontEot += `url('${url}') format('${ext}'),`;
          break;
      }
    });
    return `@font-face { font-family: '${name}'; ${fontEot} ${notFontEot}; ${fontWeight} ${fontStyle} font-display: swap; }`.replace(
      ',;',
      ';'
    );
  }

  private _getColor(color: any): any {
    const defaultColor = {
      name: 'default',
      contrast: '#FFF',
      light: '#9CA3AF',
      default: '#6B7280',
      dark: '#4B5563',
    };
    if (!color) {
      return defaultColor;
    }
    let newColor: any = defaultColor;
    Object.keys(newColor).forEach((key) => {
      if (
        key !== 'name' &&
        color.hasOwnProperty(key) &&
        color[key] &&
        color[key].trim()
      ) {
        newColor[key] = color[key];
      }
    });

    return newColor;
  }

  private _getParagraphCss(item: Paragraph): string {
    let style = '';
    const UNSET = 'unset';
    if (this.toClassName(item) == this.parentClass)
      style = `.${this.toClassName(item)} {`;
    else style = `.${this.parentClass} .${this.toClassName(item)} {`;
    if (item.fontFamily && item.fontFamily.includes('@')) {
      // google font
      let ff = item.fontFamily.split('@')[0].split('+').join(' ');
      style += `font-family:'${ff.replace(/["']/g, '')}', sans-serif;`;

      let fs = item.fontFamily.split('@')[1].split(',');
      fs.map((s) => s.trim());
      if (fs.includes('1')) style += `font-style: italic;`;

      let fw = fs.find((x) => {
        return x.match(new RegExp(/[1-9]\d\d/g)); // 3 digit number
      });
      if (fw) style += `font-weight: ${fw.replace(/["']/g, '')};`;
    } else {
      if (item.fontFamily && item.fontFamily != UNSET)
        style += `font-family: '${item.fontFamily}', sans-serif;`;
      if (item.fontWeight && item.fontWeight != UNSET)
        style += `font-weight: ${item.fontWeight};`;
      if (item.fontStyle && item.fontStyle != UNSET)
        style += `font-style: ${item.fontStyle};`;
    }
    if (item.fontSize && item.fontSize != UNSET)
      style += `font-size: ${item.fontSize};`;
    if (item.lineHeight && item.lineHeight != UNSET)
      style += `line-height: ${item.lineHeight};`;
    if (item.color && item.color != UNSET) style += `color: ${item.color};`;
    return style + '}';
  }

  public toClassName(item: Paragraph) {
    return item.name.replace(/\s/g, '').trim().toLowerCase();
  }

  private _submitForm(form: any, e: any, evt: MouseEvent) {
    let testForm = false;
    let categoryId = form.getAttributeNode('categoryFormId').value;
    let formCategory = this.categoryFormList.filter(
      // (x) => x.legacyId == parseInt(categoryId)
      (x) => x.categoryId == categoryId
    );
    if (formCategory.length == 0) {
      formCategory = this.categoryFormList.filter((x) => x.id == categoryId);
    }
    let formSubmitData = form.serializeArray();

    for (let finalField of formSubmitData) {
      if (typeof finalField.id == 'undefined')
        finalField.id = finalField.name.replace(/[^A-Za-z]/g, '').toLowerCase();
      if (finalField.value.indexOf('test') > -1) testForm = true;
    }

    formSubmitData = this._commonService.wtFormSubmit(
      formSubmitData,
      'ContactUs',
      this.categoryTitle,
      this.crrCategory.legacyId
    );

    let leadPostData = {
      companyId: this.cspConsumer?.id,
      isTest: testForm,
      data: JSON.stringify(formSubmitData),
    };

    this._formService.submit(leadPostData).subscribe(() => {
      this.pageLoaded = true;
      form.reset();

      this.openDialog(e, {
        assetLink: null,
        cspConsumer: this.cspConsumer,
        categoryFormList: this.categoryFormList,
        formId: categoryId,
        submitSucceed: true,
        trigger: new ElementRef(evt?.currentTarget),
      });
    });
  }
  private _getQueryVariable(url: string, variable: string) {
    var query = url.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] == variable) {
        return pair[1];
      }
    }

    return false;
  }
  private _resizeIframe(data) {
    let newHeight = 0;

    if (typeof data === 'number') {
      newHeight = data;
    }
    if (typeof data === 'string') {
      let queryIframeHeight = this._getQueryVariable(data, 'y');
      newHeight = +queryIframeHeight;
    }
    let iframe = document.getElementsByTagName('iframe')[0];
    // if (iframe && newHeight > 0 && iframe?.height != newHeight.toString()) {
    if (iframe && newHeight > 0 && parseInt(iframe?.height) < newHeight) {
      newHeight += 150;
      iframe.height = newHeight.toString();
      iframe.style.height = iframe.height + 'px';
      // console.log(iframe.height);
      window.parent.postMessage(newHeight, '*');
    }
  }

  private removeExternalLinkElements(): void {
    var linkElements = document.querySelectorAll("link[ rel ~= 'icon' i]");
    for (var linkElement of Array.from(linkElements)) {
      linkElement.parentNode.removeChild(linkElement);
    }
  }

  private addCustomCssJsFav(): void {
    const head = document.getElementsByTagName('head')[0];
    //customCss
    const prjFolder = environment.prjFolder.replace(
      '{prjname}',
      PUB_DATA.projectName
    );
    const cssId = `customCss-${PUB_DATA.projectName}`; // you could encode the css path itself to generate id..
    const customCssUrl: string = `${prjFolder}/${FilePath.CSS}`;
    if (!document.getElementById(cssId)) {
      let linkCss = document.createElement('link');
      linkCss.id = cssId;
      linkCss.rel = 'stylesheet';
      // linkCss.type = 'text/css';
      linkCss.type = FileContentMime.CSS;
      linkCss.href = customCssUrl;
      linkCss.media = 'all';
      head.appendChild(linkCss);
    }
    //customJs
    const jsId = `customJs-${PUB_DATA.projectName}`;
    const customJsUrl: string = `${prjFolder}/${FilePath.JS}`;
    if (!document.getElementById(jsId)) {
      let script = document.createElement('script');
      script.id = jsId;
      script.type = 'text/javascript';
      // script.type = FileContentMime.JS;
      script.src = customJsUrl;
      head.appendChild(script);
    }

    //customFavicon
    const favIconUrL: string = `${prjFolder}/${FilePath.FAVICON}`;
    const linkFav = document.createElement('link');
    linkFav.rel = 'icon';
    // linkFav.type = 'image/x-icon';
    linkFav.type = FileContentMime.FAVICON;
    const hrefCategory = favIconUrL.replace(
      'favicon.ico',
      `cat-${this.crrCategory.id}/favicon.ico` //favicon by category
    );
    linkFav.href = favIconUrL;
    this.removeExternalLinkElements();
    head.appendChild(linkFav);
    this._http.get(hrefCategory, { responseType: 'text' }).subscribe((res) => {
      if (!res) return;
      linkFav.href = hrefCategory;
      this.removeExternalLinkElements();
      head.appendChild(linkFav);
    });
  }
}
