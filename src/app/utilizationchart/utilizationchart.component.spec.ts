import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilizationchartComponent } from './utilizationchart.component';

describe('UtilizationchartComponent', () => {
  let component: UtilizationchartComponent;
  let fixture: ComponentFixture<UtilizationchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtilizationchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtilizationchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
