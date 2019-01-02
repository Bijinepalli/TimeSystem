import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonbillablehoursComponent } from './nonbillablehours.component';

describe('NonbillablehoursComponent', () => {
  let component: NonbillablehoursComponent;
  let fixture: ComponentFixture<NonbillablehoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonbillablehoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonbillablehoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
