import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Holidays, TimeSheetBinding, TimeSheet, TimeLine, TimeCell } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-maintaintimesheet',
  templateUrl: './maintaintimesheet.component.html',
  styleUrls: ['./maintaintimesheet.component.css']
})
export class MaintaintimesheetComponent implements OnInit {

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute, private fb: FormBuilder) { }

  _peroidStartDate: Date = new Date('2018-11-01');
  _periodEnddate: Date = new Date('2018-11-15');
  _days = 0;
  _DateArray: Date[] = [];
  _weekArray: number[] = [];
  _tmpDt: any;
  _dt: number;
  tandm: TimeSheetBinding[];
  tandmSelect: string;
  projectBillable: TimeSheetBinding[];
  projectBillableSelect: string;
  nonBillable: TimeSheetBinding[];
  nonBillableSelect: string;
  _timesheetId: number;
  _timesheetPeriodEnd: string;
  _timeSheetEntries: TimeSheet[];
  _timeLineEntries: TimeLine[];
  _timeNONbill: TimeLine[];
  _timeProjBill: TimeLine[];
  _timeTandM: TimeLine[];
  _timeCellEntries: TimeCell[];
  timeSheetForm = new FormGroup({});
  //   this.activatedRoute.params.subscribe((params) => {
  //   this._employeeId = params['id'] === undefined ? -1 : params['id'];
  //   this.getEmployees();
  //   if (this._employeeId !== -1) {
  //     this.isEdit = true;
  //   }
  // });

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this._timesheetId = params['id'] === undefined ? -1 : params['id'];
      this._timesheetPeriodEnd = params['periodEnd'] === undefined ? -1 : params['periodEnd'];
    });
    this._days = this.calculateDate(this._peroidStartDate, this._periodEnddate);
    // console.log('days in timesheet:' + this._days);
    // console.log(this._peroidStartDate);
    this._tmpDt = new Date('2018-11-01');

    // this._DateArray.push(this._peroidStartDate);
    for (let i = 0; i < this._days - 1; i++) {
      this._dt = this._tmpDt.setDate(this._tmpDt.getDate() + 1);
      this._DateArray.push(new Date(this._dt));
      this._weekArray.push(new Date(this._dt).getDay());
    }

    // console.log(this._peroidStartDate);
    // console.log('dates array:' + this._DateArray.length);
    this.getClientProjectCategoryDropDown();
    this.getTimesheetTimeLineTimeCellDetails();
  }


  private calculateDate(date1, date2) {
    // our custom function with two parameters, each for a selected date
    const diffc = date1.getTime() - date2.getTime();
    // getTime() function used to convert a date into milliseconds. This is needed in order to perform calculations.
    const days = Math.round(Math.abs(diffc / (1000 * 60 * 60 * 24)));
    // this is the actual equation that calculates the number of days.
    return days + 1;
  }
  getClientProjectCategoryDropDown() {
    this.timesysSvc.getEmployeeClientProjectNonBillableDetails(localStorage.getItem('UserId')).subscribe(
      (data) => {
        this.tandm = [{ label: '', value: -1, code: '' }];
        let _array: TimeSheetBinding[];
        _array = data.filter(P => P.code === 'TANDM');
        for (let i = 0; i < _array.length; i++) {
          this.tandm.push(_array[i]);
        }
        this.tandmSelect = '-1';

        this.projectBillable = [{ label: '', value: -1, code: '' }];
        _array = data.filter(P => P.code === 'PROJBILL');
        for (let i = 0; i < _array.length; i++) {
          this.projectBillable.push(_array[i]);
        }
        this.projectBillableSelect = '-1';

        this.nonBillable = [{ label: '', value: -1, code: '' }];
        _array = data.filter(P => P.code === 'NONBILL');
        for (let i = 0; i < _array.length; i++) {
          this.nonBillable.push(_array[i]);
        }
        this.nonBillableSelect = '-1';
      });
  }
  getTimesheetTimeLineTimeCellDetails() {
    console.log(this._timesheetId);
    if (this._timesheetId > 0) {
      this.timesysSvc.getTimesheetTimeLineTimeCellDetails(this._timesheetId.toString()).subscribe(
        (data) => {
          console.log(data[0]);
          console.log(data[1]);
          console.log(data[2]);
          this._timeSheetEntries = data[0];
          this._timeLineEntries = data[1];
          this._timeNONbill = this._timeLineEntries.filter(P => P.ChargeType === 'NONBILL');
          this._timeProjBill = this._timeLineEntries.filter(P => P.ChargeType === 'PROJBILL');
          this._timeTandM = this._timeLineEntries.filter(P => P.ChargeType === 'TANDM');
          this._timeCellEntries = data[2];
          this.addFormControls();
        });
    } else {

    }
  }
  addFormControls() {
    let i = 0;
    try {
      for (i = 0; i < this._timeTandM.length; i++) {
        const attrN = 'drpTandM_' + i + '';
        this.timeSheetForm.addControl(attrN, new FormControl(this._timeTandM[i].ChargeId, null));
      }
      for (i = 0; i < this._timeProjBill.length; i++) {
        const attrN = 'drpProjBill_' + i + '';
        this.timeSheetForm.addControl(attrN, new FormControl(this._timeProjBill[i].ChargeId, null));
      }
      for (i = 0; i < this._timeNONbill.length; i++) {
        const attrN = 'drpNONBill_' + i + '';
        this.timeSheetForm.addControl(attrN, new FormControl(this._timeNONbill[i].ChargeId, null));
      }
    } catch (e) {
      alert(e.error);

    }
  }
  get f() {
    return this.timeSheetForm.controls;
  }
}
