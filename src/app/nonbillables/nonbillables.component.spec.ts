import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonbillablesComponent } from './nonbillables.component';

describe('NonbillablesComponent', () => {
  let component: NonbillablesComponent;
  let fixture: ComponentFixture<NonbillablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NonbillablesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonbillablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
