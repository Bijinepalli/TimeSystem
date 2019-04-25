import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SowutilizationreportComponent } from './sowutilizationreport.component';

describe('SowutilizationreportComponent', () => {
  let component: SowutilizationreportComponent;
  let fixture: ComponentFixture<SowutilizationreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SowutilizationreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SowutilizationreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
