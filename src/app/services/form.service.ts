import { Injectable } from '@angular/core';
import { FieldModel } from '../shared/models/field.model';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LeadModel } from '../shared/models/lead.model';
import { environment } from 'src/environments/environment';
import { from, Observable, Subject } from 'rxjs';
import { GlobalService } from './global.service';
import { ContentModel } from '../shared/models/content.model';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  private _listForm$: Subject<ContentModel[]> = new Subject<ContentModel[]>();
  constructor(private _http: HttpClient, private _glService: GlobalService) {}

  toFormGroup(leadFields: FieldModel<string>[]) {
    let group: any = {};

    leadFields.forEach((f) => {
      group[f.key] = f.required
        ? new FormControl(f.value || '', Validators.required)
        : new FormControl(f.value || '');
    });
    return new FormGroup(group);
  }

  getForms(
    companyId,
    contentTypeId,
    langId,
    categoryId
  ): Observable<ContentModel[]> {
    from(
      this._http.get<ContentModel[]>(
        `${environment.baseApiUrl}/Category/GetContentPage?companyId=${companyId}&ContentTypeId=${contentTypeId}&LanguageId=${langId}&CategoryId=${categoryId}`
      )
    ).subscribe((lForms) => {
      if (lForms) {
        let tmpListForm: ContentModel[] = [];
        lForms.forEach((f) => {
          f.data = JSON.parse(f.data);
          tmpListForm.push(f);
        });

        this._listForm$.next(tmpListForm);
      }
    });
    return this._listForm$;
  }
  //  this._http.get<CategoryModel[]>(`${environment.baseApiUrl}/Category?companyId=${companyId}&languageId=${langId}&contentTypeId=${ctId}`).subscribe(responseData => {
  //       this.subjectPages.next(responseData);
  //     })
  submit(formData: any): Observable<LeadModel> {
    return this._http.post<LeadModel>(
      `${environment.baseApiUrl}/leadgen`,
      formData
    );
  }
}
