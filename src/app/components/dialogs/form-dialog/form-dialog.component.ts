import { Component, OnInit,AfterViewInit, Inject, Input, ViewEncapsulation, ElementRef,HostListener, ViewChild } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { FieldModel } from 'src/app/shared/models/field.model';
import { FormService } from 'src/app/services/form.service';
import { CspdataService } from 'src/app/services/cspdata.service';
import { CompanyModel } from 'src/app/shared/models/company.model';
import { CategoryModel } from 'src/app/shared/models/category.model';
import { FieldTextboxModel } from 'src/app/shared/models/fieldtextbox.model';
import { FieldCheckboxModel } from 'src/app/shared/models/fieldcheckbox.model';
import { GlobalService } from 'src/app/services/global.service';
import { FieldDropdownModel } from 'src/app/shared/models/fielddropdown.model';
import { FieldTextareaModel } from 'src/app/shared/models/fieldtextarea.model';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { FormFieldModel } from 'src/app/shared/models/formfield.model'; 
declare var PUB_DATA: any;
declare var SUPPLIER_PARAMS: any;
declare var cspPageIndicator: any;

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormDialogComponent implements OnInit {
  public cspConsumer: CompanyModel;
  public form: FormGroup;
  public assetUrl: string = '';
  public formId: number = 0;
  public leadgenFields: FieldModel<string>[] = [];
  public categoryFormList: CategoryModel[] = [];
  public formCategory: CategoryModel;
  public payLoad = '';
  public submitSucceed: boolean = false;
  public formTitle: string = '';
  public gdprLabel: string = '';
  public pageLoaded: boolean = true;
  public decodedAssetLink: string = '';
  public label = {
    btnCancel: 'Cancel',
    btnSubmit: 'Submit',
    thankyou: 'Thank you',
    submittedSuccessful: 'Your request has been submitted successfully. Please click Ok below to continue.',
    clickOk: '',
    btnOk: 'Ok',
    btnDownload: 'Download',
    verbiageDownloadMsg: '<center><small><i>if your download does not start, please <a href="{asset_link}" target="_blank"><b>click here</b></a> to download</i></small></center>'
  } 

  private readonly triggerElementRef: ElementRef;

  constructor(public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _elementRef: ElementRef,
    public formService: FormService,
    private _dataService: CspdataService,
    private _glService: GlobalService,
    private _commonService: CommonService) {
    this.form = this.formService.toFormGroup(this.leadgenFields);
    this.triggerElementRef = data?.trigger;
    dialogRef.disableClose = false;
  }
  @HostListener('window:keyup.esc') onKeyUp() {
    this.dialogRef.close();
  }
  ngOnInit(): void {
    /* try {
      this._translateLabel();
    } catch(exc) {console.log(exc)} */
    if (this.data.assetLink != null) {
      this.assetUrl = this.data.assetLink.srcElement.getAttributeNode("relasset").value;
      this.formId = this.data.assetLink.srcElement.getAttributeNode("formcategory").value;
    }
    if (this.data.assetBtnLink != undefined)
      this.assetUrl = this.data.assetBtnLink;

    this.decodedAssetLink = this.data.assetBtnLink != undefined ? this.assetUrl : atob(this.assetUrl);
    this.formId = typeof (this.data.formId) != 'undefined' ? this.data.formId : this.formId;
    this.cspConsumer = this.data.cspConsumer;
    this.categoryFormList = this.data.categoryFormList;
    this.submitSucceed = typeof (this.data.submitSucceed) != 'undefined' ? this.data.submitSucceed : this.submitSucceed;
    if (this.triggerElementRef && this.triggerElementRef?.nativeElement) {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect = this.triggerElementRef?.nativeElement.getBoundingClientRect();
      // console.log(rect);
      // console.log(window.screen.height, window.screen.width);
      if (window.innerHeight > window.screen.height - 100 && window.screen.width > 425) { // detect not iframe & mobile
        // matDialogConfig.position = { top: `${rect.bottom - 50}px` };
        let top = rect.top < 150 ? rect.top + 50 : rect.top - 150;
        if (this.submitSucceed) top += 100;
          matDialogConfig.position = { top: `${top}px` };
        if (window.innerHeight - rect.top < 600)
          matDialogConfig.position = { bottom: `100px` };
        this.dialogRef.updatePosition(matDialogConfig.position);
      }
    }
    let targetForm = this.categoryFormList.find(x => x.contentMainId == this.formId + '');
    //console.log(this.formId, this.categoryFormList, targetForm);
    if (targetForm != undefined) {
      this.formCategory = targetForm;
      this.formTitle = this.formCategory.data['formTitle'].replace(/[^\w-]+|_+/g, "");
      this._loadFormCategory();
      this._translateLabel();
    }
    /*
    this.decodedAssetLink = this.data.assetBtnLink != undefined ? this.assetUrl : atob(this.assetUrl);
    this.formId = typeof(this.data.formId) != 'undefined' ? this.data.formId : this.formId;
    this.cspConsumer = this.data.cspConsumer;
    this.categoryFormList = this.data.categoryFormList;
    this.submitSucceed = typeof(this.data.submitSucceed) != 'undefined' ? this.data.submitSucceed : this.submitSucceed;

    let targetForm = this.categoryFormList.filter(x => x.legacyId == this.formId);
    if (targetForm.length == 0) {
      targetForm = this.categoryFormList.filter(x => x.id == this.formId + '');
    }
    if (targetForm.length > 0) {
      this.formCategory = targetForm[0];
      this.formTitle = this.formCategory.data['contentTitle'].replace(/[^\w-]+|_+/g, "");
    }
    
    if (!this.submitSucceed) {
      if (this._glService.formFieldOrder == null) {
        this._dataService.getFieldSortInfo().pipe(
          catchError(err => {
              return throwError(err);
          })
        )
        .subscribe(x => {
          this._glService.formFieldOrder = x;
          this._loadFormCategory();
        },
        (error) => {                              //Error callback
          this._glService.formFieldOrder = null;
          this._loadFormCategory();
        })
      }
      else {
        this._loadFormCategory();
      }
    } */
  }

  private _translateLabel() {
    let consumerLang = this._glService.listLanguages.CspLanguage.find(x => parseInt(x.Id) == PUB_DATA.languageId);
    let consumerLangCode = consumerLang != undefined ? consumerLang.LanguageCode : this._glService.listLanguages.CspLanguage[0].LanguageCode;

    this.label.thankyou = typeof (this._glService.gdprTranslation['thankyou'][consumerLangCode]) != 'undefined' ? this._glService.gdprTranslation['thankyou'][consumerLangCode] : this.label.thankyou;
    this.label.submittedSuccessful = typeof (this._glService.gdprTranslation['thankyoumsg'][consumerLangCode]) != 'undefined' ? this._glService.gdprTranslation['thankyoumsg'][consumerLangCode] : this.label.submittedSuccessful;
    this.label.btnDownload = typeof (this._glService.localizeData?.localize.btnDownload) != 'undefined' ? this._glService.localizeData?.localize.btnDownload : this.label.btnDownload;
    this.label.verbiageDownloadMsg = typeof (this._glService.localizeData?.localize.verbiageDownloadMsg) != 'undefined' ? this._glService.localizeData?.localize.verbiageDownloadMsg : this.label.verbiageDownloadMsg;

  }

  public onSubmit(): void {
    let assetLink = this.data.assetBtnLink != undefined ? this.assetUrl : atob(this.assetUrl);
    let formData = this.form.getRawValue();
    let leadFieldData: any = [];
    // formData.downloadAsset = this.data.assetBtnLink != undefined ? this.assetUrl : atob(this.assetUrl);
    formData.downloadAsset = assetLink.substring(assetLink.lastIndexOf('/')+1);
    formData.subject = this.formTitle ?? "Gated asset from showcase";
    if (assetLink == '')
      formData.subject = this.formTitle ?? 'Contact Us from Showcase';

    for (const [fkey, fvalue] of Object.entries(formData)) {
      leadFieldData.push({
        id: fkey,
        value: fvalue
      })
    }
    let cTitle = '';
    if (typeof (this._glService.activeCategory.data['contentTitle']) != 'undefined')
      cTitle = this._glService.activeCategory.data['contentTitle'];
    leadFieldData = this._commonService.wtFormSubmit(leadFieldData, 'ContactUs', cTitle, this._glService.activeCategory.legacyId);
    let leadPostData = {
      companyId: this.cspConsumer.id,
      isTest: false,
      data: JSON.stringify(leadFieldData)
    }
    // console.log('assetLink', assetLink);
    // console.log('leadPostData', leadPostData);
    this.pageLoaded = false;
    this.formService.submit(leadPostData).subscribe(leadResponse => {
      this.pageLoaded = true;
      if (assetLink != '')
        window.open(assetLink, "_blank");
      this.submitSucceed = true;
    })
  }

  public verbiageDownload(): string {
    let assetLink = this.data.assetBtnLink != undefined ? this.assetUrl : atob(this.assetUrl);
    let verbiageMsg = '';
    if (assetLink != '')
      verbiageMsg = this.label.verbiageDownloadMsg.replace('{asset_link}', assetLink);
    return verbiageMsg;
  }

  public goDownload(): void {

  }

  public closeDialog(e: Event): void {
    e.preventDefault();
    this.dialogRef.close();
  }

  public fakeSubmit(): void {
    this.submitSucceed = true;
  }

  private _loadFormCategory(): void {
    //this.pageLoaded = false;
    let cspFields: FieldModel<string>[] = [];
    let categoryFormFields: any[] = [];
    let fieldIds = (this.formCategory.data['fieldList'] as FormFieldModel[]).map(x => x.contentMainId);
    fieldIds.forEach(fId => {
      let checkField = this._glService.listFormField?.find(x => x.contentMainId == fId);
      if (checkField != undefined)
        categoryFormFields.push(checkField);
    })
   
    //this.formCategory
    //let fieldIds = this.formCategory.data['fieldList'].split(',');
    //let categoryFormFields = this._glService.listFormField.filter(x => fieldIds.indexOf(x.contentId) > -1);
    //console.log(fieldIds, categoryFormFields, this._glService.listFormField);
    categoryFormFields.forEach(element => {
      switch (element['statusFormfieldType']) {
        case 'select':
          var opts = [];
          var optArr = element['contentFormFieldLabel'].split(',');
          
          for (var i = 0; i < optArr.length; i++) {
            let optVal = optArr[i];
            if (i == 0) {
              optVal = '';
            }
            opts.push({
              key: optArr[i],
              value: optVal
            })
          }
          cspFields.push(new FieldDropdownModel({
            key: element['statusFormfieldName'],
            label: element['contentFormFieldLabel'].split(',')[0] + this._getAsteriskSymbol(element),
            value: '',
            required: element['statusFormfieldValidationYN'] != undefined && element['statusFormfieldValidationYN'].toLowerCase() == 'yes',
            order: parseInt(element['statusSortOrder']),
            options: opts
          }));
          break;
        case 'textarea':
          cspFields.push(new FieldTextareaModel({
            key: element['statusFormfieldName'],
            label: element['contentFormFieldLabel'] + this._getAsteriskSymbol(element),
            value: '',
            required: element['statusFormfieldValidationYN'] != undefined && element['statusFormfieldValidationYN'].toLowerCase() == 'yes',
            order: parseInt(element['statusSortOrder'])
          }));
          break;
        case 'field':
          var fieldRequired = element['statusFormfieldValidationYN'] != undefined && element['statusFormfieldValidationYN'].toLowerCase() == 'yes';
          if (typeof (element['statusFormfieldValidationSkip']) != 'undefined')
            fieldRequired = element['statusFormfieldValidationSkip'].indexOf(this.formCategory.id) < 0 && fieldRequired;
          
          cspFields.push(new FieldTextboxModel({
            key: element['statusFormfieldName'],
            label: element['contentFormFieldLabel'] + this._getAsteriskSymbol(element),
            value: '',
            required: fieldRequired,
            order: parseInt(element['statusSortOrder'])
          }));
          break;
        case 'submit':
          this.label.btnSubmit = element['contentFormFieldLabel'];
          if (this._glService.companyInfo.defaultLanguageId == 6 && element['contentFormFieldLabel'].toLowerCase() == 'submit')
            this.label.btnSubmit = 'Submeter';
          break;
        default:
      }
    });

    cspFields.push(new FieldCheckboxModel({
      key: 'gdprconfirmation',
      label: this._glService.gdprTranslatedText.replace('&nbsp;', ''),
      value: '',
      required: true,
      order: 9999
    }));
    this.leadgenFields = cspFields;
    this.form = this.formService.toFormGroup(this.leadgenFields);
    setTimeout(() => {
      this._bindingFormEvent()
    }, 500);
   
  }
  private _bindingFormEvent() {
    let listFieldForm = 0;
     let listForm = document.getElementsByTagName('form');
     for (let i = 0; i < listForm.length; i++) {
      listFieldForm = listFieldForm + listForm[i].getElementsByClassName('object ').length;; 
    }

    let formList = this._elementRef.nativeElement.getElementsByTagName('form');
      for (let form of formList) {
        let fIndex = listFieldForm;
        for (let fField of form.getElementsByClassName('fieldform')) {
            try {
              fField
                .getElementsByTagName('input')[0]
                .setAttribute('tabindex', fIndex);
              fField
                .getElementsByTagName('select')[0]
                .setAttribute('tabindex', fIndex);
              fField.getElementsByTagName('select')[0].selectedIndex = 0;
            } catch (exc) {
            }
          fIndex++;
        }
      
      }
  }
  private _getAsteriskSymbol(element: any) {
    var fieldRequired = element['statusFormfieldValidationYN'] != undefined && element['statusFormfieldValidationYN'].toLowerCase() == 'yes';
    if (typeof (element['statusFormfieldValidationSkip']) != 'undefined')
      fieldRequired = element['statusFormfieldValidationSkip'].indexOf(this.formCategory.id) < 0 && fieldRequired;
    var asteriskSymbol = fieldRequired ? '*' : '';
    if (element['contentFormFieldLabel'].indexOf('*') > -1)
      asteriskSymbol = '';
    return asteriskSymbol;
  }

  public getFormTitle(title: string) {
    if (!title) return '';
    return title.replace(/\s/g, '').toLowerCase();
  }
}
