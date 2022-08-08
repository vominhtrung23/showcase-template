import * as uuid from "uuid";

export class JsonPageModel {
  name: string;
  uId: string;
  type: string;

  class: string;
  innerClass: string;
  themeClass: string;
  children: JsonPageModel[];
  properties: Property[];
  styles: Property[];
  fxLayout: FxLayout;
  fxLayoutAlign: FxLayout;
  fxFlex: string;
  isExpanded: boolean;
  categoryIds?: string[];

  [key: string]: any;

  constructor(options: {
    name: string;
    type: string;

    class?: string;
    innerClass?: string;
    themeClass?: string;
    children?: JsonPageModel[];
    properties?: Property[];
    styles?: Property[];
    fxLayout?: FxLayout;
    fxLayoutAlign?: FxLayout;
    fxFlex?: string;
    categoryIds?: string[];
    isExpanded?: boolean;
  }) {
    this.name = options.name;
    this.uId = uuid.v4();
    this.type = options.type;

    this.class = options.class || '';
    this.innerClass = options.innerClass || '';
    this.themeClass = options.themeClass || '';
    this.children = options.children || [];
    this.properties = options.properties || [];
    this.styles = options.styles || [];
    this.fxLayout = options.fxLayout || { default: 'row' };
    this.fxLayoutAlign = options.fxLayoutAlign || { default: 'start stretch' };
    this.fxFlex = options.fxFlex || '';
    this.categoryIds = options.categoryIds || [];
    this.isExpanded = options.isExpanded || false;
  }
}

export class Property {
  props: string;
  value: any;
}

export class FxLayout {
  default: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  [key: string]: any;
}