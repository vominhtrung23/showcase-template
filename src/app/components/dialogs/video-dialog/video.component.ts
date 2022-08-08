import { ElementRef } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  host: { class: 'tcma-sb' },
})
export class VideoComponent implements OnInit {
  private readonly triggerElementRef: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<VideoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.triggerElementRef = data?.trigger;
  }

  ngOnInit(): void {
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
