import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillablehoursComponent } from './billablehours.component';

describe('BillablehoursComponent', () => {
  let component: BillablehoursComponent;
  let fixture: ComponentFixture<BillablehoursComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillablehoursComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillablehoursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
