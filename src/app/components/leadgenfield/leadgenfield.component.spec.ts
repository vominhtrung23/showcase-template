import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadgenfieldComponent } from './leadgenfield.component';

describe('LeadgenfieldComponent', () => {
  let component: LeadgenfieldComponent;
  let fixture: ComponentFixture<LeadgenfieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeadgenfieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadgenfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
