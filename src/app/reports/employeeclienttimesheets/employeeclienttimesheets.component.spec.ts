import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeclienttimesheetsComponent } from './employeeclienttimesheets.component';

describe('EmployeeclienttimesheetsComponent', () => {
  let component: EmployeeclienttimesheetsComponent;
  let fixture: ComponentFixture<EmployeeclienttimesheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeclienttimesheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeclienttimesheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
