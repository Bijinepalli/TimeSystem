import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnusedbillingcodesComponent } from './unusedbillingcodes.component';

describe('UnusedbillingcodesComponent', () => {
  let component: UnusedbillingcodesComponent;
  let fixture: ComponentFixture<UnusedbillingcodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnusedbillingcodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnusedbillingcodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
