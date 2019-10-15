import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeehoursbybillingcodewithrateComponent } from './employeehoursbybillingcodewithrate.component';

describe('EmployeehoursbybillingcodewithrateComponent', () => {
  let component: EmployeehoursbybillingcodewithrateComponent;
  let fixture: ComponentFixture<EmployeehoursbybillingcodewithrateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeehoursbybillingcodewithrateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeehoursbybillingcodewithrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
