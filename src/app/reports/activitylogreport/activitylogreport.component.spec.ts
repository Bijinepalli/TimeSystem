import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitylogreportComponent } from './activitylogreport.component';

describe('ActivitylogreportComponent', () => {
  let component: ActivitylogreportComponent;
  let fixture: ComponentFixture<ActivitylogreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitylogreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitylogreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
