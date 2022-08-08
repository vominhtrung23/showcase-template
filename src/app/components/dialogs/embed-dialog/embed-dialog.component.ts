import { ElementRef } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-embed-dialog',
  templateUrl: './embed-dialog.component.html',
  host: { class: 'tcma-sb' },
})
export class EmbedDialogComponent implements OnInit {
  private readonly triggerElementRef: ElementRef;
  embedCode: any;

  constructor(
    public dialogRef: MatDialogRef<EmbedDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sanitizer: DomSanitizer
  ) {
    this.triggerElementRef = data?.trigger;
    
    
  }

  ngOnInit(): void {
    this.embedCode = this._sanitizer.bypassSecurityTrustHtml(this.data?.src);
    console.log('this.embedCode', this.embedCode);
    if (this.triggerElementRef && this.triggerElementRef?.nativeElement) {
      const matDialogConfig: MatDialogConfig = new MatDialogConfig();
      const rect =
        this.triggerElementRef?.nativeElement.getBoundingClientRect();
      // console.log(rect);
      // console.log(window.screen.height, window.screen.width);
      if (
        window.innerHeight > window.screen.height - 100 &&
        window.screen.width > 425
      ) {
        // detect not iframe & mobile
        // matDialogConfig.position = { top: `${rect.bottom - 50}px` };
        let top = rect.top < 150 ? rect.top + 50 : rect.top - 150;
        matDialogConfig.position = { top: `${top}px` };
        if (window.innerHeight - rect.top < 600)
          matDialogConfig.position = { bottom: `100px` };
        this.dialogRef.updatePosition(matDialogConfig.position);
      }
    }
  }
  public closeDialog(e: Event): void {
    e.preventDefault();
    this.dialogRef.close();
  }
}
