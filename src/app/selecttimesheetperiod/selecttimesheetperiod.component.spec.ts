import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecttimesheetperiodComponent } from './selecttimesheetperiod.component';

describe('SelecttimesheetperiodComponent', () => {
  let component: SelecttimesheetperiodComponent;
  let fixture: ComponentFixture<SelecttimesheetperiodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelecttimesheetperiodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelecttimesheetperiodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
