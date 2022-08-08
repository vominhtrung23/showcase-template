import { FieldModel } from './field.model';

export class FieldTextareaModel extends FieldModel<string> {
    controlType = 'textarea';
    type: string;
  
    constructor(options: {} = {}) {
      super(options);
      this.type = options['type'] || '';
    }
  }