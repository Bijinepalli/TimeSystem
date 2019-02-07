import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeetimesheetsComponent } from './employeetimesheets.component';

describe('EmployeetimesheetsComponent', () => {
  let component: EmployeetimesheetsComponent;
  let fixture: ComponentFixture<EmployeetimesheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeetimesheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeetimesheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
