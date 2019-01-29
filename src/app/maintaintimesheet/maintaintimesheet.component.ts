import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import {
  Holidays, Employee,
  TimeSheetBinding, TimeSheet, TimeLine, TimeCell, TimePeriods, TimeLineAndTimeCell, TimeSheetSubmit, TimeSheetForApproval
} from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { from } from 'rxjs';
import { OverlayPanelModule, OverlayPanel } from 'primeng/overlaypanel';
import { InputTextModule, Dropdown } from 'primeng/primeng';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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
  _periodEndDateString = '';
  _days = 0;
  _DateArray: Date[] = [];
  _weekArray: number[] = [];
  _tmpDt: any;
  _dt: number;
  tandm: TimeSheetBinding[] = [];
  tandmSelect: string;
  projectBillable: TimeSheetBinding[] = [];
  projectBillableSelect: string;
  nonBillable: TimeSheetBinding[] = [];
  nonBillableSelect: string;
  _timesheetId: number;
  _timesheetPeriodEnd: string;
  _timeSheetEntries: TimeSheet[] = [];
  _timeLineEntries: TimeLine[] = [];
  _timeNONbill: TimeLine[] = [];
  _timeProjBill: TimeLine[] = [];
  _timeTandM: TimeLine[] = [];
  _timeCellEntries: TimeCell[] = [];
  timeSheetForm = new FormGroup({});
  _timePeriods: TimePeriods[] = [];
  _employee: Employee[] = [];
  _errorDailyGrandArray: number[] = [];
  _errorDailyTANDMArray: number[] = [];
  _errorHourlyTANDMArray: number[] = [];
  _errorDailyProjBillArray: number[] = [];
  _errorHourlyProjBillArray: number[] = [];
  _errorDailyNonBillArray: number[] = [];
  _errorHourlyNonBillArray: number[] = [];

  _TotalValidationErrors = 0;
  _IsTimeSheetSubmitted = false;
  _actualTimeSheetId = 0;
  _timeSheetApproval: TimeSheetForApproval[];
  _isTimesheetToAprrove = false;
  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this._timesheetId = params['id'] === undefined ? -1 : params['id'];
      this._actualTimeSheetId = params['id'] === undefined ? -1 : params['id'];
      this._timesheetPeriodEnd = params['periodEnd'] === undefined ? -1 : params['periodEnd'];
      if (this._timesheetId.toString() === '-1') {
        this._periodEndDateString = localStorage.getItem('PeriodEndDate');
      }
      if (this._periodEndDateString === '') {
        this._periodEndDateString = this._timesheetPeriodEnd;
      }
    });

    this.defaultControlsToForm();
    this.getTimesheetTimeLineTimeCellDetails();
  }


  getEmployeeDetails(EmployeeId: string) {
    this.timesysSvc.getEmployee(EmployeeId, '', '').subscribe(
      (dataEmp) => {
        if (dataEmp !== undefined && dataEmp !== null && dataEmp.length > 0) {
          this._employee = dataEmp;
        }
        this.checkPendingTimesheets();
      });
  }

  getTimesheetTimeLineTimeCellDetails() {
    this._employee = [];

    this._timeSheetEntries = [];
    this._timeLineEntries = [];
    this._timeCellEntries = [];

    this._timeNONbill = [];
    this._timeProjBill = [];
    this._timeTandM = [];

    this._DateArray = [];
    this._weekArray = [];
    this._timePeriods = [];

    this._peroidStartDate = null;
    this._periodEnddate = null;
    this._IsTimeSheetSubmitted = false;


    if (this._timesheetId > 0) {
      this.timesysSvc.getTimesheetTimeLineTimeCellDetails(this._timesheetId.toString()).subscribe(
        (data) => {
          this.getEmployeeDetails(data[0][0].EmployeeId.toString());

          this.timesysSvc.getTimeSheetPeridos().subscribe(
            (data1) => {

              console.log(data);
              console.log(data1);

              if (data !== undefined && data !== null && data.length > 0) {
                this._timeSheetEntries = data[0];
                this._timeLineEntries = data[1];
                this._timeCellEntries = data[2];

                this._timeNONbill = this._timeLineEntries.filter(P => P.ChargeType === 'NONBILL');
                this._timeProjBill = this._timeLineEntries.filter(P => P.ChargeType === 'PROJBILL');
                this._timeTandM = this._timeLineEntries.filter(P => P.ChargeType === 'TANDM');
              }

              if (data1 !== undefined && data1 !== null && data1.length > 0) {

                if (this._timeSheetEntries !== undefined && this._timeSheetEntries !== null && this._timeSheetEntries.length > 0) {
                  this._timePeriods = data1.filter(P => P.FuturePeriodEnd === this._timeSheetEntries[0].PeriodEnd);
                  if (this._timeSheetEntries[0].Submitted) {
                    this._IsTimeSheetSubmitted = true;
                  }
                  this._periodEnddate = new Date(this._timeSheetEntries[0].PeriodEnd);
                  this._periodEndDateString = this._timeSheetEntries[0].PeriodEnd;
                }
                const startPeriod = data1.filter(P => P.RowNumber === (this._timePeriods[0].RowNumber - 1));

                if (startPeriod !== undefined && startPeriod !== null && startPeriod.length > 0) {
                  this._peroidStartDate = new Date(startPeriod[0].FuturePeriodEnd);
                }

                this._days = this.calculateDate(this._peroidStartDate, this._periodEnddate);
                this._tmpDt = this._peroidStartDate;
                if (this._days > 0) {
                  for (let i = 0; i < this._days - 1; i++) {
                    this._dt = this._tmpDt.setDate(this._tmpDt.getDate() + 1);
                    this._DateArray.push(new Date(this._dt));
                    this._weekArray.push(new Date(this._dt).getDay());
                  }
                }
              }

              this.addFormControls();

            });
        });
    } else {
      this.getEmployeeDetails(localStorage.getItem('UserId').toString());

      this.timesysSvc.getPeriodEndDate().subscribe(
        (data1) => {


          const selectPeriodEndDate = this.datePipe.transform(this._periodEndDateString, 'yyyy-MM-dd');

          if (data1 !== undefined && data1 !== null && data1.length > 0) {

            this._timePeriods = data1.filter(P => P.FuturePeriodEnd === selectPeriodEndDate);


            if (this._timePeriods !== undefined && this._timePeriods !== null && this._timePeriods.length > 0) {
              const startPeriod = data1.filter(P => P.RowNumber === (this._timePeriods[0].RowNumber - 1));
              this._periodEnddate = new Date(this._timePeriods[0].FuturePeriodEnd);

              if (startPeriod !== undefined && startPeriod !== null && startPeriod.length > 0) {
                this._peroidStartDate = new Date(startPeriod[0].FuturePeriodEnd);
              }

              this._days = this.calculateDate(this._peroidStartDate, this._periodEnddate);
              this._tmpDt = this._peroidStartDate;
              if (this._days > 0) {
                for (let i = 0; i < this._days - 1; i++) {
                  this._dt = this._tmpDt.setDate(this._tmpDt.getDate() + 1);
                  this._DateArray.push(new Date(this._dt));
                  this._weekArray.push(new Date(this._dt).getDay());
                }
              }
            }
          }
          this.defaultControlsToForm();
          this.addFormControls();
        });
    }
  }

  defaultControlsToForm() {
    /* Total Weeks */
    this.timeSheetForm = new FormGroup({});
    this.timeSheetForm.addControl('txtTANDMTotalWeeks', new FormControl(this.decimal.transform(0, '1.2-2', null)));
    this.timeSheetForm.addControl('txtProjBillTotalWeeks', new FormControl(this.decimal.transform(0, '1.2-2', null)));
    this.timeSheetForm.addControl('txtNonBillTotalWeeks', new FormControl(this.decimal.transform(0, '1.2-2', null)));

    /* Weekly Grand Total */
    this.timeSheetForm.addControl('txtWeeklyGrandTotal', new FormControl(this.decimal.transform(0, '1.2-2', null)));

    /* */
    this.timeSheetForm.addControl('drpTandMDefault', new FormControl(-1, null));
    this.timeSheetForm.addControl('txtTANDMWeeklyTotalDefault', new FormControl(this.decimal.transform(0, '1.2-2', null)));

    this.timeSheetForm.addControl('drpProjBillDefault', new FormControl(-1, null));
    this.timeSheetForm.addControl('txtProjBillWeeklyTotalDefault', new FormControl(this.decimal.transform(0, '1.2-2', null)));

    this.timeSheetForm.addControl('drpNonBillDefault', new FormControl(-1, null));
    this.timeSheetForm.addControl('txtNonBillWeeklyTotalDefault', new FormControl(this.decimal.transform(0, '1.2-2', null)));
    this.timeSheetForm.addControl('txtComments', new FormControl(null, null));
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
        this.timeSheetForm.addControl(txtProjBillDailyTotalHours,
          new FormControl({ value: this.decimal.transform(0, '1.2-2', null), disabled: true }));
        this.timeSheetForm.controls[txtProjBillDailyTotalHours].disable();

        const txtNonBillDailyTotals = 'txtNonBillDailyTotals_' + j;
        this.timeSheetForm.addControl(txtNonBillDailyTotals,
          new FormControl({ value: this.decimal.transform(0, '1.2-2', null), disabled: true }));
        this.timeSheetForm.controls[txtNonBillDailyTotals].disable();

        const txtTANDMDailyTotals = 'txtTANDMDailyTotals_' + j;
        this.timeSheetForm.addControl(txtTANDMDailyTotals,
          new FormControl({ value: this.decimal.transform(0, '1.2-2', null), disabled: true }));
        this.timeSheetForm.controls[txtTANDMDailyTotals].disable();

        /* Daily Grand Totals Building */
        const txtDailyGrandTotal = 'txtDailyGrandTotal_' + j;
        this.timeSheetForm.addControl(txtDailyGrandTotal,
          new FormControl({ value: this.decimal.transform(0, '1.2-2', null), disabled: true }));
        this.timeSheetForm.controls[txtDailyGrandTotal].disable();

        /* Daily Default Hours Building */
        const txttimeTandMHoursDefault = 'txttimeTandMHoursDefault_' + j;
        this.timeSheetForm.addControl(txttimeTandMHoursDefault, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        const txtProjBillHoursDefault = 'txtProjBillHoursDefault_' + j;
        this.timeSheetForm.addControl(txtProjBillHoursDefault, new FormControl(this.decimal.transform(0, '1.2-2', null)));

        const txtNonBillHoursDefault = 'txtNonBillHoursDefault_' + j;
        this.timeSheetForm.addControl(txtNonBillHoursDefault, new FormControl(this.decimal.transform(0, '1.2-2', null)));
      }

      /* Weekly Totals Building */
      for (let j = 0; j < this._timeProjBill.length; j++) {
        const txtProjBillWeeklyTotalHours = 'txtProjBillWeeklyTotals_' + j;
        this.timeSheetForm.addControl(txtProjBillWeeklyTotalHours,
          new FormControl({ value: this.decimal.transform(0, '1.2-2', null), disabled: true }));
      }
      for (let j = 0; j < this._timeNONbill.length; j++) {
        const txtNonBillWeeklyTotals = 'txtNonBillWeeklyTotals_' + j;
        this.timeSheetForm.addControl(txtNonBillWeeklyTotals,
          new FormControl({ value: this.decimal.transform(0, '1.2-2', null), disabled: true }));
      }
      for (let j = 0; j < this._timeTandM.length; j++) {
        const txtTANDMWeeklyTotals = 'txtTANDMWeeklyTotals_' + j;
        this.timeSheetForm.addControl(txtTANDMWeeklyTotals,
          new FormControl({ value: this.decimal.transform(0, '1.2-2', null), disabled: true }));
      }
    } catch (e) {
      alert(e.error);
    }
    this.setValues();
  }

  resetForm() {
    this.timeSheetForm.markAsPristine();
    this.timeSheetForm.markAsUntouched();
    this.timeSheetForm.updateValueAndValidity();
    this.timeSheetForm.reset();
  }
  private calculateDate(date1, date2) {
    // our custom function with two parameters, each for a selected date
    const diffc = date1.getTime() - date2.getTime();
    // getTime() function used to convert a date into milliseconds. This is needed in order to perform calculations.
    const days = Math.round(Math.abs(diffc / (1000 * 60 * 60 * 24)));
    // this is the actual equation that calculates the number of days.
    return days + 1;
  }
  getClientProjectCategoryDropDown(timeSheetUserId: string) {
    // console.log(timeSheetUserId);
    this.timesysSvc.getEmployeeClientProjectNonBillableDetails(timeSheetUserId).subscribe(
      (data) => {
        this.tandm = [{ label: '', value: -1, code: '' }];
        this.projectBillable = [{ label: '', value: -1, code: '' }];
        this.nonBillable = [{ label: '', value: -1, code: '' }];
        this.tandmSelect = '-1';
        this.projectBillableSelect = '-1';
        this.nonBillableSelect = '-1';

        if (data !== undefined && data !== null && data.length > 0) {
          let _array: TimeSheetBinding[];
          _array = data.filter(P => P.code === 'TANDM');
          if (_array !== undefined && _array !== null && _array.length > 0) {
            for (let i = 0; i < _array.length; i++) {
              this.tandm.push(_array[i]);
            }
          }
          _array = data.filter(P => P.code === 'PROJBILL');
          if (_array !== undefined && _array !== null && _array.length > 0) {
            for (let i = 0; i < _array.length; i++) {
              this.projectBillable.push(_array[i]);
            }
          }
          _array = data.filter(P => P.code === 'NONBILL');
          if (_array !== undefined && _array !== null && _array.length > 0) {
            for (let i = 0; i < _array.length; i++) {
              this.nonBillable.push(_array[i]);
            }
          }
        }
      });
  }
  TANDMTotalCalculation() {
    /* TANDM Daily Total Calculation */
    this._errorDailyTANDMArray = [];
    this._errorHourlyTANDMArray = [];
    let WeeklyTANDMDefaultHoursTotal = 0;
    for (let j = 0; j < this._DateArray.length; j++) {
      let dayHoursTotal = 0;
      for (let i = 0; i < this._timeTandM.length; i++) {
        const hour = this.timeSheetForm.get('txttimeTandMHours_' + i + '_' + j).value;
        if (hour > 24) {
          this._errorHourlyTANDMArray.push(j);
        }
        dayHoursTotal += +hour;
      }
      const defaultHour = this.timeSheetForm.get('txttimeTandMHoursDefault_' + j).value;
      if (defaultHour > 0) {
        if (defaultHour > 24) {
          this._errorHourlyTANDMArray.push(j);
        }
        dayHoursTotal += +defaultHour;
      }
      if (dayHoursTotal > 24) {
        this._errorDailyTANDMArray.push(j);
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
    for (let j = 0; j < this._DateArray.length; j++) {
      const defaultHour = this.timeSheetForm.get('txttimeTandMHoursDefault_' + j).value;
      if (defaultHour > 0) {
        WeeklyTANDMDefaultHoursTotal += +defaultHour;
      }
    }
    this.timeSheetForm.controls['txtTANDMWeeklyTotalDefault'].setValue(this.decimal.transform(WeeklyTANDMDefaultHoursTotal, '1.2-2'));
    /* TANDM All Weeks Total Calculation */
    let AllWeeksTANDMHoursTotal = 0;
    for (let i = 0; i < this._timeTandM.length; i++) {
      const hour = this.timeSheetForm.get('txtTANDMWeeklyTotals_' + i).value;
      AllWeeksTANDMHoursTotal += +hour;
    }
    AllWeeksTANDMHoursTotal += +this.timeSheetForm.get('txtTANDMWeeklyTotalDefault').value;
    this.timeSheetForm.controls['txtTANDMTotalWeeks'].setValue(this.decimal.transform(AllWeeksTANDMHoursTotal, '1.2-2'));
  }
  ProjBillTotalCalculation() {
    /* ProjBill Daily Total Calculation */
    this._errorDailyProjBillArray = [];
    this._errorHourlyProjBillArray = [];
    let WeeklyProjBillDefaultHoursTotal = 0;
    for (let j = 0; j < this._DateArray.length; j++) {
      let dayHoursTotal = 0;
      for (let i = 0; i < this._timeProjBill.length; i++) {
        const hour = this.timeSheetForm.get('txtProjBillHours_' + i + '_' + j).value;
        if (hour > 24) {
          this._errorHourlyProjBillArray.push(j);
        }
        dayHoursTotal += +hour;
      }
      const defaultHour = this.timeSheetForm.get('txtProjBillHoursDefault_' + j).value;
      if (defaultHour > 0) {
        if (defaultHour > 24) {
          this._errorHourlyProjBillArray.push(j);
        }
        dayHoursTotal += +defaultHour;
      }
      if (dayHoursTotal > 24) {
        this._errorDailyProjBillArray.push(j);
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
    for (let j = 0; j < this._DateArray.length; j++) {
      const defaultHour = this.timeSheetForm.get('txtProjBillHoursDefault_' + j).value;
      if (defaultHour > 0) {
        WeeklyProjBillDefaultHoursTotal += +defaultHour;
      }
    }
    this.timeSheetForm.controls['txtProjBillWeeklyTotalDefault'].setValue(this.decimal.transform(WeeklyProjBillDefaultHoursTotal, '1.2-2'));
    /* ProjBill All Weeks Total Calculation */
    let AllWeeksProjBillHoursTotal = 0;
    for (let i = 0; i < this._timeProjBill.length; i++) {
      const hour = this.timeSheetForm.get('txtProjBillWeeklyTotals_' + i).value;
      AllWeeksProjBillHoursTotal += +hour;
    }
    AllWeeksProjBillHoursTotal += +this.timeSheetForm.get('txtProjBillWeeklyTotalDefault').value;
    this.timeSheetForm.controls['txtProjBillTotalWeeks'].setValue(this.decimal.transform(AllWeeksProjBillHoursTotal, '1.2-2'));
  }
  NonBillTotalCalculation() {
    /* NonBill Daily Total Calculation */
    this._errorDailyNonBillArray = [];
    this._errorHourlyNonBillArray = [];
    let WeeklyNonBillDefaultHoursTotal = 0;
    for (let j = 0; j < this._DateArray.length; j++) {
      let dayHoursTotal = 0;
      for (let i = 0; i < this._timeNONbill.length; i++) {
        const hour = this.timeSheetForm.get('txtNonBillHours_' + i + '_' + j).value;
        if (hour > 24) {
          this._errorHourlyNonBillArray.push(j);
        }
        dayHoursTotal += +hour;
      }
      const defaultHour = this.timeSheetForm.get('txtNonBillHoursDefault_' + j).value;
      if (defaultHour > 0) {
        if (defaultHour > 24) {
          this._errorHourlyNonBillArray.push(j);
        }
        dayHoursTotal += +defaultHour;
      }
      if (dayHoursTotal > 24) {
        this._errorDailyNonBillArray.push(j);
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
    for (let j = 0; j < this._DateArray.length; j++) {
      const defaultHour = this.timeSheetForm.get('txtNonBillHoursDefault_' + j).value;
      if (defaultHour > 0) {
        WeeklyNonBillDefaultHoursTotal += +defaultHour;
      }
    }
    this.timeSheetForm.controls['txtNonBillWeeklyTotalDefault'].setValue(this.decimal.transform(WeeklyNonBillDefaultHoursTotal, '1.2-2'));
    /* NonBill All Weeks Total Calculation */
    let AllWeeksNonBillHoursTotal = 0;
    for (let i = 0; i < this._timeNONbill.length; i++) {
      const hour = this.timeSheetForm.get('txtNonBillWeeklyTotals_' + i).value;
      AllWeeksNonBillHoursTotal += +hour;
    }
    AllWeeksNonBillHoursTotal += +this.timeSheetForm.get('txtNonBillWeeklyTotalDefault').value;
    this.timeSheetForm.controls['txtNonBillTotalWeeks'].setValue(this.decimal.transform(AllWeeksNonBillHoursTotal, '1.2-2'));
  }


  hoursOnChange() {
    this.setValues();
  }
  setValues() {
    if (this.timeSheetForm.get('txtComments') !== undefined &&
      this.timeSheetForm.get('txtComments') !== null &&
      this._timeSheetEntries !== undefined &&
      this._timeSheetEntries !== null &&
      this._timeSheetEntries.length > 0
    ) {
      this.timeSheetForm.controls['txtComments'].setValue(this._timeSheetEntries[0].Comments);
    }
    this.TANDMTotalCalculation();
    this.ProjBillTotalCalculation();
    this.NonBillTotalCalculation();
    /* Grand Total Calculation */
    this._errorDailyGrandArray = [];
    for (let j = 0; j < this._DateArray.length; j++) {
      const TANDhour = this.timeSheetForm.get('txtTANDMDailyTotals_' + j).value;
      const ProjBillhour = this.timeSheetForm.get('txtProjBillDailyTotals_' + j).value;
      const NonBillhour = this.timeSheetForm.get('txtNonBillDailyTotals_' + j).value;
      const grandTotal = ((+TANDhour) + (+ProjBillhour) + (+NonBillhour));
      // tslint:disable-next-line:max-line-length
      this.timeSheetForm.controls['txtDailyGrandTotal_' + j].setValue(this.decimal.transform(grandTotal, '1.2-2'));
      if (grandTotal > 24) {
        this._errorDailyGrandArray.push(j);
      }
    }

    const TANDhourTotalWeek = this.timeSheetForm.get('txtTANDMTotalWeeks').value;
    const ProjBillhourTotalWeek = this.timeSheetForm.get('txtProjBillTotalWeeks').value;
    const NonBillhourTotalWeek = this.timeSheetForm.get('txtNonBillTotalWeeks').value;
    const grandWeeklyTotal = ((+TANDhourTotalWeek) + (+ProjBillhourTotalWeek) + (+NonBillhourTotalWeek));

    // tslint:disable-next-line:max-line-length
    this.timeSheetForm.controls['txtWeeklyGrandTotal'].setValue(this.decimal.transform(grandWeeklyTotal, '1.2-2'));
    if (this._IsTimeSheetSubmitted) {
      this.timeSheetForm.disable();
    } else {
      this.timeSheetForm.enable();
    }
    // console.log(this._isTimesheetToAprrove + 'Super');
    if (this._isTimesheetToAprrove) {
      const superComments = this.timeSheetForm.get('txtSuperComments');
      superComments.enable();
    }
  }
  get f() {
    return this.timeSheetForm.controls;
  }
  hourRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value !== undefined && (isNaN(control.value) || control.value < 18 || control.value > 45)) {
      return { 'ageRange': true };
    }
    return null;
  }

  TotalHoursExceedValidation() {
    if (this._errorDailyGrandArray.length > 0 ||
      this._errorDailyNonBillArray.length > 0 ||
      this._errorDailyProjBillArray.length > 0 ||
      this._errorDailyNonBillArray.length > 0 ||
      this._errorHourlyNonBillArray.length > 0 ||
      this._errorHourlyProjBillArray.length > 0 ||
      this._errorHourlyTANDMArray.length > 0) {
      this.msgSvc.add({
        key: 'alert',
        sticky: true,
        severity: 'error',
        summary: '',
        detail: 'Hours Exceeded.',
      });
      this._TotalValidationErrors++;
    }
  }

  // tslint:disable-next-line:max-line-length
  DataMissingValidations(drpId: string, txtId: string, drpDefaultId: string, txtDefaultId: string, ChargeType: string, timeItems: any, mode: number) {
    const drpError = [];
    const drpSelOrUnsel = [];
    const drpValues = [];
    for (let i = 0; i < timeItems.length; i++) {
      const drpVal = this.timeSheetForm.get(drpId + i).value;
      const WeeklyTotals = this.timeSheetForm.get(txtId + i).value;
      if (drpVal === -1) {
        if (WeeklyTotals > 0) {
          drpError.push(i);
          this._TotalValidationErrors++;
        }
      } else {
        drpValues.push(drpVal);
        if (WeeklyTotals <= 0) {
          drpSelOrUnsel.push(1);
        }
      }
    }
    const drpValDefault = this.timeSheetForm.get(drpDefaultId).value;
    const WeeklyTotalsDefault = this.timeSheetForm.get(txtDefaultId).value;
    if (drpValDefault === -1) {
      if (WeeklyTotalsDefault > 0) {
        drpError.push(1);
        this._TotalValidationErrors++;
      }
    } else {
      drpValues.push(drpValDefault);
      if (WeeklyTotalsDefault <= 0) {
        drpSelOrUnsel.push(1);
      }
    }

    const distinct = (value: any, index: any, self: any) => {
      return self.indexOf(value) === index;
    };
    const distinctValues = drpValues.filter(distinct);
    if (distinctValues.length !== drpValues.length) {
      this.msgSvc.add({
        key: 'alert',
        sticky: true,
        severity: 'error',
        summary: '',
        detail: 'The ' + ChargeType + ' is already used, please select another ' + ChargeType + '.',
      });
      this._TotalValidationErrors++;
    } else {
      if (mode === 1) {
        if (drpError.length > 0) {
          this._TotalValidationErrors++;
          this.confSvc.confirm({
            message: '' + ChargeType + ' not selected, entered billing hours will not save. Do you want to continue?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
            },
            reject: () => {
              this._TotalValidationErrors--;
            }
          });
        } else {
          if (drpSelOrUnsel.length > 0) {
            this._TotalValidationErrors++;
            this.confSvc.confirm({
              message: '' + ChargeType + ' selected, but billing hours have not entered. Do you want to continue?',
              header: 'Confirmation',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
              },
              reject: () => {
                this._TotalValidationErrors--;
              }
            });
          }
        }
      }
    }
  }

  drpChange(event: any) {
    this._TotalValidationErrors = 0;
    this.DataMissingValidations('drpTandM_', 'txtTANDMWeeklyTotals_',
      'drpTandMDefault', 'txtTANDMWeeklyTotalDefault', 'Client', this._timeTandM, 0);
    this.DataMissingValidations('drpProjBill_', 'txtProjBillWeeklyTotals_',
      'drpProjBillDefault', 'txtProjBillWeeklyTotalDefault', 'Project', this._timeProjBill, 0);
    this.DataMissingValidations('drpNONBill_', 'txtNonBillWeeklyTotals_',
      'drpNonBillDefault', 'txtNonBillWeeklyTotalDefault', 'Category', this._timeNONbill, 0);
  }

  saveClickValidations() {
    this._TotalValidationErrors = 0;
    this.TotalHoursExceedValidation();
    this.DataMissingValidations('drpTandM_', 'txtTANDMWeeklyTotals_',
      'drpTandMDefault', 'txtTANDMWeeklyTotalDefault', 'Client', this._timeTandM, 1);
    this.DataMissingValidations('drpProjBill_', 'txtProjBillWeeklyTotals_',
      'drpProjBillDefault', 'txtProjBillWeeklyTotalDefault', 'Project', this._timeProjBill, 1);
    this.DataMissingValidations('drpNONBill_', 'txtNonBillWeeklyTotals_',
      'drpNonBillDefault', 'txtNonBillWeeklyTotalDefault', 'Category', this._timeNONbill, 1);
    // console.log(this._TotalValidationErrors);
  }

  Save() {
    this.saveClickValidations();
    if (this._TotalValidationErrors === 0) {
      this.SaveSPCall(false);
    }

  }

  Submit() {
    this.saveClickValidations();
    if (this._TotalValidationErrors === 0) {
      this.SaveSPCall(true);
    }

  }

  SaveSPCall(submitted: boolean) {
    let timeSheetSubmit: TimeSheetSubmit;
    timeSheetSubmit = {};
    timeSheetSubmit.timeSheet = {};
    timeSheetSubmit.timeSheet.Id = this._timesheetId;
    timeSheetSubmit.timeSheet.PeriodEnd = this.datePipe.transform(this._periodEnddate.toString(), 'yyyy-MM-dd');

    if (this.timeSheetForm.get('txtComments') !== undefined &&
      this.timeSheetForm.get('txtComments') !== null && this.timeSheetForm.get('txtComments').value !== null &&
      this.timeSheetForm.get('txtComments').value.toString() !== ''
    ) {
      timeSheetSubmit.timeSheet.Comments = this.timeSheetForm.get('txtComments').value.toString();
    } else {
      timeSheetSubmit.timeSheet.Comments = '';
    }
    timeSheetSubmit.timeSheet.EmployeeId = +localStorage.getItem('UserId');
    timeSheetSubmit.timeSheet.Submitted = submitted;
    if (this._timesheetId.toString() === '-1') {
      this.timesysSvc.timeSheetInsert(timeSheetSubmit.timeSheet).subscribe((dataNew) => {
        this._timesheetId = +dataNew;
        timeSheetSubmit.timeSheet.Id = this._timesheetId;

        let timeLineAndTimeCellSaveArr: TimeLineAndTimeCell[];
        timeLineAndTimeCellSaveArr = [];
        for (let i = 0; i < this._timeTandM.length; i++) {
          this.buildValues(timeLineAndTimeCellSaveArr, 'drpTandM_' + i, 'txttimeTandMHours_' + i + '_', 'TANDM');
        }
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpTandMDefault', 'txttimeTandMHoursDefault_', 'TANDM');
        for (let i = 0; i < this._timeProjBill.length; i++) {
          this.buildValues(timeLineAndTimeCellSaveArr, 'drpProjBill_' + i, 'txtProjBillHours_' + i + '_', 'PROJBILL');
        }
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpProjBillDefault', 'txtProjBillHoursDefault_', 'PROJBILL');
        for (let i = 0; i < this._timeNONbill.length; i++) {
          this.buildValues(timeLineAndTimeCellSaveArr, 'drpNONBill_' + i, 'txtNonBillHours_' + i + '_', 'NONBILL');
        }
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpNonBillDefault', 'txtNonBillHoursDefault_', 'NONBILL');
        if (timeLineAndTimeCellSaveArr.length > 0) {
          timeSheetSubmit.timeLineAndTimeCellArr = timeLineAndTimeCellSaveArr;
          this.timesysSvc.TimeLineAndTimeCell_DeleteAndInsert(timeSheetSubmit)
            .subscribe(
              (outputData) => {
                if (outputData !== null && outputData.ErrorMessage !== '') {
                  this.msgSvc.add({
                    key: 'alert',
                    sticky: true,
                    severity: 'error',
                    summary: 'Error!',
                    detail: outputData.ErrorMessage
                  });
                } else {
                  this.msgSvc.add({
                    key: 'saveSuccess', severity: 'success'
                    , summary: 'Info Message', detail: 'Timesheet saved successfully'
                  });
                  this.resetForm();
                  this.defaultControlsToForm();
                  this.getClientProjectCategoryDropDown(localStorage.getItem('UserId'));
                  this.getTimesheetTimeLineTimeCellDetails();
                }
              },
              (error) => {
                console.log(error);
              });
          if (this._actualTimeSheetId.toString() === '-1') {
            localStorage.removeItem('PeriodEndDate');
            this.router.navigate(['/menu/maintaintimesheet/' + this._timesheetId]);
          }
        }
      });
    } else {
      let timeLineAndTimeCellSaveArr: TimeLineAndTimeCell[];
      timeLineAndTimeCellSaveArr = [];
      for (let i = 0; i < this._timeTandM.length; i++) {
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpTandM_' + i, 'txttimeTandMHours_' + i + '_', 'TANDM');
      }
      this.buildValues(timeLineAndTimeCellSaveArr, 'drpTandMDefault', 'txttimeTandMHoursDefault_', 'TANDM');
      for (let i = 0; i < this._timeProjBill.length; i++) {
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpProjBill_' + i, 'txtProjBillHours_' + i + '_', 'PROJBILL');
      }
      this.buildValues(timeLineAndTimeCellSaveArr, 'drpProjBillDefault', 'txtProjBillHoursDefault_', 'PROJBILL');
      for (let i = 0; i < this._timeNONbill.length; i++) {
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpNONBill_' + i, 'txtNonBillHours_' + i + '_', 'NONBILL');
      }
      this.buildValues(timeLineAndTimeCellSaveArr, 'drpNonBillDefault', 'txtNonBillHoursDefault_', 'NONBILL');
      if (timeLineAndTimeCellSaveArr.length > 0) {
        timeSheetSubmit.timeLineAndTimeCellArr = timeLineAndTimeCellSaveArr;
        this.timesysSvc.TimeLineAndTimeCell_DeleteAndInsert(timeSheetSubmit)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess', severity: 'success'
                  , summary: 'Info Message', detail: 'Timesheet saved successfully'
                });
                this.resetForm();
                this.defaultControlsToForm();
                this.getClientProjectCategoryDropDown(localStorage.getItem('UserId'));
                this.getTimesheetTimeLineTimeCellDetails();
              }
            },
            (error) => {
              console.log(error);
            });
      }
    }

  }

  buildValues(timeLineAndTimeCellSaveArr: TimeLineAndTimeCell[], drpArr: string, txtArr: string, chargeTypeArr: string) {
    if (this.timeSheetForm.get(drpArr) !== undefined &&
      this.timeSheetForm.get(drpArr) !== null &&
      this.timeSheetForm.get(drpArr).value.toString() !== '' &&
      this.timeSheetForm.get(drpArr).value.toString() !== '-1'
    ) {
      let timeLineAndTimeCellSave: TimeLineAndTimeCell;
      timeLineAndTimeCellSave = {};
      let timeLineSave: TimeLine;
      timeLineSave = {};
      timeLineSave.TimeSheetId = this._timesheetId;
      timeLineSave.ChargeType = chargeTypeArr;
      timeLineSave.ChargeId = this.timeSheetForm.get(drpArr).value;
      timeLineAndTimeCellSave.timeLine = timeLineSave;

      let timeCellSaveArr: TimeCell[];
      timeCellSaveArr = [];
      for (let j = 0; j < this._DateArray.length; j++) {
        if (this.timeSheetForm.get(txtArr + j) !== undefined &&
          this.timeSheetForm.get(txtArr + j) !== null &&
          this.timeSheetForm.get(txtArr + j).value.toString() !== '' &&
          +this.timeSheetForm.get(txtArr + j).value > 0) {
          let timeCellSave: TimeCell;
          timeCellSave = {};
          timeCellSave.CalendarDate = this.datePipe.transform(this._DateArray[j], 'yyyy-MM-dd');
          timeCellSave.Hours = this.timeSheetForm.get(txtArr + j).value;
          timeCellSaveArr.push(timeCellSave);
        }
      }
      timeLineAndTimeCellSave.timeCell = timeCellSaveArr;

      timeLineAndTimeCellSaveArr.push(timeLineAndTimeCellSave);
    }
  }



  editHoliday(rowData: any) {

  }
  checkPendingTimesheets() {
    if (this._employee.length > 0 && this._employee[0].ID.toString() !== localStorage.getItem('UserId')) {
      this.timesysSvc.getTimeSheetForApprovalCheck(this._employee[0].ID.toString())
        .subscribe(
          (data) => {
            this._timeSheetApproval = data;
            for (let i = 0; i < this._timeSheetApproval.length; i++) {
              if (this._timesheetId.toString() === this._timeSheetApproval[i].TimesheetId.toString()) {
                this._isTimesheetToAprrove = true;
                break;
              }
            }
            // console.log(this._isTimesheetToAprrove);
            if (this._isTimesheetToAprrove) {
              this.getClientProjectCategoryDropDown(this._employee[0].ID.toString());
            } else {
              this.getClientProjectCategoryDropDown(localStorage.getItem('UserId'));
            }
          }
        );
    } else {
      this.getClientProjectCategoryDropDown(localStorage.getItem('UserId'));

    }
  }
  Accept(txtSuper: any) {
    // console.log(txtSuper.value);
    this.router.navigate(['/menu/dashboard/']);
  }
  Reject() {
    this.router.navigate(['/menu/dashboard/']);
  }
}
