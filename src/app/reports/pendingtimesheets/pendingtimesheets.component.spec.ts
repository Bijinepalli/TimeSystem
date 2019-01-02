import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingtimesheetsComponent } from './pendingtimesheets.component';

describe('PendingtimesheetsComponent', () => {
  let component: PendingtimesheetsComponent;
  let fixture: ComponentFixture<PendingtimesheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingtimesheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingtimesheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
