import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovaltimesheetsComponent } from './approvaltimesheets.component';

describe('ApprovaltimesheetsComponent', () => {
  let component: ApprovaltimesheetsComponent;
  let fixture: ComponentFixture<ApprovaltimesheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApprovaltimesheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApprovaltimesheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
