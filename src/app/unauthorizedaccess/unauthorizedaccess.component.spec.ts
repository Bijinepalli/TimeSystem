import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizedaccessComponent } from './unauthorizedaccess.component';

describe('UnauthorizedaccessComponent', () => {
  let component: UnauthorizedaccessComponent;
  let fixture: ComponentFixture<UnauthorizedaccessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnauthorizedaccessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnauthorizedaccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
