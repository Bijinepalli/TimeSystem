import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodendhoursComponent } from './periodendhours.component';

describe('PeriodendhoursComponent', () => {
  let component: PeriodendhoursComponent;
  let fixture: ComponentFixture<PeriodendhoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodendhoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodendhoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
