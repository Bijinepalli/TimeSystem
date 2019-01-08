import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OutstandingtimesheetsComponent } from './outstandingtimesheets.component';

describe('OutstandingtimesheetsComponent', () => {
  let component: OutstandingtimesheetsComponent;
  let fixture: ComponentFixture<OutstandingtimesheetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OutstandingtimesheetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutstandingtimesheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
