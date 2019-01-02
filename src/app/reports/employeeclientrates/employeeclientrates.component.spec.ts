import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeclientratesComponent } from './employeeclientrates.component';

describe('EmployeeclientratesComponent', () => {
  let component: EmployeeclientratesComponent;
  let fixture: ComponentFixture<EmployeeclientratesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeclientratesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeclientratesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
