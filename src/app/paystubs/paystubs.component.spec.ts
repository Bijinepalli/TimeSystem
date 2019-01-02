import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaystubsComponent } from './paystubs.component';

describe('PaystubsComponent', () => {
  let component: PaystubsComponent;
  let fixture: ComponentFixture<PaystubsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaystubsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaystubsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
