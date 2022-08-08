import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoryModel } from '../shared/models/category.model';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CompanyModel } from '../shared/models/company.model';
import { ActivatedRoute } from '@angular/router';
import { GlobalService } from './global.service';
import { SocialModel } from '../shared/models/social.model';
import { FilePath } from '../shared/models/filecontent.model';
declare var PUB_DATA: any;

@Injectable({
  providedIn: 'root',
})
export class CspdataService {
  public subjectCategory = new Subject<CategoryModel[]>();
  public subjectPages = new Subject<CategoryModel[]>();
  public subjectCategoryForm = new Subject<CategoryModel[]>();
  public subjectCategoryField = new Subject<CategoryModel[]>();
  public subjectCompanyInfo = new Subject<any>();
  private VALID_SYNDICATION_TYPES: string[] = ['', 'showcase', 'all', 'hidden'];

  constructor(private _http: HttpClient, public glService: GlobalService) {}

  public getCategory(
    companyId: string,
    langId: number = 1
  ): Observable<CategoryModel[]> {
    this._http
      .get<CategoryModel[]>(
        `${environment.baseApiUrl}/Category?companyId=${companyId}&languageId=${langId}`
      )
      .subscribe((responseData) => {
        let formCategory = [];
        let validCategory = [];
        for (var i = 0; i < responseData.length; i++) {
          responseData[i].data = JSON.parse(responseData[i].data);
          if (
            typeof responseData[i].data['localSyndicationType'] == 'undefined'
          ) {
            validCategory.push(responseData[i]);
            continue;
          }
          if (
            responseData[i].data['localSyndicationType'].toLowerCase() == 'form'
          ) {
            formCategory.push(responseData[i]);
          } else if (
            this.VALID_SYNDICATION_TYPES.indexOf(
              responseData[i].data['localSyndicationType'].toLowerCase()
            ) > -1
          )
            validCategory.push(responseData[i]);
        }
        this.subjectCategoryForm.next(formCategory);
        this.subjectCategory.next(validCategory);
      });
    return this.subjectCategory;
  }

  public getAllPageContent(
    companyId: string,
    langId: number = 1,
    ctId: number
  ): Observable<CategoryModel[]> {
    this._http
      .get<CategoryModel[]>(
        `${environment.baseApiUrl}/Category?companyId=${companyId}&languageId=${langId}&contentTypeId=${ctId}`
      )
      .subscribe((responseData) => {
        this.subjectPages.next(responseData);
      });
    return this.subjectPages;
  }

  public getLeadFields(
    companyId: string,
    langId: number = 1
  ): Observable<CategoryModel[]> {
    let rootNote = this.glService.listCategory.find(
      (x) => x.parentId == undefined || x.parentId == ''
    );
    //this._http.get<CategoryModel[]>(`${environment.baseApiUrl}/Category?companyId=${companyId}&languageId=${langId}&contenttypeId=15000`).subscribe(responseData => {
    this.getPageContent(companyId, rootNote.id, langId, 15000).subscribe(
      (responseData) => {
        let lField: any[] = [];
        let fieldLabelTranslate: any[] = [];
        for (let r of responseData) {
          let fieldDetail = (r.data = JSON.parse(r.data));
          fieldDetail.contentMainId = r.contentMainId;
          fieldDetail['contentId'] = r.id;
          fieldDetail['statusSortOrder'] =
            fieldDetail['statusSortOrder'] != undefined
              ? parseInt(fieldDetail['statusSortOrder'])
              : 99;
          if (
            typeof fieldDetail['statusFormFieldId'] == 'undefined' ||
            typeof fieldDetail['contentFormFieldLabel'] == 'undefined'
          )
            continue;
          if (
            lField.find(
              (x) =>
                x['statusFormFieldId'] == fieldDetail['statusFormFieldId'] &&
                x['contentFormFieldLabel'] ==
                  fieldDetail['contentFormFieldLabel']
            ) == undefined
          ) {
            lField.push(fieldDetail);
          }
          var tId = `${r.id}${fieldDetail['statusFormFieldId']}`;
          if (typeof fieldLabelTranslate[tId] != 'undefined') continue;
          fieldLabelTranslate[tId] = [];
          fieldLabelTranslate[tId] =
            typeof fieldDetail['contentFormFieldLabel'] == 'undefined'
              ? fieldDetail['statusFormFieldId']
              : fieldDetail['contentFormFieldLabel'];
        }
        this.glService.leadFieldLabelTranslation = fieldLabelTranslate;
        this.glService.listFormField = lField;

        this.glService.listCategoryFields = responseData;
        this.subjectCategoryField.next(responseData);
      }
    );
    return this.subjectCategoryField;
  }

