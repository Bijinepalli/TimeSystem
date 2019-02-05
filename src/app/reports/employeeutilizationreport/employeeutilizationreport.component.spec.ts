import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeutilizationreportComponent } from './employeeutilizationreport.component';

describe('EmployeeutilizationreportComponent', () => {
  let component: EmployeeutilizationreportComponent;
  let fixture: ComponentFixture<EmployeeutilizationreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeutilizationreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeutilizationreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
