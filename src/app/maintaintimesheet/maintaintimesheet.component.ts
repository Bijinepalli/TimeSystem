import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Holidays, TimeSheetBinding, TimeSheet, TimeLine, TimeCell, TimePeriods, Employee } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { from } from 'rxjs';

@Component({
  selector: 'app-maintaintimesheet',
  templateUrl: './maintaintimesheet.component.html',
  styleUrls: ['./maintaintimesheet.component.css'],
  providers: [DatePipe, DecimalPipe],
})
export class MaintaintimesheetComponent implements OnInit {

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private datePipe: DatePipe, private decimal: DecimalPipe) { }

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
  _timePeriods: TimePeriods[];
  _employee: Employee[];
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


    // console.log(this._peroidStartDate);
    // console.log('dates array:' + this._DateArray.length);
    this.defaultControlsToForm();
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
    if (this._timesheetId > 0) {
      this.timesysSvc.getTimesheetTimeLineTimeCellDetails(this._timesheetId.toString()).subscribe(
        (data) => {
          this.timesysSvc.getTimeSheetPeridos().subscribe(
            (data1) => {
              this._timeSheetEntries = data[0];
              this.timesysSvc.getEmployee(this._timeSheetEntries[0].EmployeeId.toString(), '', '').subscribe(
                (dataEmp) => {
                  this._employee = dataEmp;
                });
              this._timeLineEntries = data[1];
              this._timeNONbill = this._timeLineEntries.filter(P => P.ChargeType === 'NONBILL');
              this._timeProjBill = this._timeLineEntries.filter(P => P.ChargeType === 'PROJBILL');
              this._timeTandM = this._timeLineEntries.filter(P => P.ChargeType === 'TANDM');
              this._timeCellEntries = data[2];
              this._periodEnddate = new Date(this._timeSheetEntries[0].PeriodEnd);

              this._timePeriods = data1.filter(P => P.FuturePeriodEnd === this._timeSheetEntries[0].PeriodEnd);
              const startPeriod = data1.filter(P => P.RowNumber === (this._timePeriods[0].RowNumber - 1));
              console.log(startPeriod[0].FuturePeriodEnd);
              this._peroidStartDate = new Date(startPeriod[0].FuturePeriodEnd);

              // this._periodEnddate = new Date('2019-01-05');
              // this._peroidStartDate = new Date('2018-12-31');

              this._days = this.calculateDate(this._peroidStartDate, this._periodEnddate);
              this._tmpDt = this._peroidStartDate;

              // this._DateArray.push(this._peroidStartDate);
              for (let i = 0; i < this._days - 1; i++) {
                this._dt = this._tmpDt.setDate(this._tmpDt.getDate() + 1);
                this._DateArray.push(new Date(this._dt));
                this._weekArray.push(new Date(this._dt).getDay());
              }
              this.addFormControls();
            });
        });
    } else {

    }
  }
  addFormControls() {
    let i = 0;
    try {


      for (i = 0; i < this._timeTandM.length; i++) {
        /* Dropdown building */
        const attrN = 'drpTandM_' + i + '';
        this.timeSheetForm.addControl(attrN, new FormControl(this._timeTandM[i].ChargeId, null));

        /* Hours textbox building */
        const filterTimeCellEntries = this._timeCellEntries.filter(P => P.TimeLineId === this._timeTandM[i].Id);
        for (let j = 0; j < this._DateArray.length; j++) {
          // const txtHours = 'txtHours_' + this._timeTandM[i].ChargeId + '_' + this._timeTandM[i].Id + '_' + j + '';
          const txtHours = 'txttimeTandMHours_' + i + '_' + j;
          this.timeSheetForm.addControl(txtHours, new FormControl(this.decimal.transform(0, '1.2-2', null)));
          const DateArrayCell = this.datePipe.transform(this._DateArray[j], 'yyyy-MM-dd');

          // For Value Settings
          for (let k = 0; k < filterTimeCellEntries.length; k++) {
            const DateTimeCell = this.datePipe.transform(filterTimeCellEntries[k].CalendarDate, 'yyyy-MM-dd');
            if (DateTimeCell === DateArrayCell) {
              this.timeSheetForm.controls[txtHours].setValue(this.decimal.transform(filterTimeCellEntries[k].Hours, '1.2-2'));
            }
          }
        }
      }
      for (i = 0; i < this._timeProjBill.length; i++) {
        /* Dropdown building */
        const attrN = 'drpProjBill_' + i + '';
        this.timeSheetForm.addControl(attrN, new FormControl(this._timeProjBill[i].ChargeId, null));

        /* Hours textbox building */
        const filterTimeCellEntries = this._timeCellEntries.filter(P => P.TimeLineId === this._timeProjBill[i].Id);
        for (let j = 0; j < this._DateArray.length; j++) {
          // const txtHours = 'txtHours_' + this._timeTandM[i].ChargeId + '_' + this._timeTandM[i].Id + '_' + j + '';
          const txtHours = 'txtProjBillHours_' + i + '_' + j;
          this.timeSheetForm.addControl(txtHours, new FormControl(this.decimal.transform(0, '1.2-2', null)));
          const DateArrayCell = this.datePipe.transform(this._DateArray[j], 'yyyy-MM-dd');

          // For Value Settings
          for (let k = 0; k < filterTimeCellEntries.length; k++) {
            const DateTimeCell = this.datePipe.transform(filterTimeCellEntries[k].CalendarDate, 'yyyy-MM-dd');
            if (DateTimeCell === DateArrayCell) {
              this.timeSheetForm.controls[txtHours].setValue(this.decimal.transform(filterTimeCellEntries[k].Hours, '1.2-2'));
            }
          }
        }
      }
      for (i = 0; i < this._timeNONbill.length; i++) {
        /* Dropdown building */
        const attrN = 'drpNONBill_' + i + '';
        this.timeSheetForm.addControl(attrN, new FormControl(this._timeNONbill[i].ChargeId, null));

        /* Hours textbox building */
        const filterTimeCellEntries = this._timeCellEntries.filter(P => P.TimeLineId === this._timeNONbill[i].Id);
        for (let j = 0; j < this._DateArray.length; j++) {
          // const txtHours = 'txtHours_' + this._timeTandM[i].ChargeId + '_' + this._timeTandM[i].Id + '_' + j + '';
          const txtHours = 'txtNonBillHours_' + i + '_' + j;
          this.timeSheetForm.addControl(txtHours, new FormControl(this.decimal.transform(0, '1.2-2', null)));
          const DateArrayCell = this.datePipe.transform(this._DateArray[j], 'yyyy-MM-dd');

          // For Value Settings
          for (let k = 0; k < filterTimeCellEntries.length; k++) {
            const DateTimeCell = this.datePipe.transform(filterTimeCellEntries[k].CalendarDate, 'yyyy-MM-dd');
            if (DateTimeCell === DateArrayCell) {
              this.timeSheetForm.controls[txtHours].setValue(this.decimal.transform(filterTimeCellEntries[k].Hours, '1.2-2'));
            }
          }
        }
      }

      for (let j = 0; j < this._DateArray.length; j++) {
        /* Daily Totals Building */
        const txtProjBillDailyTotalHours = 'txtProjBillDailyTotals_' + j;
        this.timeSheetForm.addControl(txtProjBillDailyTotalHours, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        const txtNonBillDailyTotals = 'txtNonBillDailyTotals_' + j;
        this.timeSheetForm.addControl(txtNonBillDailyTotals, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        const txtTANDMDailyTotals = 'txtTANDMDailyTotals_' + j;
        this.timeSheetForm.addControl(txtTANDMDailyTotals, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        /* Daily Grand Totals Building */
        const txtDailyGrandTotal = 'txtDailyGrandTotal_' + j;
        this.timeSheetForm.addControl(txtDailyGrandTotal, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        /* Daily Default Hours Building */
        const txttimeTandMHoursDefault = 'txttimeTandMHoursDefault_' + j;
        this.timeSheetForm.addControl(txttimeTandMHoursDefault, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        const txtProjBillHoursDefault = 'txtProjBillHoursDefault_' + j;
        this.timeSheetForm.addControl(txtProjBillHoursDefault, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        const txtNonBillHoursDefault = 'txtNonBillHoursDefault_' + j;
        this.timeSheetForm.addControl(txtNonBillHoursDefault, new FormControl(this.decimal.transform(0, '1.2-2', null)));
      }

      /* Weekly Totals Building */
      for (let j = 0; j < this._timeTandM.length; j++) {
        const txtProjBillWeeklyTotalHours = 'txtProjBillWeeklyTotals_' + j;
        this.timeSheetForm.addControl(txtProjBillWeeklyTotalHours, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        const txtNonBillWeeklyTotals = 'txtNonBillWeeklyTotals_' + j;
        this.timeSheetForm.addControl(txtNonBillWeeklyTotals, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        const txtTANDMWeeklyTotals = 'txtTANDMWeeklyTotals_' + j;
        this.timeSheetForm.addControl(txtTANDMWeeklyTotals, new FormControl(this.decimal.transform(0, '1.2-2', null)));
      }
    } catch (e) {
      alert(e.error);

    }
    this.setValues();
  }

  setValues() {
    /* TANDM Daily Total Calculation */
    for (let j = 0; j < this._DateArray.length; j++) {
      let dayHoursTotal = 0;
      for (let i = 0; i < this._timeTandM.length; i++) {
        const hour = this.timeSheetForm.get('txttimeTandMHours_' + i + '_' + j).value;
        dayHoursTotal += +hour;
      }
      this.timeSheetForm.controls['txtTANDMDailyTotals_' + j].setValue(this.decimal.transform(dayHoursTotal, '1.2-2'));
    }
    /* TANDM Weekly Total Calculation */
    for (let i = 0; i < this._timeTandM.length; i++) {
      let WeeklyHoursTotal = 0;
      for (let j = 0; j < this._DateArray.length; j++) {
        // let hour = this.timeSheetForm.controls['txttimeTandMHours_' + i + '_' + j + ''].getValue();
        const hour = this.timeSheetForm.get('txttimeTandMHours_' + i + '_' + j).value;
        WeeklyHoursTotal += +hour;
      }
      this.timeSheetForm.controls['txtTANDMWeeklyTotals_' + i].setValue(this.decimal.transform(WeeklyHoursTotal, '1.2-2'));
    }
    /* TANDM All Weeks Total Calculation */
    let AllWeeksTANDMHoursTotal = 0;
    for (let i = 0; i < this._timeTandM.length; i++) {
      const hour = this.timeSheetForm.get('txtTANDMWeeklyTotals_' + i).value;
      AllWeeksTANDMHoursTotal += +hour;
    }
    this.timeSheetForm.controls['txtTANDMTotalWeeks'].setValue(this.decimal.transform(AllWeeksTANDMHoursTotal, '1.2-2'));

    /* ProjBill Daily Total Calculation */
    for (let j = 0; j < this._DateArray.length; j++) {
      let dayHoursTotal = 0;
      for (let i = 0; i < this._timeProjBill.length; i++) {
        const hour = this.timeSheetForm.get('txtProjBillHours_' + i + '_' + j).value;
        dayHoursTotal += +hour;
      }
      this.timeSheetForm.controls['txtProjBillDailyTotals_' + j].setValue(this.decimal.transform(dayHoursTotal, '1.2-2'));
    }
    /* ProjBill Weekly Total Calculation */
    for (let i = 0; i < this._timeProjBill.length; i++) {
      let WeeklyHoursTotal = 0;
      for (let j = 0; j < this._DateArray.length; j++) {
        // let hour = this.timeSheetForm.controls['txttimeTandMHours_' + i + '_' + j + ''].getValue();
        const hour = this.timeSheetForm.get('txtProjBillHours_' + i + '_' + j).value;
        WeeklyHoursTotal += +hour;
      }
      this.timeSheetForm.controls['txtProjBillWeeklyTotals_' + i].setValue(this.decimal.transform(WeeklyHoursTotal, '1.2-2'));
    }
    /* ProjBill All Weeks Total Calculation */
    let AllWeeksProjBillHoursTotal = 0;
    for (let i = 0; i < this._timeProjBill.length; i++) {
      const hour = this.timeSheetForm.get('txtProjBillWeeklyTotals_' + i).value;
      AllWeeksProjBillHoursTotal += +hour;
    }
    this.timeSheetForm.controls['txtProjBillTotalWeeks'].setValue(this.decimal.transform(AllWeeksProjBillHoursTotal, '1.2-2'));

    /* NonBill Daily Total Calculation */
    for (let j = 0; j < this._DateArray.length; j++) {
      let dayHoursTotal = 0;
      for (let i = 0; i < this._timeNONbill.length; i++) {
        const hour = this.timeSheetForm.get('txtNonBillHours_' + i + '_' + j).value;
        dayHoursTotal += +hour;
      }
      this.timeSheetForm.controls['txtNonBillDailyTotals_' + j].setValue(this.decimal.transform(dayHoursTotal, '1.2-2'));
    }
    /* NonBill Weekly Total Calculation */
    for (let i = 0; i < this._timeNONbill.length; i++) {
      let WeeklyHoursTotal = 0;
      for (let j = 0; j < this._DateArray.length; j++) {
        // let hour = this.timeSheetForm.controls['txttimeTandMHours_' + i + '_' + j + ''].getValue();
        const hour = this.timeSheetForm.get('txtNonBillHours_' + i + '_' + j).value;
        WeeklyHoursTotal += +hour;
      }
      this.timeSheetForm.controls['txtNonBillWeeklyTotals_' + i].setValue(this.decimal.transform(WeeklyHoursTotal, '1.2-2'));
    }
    /* NonBill All Weeks Total Calculation */
    let AllWeeksNonBillHoursTotal = 0;
    for (let i = 0; i < this._timeNONbill.length; i++) {
      const hour = this.timeSheetForm.get('txtNonBillWeeklyTotals_' + i).value;
      AllWeeksNonBillHoursTotal += +hour;
    }
    this.timeSheetForm.controls['txtNonBillTotalWeeks'].setValue(this.decimal.transform(AllWeeksNonBillHoursTotal, '1.2-2'));

    for (let j = 0; j < this._DateArray.length; j++) {
      const TANDhour = this.timeSheetForm.get('txtTANDMDailyTotals_' + j).value;
      const ProjBillhour = this.timeSheetForm.get('txtProjBillDailyTotals_' + j).value;
      const NonBillhour = this.timeSheetForm.get('txtNonBillDailyTotals_' + j).value;

      // tslint:disable-next-line:max-line-length
      this.timeSheetForm.controls['txtDailyGrandTotal_' + j].setValue(this.decimal.transform(((+TANDhour) + (+ProjBillhour) + (+NonBillhour)), '1.2-2'));
    }

    const TANDhourTotalWeek = this.timeSheetForm.get('txtTANDMTotalWeeks').value;
    const ProjBillhourTotalWeek = this.timeSheetForm.get('txtProjBillTotalWeeks').value;
    const NonBillhourTotalWeek = this.timeSheetForm.get('txtNonBillTotalWeeks').value;

    // tslint:disable-next-line:max-line-length
    this.timeSheetForm.controls['txtWeeklyGrandTotal'].setValue(this.decimal.transform(((+TANDhourTotalWeek) + (+ProjBillhourTotalWeek) + (+NonBillhourTotalWeek)), '1.2-2'));

  }
  get f() {
    return this.timeSheetForm.controls;
  }

  defaultControlsToForm() {
    /* Total Weeks */
    this.timeSheetForm.addControl('txtTANDMTotalWeeks', new FormControl(this.decimal.transform(0, '1.2-2', null)));
    this.timeSheetForm.addControl('txtProjBillTotalWeeks', new FormControl(this.decimal.transform(0, '1.2-2', null)));
    this.timeSheetForm.addControl('txtNonBillTotalWeeks', new FormControl(this.decimal.transform(0, '1.2-2', null)));

    /* Weekly Grand Total */
    this.timeSheetForm.addControl('txtWeeklyGrandTotal', new FormControl(this.decimal.transform(0, '1.2-2', null)));

    /* */
    this.timeSheetForm.addControl('drpTandMDefault', new FormControl(this.decimal.transform(0, '1.2-2', null)));
    this.timeSheetForm.addControl('txtTANDMDailyTotalDefault', new FormControl(this.decimal.transform(0, '1.2-2', null)));

    this.timeSheetForm.addControl('drpProjBillDefault', new FormControl(this.decimal.transform(0, '1.2-2', null)));
    this.timeSheetForm.addControl('txtProjBillDailyTotalDefault', new FormControl(this.decimal.transform(0, '1.2-2', null)));

    this.timeSheetForm.addControl('drpNonBillDefault', new FormControl(this.decimal.transform(0, '1.2-2', null)));
    this.timeSheetForm.addControl('txtNonBillDailyTotalDefault', new FormControl(this.decimal.transform(0, '1.2-2', null)));
  }
  hoursOnChange() {
    this.setValues();
  }
}
