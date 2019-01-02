import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursbyemployeeComponent } from './hoursbyemployee.component';

describe('HoursbyemployeeComponent', () => {
  let component: HoursbyemployeeComponent;
  let fixture: ComponentFixture<HoursbyemployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoursbyemployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoursbyemployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
