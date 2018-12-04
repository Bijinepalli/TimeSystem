import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingcodelistingComponent } from './billingcodelisting.component';

describe('BillingcodelistingComponent', () => {
  let component: BillingcodelistingComponent;
  let fixture: ComponentFixture<BillingcodelistingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingcodelistingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingcodelistingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