  public getPageContent(
    companyId: string,
    categoryId: string,
    langId: number,
    contentTypeId: number = 66000
  ): Observable<CategoryModel[]> {
    return this._http.get<CategoryModel[]>(
      `${environment.baseApiUrl}/Category/GetContentPage?companyId=${companyId}&categoryId=${categoryId}&languageId=${langId}&contentTypeId=${contentTypeId}`
    );
  }

  public getSociaContent(
    companyId: string,
    socialId: string
  ): Observable<SocialModel> {
    return this._http.get<SocialModel>(
      `${environment.baseApiUrl}/Social/social/${companyId}/${socialId}`
    );
  }

  public getCompanyInfo(companyId: string): Observable<CompanyModel> {
    return this._http.get<CompanyModel>(
      `${environment.baseApiUrl}/Company?id=${companyId}`
    );
  }

  // public getGdprLocalize(): Observable<any> {
  //   let gdprTranslate$: Subject<any> = new Subject<any>();
  //   this._http.get<any>(environment.gdprLocalizeUrl).subscribe(x => {
  //     gdprTranslate$.next(x);
  //   },
  //   error => {
  //     gdprTranslate$.next([]);
  //   });;
  //   return gdprTranslate$;
  // }
  public getGdprLocalize(): Observable<any> {
    let gdprTranslate$: Subject<any> = new Subject<any>();
    // this._http.get<any>(`${environment.gdprLocalizeUrl.replace('assets/shareddata', PUB_DATA.projectName.replaceAll('-', ''))}`).subscribe(x => {
    // gdprTranslate$.next(x);
    const url = `${environment.prjFolder.replace(
      '{prjname}',
      PUB_DATA.projectName
    )}/${FilePath.LOCALIZE}`;
    this._http.get<any>(url).subscribe({
      next: (x) => {
        if (x) {
          gdprTranslate$.next(x);
        }
      },
      error :(err) => {
        // gdprTranslate$.next([]);
        if (err)
          this._http.get<any>(environment.gdprLocalizeUrl).subscribe({
            next: (y) => {
              gdprTranslate$.next(y);
            },
            error: (err2) => {
              if (err2) gdprTranslate$.next([]);
            }
          });
      }
    });
    return gdprTranslate$;
  }

  public getLanguageList(): Observable<any> {
    let langList$: Subject<any> = new Subject<any>();
    this._http.get<any>(environment.jsonLanguages).subscribe(
      (x) => {
        langList$.next(x);
      },
      (error) => {
        langList$.next([]);
      }
    );
    return langList$;
  }

  // public getFieldSortInfo(): any {
  //   // return this._http.get<any>(environment.fileFieldSort.replace('{prjname}', PUB_DATA.projectName));
  //   return this._http.get<any>(
  //     `${environment.prjFolder.replace('{prjname}', PUB_DATA.projectName)}/${
  //       FilePath.FILE_FIELD_SORT
  //     }`
  //   );
  // }

  public getLocalizeJson(): Observable<any> {
    let localize$: Subject<any> = new Subject<any>();
    const url = `${environment.prjFolder.replace(
      '{prjname}',
      PUB_DATA.projectName
    )}/${FilePath.LOCALIZE}`;
    this._http.get<any>(url).subscribe(
      (x) => {
        localize$.next(x);
      },
      (error) => {
        localize$.next([]);
      }
    );
    return localize$;
  }
}
