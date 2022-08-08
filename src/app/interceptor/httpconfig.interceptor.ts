import { Injectable } from '@angular/core';
import{GlobalService} from '../services/global.service'
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    constructor(private _glService: GlobalService) {
      }
   
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // const partnerEnv: string = localStorage.getItem('X-Environment-Context');
        // const partnerContext: string = localStorage.getItem('X-Application-Context');
        const partnerEnv: string = this._glService.partnerEnv;
        const partnerContext: string = this._glService.partnerContext;
        if (partnerEnv) {
            request = request.clone({ headers: request.headers.set('X-Environment-Context', partnerEnv) });
        }
        if (partnerContext) {
            request = request.clone({ headers: request.headers.set('X-Application-Context', partnerContext) });
        }

        if (!request.headers.has('Content-Type')) {
            request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
        }

        request = request.clone({ headers: request.headers.set('Accept', 'application/json') });

        return next.handle(request).pipe(
            map((event: HttpEvent<any>) => {
                /* if (event instanceof HttpResponse) {
                    
                } */
                return event;
            }));
    }
}