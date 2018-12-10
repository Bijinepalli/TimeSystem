import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintaintimesheetComponent } from './maintaintimesheet.component';

describe('MaintaintimesheetComponent', () => {
  let component: MaintaintimesheetComponent;
  let fixture: ComponentFixture<MaintaintimesheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaintaintimesheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaintaintimesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
