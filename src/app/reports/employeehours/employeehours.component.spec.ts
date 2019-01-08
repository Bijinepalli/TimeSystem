import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeehoursComponent } from './employeehours.component';

describe('EmployeehoursComponent', () => {
  let component: EmployeehoursComponent;
  let fixture: ComponentFixture<EmployeehoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeehoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeehoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
