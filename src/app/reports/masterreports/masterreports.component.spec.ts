import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterreportsComponent } from './masterreports.component';

describe('MasterreportsComponent', () => {
  let component: MasterreportsComponent;
  let fixture: ComponentFixture<MasterreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MasterreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
