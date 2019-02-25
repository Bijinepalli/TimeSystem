import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RollbillingcodesComponent } from './rollbillingcodes.component';

describe('RollbillingcodesComponent', () => {
  let component: RollbillingcodesComponent;
  let fixture: ComponentFixture<RollbillingcodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RollbillingcodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RollbillingcodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
