import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessrightsComponent } from './accessrights.component';

describe('AccessrightsComponent', () => {
  let component: AccessrightsComponent;
  let fixture: ComponentFixture<AccessrightsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessrightsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessrightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
