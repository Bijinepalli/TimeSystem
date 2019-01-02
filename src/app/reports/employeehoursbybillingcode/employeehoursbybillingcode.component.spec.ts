import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeehoursbybillingcodeComponent } from './employeehoursbybillingcode.component';

describe('EmployeehoursbybillingcodeComponent', () => {
  let component: EmployeehoursbybillingcodeComponent;
  let fixture: ComponentFixture<EmployeehoursbybillingcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeehoursbybillingcodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeehoursbybillingcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
