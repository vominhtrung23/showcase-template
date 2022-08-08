import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ElementRef,
  SecurityContext,
} from '@angular/core';
import { JsonPageModel } from 'src/app/shared/models/JsonPage.model';
import { GlobalService } from 'src/app/services/global.service';
import { CspdataService } from 'src/app/services/cspdata.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { FormService } from 'src/app/services/form.service';
import { FormDialogComponent } from '../dialogs/form-dialog/form-dialog.component';
import { CompanyModel } from 'src/app/shared/models/company.model';
import { YoutubeComponent } from '../dialogs/youtube-dialog/youtube.component';
import { FormFieldModel } from 'src/app/shared/models/formfield.model';
import { VideoComponent } from '../dialogs/video-dialog/video.component';
import { EmbedDialogComponent } from '../dialogs/embed-dialog/embed-dialog.component';
declare var PUB_DATA: any;

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemComponent implements OnInit {
  @Input() item: JsonPageModel;
  // @Output() itemDrop: EventEmitter<CdkDragDrop<Item>>;
  loading: boolean = true;
  public listForm: any[] = [];
  public cspConsumer: CompanyModel;
  public listFormChecked: any[] = [];
  private _showcaseHash: string = '';
  public formSubmitting: boolean = false;
  public selectModel: any = {};
  public type = ItemType;

  listParentType = ['section', 'container', 'div'];
  constructor(
    public glService: GlobalService,
    private _cspDataService: CspdataService,
    private _routeActive: ActivatedRoute,
    private _router: Router,
    private _dialog: MatDialog,
    private _formService: FormService,
    private _sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.cspConsumer = this.glService.companyInfo;
    this.item.class = this.item.class
      ? this.item.class.replace(/\s+/g, ' ').trim()
      : '';
    this._routeActive.params.subscribe((x) => {
      if (this._showcaseHash == '')
        this._showcaseHash = typeof x['any'] != 'undefined' ? x['any'] : '';
    });
  }

  public loadForm(item: JsonPageModel, props: string): string {
    let fId =
      typeof item.properties.find((x) => x.props == props) == 'undefined'
        ? ''
        : item.properties.find((x) => x.props == props).value;
    /*
    if (typeof(item.properties.find(x => x.props == 'fieldList')) == 'undefined') {
      item.properties.push({
        props: 'fieldList',
        value: []
      });
    }
    item.properties.find(x => x.props == 'fieldList').value.sort((a, b) => { return parseInt(a.data['statusSortOrder']) > parseInt(b.data['statusSortOrder']) ? 1 : -1; });
    */
    /*
    if (this.listFormChecked.indexOf(fId) == -1) {
      this.listFormChecked.push(fId);
      this._cspDataService.getPageContent(PUB_DATA.companyId, fId, PUB_DATA.languageId, 15000).subscribe(x => {
        console.log(x, item.properties.find(x => x.props == 'fieldList').value);
      });
    }
    */
    return fId;
  }

  getFields(item: JsonPageModel): any[] {
    let fields = [];
    let formId = this.getProps(item, 'formId');
    let inlineForm = this.glService.listLeadForm.find(
      (x) => x.contentMainId == formId
    );

    if (inlineForm != undefined) {
      let fieldIds = (inlineForm.data['fieldList'] as FormFieldModel[]).map(
        (x) => x.contentMainId
      );
      fieldIds.forEach((fId) => {
        let checkField = this.glService.listFormField?.find(
          (x) => x.contentMainId == fId
        );
        if (checkField != undefined) fields.push(checkField);
      });
    }

    return fields;
  }
  getFormTitle(item: JsonPageModel): string {
    const formId = this.getProps(item, 'formId');
    const inlineForm = this.glService.listLeadForm.find(
      (x) => x.contentMainId == formId
    );
    return inlineForm?.data['formTitle'] ?? 'inline-form';
  }

  public sanitize(url: string) {
    return this._sanitizer.bypassSecurityTrustUrl(url);
  }

  public getCspReportType(linkEl: JsonPageModel): string {
    if (linkEl.class.indexOf('csp-deep-link') > -1) return 'LINKS';
    else if (this.getProps(linkEl, 'assetform') != undefined)
      return 'DOWNLOADS';
    return '';
  }

  public getCspReportValue(linkEl: JsonPageModel): string {
    let thisSrc = this.getProps(linkEl, 'categoryLink');
    if (thisSrc != undefined) {
      let checkCategory = this.glService.listCategory.find(
        (x) => x.id == thisSrc
      );
      if (checkCategory != null) {
        return checkCategory.data['contentTitle'];
      }
      return '';
    } else if (
      this.getProps(linkEl, 'assetUrl') != undefined &&
      this.getProps(linkEl, 'assetUrl') != ''
    ) {
      thisSrc = this.getProps(linkEl, 'assetUrl');
      return thisSrc.split('/').pop().trim();
    } else if (
      this.getProps(linkEl, 'href') != undefined &&
      this.getProps(linkEl, 'href') != ''
    ) {
      thisSrc = this.getProps(linkEl, 'href');
      return thisSrc.split('/').pop().trim();
    }
    return '';
  }

  public loadFieldOpt(fLabel: string): any[] {
    let listOpt: any[] = [];
    let optIndex = 0;
    var lastChar = fLabel.substr(fLabel.length - 1);
    if (lastChar == '*') fLabel = fLabel.substr(0, fLabel.length - 1);
    else lastChar = '';

    for (let fItem of fLabel.split(',')) {
      let fValue = optIndex == 0 ? '' : fItem;
      if (fItem.trim() != '') {
        listOpt.push({
          label: fItem,
          value: fValue,
        });
        optIndex++;
      }
    }
    listOpt[0].label = listOpt[0].label + lastChar;
    return listOpt;
  }
  /*
  public inlineFormSubmit(e: Event, formItem: JsonPageModel): void {
    e.preventDefault();
    console.log(e.srcElement, formItem);
  }
  */
  isHorizontal(item: JsonPageModel) {
    // if (item.class.includes("flex-row"))
    // if (item.flexLayout && item.flexLayout.fxFlex && item.flexLayout.fxFlex.indexOf("column") !== -1)
    if (item.fxLayout && item.fxLayout.indexOf('column') !== -1)
      return 'horizontal';
    return undefined;
  }
  public isParent(type: string) {
    if (!type) return false;
    let listParentType = [
      ItemType.body.toLowerCase(),
      ItemType.section.toLowerCase(),
      ItemType.div.toLowerCase(),
      ItemType.container.toLowerCase(),
    ];
    return listParentType.includes(type.toLowerCase());
    // return (type.toLowerCase() == ItemType.div.toLowerCase() || type.toLowerCase() == ItemType.body.toLowerCase());
  }

  getStyles(item: JsonPageModel) {
    let result: { [k: string]: any } = {};
    let bg = item.properties?.find((x) => x.props == 'background')?.value;
    if (bg) result['background-image'] = 'url(' + bg + ')';
    // if (
    //   item.type != 'section' &&
    //   item.type != 'container' &&
    //   item.type != 'div'
    // )
    //   return null;
    // if (item.styles == undefined || item.styles == [] || item.styles == null)
    //   return null;
    // var result = item.styles.reduce(
    //   (obj, style) => Object.assign(obj, { [style.props]: style.value }),
    //   {}
    // );
    // // console.log("console.log: ListItemComponent -> getStyles -> object", result)

    return result;
  }
  getProps(item: JsonPageModel, props: string) {
    if (item.name == 'inlineform' && props == 'fieldList') {
      let formId = item.properties.find((x) => x.props == 'formid')?.value
        ? item.properties.find((x) => x.props == 'formid')?.value
        : '';
      if (item.properties.find((x) => x.props == props))
        item.properties.find((x) => x.props == props).value =
          this.glService.listCategoryFields.filter((x) => x.id == formId);

      //this._formFieldSort(item, formId);
      return item.properties.find((x) => x.props == props)?.value;
    }
    let prop = item.properties?.find((x) => x.props == props);
    let propValue = prop == undefined ? prop : prop.value;
    if (propValue != undefined && propValue.indexOf('{consumer:') > -1) {
      propValue = this._replaceCspCode(propValue);
    }
    if (props.toLowerCase().includes('class') && propValue) {
      propValue = propValue.replace(/\s+/g, ' ').trim();
    }
    return propValue;
  }

  getBgVideoParam(item: JsonPageModel, key?: string): boolean {
    const url_string = this.getProps(item, 'backgroundVideo'); 
    if (!url_string || !key) return true;
    const url = new URL(url_string);
    // if ((key = 'autoplay'))
    //   console.log('url.searchParams.get(key)', url.searchParams.get(key));
    return (/true/i).test(url.searchParams.get(key));
  }
  getSafeContent(item: JsonPageModel) {
    // return this.glService.allowJava;
    if (this.glService.allowJava)
      return this._sanitizer.bypassSecurityTrustHtml(
        this.getProps(item, 'content')
      );
    return this._sanitizer.sanitize(
      // SecurityContext.URL,
      SecurityContext.HTML,
      this.getProps(item, 'content')
    );
  }

  public checkCategorySubscribe(item: JsonPageModel) {
    let catSub = item.properties?.find((x) => x.props == 'categorySubscribe');
    if (!catSub) return true;
    return this.glService.listCategory.some((x) => x.id == catSub.value);
  }

  checkSubscribeStatus(item: JsonPageModel) {
    let isSubscribed = false;
    let deepLink = this.getProps(item, 'categoryLink');
    if (deepLink != undefined) {
      isSubscribed =
        this.glService.listCategory.find((x) => x.id == deepLink) != undefined;
    }
    return isSubscribed;
  }

  checkChildrenSubscribeStatus(item: JsonPageModel) {
    if (!item.children || item.children.length == 0) return true;
    for (let i = 0; i < item.children.length; i++) {
      const child = item.children[i];
      if (
        child.name == 'button' &&
        this.getProps(child, 'categoryLink') != undefined &&
        this.checkSubscribeStatus(child) == false
      ) {
        return false;
      }
      if (this.checkChildrenSubscribeStatus(child) == false) {
        return false;
      }
    }
    return true;
  }

  getImgSrc(item: JsonPageModel, props: string) {
    let propValue = this.getProps(item, props);
    if (propValue != undefined && propValue.indexOf('{consumer:') > -1) {
      propValue = this._replaceCspCode(propValue);
    }
    if (propValue == '' || propValue == undefined) {
      propValue = 'static/showcase/assets/images/csp-pixel.png';
    }

    return propValue;
  }
  onLoad() {
    this.loading = false;
  }
  public getDivClass(item: JsonPageModel) {
    let rel = (item.class ? item.class : '').trim();
    if (rel.includes('toggle-') && rel.includes('-on'))
      rel += ' ' + 'tw-hidden';

    return rel.replace(/\s\s+/g, ' ').trim();
  }
  public getItemClass(item: JsonPageModel) {
    let rel = '';
    let classHide = '';
    let content = this.getProps(item, 'content')
      ? this.getProps(item, 'content')?.trim().toLowerCase()
      : '';
    let src = this.getProps(item, 'src')
      ? this.getProps(item, 'src')?.trim().toLowerCase()
      : '';
    if (
      content == '{hide}' ||
      content == '{hidden}' ||
      content == '{tw-hidden}'
    )
      classHide += 'tw-hidden hide hidden';
    if (src == '{hide}' || src == '{hidden}' || src == '{tw-hidden}')
      classHide += 'tw-hidden hide hidden';
    rel = (
      (item.innerClass ? item.innerClass : '') +
      ' ' +
      (item.themeClass ? item.themeClass : '') +
      ' ' +
      classHide
    ).trim();
    if (rel.includes('toggle-') && rel.includes('-on'))
      rel += ' ' + 'tw-hidden';

    return rel.replace(/\s\s+/g, ' ').trim();
  }
  public clickToggleBtn(e: MouseEvent, el: JsonPageModel): void {
    e.preventDefault();
    if (el.name != ItemType.button) return;
    // let thisSrc =
    //   this.getProps(el, 'href') == undefined
    //     ? this.getProps(el, 'src')
    //     : this.getProps(el, 'href');
    let thisSrc = this.getProps(el, 'href') ? this.getProps(el, 'href') : '';
    if (thisSrc && thisSrc.trim().includes('{toggle-')) {
      let classToggle = thisSrc.split('{').pop().split('}')[0];
      // console.log('classToggle', classToggle);
      if (classToggle) {
        classToggle =
          '.' +
          classToggle.toLowerCase().replace('-off', '').replace('-on', '');
        let classOn = classToggle + '-on';
        let classOff = classToggle + '-off';
        document.querySelectorAll(classOn).forEach((x) => {
          x.classList.toggle('tw-hidden');
        });
        document.querySelectorAll(classOff).forEach((x) => {
          x.classList.toggle('tw-hidden');
        });
      }
      return;
    }
  }
  public clickCategoryLink(e: MouseEvent, el: JsonPageModel): void {
    e.preventDefault();
    if (el.name != ItemType.button && el.name != ItemType.image) return;
    let deepLink = this.getProps(el, 'categoryLink');
    if (!deepLink) return;
    let checkCategory = this.glService.listCategory.find(
      (x) => x.id == deepLink
    );
    if (!checkCategory) return;
    // if (checkCategory != null) {
    let categoryTitleData = checkCategory.categoryText
      .split(' ')
      .filter((x) => x != '' && x != '-');
    let categoryAlias = categoryTitleData
      .join('-')
      .replace(/[^0-9a-z\-]/gi, '')
      .toLowerCase();

    let routePath =
      this._showcaseHash != ''
        ? `${this._routeActive.snapshot.url[0].path}/${this._showcaseHash}`
        : this._routeActive.snapshot.url[0].path;
    let internalUrl = `${routePath}/page/${categoryAlias}`;
    this._router.navigate([internalUrl]);
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    return;
    // }
  }
  public clickWatchVideo(e: MouseEvent, el: JsonPageModel): void {
    e.preventDefault();
    if (el.name != ItemType.button && el.name != ItemType.image) return;
    // let thisSrc =
    //   this.getProps(el, 'assetUrl') != undefined &&
    //   this.getProps(el, 'assetUrl') != ''
    //     ? this.getProps(el, 'assetUrl')
    //     : this.getProps(el, 'href');
    let thisSrc = this.getProps(el, 'href') ? this.getProps(el, 'href') : '';
    thisSrc = thisSrc.trim();
    // if (this._isExternalLink(thisSrc)) {
    if (thisSrc.indexOf('youtu') > -1) {
      let dialogBoxSettings = {
        height: '500px',
        width: '55%',
        margin: '0 auto',
        disableClose: false,
        autoFocus: true,
        data: { src: thisSrc, trigger: new ElementRef(e.currentTarget) },
      };
      this._dialog.open(YoutubeComponent, dialogBoxSettings);
      return;
    }
    // window.open(thisSrc, '_blank');
    // return;
    // }
    if (
      thisSrc.endsWith('.mp4') ||
      thisSrc.endsWith('.ogg') ||
      thisSrc.endsWith('.webm')
    ) {
      thisSrc = thisSrc.replace('/static/', '/video/stream?subpath=');
      let dialogBoxSettings = {
        margin: '0 auto',
        disableClose: false,
        autoFocus: true,
        data: { src: thisSrc, trigger: new ElementRef(e.currentTarget) },
      };
      this._dialog.open(VideoComponent, dialogBoxSettings);
      return;
    }
    return;
    // window.open(thisSrc, '_blank');
  }
  public clickEmbedDialog(e: MouseEvent, el: JsonPageModel): void {
    e.preventDefault();
    if (el.name != ItemType.button && el.name != ItemType.image) return;
    let thisSrc = this.getProps(el, 'href') ? this.getProps(el, 'href') : '';
    let dialogBoxSettings = {
      margin: '0 auto',
      disableClose: false,
      autoFocus: true,
      width: '500px',
      maxWidth: '100%',
      data: { src: thisSrc, trigger: new ElementRef(e.currentTarget) },
    };
    this._dialog.open(EmbedDialogComponent, dialogBoxSettings);
    return;
  }
  public clickAssetsLink(e: MouseEvent, el: JsonPageModel): void {
    e.preventDefault();
    if (el.name != ItemType.button && el.name != ItemType.image) return;
    if (!this.getProps(el, 'assetFormId')) return;
    const dialogConfig = new MatDialogConfig();
    // let thisSrc =
    //   this.getProps(el, 'assetUrl') != undefined &&
    //   this.getProps(el, 'assetUrl') != ''
    //     ? this.getProps(el, 'assetUrl')
    //     : this.getProps(el, 'href');
    let thisSrc = this.getProps(el, 'href') ? this.getProps(el, 'href') : '';
    // thisSrc = thisSrc.trim();
    dialogConfig.minWidth = 300;
    dialogConfig.maxWidth = 500;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      assetBtnLink: thisSrc,
      cspConsumer: this.glService.companyInfo,
      categoryFormList: this.glService.listLeadForm,
      formId: this.getProps(el, 'assetFormId'),
      trigger: new ElementRef(e.currentTarget),
    };
    this._dialog.open(FormDialogComponent, dialogConfig);
    return;
  }
  public clickDownloadLink(e: MouseEvent, el: JsonPageModel): void {
    e.preventDefault();
    if (el.name != ItemType.button && el.name != ItemType.image) return;
    let thisSrc =
      this.getProps(el, 'href') == undefined
        ? this.getProps(el, 'src')
        : this.getProps(el, 'href');
    window.open(thisSrc, '_blank');
    return;
  }
  public goToLink(e: MouseEvent, el: any): void {
    e.preventDefault();
    // let thisSrc =
    //   this.getProps(el, 'href') == undefined
    //     ? this.getProps(el, 'src')
    //     : this.getProps(el, 'href');
    let thisSrc = this.getProps(el, 'href') ? this.getProps(el, 'href') : '';
    // if (this.isHTML) {
    //   this.clickEmbedDialog(e, el)
    //   return;
    // }
    if (thisSrc && thisSrc.trim().includes('{toggle-')) {
      let classToggle = thisSrc.split('{').pop().split('}')[0];
      // console.log('classToggle', classToggle);
      if (classToggle) {
        classToggle =
          '.' +
          classToggle.toLowerCase().replace('-off', '').replace('-on', '');
        let classOn = classToggle + '-on';
        let classOff = classToggle + '-off';
        document.querySelectorAll(classOn).forEach((x) => {
          x.classList.toggle('tw-hidden');
        });
        document.querySelectorAll(classOff).forEach((x) => {
          x.classList.toggle('tw-hidden');
        });
      }
      return;
    }
    if (
      this.getProps(el, 'assetFormId') != undefined &&
      this.getProps(el, 'assetFormId') != ''
    ) {
      const dialogConfig = new MatDialogConfig();
      thisSrc =
        this.getProps(el, 'assetUrl') != undefined &&
        this.getProps(el, 'assetUrl') != ''
          ? this.getProps(el, 'assetUrl')
          : this.getProps(el, 'href');
      // thisSrc = thisSrc.trim();
      dialogConfig.minWidth = 300;
      dialogConfig.maxWidth = 500;
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.data = {
        assetBtnLink: thisSrc,
        cspConsumer: this.glService.companyInfo,
        categoryFormList: this.glService.listLeadForm,
        formId: this.getProps(el, 'assetFormId'),
        // data: { src: thisSrc, trigger: new ElementRef(e.currentTarget) },
        trigger: new ElementRef(e.currentTarget),
      };
      this._dialog.open(FormDialogComponent, dialogConfig);
      return;
    }

    let deepLink = this.getProps(el, 'categoryLink');
    if (deepLink != undefined) {
      let checkCategory = this.glService.listCategory.find(
        (x) => x.id == deepLink
      );
      if (checkCategory != null) {
        let categoryTitleData = checkCategory.categoryText
          .split(' ')
          .filter((x) => x != '' && x != '-');
        let categoryAlias = categoryTitleData
          .join('-')
          .replace(/[^0-9a-z\-]/gi, '')
          .toLowerCase();

        let routePath =
          this._showcaseHash != ''
            ? `${this._routeActive.snapshot.url[0].path}/${this._showcaseHash}`
            : this._routeActive.snapshot.url[0].path;
        let internalUrl = `${routePath}/page/${categoryAlias}`;
        this._router.navigate([internalUrl]);
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
        return;
      }
    }

    if (this._isExternalLink(thisSrc)) {
      if (thisSrc.indexOf('youtu') > -1) {
        let dialogBoxSettings = {
          height: '500px',
          width: '55%',
          margin: '0 auto',
          disableClose: false,
          autoFocus: true,
          data: { src: thisSrc, trigger: new ElementRef(e.currentTarget) },
        };
        this._dialog.open(YoutubeComponent, dialogBoxSettings);
        return;
      }
      window.open(thisSrc, '_blank');
      return;
    }
    if (
      thisSrc.endsWith('.mp4') ||
      thisSrc.endsWith('.ogg') ||
      thisSrc.endsWith('.webm')
    ) {
      thisSrc = thisSrc.replace('/static/', '/video/stream?subpath=');
      let dialogBoxSettings = {
        margin: '0 auto',
        disableClose: false,
        autoFocus: true,
        data: thisSrc,
      };
      this._dialog.open(VideoComponent, dialogBoxSettings);
      return;
    }
    window.open(thisSrc, '_blank');
  }

  public isTelephoneLink(item: JsonPageModel): boolean {
    let thisSrc = this.getProps(item, 'href');
    return thisSrc != undefined && thisSrc.indexOf('tel:') == 0;
  }

  public isVideo(item: JsonPageModel): boolean {
    let thisSrc = this.getProps(item, 'href');
    let fileExt = thisSrc != undefined ? thisSrc.split('.').pop() : '';

    if (thisSrc == undefined) return false;

    return (
      thisSrc.indexOf('youtu') ||
      fileExt == '.mp4' ||
      fileExt == '.ogg' ||
      fileExt == '.webm'
    );
  }

  public isGatedFile(item: JsonPageModel): boolean {
    let thisSrc = this.getProps(item, 'href');
    let fileExt = thisSrc != undefined ? thisSrc.split('.').pop() : '';

    if (thisSrc == undefined || fileExt.trim().toLowerCase() != 'pdf')
      return false;
    return true;
  }

  public getLink(el: any): string {
    let thisSrc = this.getProps(el, 'src');
    if (el.name == 'image') thisSrc = this.getProps(el, 'href');
    if (this.getProps(el, 'assetform') != undefined) {
      return '#';
    }

    let checkCategory = this.glService.listCategory.find(
      (x) => x.id == thisSrc
    );
    if (checkCategory != null) {
      let categoryTitleData = checkCategory.data['contentTitle']
        .split(' ')
        .filter((x) => x != '' && x != '-');
      let categoryAlias = categoryTitleData
        .join('-')
        .replace(/[^0-9a-z\-]/gi, '')
        .toLowerCase();

      let routePath =
        this._showcaseHash != ''
          ? `${this._routeActive.snapshot.url[0].path}/${this._showcaseHash}`
          : this._routeActive.snapshot.url[0].path;
      let internalUrl = `${routePath}/page/${categoryAlias}`;
      return internalUrl;
    }
    return thisSrc;
  }

  public selectChanged(e: any) {
    console.log(e);
  }

  private _isExternalLink(url: string): boolean {
    var domain = function (url) {
      return url.replace('http://', '').replace('https://', '').split('/')[0];
    };

    return domain(location.href) !== domain(url);
  }

  private _replaceCspCode(injectedHtmlString: string): string {
    if (this.cspConsumer == undefined) {
      injectedHtmlString = injectedHtmlString.replace(/{consumer:.+}/gi, '');
      return injectedHtmlString;
    }
    for (var key in this.cspConsumer) {
      if (typeof this.cspConsumer[key] != 'object') {
        injectedHtmlString = injectedHtmlString.replace(
          new RegExp(`{consumer:f${key}}`, 'gi'),
          this.cspConsumer[key]
        );
      }
    }

    injectedHtmlString = injectedHtmlString.replace(
      /{consumer:fconsumerid}/gi,
      this.cspConsumer.id
    );
    injectedHtmlString = injectedHtmlString.replace(
      /{fctanguageid}/gi,
      this.cspConsumer.defaultLanguageId + ''
    );

    for (var i = 0; i < this.cspConsumer.companyParameters.length; i++) {
      injectedHtmlString = injectedHtmlString.replace(
        new RegExp(
          `{consumer:f${this.cspConsumer.companyParameters[i].name}}`,
          'gi'
        ),
        this.cspConsumer.companyParameters[i].value
      );
    }
    injectedHtmlString = injectedHtmlString.replace(/{consumer:.+}/gi, '');

    return injectedHtmlString;
  }

  public getIfEmail(fId) {
    return fId.indexOf('mail') < 0 ? 'text' : 'email';
  }

  public translateLabel(
    item: JsonPageModel,
    fieldId: string,
    fieldObject = null
  ) {
    if (
      this.glService.companyInfo.defaultLanguageId == 6 &&
      fieldObject['statusFormfieldType'] == 'submit'
    )
      return 'Submeter';
    let fLabel =
      fieldObject == null ? fieldId : fieldObject['contentFormFieldLabel'];
    //console.log(item, fieldObject, this.glService.companyInfo);
    fLabel = fLabel.replace('*', '');
    if (
      fieldObject['statusFormfieldValidationYN'] != undefined &&
      fieldObject['statusFormfieldValidationYN'].toLowerCase() == 'yes'
    )
      fLabel += '*';
    return fLabel.replace('**', '*');
  }

  private _formFieldSort(item: JsonPageModel, fId: string): void {
    if (this.glService.formFieldOrder != null) {
      let sortedForm = this.glService.formFieldOrder.find(
        (x) => x.formId.toLowerCase() == fId.toLowerCase()
      );
      if (sortedForm == undefined) {
        sortedForm = this.glService.formFieldOrder.find(
          (x) => x.formId.toLowerCase() == 'default'
        );
      }
      if (sortedForm == undefined) return;

      item.properties.find((x) => x.props == 'fieldSortOrder').value =
        sortedForm.fieldOrder;
      let crrFieldList = item.properties.find((x) => x.props == 'fieldList');
      if (crrFieldList == undefined || crrFieldList.value.legnth == 0) return;
      for (let sortedF of sortedForm.fieldOrder) {
        let targetField = crrFieldList.value.find(
          (x) =>
            x.data['statusFormFieldId'].toLowerCase() ==
            sortedF.fieldId.toLowerCase()
        );
        if (targetField != undefined) {
          targetField.data['statusSortOrder'] = sortedF.sortOrder;
        }
      }
      item.properties
        .find((x) => x.props == 'fieldList')
        .value.sort((a, b) => {
          return parseInt(a.data['statusSortOrder']) >
            parseInt(b.data['statusSortOrder'])
            ? 1
            : -1;
        });
    }
  }
  public fxLayout(item: any, str: string): string {
    if (item.fxLayout && item.fxLayout[str]) return item.fxLayout[str];
    if (item.fxLayout && item.fxLayout['default'])
      return item.fxLayout['default'];
    return 'row';
  }
  public fxLayoutAlign(item: any, str: string): string {
    if (item.fxLayoutAlign && item.fxLayoutAlign[str])
      return item.fxLayoutAlign[str];
    if (item.fxLayoutAlign && item.fxLayoutAlign['default'])
      return item.fxLayoutAlign['default'];
    return 'start stretch';
  }
  public submitInlineForm(e: Event) {
    e.preventDefault();
  }

  public getSrcIframe(item: JsonPageModel) {
    let url = this.getProps(item, 'src');
    this._replaceCspCode(url);
    return url ? url : '';
  }
  public getPropsIframe(item: JsonPageModel, props: string) {
    let prop = item.properties?.find((x) => x.props == props);
    if (props == 'allowfullscreen')
      //  true | false
      return prop ? prop.value : false;
    if (props == 'scrolling')
      // auto | yes | no
      return prop ? prop.value : 'auto';
    return prop ? prop.value : '';
  }
  public loadIframe() {
    // console.log(document.getElementsByTagName('iframe')[0].height);
    let iframe = document.getElementsByTagName('iframe')[0];
    if (!iframe) return;
    iframe.scrollIntoView();
    this.glService.iframeLoad$.next(iframe.height);
    setInterval(function () {
      $(document).click();
    }, 150);
    // console.log(this._count);
    // document.getElementsByTagName('iframe')[0].click();
  }
  isHTML(str) {
    var a = document.createElement('div');
    a.innerHTML = str;
    for (var c = a.childNodes, i = c.length; i--; ) {
      if (c[i].nodeType == 1) return true;
    }
    return false;
  }
  public getFormFieldType(lField: any): string {
    if (!lField) return '';
    if (lField['contentFormFieldLabel']?.toLowerCase().includes('[checkbox]'))
      return 'checkbox';
    return lField['statusFormfieldType'];
  }
  public getFieldLabel(lField: any): string {
    if (!lField) return '';
    const label = lField['contentFormFieldLabel']
      .replace('[checkbox]', '')
      .trim();
    if (label != undefined && label.indexOf('{consumer:') > -1) {
      return this._replaceCspCode(label);
    }
    return label;
  }
}

export enum ItemType {
  body = 'body',
  section = 'section',
  div = 'div',
  span = 'span',
  paragraph = 'paragraph',
  image = 'image',
  svg = 'svg',
  container = 'container',
  button = 'button',
  a = 'a',
  inlineform = 'inlineform',
  toggleBtn = 'toggleBtn',
  assetsLink = 'assetsLink',
  categoryLink = 'categoryLink',
  videoLink = 'videoLink',
  downloadLink = 'downloadLink',
  embedDialog = 'embedDialog',
}