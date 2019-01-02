import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaysreportComponent } from './holidaysreport.component';

describe('HolidaysreportComponent', () => {
  let component: HolidaysreportComponent;
  let fixture: ComponentFixture<HolidaysreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HolidaysreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HolidaysreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
