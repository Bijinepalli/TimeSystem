import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeelogindataComponent } from './employeelogindata.component';

describe('EmployeelogindataComponent', () => {
  let component: EmployeelogindataComponent;
  let fixture: ComponentFixture<EmployeelogindataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeelogindataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeelogindataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
