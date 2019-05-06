import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SowtotalreportComponent } from './sowtotalreport.component';

describe('SowtotalreportComponent', () => {
  let component: SowtotalreportComponent;
  let fixture: ComponentFixture<SowtotalreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SowtotalreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SowtotalreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
