import { FieldModel } from './field.model';

export class FieldCheckboxModel extends FieldModel<string> {
    controlType = 'checkbox';
    type: string;
  
    constructor(options: {} = {}) {
      super(options);
      this.type = options['type'] || '';
    }
  }