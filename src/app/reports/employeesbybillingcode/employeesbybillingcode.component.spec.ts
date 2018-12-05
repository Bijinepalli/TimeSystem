import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesbybillingcodeComponent } from './employeesbybillingcode.component';

describe('EmployeesbybillingcodeComponent', () => {
  let component: EmployeesbybillingcodeComponent;
  let fixture: ComponentFixture<EmployeesbybillingcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeesbybillingcodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeesbybillingcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
