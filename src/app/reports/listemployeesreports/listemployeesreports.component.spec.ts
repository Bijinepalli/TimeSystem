import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListemployeesreportsComponent } from './listemployeesreports.component';

describe('ListemployeesreportsComponent', () => {
  let component: ListemployeesreportsComponent;
  let fixture: ComponentFixture<ListemployeesreportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListemployeesreportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListemployeesreportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
