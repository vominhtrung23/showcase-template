import { Component, OnInit, Input, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FieldModel } from 'src/app/shared/models/field.model';
import { FormGroup } from '@angular/forms';
import { GlobalService } from 'src/app/services/global.service';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-leadgenfield',
  templateUrl: './leadgenfield.component.html',
  styleUrls: ['./leadgenfield.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class LeadgenfieldComponent implements OnInit {
  @Input() leadField: FieldModel<string>;
  @Input() form: FormGroup;
 
  constructor(private _gl: GlobalService) {}
  @ViewChild('usernameInput') usrFld: ElementRef;

  ngAfterViewInit() {
    // console.log("this.leadField.controlType[0]",this.leadField[0].controlType);
    debugger
    if(this.leadField.order ==1)
     this.usrFld.nativeElement.focus();
  }
  ngOnInit(): void {
    // console.log("leadField",this.leadField);
  }
  
  get isValid() {
    return this.form.controls[this.leadField.key].valid;
  }

  public checkboxChange(field: any, checkedStatus: any) {
    if (field.required && !checkedStatus.checked) {
      this.form.controls[this.leadField.key].setValue('');
    }
  }
  public getContentType(): string {
    if (this.leadField.label.includes('[checkbox]')) return 'checkbox';
    return this.leadField.controlType;
  }
  public getLabel(): string {
    return this._gl.replaceCspCode(this.leadField.label.replace('[checkbox]', '').trim());
  }
}
