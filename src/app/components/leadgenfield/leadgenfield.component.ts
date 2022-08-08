import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FieldModel } from 'src/app/shared/models/field.model';
import { FormGroup } from '@angular/forms';
import { GlobalService } from 'src/app/services/global.service';

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

  ngOnInit(): void {}

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
