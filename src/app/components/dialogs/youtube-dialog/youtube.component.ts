import { Component, OnInit, Inject, ElementRef } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-youtube',
  templateUrl: './youtube.component.html',
  styleUrls: ['./youtube.component.scss'],
  host: { class: 'tcma-sb' },
})
export class YoutubeComponent implements OnInit {
  public ytUrl: any;
  private readonly triggerElementRef: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<YoutubeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _sanitizer: DomSanitizer
  ) {
    this.triggerElementRef = data?.trigger;
  }

  ngOnInit(): void {
    this.ytUrl = this._sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this._parseYtId()}`
    );
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

  private _parseYtId(): string {
    var regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = this.data?.src.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  }

  public closeDialog(e: Event): void {
    e.preventDefault();
    this.dialogRef.close();
  }
}
