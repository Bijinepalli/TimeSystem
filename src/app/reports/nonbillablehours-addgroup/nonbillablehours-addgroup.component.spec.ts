import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonbillablehoursAddgroupComponent } from './nonbillablehours-addgroup.component';

describe('NonbillablehoursAddgroupComponent', () => {
  let component: NonbillablehoursAddgroupComponent;
  let fixture: ComponentFixture<NonbillablehoursAddgroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonbillablehoursAddgroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonbillablehoursAddgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
