import { FieldModel } from './field.model';

export class FieldDropdownModel extends FieldModel<string> {
    controlType = 'dropdown';
    options: {key: string, value: string}[] = [];
  
    constructor(options: {} = {}) {
      super(options);
      this.options = options['options'] || [];
    }
  }