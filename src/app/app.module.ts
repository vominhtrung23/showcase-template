import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CspCodePipe } from './pipes/csp-code.pipe';
import { PageComponent } from './components/page/page.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormDialogComponent } from './components/dialogs/form-dialog/form-dialog.component';
import { LeadgenfieldComponent } from './components/leadgenfield/leadgenfield.component';
import { GlobalService } from './services/global.service';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ListItemComponent } from './components/list-item/list-item.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';

import * as $ from 'jquery';
import { YoutubeComponent } from './components/dialogs/youtube-dialog/youtube.component';
import { CustomBreakPointsProvider } from './flex-layout-custom-breakpoints';
import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { HttpConfigInterceptor } from './interceptor/httpconfig.interceptor';
import { VideoComponent } from './components/dialogs/video-dialog/video.component';
import { CommonModule } from '@angular/common';
import { SafePipe } from './pipes/safe.pipe';
import { EmbedDialogComponent } from './components/dialogs/embed-dialog/embed-dialog.component';
import { CompanyComponent } from './components/company/company.component';

@NgModule({
  declarations: [
    AppComponent,
    CspCodePipe,
    PageComponent,
    FormDialogComponent,
    LeadgenfieldComponent,
    ListItemComponent,
    YoutubeComponent,
    SanitizeHtmlPipe,
    VideoComponent,
    SafePipe,
    EmbedDialogComponent,CompanyComponent
  ],
  imports: [
    MatCheckboxModule, MatProgressBarModule, ScrollingModule, MatProgressSpinnerModule, MatSelectModule, MatRadioModule, MatNativeDateModule, MatDatepickerModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FlexLayoutModule.withConfig({ disableDefaultBps: true, addOrientationBps: true }),
  ],
  exports: [MatCheckboxModule, ScrollingModule, MatProgressSpinnerModule, MatSelectModule, MatRadioModule, MatNativeDateModule, MatDatepickerModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  entryComponents: [FormDialogComponent, YoutubeComponent, VideoComponent, EmbedDialogComponent],
  providers: [GlobalService, CustomBreakPointsProvider, { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
