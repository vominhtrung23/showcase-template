import { TestBed } from '@angular/core/testing';

import { CspdataService } from './cspdata.service';

describe('CspdataService', () => {
  let service: CspdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CspdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
