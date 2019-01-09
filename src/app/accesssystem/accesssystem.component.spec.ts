import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesssystemComponent } from './accesssystem.component';

describe('AccesssystemComponent', () => {
  let component: AccesssystemComponent;
  let fixture: ComponentFixture<AccesssystemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccesssystemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccesssystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
