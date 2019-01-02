import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoursbytimesheetcategoryComponent } from './hoursbytimesheetcategory.component';

describe('HoursbytimesheetcategoryComponent', () => {
  let component: HoursbytimesheetcategoryComponent;
  let fixture: ComponentFixture<HoursbytimesheetcategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoursbytimesheetcategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoursbytimesheetcategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
