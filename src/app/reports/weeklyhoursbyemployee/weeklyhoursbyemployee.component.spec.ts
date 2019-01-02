import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyhoursbyemployeeComponent } from './weeklyhoursbyemployee.component';

describe('WeeklyhoursbyemployeeComponent', () => {
  let component: WeeklyhoursbyemployeeComponent;
  let fixture: ComponentFixture<WeeklyhoursbyemployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeeklyhoursbyemployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeeklyhoursbyemployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
