import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintaintimesheethourlyComponent } from './maintaintimesheethourly.component';

describe('MaintaintimesheethourlyComponent', () => {
  let component: MaintaintimesheethourlyComponent;
  let fixture: ComponentFixture<MaintaintimesheethourlyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintaintimesheethourlyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintaintimesheethourlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
