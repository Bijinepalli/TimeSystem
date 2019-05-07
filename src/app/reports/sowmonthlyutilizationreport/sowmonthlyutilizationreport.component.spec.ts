import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SowmonthlyutilizationreportComponent } from './sowmonthlyutilizationreport.component';

describe('SowmonthlyutilizationreportComponent', () => {
  let component: SowmonthlyutilizationreportComponent;
  let fixture: ComponentFixture<SowmonthlyutilizationreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SowmonthlyutilizationreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SowmonthlyutilizationreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
