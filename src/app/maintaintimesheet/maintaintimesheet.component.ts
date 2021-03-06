import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import {
  Holidays, Employee,
  TimeSheetBinding, TimeSheet, TimeLine, TimeCell, TimePeriods, TimeLineAndTimeCell,
  TimeSheetSubmit, TimeSheetForApproval, DateArray, PageNames
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
import { DISABLED } from '@angular/forms/src/model';
import { environment } from 'src/environments/environment';
import { wrapIntoObservable } from '@angular/router/src/utils/collection';
import { TableExport } from 'tableexport';
import { ActivitylogService } from '../service/activitylog.service'; // ActivityLog - Default

@Component({
  selector: 'app-maintaintimesheet',
  templateUrl: './maintaintimesheet.component.html',
  styleUrls: ['./maintaintimesheet.component.css'],
  providers: [DatePipe, DecimalPipe],
})

export class MaintaintimesheetComponent implements OnInit {
  // @ViewChild('divError') divError: ElementRef;
  // @ViewChild('divWarning') divWarning: ElementRef;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private fb: FormBuilder, private datePipe: DatePipe, private decimal: DecimalPipe, ) { }


  _days = 0;
  _errorMessage = '';
  _warningMessage = '';
  _errorBlock = '';
  _warningBlock = '';
  showConfirmSubmit = false;
  _DateArray: string[] = [];
  _weekArray: number[] = [];
  tandm: TimeSheetBinding[] = [];
  tandmSelect: string;
  projectBillable: TimeSheetBinding[] = [];
  projectBillableSelect: string;
  nonBillable: TimeSheetBinding[] = [];
  nonBillableSelect: string;
  _timesheetId: number;
  _timesheetUserId: string;
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
  _supervisor: Employee[] = [];
  _timeSheetUsersSupervisor: Employee[] = [];
  _errorDailyGrandArray: number[] = [];
  _errorDailyTANDMArray: number[] = [];
  _errorHourlyTANDMArray: number[] = [];
  _errorDailyProjBillArray: number[] = [];
  _errorHourlyProjBillArray: number[] = [];
  _errorDailyNonBillArray: number[] = [];
  _errorHourlyNonBillArray: number[] = [];
  _errorHourlyNonBillHolidayArray: number[] = [];
  _errorHourlyNonBillHolidayArrayRow: number[] = [];
  _TotalValidationErrors = 0;
  _IsTimeSheetSubmitted = false;
  _IsTimeSheetSubmittedJustNow = false;
  _showComments = false;
  _actualTimeSheetId = 0;
  _isTimesheetToAprrove = false;
  _isTimesheetRejected = false;
  _isTimesheetApprovedOrRejected = false;
  _isTimesheetView = false;
  _submitMessage = '';
  _EmployeeName = '';
  _periodEndDateDisplay = '';
  _SubmittedOn = 'N/A';
  _Resubmittal = 'No';
  _pageState = '';
  _ApprovalId = 0;
  showSpinner = false;
  _peroidStartDate: Date = new Date('2018-11-01');
  _periodEnddate: Date = new Date('2018-11-15');
  _periodEndDateString = '';
  _holidays: Holidays[] = [];
  _timePeriodsOnLoad: TimePeriods[] = [];
  _timeSheetForApprovalsOnLoad: TimeSheetForApproval[] = [];
  _isTimesheetPending = false;
  _isEmptyTimesheet = false;
  _daysNDates: DateArray;
  // _txtErrorColor = '#ffccd4'; // Error box background color
  _txtErrorColor = ''; // Error box background color


  _timeSheetHTML = '';
  @ViewChild('dtTimesheet') dtTimesheet: ElementRef;

  ngOnInit() {
    this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet', 'Page', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
    this._errorMessage = '';
    this._warningMessage = '';
    this.activatedRoute.params.subscribe((params) => {
      this._timesheetId = params['id'] === undefined ? -1 : params['id'];
      this._actualTimeSheetId = params['id'] === undefined ? -1 : params['id'];
      this._timesheetPeriodEnd = params['periodEnd'] === undefined ? -1 : params['periodEnd'];
      this._pageState = params['state'] === undefined ? '' : params['state'];
      this._ApprovalId = params['approvalId'] === undefined ? -1 : params['approvalId'];
      if (+this._timesheetId.toString() < 0) {
        this._periodEndDateString = this._timesheetPeriodEnd;
        this._periodEndDateDisplay = this.datePipe.transform(this._timesheetPeriodEnd, 'MM-dd-yyyy');
      }
    });
    this.defaultControlsToForm();
    this.getTimesheetTimeLineTimeCellDetails();
  }

  // This method is used to get Employee Details
  getEmployeeDetails(EmployeeId: string) {
    this.timesysSvc.getEmployee(EmployeeId, '', '').subscribe(
      (dataEmp) => {
        if (dataEmp !== undefined && dataEmp !== null && dataEmp.length > 0) {
          this._employee = dataEmp;
          this._EmployeeName = this._employee[0].FirstName + ' ' + this._employee[0].LastName;
          if (this._employee[0].SupervisorId !== undefined && this._employee[0].SupervisorId > 0) {
            this.timesysSvc.getEmployee(this._employee[0].SupervisorId.toString(), '', '').subscribe((superEmp) => {
              this._supervisor = superEmp;
            });
          }
        }
      });
  }

  // This method is used to get Timesheet Details
  getTimesheetTimeLineTimeCellDetails() {
    this._errorMessage = '';
    this._employee = [];
    this.showSpinner = true;
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
          this.timesysSvc.TimesheetHTML(this._timesheetId.toString()).subscribe(
            (dataHTML) => {
              if (dataHTML !== undefined && dataHTML !== null) {
                this._timeSheetHTML = dataHTML;
              }

              if (data !== undefined && data !== null && data.length > 0) {
                if (data[0].length > 0) {
                  this._timesheetUserId = data[0][0].EmployeeId.toString();
                  this.getEmployeeDetails(data[0][0].EmployeeId.toString());
                  this._timeSheetEntries = data[0];
                  this._timeLineEntries = data[1];
                  this._timeCellEntries = data[2];
                  this._isTimesheetRejected = data[0][0].ApprovalStatus === '3' ? true : false;
                  this._timeNONbill = this._timeLineEntries.filter(P => P.ChargeType === 'NONBILL');
                  this._timeProjBill = this._timeLineEntries.filter(P => P.ChargeType === 'PROJBILL');
                  this._timeTandM = this._timeLineEntries.filter(P => P.ChargeType === 'TANDM');
                  if (this._timeSheetEntries !== undefined && this._timeSheetEntries !== null && this._timeSheetEntries.length > 0) {
                    this._SubmittedOn = this._timeSheetEntries[0].SubmitDate !== '' ? (this._timeSheetEntries[0].SubmitDate) : 'N/A';
                    this._Resubmittal = this._timeSheetEntries[0].Resubmitted === true ? 'Yes' : 'No';
                    if (this._timeSheetEntries[0].Submitted) {
                      this._IsTimeSheetSubmitted = true;
                    }
                    this._periodEndDateString = this._timeSheetEntries[0].PeriodEnd;
                    this._periodEndDateDisplay = this.datePipe.transform(this._timeSheetEntries[0].PeriodEnd, 'MM-dd-yyyy');
                    // this.getPeriodDates(this._timeSheetEntries[0].PeriodEnd);
                    this.getAllWantedDetailsOnLoad(this._timesheetUserId, this._timeSheetEntries[0].PeriodEnd);
                  }
                } else {
                  this.showSpinner = false;
                  this._errorMessage = 'Problem exists with this timesheet please contact administrator.<br/>';
                }
                if (this._timeSheetEntries[0].ApprovalStatus === '1') {
                  this._isTimesheetPending = true;
                }
                this._periodEndDateString = this._timeSheetEntries[0].PeriodEnd;
                this._periodEndDateDisplay = this.datePipe.transform(this._timeSheetEntries[0].PeriodEnd, 'MM-dd-yyyy');
                // this.getPeriodDates(this._timeSheetEntries[0].PeriodEnd);
                this.getAllWantedDetailsOnLoad(this._timesheetUserId, this._timeSheetEntries[0].PeriodEnd);
              } else {
                this.showSpinner = false;
                this._errorMessage = 'Problem exists with this timesheet please contact administrator.<br/>';
              }
              if (this._errorMessage !== '') {
                this._errorBlock = this._errorMessage;
              }
            });
        });
    } else {
      this.getEmployeeDetails(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString());
      const selectPeriodEndDate = this.datePipe.transform(this._periodEndDateString, 'yyyy-MM-dd');
      // this.getPeriodDates(selectPeriodEndDate);
      this.getAllWantedDetailsOnLoad(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString(),
        selectPeriodEndDate);
    }
  }

  // This method is used to transform date format
  getNewStartDateVal(dtNew: string): Date {
    const dtDBFormat = this.datePipe.transform(dtNew, 'yyyy-MM-dd');
    const dtVals = dtDBFormat.split('-');
    const newDate = new Date(+dtVals[0], +dtVals[1] - 1, +dtVals[2]);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  }

  // This method is used to transform date format
  getNewEndDateVal(dtNew: string): Date {
    const dtDBFormat = this.datePipe.transform(dtNew, 'yyyy-MM-dd');
    const dtVals = dtDBFormat.split('-');
    const newDate = new Date(+dtVals[0], +dtVals[1] - 1, +dtVals[2]);
    return newDate;
  }

  // This method is used to get PeriodEnd and PeriodStart Dates
  getPeriodDates(selectPeriodEndDate: string) {
    // this.timesysSvc.getTimeSheetPeridos().subscribe(
    //   (data1) => {
    const data1 = this._timePeriodsOnLoad;
    if (data1 !== undefined && data1 !== null && data1.length > 0) {
      this._timePeriods = data1.filter(P => P.FuturePeriodEnd === selectPeriodEndDate);
      if (this._timePeriods !== undefined && this._timePeriods !== null && this._timePeriods.length > 0) {
        const startPeriod = data1.filter(P => P.RowNumber === (this._timePeriods[0].RowNumber - 1));
        // this._periodEnddate = new Date(this._timePeriods[0].FuturePeriodEnd);
        this._periodEnddate = this.getNewEndDateVal(this._timePeriods[0].FuturePeriodEnd);

        if (startPeriod !== undefined && startPeriod !== null && startPeriod.length > 0) {
          // this._peroidStartDate = new Date(startPeriod[0].FuturePeriodEnd);
          this._peroidStartDate = this.getNewStartDateVal(startPeriod[0].FuturePeriodEnd);
        }
        this.getDateAndWeekArrays();
      }
    }
    this.defaultControlsToForm();
    this.checkPendingTimesheets();
    this.addFormControls();
    if (this._peroidStartDate !== undefined && this._peroidStartDate !== null) {
      // For Validation Purpose
      const cStartDate = this.datePipe.transform(this._peroidStartDate.toString(), 'yyyy-MM-dd');
      const cEndDate = this.datePipe.transform(this._periodEnddate.toString(), 'yyyy-MM-dd');
      this.getVertexHolidaysList(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId'), cEndDate, cStartDate);
    }
    // });
  }

  // This method is used to get All data at a time which we wanted to use in this page - because of async functionality
  getAllWantedDetailsOnLoad(timeSheetUserId: string, selectPeriodEndDate: string) {
    this.timesysSvc.getAllWantedDetailsOnLoad(timeSheetUserId, selectPeriodEndDate).subscribe(
      (wholeData) => {
        if (wholeData !== undefined && wholeData !== null && wholeData.length > 0) {
          this._timePeriodsOnLoad = wholeData[0];
          this._timeSheetForApprovalsOnLoad = wholeData[1];
          this._timeSheetUsersSupervisor = wholeData[2];
          this._daysNDates = wholeData[3];
        }
        this.getPeriodDates(selectPeriodEndDate);
      });
  }

  // This method is used to get date and week arrays to display
  getDateAndWeekArrays() {
    // this._days = this.calculateDate(this._peroidStartDate, this._periodEnddate);
    // if (this._days > 0) {
    //   for (let i = 0; i < this._days; i++) {
    //     const dtNew = new Date(this._peroidStartDate.getFullYear(),
    //       this._peroidStartDate.getMonth(),
    //       this._peroidStartDate.getDate() + i);
    //     this._DateArray.push(this.datePipe.transform(dtNew, 'yyyy-MM-dd'));
    //     this._weekArray.push(dtNew.getDay());
    //   }
    // }
    this._days = this._daysNDates.NoOfDays;
    const datesRound = this._daysNDates.Dates;
    if (datesRound.length > 0) {
      for (let i = 0; i < datesRound.length; i++) {
        const dtNew = new Date(datesRound[i]);
        this._DateArray = this._daysNDates.Dates;
        this._weekArray.push(dtNew.getDay());
      }
    }
  }

  // This method is used to add static controls to form
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
    this.timeSheetForm.addControl('txtUserComments', new FormControl('', null));
    this.timeSheetForm.addControl('txtSuperComments', new FormControl('', null));
  }

  // This method is used to add dynamic controls to form
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
    this.showSpinner = false;
  }

  // This method is used to reset the whole form to default
  resetForm() {
    this.timeSheetForm.markAsPristine();
    this.timeSheetForm.markAsUntouched();
    this.timeSheetForm.updateValueAndValidity();
    this.timeSheetForm.reset();
  }
  // private calculateDate(date1, date2) {
  //   // our custom function with two parameters, each for a selected date
  //   const diffc = date1.getTime() - date2.getTime();
  //   // getTime() function used to convert a date into milliseconds. This is needed in order to perform calculations.
  //   const days = Math.round(Math.abs(diffc / (1000 * 60 * 60 * 24)));
  //   // this is the actual equation that calculates the number of days.
  //   return days + 1;
  // }

  // This method is used to fill all dropdowns with data
  getClientProjectCategoryDropDown(timeSheetUserId: string) {
    const cStartDate = this.datePipe.transform(this._peroidStartDate.toString(), 'yyyy-MM-dd');
    const cEndDate = this.datePipe.transform(this._periodEnddate.toString(), 'yyyy-MM-dd');
    this.timesysSvc.getEmployeeClientProjectNonBillableDetails(timeSheetUserId, cEndDate, cStartDate).subscribe(
      (data) => {
        const data1 = data[0];
        const data2 = data[1];
        this.tandm = [{ label: '', value: -1, code: '' }];
        this.projectBillable = [{ label: '', value: -1, code: '' }];
        this.nonBillable = [{ label: '', value: -1, code: '' }];
        this.tandmSelect = '-1';
        this.projectBillableSelect = '-1';
        this.nonBillableSelect = '-1';

        if (data !== undefined && data !== null && data.length > 0) {
          let _array: TimeSheetBinding[];
          _array = data1.filter(P => P.code === 'TANDM');
          if (_array !== undefined && _array !== null && _array.length > 0) {
            for (let i = 0; i < _array.length; i++) {
              this.tandm.push(_array[i]);
            }
          }
          _array = data1.filter(P => P.code === 'PROJBILL');
          if (_array !== undefined && _array !== null && _array.length > 0) {
            for (let i = 0; i < _array.length; i++) {
              this.projectBillable.push(_array[i]);
            }
          }
          for (let j = 0; j < data2.length; j++) {
            const _timesdataNonBill = new TimeSheetBinding();
            _timesdataNonBill.code = data2[j].Key;
            _timesdataNonBill.label = data2[j].ProjectName;
            _timesdataNonBill.value = data2[j].Id;
            this.nonBillable.push(_timesdataNonBill);
          }
        }
      });
  }

  // This method is used to calculate client, daily and weekly hours
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

  // This method is used to calculate project, daily and weekly hours
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

  // This method is used to calculate Non Billable, daily and weekly hours
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

  // This method is used to calculate total daily and weekly hours on blur event
  hoursOnChange() {
    this.calculateHours();
  }

  // This method is used to calculate total daily and weekly hours
  calculateHours() {
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

  }

  // This method is used to set values on loading the timesheet
  setValues() {
    if (this.timeSheetForm.get('txtUserComments') !== undefined &&
      this.timeSheetForm.get('txtUserComments') !== null &&
      this._timeSheetEntries !== undefined &&
      this._timeSheetEntries !== null &&
      this._timeSheetEntries.length > 0
    ) {
      this.timeSheetForm.controls['txtUserComments'].setValue(this._timeSheetEntries[0].Comments);
      this.timeSheetForm.controls['txtSuperComments'].setValue(this._timeSheetEntries[0].SupervisorComments);
      if (this._timeSheetEntries[0].SupervisorComments !== undefined && this._timeSheetEntries[0].SupervisorComments !== '') {
        this._isTimesheetApprovedOrRejected = true;
        this.timeSheetForm.get('txtSuperComments').disable();
      }
    }
    this.calculateHours();
    // if (this._IsTimeSheetSubmitted || this._isTimesheetView || this._isTimesheetToAprrove || this._isTimesheetRejected) {
    // tslint:disable-next-line:max-line-length
    if (this._IsTimeSheetSubmitted || this._isTimesheetView || this._isTimesheetToAprrove || this._isTimesheetRejected || this._isTimesheetPending) {
      this.timeSheetForm.disable();
      // this.timeSheetForm.get('txtSuperComments').disable();
      // this.timeSheetForm.get('txtUserComments').disable();
    } else {
      this.timeSheetForm.enable();
    }
    if (this._isTimesheetToAprrove) {
      const superComments = this.timeSheetForm.get('txtSuperComments');
      superComments.enable();
    }
  }

  // This method is used to get all formcontrols, we can set or get values from this
  get f() {
    return this.timeSheetForm.controls;
  }

  // This method is used as a validator in html
  hourRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value !== undefined && (isNaN(control.value) || control.value < 18 || control.value > 45)) {
      return { 'ageRange': true };
    }
    return null;
  }

  // This method is used for validating the hour textboxes
  TotalHoursExceedValidation() {
    if (this._errorDailyGrandArray.length > 0 ||
      this._errorDailyNonBillArray.length > 0 ||
      this._errorDailyProjBillArray.length > 0 ||
      this._errorDailyNonBillArray.length > 0 ||
      this._errorHourlyNonBillArray.length > 0 ||
      this._errorHourlyProjBillArray.length > 0 ||
      this._errorHourlyTANDMArray.length > 0) {
      // this.msgSvc.add({
      //   key: 'alert',
      //   sticky: true,
      //   severity: 'error',
      //   summary: '',
      //   detail: 'Hours Exceeded.',
      // });
      let section = '';
      if (this._errorHourlyTANDMArray.length > 0) {
        section += 'Daily hours in any single cell must be between 0 and 24, inclusive.(Section: Time & Materials)<br/>';
      }
      if (this._errorHourlyProjBillArray.length > 0) {
        section += 'Daily hours in any single cell must be between 0 and 24, inclusive.(Section: Project Billable)<br/>';
      }
      if (this._errorHourlyNonBillArray.length > 0) {
        section += 'Daily hours in any single cell must be between 0 and 24, inclusive.(Section: Non-Billable)<br/>';
      }

      // tslint:disable-next-line:max-line-length
      this._errorMessage += section + 'You cannot enter more than 24 hours for a single day.<br/>';
      this._TotalValidationErrors++;
    }
  }

  // This method is used for validating the hour textboxes
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
      // this.msgSvc.add({
      //   key: 'alert',
      //   sticky: true,
      //   severity: 'error',
      //   summary: '',
      //   detail: 'The ' + ChargeType + ' is already used, please select another ' + ChargeType + '.',
      // });
      this._errorMessage += 'The ' + ChargeType + ' is already used, please select another ' + ChargeType + '.</br>';
      this._TotalValidationErrors++;
    } else {
      if (mode === 1) {
        if (drpError.length > 0) {
          this._TotalValidationErrors++;
          // this.confSvc.confirm({
          //   message: '' + ChargeType + ' not selected, entered billing hours will not save. Do you want to continue?',
          //   header: 'Confirmation',
          //   icon: 'pi pi-exclamation-triangle',
          //   accept: () => {
          //   },
          //   reject: () => {
          //     this._TotalValidationErrors--;
          //   }
          // });
          this._errorMessage += 'You cannot enter hours without selecting a billing code. (Section ' + ChargeType + ')<br/>';
        } else {
          if (drpSelOrUnsel.length > 0) {
            this._TotalValidationErrors++;
            // this.confSvc.confirm({
            //   message: '' + ChargeType + ' selected, but billing hours have not entered. Do you want to continue?',
            //   header: 'Confirmation',
            //   icon: 'pi pi-exclamation-triangle',
            //   accept: () => {
            //   },
            //   reject: () => {
            //     this._TotalValidationErrors--;
            //   }
            // });
            this._errorMessage += ' You cannot select a billing code without entering hours. (Section ' + ChargeType + ')<br/>';
          }
        }
      }
    }
  }

  // This method is used as onchange event for dropdowns to call validation methods
  drpChange(event: any) {
    this._TotalValidationErrors = 0;
    this.DataMissingValidations('drpTandM_', 'txtTANDMWeeklyTotals_',
      'drpTandMDefault', 'txtTANDMWeeklyTotalDefault', 'Time & Materials Billable', this._timeTandM, 0);
    this.DataMissingValidations('drpProjBill_', 'txtProjBillWeeklyTotals_',
      'drpProjBillDefault', 'txtProjBillWeeklyTotalDefault', 'Project Billable', this._timeProjBill, 0);
    this.DataMissingValidations('drpNONBill_', 'txtNonBillWeeklyTotals_',
      'drpNonBillDefault', 'txtNonBillWeeklyTotalDefault', 'Non Billable ', this._timeNONbill, 0);
  }

  // This method is used in save button click event to check all validations
  saveClickValidations() {
    this._TotalValidationErrors = 0;
    this.TotalHoursExceedValidation();
    this.DataMissingValidations('drpTandM_', 'txtTANDMWeeklyTotals_',
      'drpTandMDefault', 'txtTANDMWeeklyTotalDefault', 'Time & Materials Billable', this._timeTandM, 1);
    this.DataMissingValidations('drpProjBill_', 'txtProjBillWeeklyTotals_',
      'drpProjBillDefault', 'txtProjBillWeeklyTotalDefault', 'Project Billable', this._timeProjBill, 1);
    this.DataMissingValidations('drpNONBill_', 'txtNonBillWeeklyTotals_',
      'drpNonBillDefault', 'txtNonBillWeeklyTotalDefault', 'Non Billable ', this._timeNONbill, 1);
  }
  getHolidayErrors(rowId) {
    let countError = 0;
    this._errorHourlyNonBillHolidayArray = [];
    this._errorHourlyNonBillHolidayArrayRow = [];
    for (let i = 0; i < this._DateArray.length; i++) {
      const dtHolidaDateNew = new Date(this._DateArray[i]);
      const dtHolidaDateNewTransform = this.datePipe.transform(dtHolidaDateNew, 'yyyy-MM-dd');
      const dateHoliday = this._holidays.find(P => P.HolidayDate === dtHolidaDateNewTransform);
      if (this._timeNONbill.length > 0) {
        if (dateHoliday === undefined
          && this.timeSheetForm.get('txtNonBillHours_' + rowId + '_' + i).value !== '') {
          if (+this.timeSheetForm.get('txtNonBillHours_' + rowId + '_' + i).value > 0) {
            countError++;
            this._errorHourlyNonBillArray.push(i);
            if (+this.timeSheetForm.get('txtNonBillHours_' + rowId + '_' + i).value > 8) {
              this._errorHourlyNonBillHolidayArray.push(i);
              this._errorHourlyNonBillHolidayArrayRow.push(rowId);
            }
          }
        } else if (this.timeSheetForm.get('txtNonBillHours_' + rowId + '_' + i).value !== ''
          && + this.timeSheetForm.get('txtNonBillHours_' + rowId + '_' + i).value > 8) {
          this._errorHourlyNonBillHolidayArray.push(i);
          this._errorHourlyNonBillHolidayArrayRow.push(rowId);
        }
      } else {
        if (dateHoliday === undefined
          && this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value !== '') {
          if (+this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value > 0) {
            countError++;
            this._errorHourlyNonBillArray.push(i);
            if (+this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value > 8) {
              this._errorHourlyNonBillHolidayArray.push(i);
              this._errorHourlyNonBillHolidayArrayRow.push(rowId);
            }
          }
        } else if (this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value !== ''
          && +this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value > 8) {
          this._errorHourlyNonBillHolidayArray.push(i);
          this._errorHourlyNonBillHolidayArrayRow.push(rowId);
        }
      }
      // for (let j = 0; j < this._holidays.length; j++) {
      //   if (this._timeNONbill.length > 0) {
      //     if (this._DateArray[i] !== this._holidays[j].HolidayDate
      //       && this.timeSheetForm.get('txtNonBillHours_' + rowId + '_' + i).value !== '') {
      //       if (+this.timeSheetForm.get('txtNonBillHours_' + rowId + '_' + i).value > 0) {
      //         countError++;
      //         this._errorHourlyNonBillArray.push(i);
      //       }
      //     }
      //   } else {
      //     if (this._DateArray[i] !== this._holidays[j].HolidayDate
      //       && this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value !== '') {
      //       if (+this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value > 0) {
      //         countError++;
      //         this._errorHourlyNonBillArray.push(i);
      //       }
      //     }
      //   }
      // }
    }
    if (countError > 0) {
      // tslint:disable-next-line:max-line-length
      this._errorMessage += 'None of your billing codes or projects have holidays scheduled on the day(s) you charged holiday time.Please contact Finance. (Section: Non-Billable).<br>';
    }
    if (this._errorHourlyNonBillHolidayArray.length > 0) {
      this._errorMessage += 'You cannot enter more than 8 hours of holiday time per day. (Section: Non-Billable)<br/>';
    }
  }
  getHolidayNPTOErrors(HolidayNPtoRowIds: string) {
    let countError = 0;
    const rowIds = HolidayNPtoRowIds.split(',');
    for (let i = 0; i < this._DateArray.length; i++) {
      // tslint:disable-next-line:max-line-length
      if (this.timeSheetForm.get('txtNonBillHours_' + rowIds[0] + '_' + i).value !== ''
        && +this.timeSheetForm.get('txtNonBillHours_' + rowIds[0] + '_' + i).value > 0
        && this.timeSheetForm.get('txtNonBillHours_' + rowIds[1] + '_' + i).value !== ''
        && +this.timeSheetForm.get('txtNonBillHours_' + rowIds[1] + '_' + i).value > 0) {
        countError++;
      }
    }
    if (countError > 0) {
      // tslint:disable-next-line:max-line-length
      this._errorMessage += 'You cannot enter both PTO and holiday hours on the same day. (Section: Non-Billable)<br>';
    }
  }
  getWeekendHours() {
    let weekEndTandMCountWarning = 0;
    let weekDayTandMCountWarning = -1;
    let weekEndProjCountWarning = 0;
    let weekDayProjCountWarning = -1;
    let weekEndNonCountWarning = 0;
    let weekDayNonCountWarning = -1;
    let weekDayCountInArray = 0;
    for (let i = 0; i < this._DateArray.length; i++) {
      const dateWeekend = new Date(this._DateArray[i]);
      if (!(dateWeekend.getDay() === 6 || dateWeekend.getDay() === 0)) {
        weekDayCountInArray++;
      }
    }
    if (this._timeTandM !== null && this._timeTandM !== undefined && this._timeTandM.length > 0) {
      weekDayTandMCountWarning = 0;
      for (let j = 0; j < this._timeTandM.length; j++) {
        for (let i = 0; i < this._DateArray.length; i++) {
          const dateWeekend = new Date(this._DateArray[i]);
          if (dateWeekend.getDay() === 6 || dateWeekend.getDay() === 0) {
            if (this.timeSheetForm.get('txttimeTandMHours_' + j + '_' + i).value !== ''
              && +this.timeSheetForm.get('txttimeTandMHours_' + j + '_' + i).value > 0) {
              weekEndTandMCountWarning++;
            }
          } else {
            if (this.timeSheetForm.get('txttimeTandMHours_' + j + '_' + i).value !== ''
              && +this.timeSheetForm.get('txttimeTandMHours_' + j + '_' + i).value > 0) {
              weekDayTandMCountWarning++;
            }
          }
        }
      }
    } else {
      for (let i = 0; i < this._DateArray.length; i++) {
        const dateWeekend = new Date(this._DateArray[i]);
        if (dateWeekend.getDay() === 6 || dateWeekend.getDay() === 0) {
          if (this.timeSheetForm.get('txttimeTandMHoursDefault_' + i).value !== ''
            && +this.timeSheetForm.get('txttimeTandMHoursDefault_' + i).value > 0) {
            weekEndTandMCountWarning++;
          }
        } else {
          if (this.timeSheetForm.get('txttimeTandMHoursDefault_' + i).value !== ''
            && +this.timeSheetForm.get('txttimeTandMHoursDefault_' + i).value > 0) {
            if (weekDayTandMCountWarning < 0) {
              weekDayTandMCountWarning = 0;
            }
            weekDayTandMCountWarning++;
          }
        }
      }
    }
    if (this._timeProjBill !== null && this._timeProjBill !== undefined && this._timeProjBill.length > 0) {
      weekDayProjCountWarning = 0;
      for (let j = 0; j < this._timeProjBill.length; j++) {
        for (let i = 0; i < this._DateArray.length; i++) {
          const dateWeekend = new Date(this._DateArray[i]);
          if (dateWeekend.getDay() === 6 || dateWeekend.getDay() === 0) {
            if (this.timeSheetForm.get('txtProjBillHours_' + j + '_' + i).value !== ''
              && +this.timeSheetForm.get('txtProjBillHours_' + j + '_' + i).value > 0) {
              weekEndProjCountWarning++;
            }
          } else {
            if (this.timeSheetForm.get('txtProjBillHours_' + j + '_' + i).value !== ''
              && +this.timeSheetForm.get('txtProjBillHours_' + j + '_' + i).value > 0) {
              weekDayProjCountWarning++;
            }
          }
        }
      }
    } else {
      for (let i = 0; i < this._DateArray.length; i++) {
        const dateWeekend = new Date(this._DateArray[i]);
        if (dateWeekend.getDay() === 6 || dateWeekend.getDay() === 0) {
          if (this.timeSheetForm.get('txtProjBillHoursDefault_' + i).value !== ''
            && +this.timeSheetForm.get('txtProjBillHoursDefault_' + i).value > 0) {
            weekEndProjCountWarning++;
          }
        } else {
          if (this.timeSheetForm.get('txtProjBillHoursDefault_' + i).value !== ''
            && +this.timeSheetForm.get('txtProjBillHoursDefault_' + i).value > 0) {
            if (weekDayProjCountWarning < 0) {
              weekDayProjCountWarning = 0;
            }
            weekDayProjCountWarning++;
          }
        }
      }
    }
    if (this._timeNONbill !== null && this._timeNONbill !== undefined && this._timeNONbill.length > 0) {
      weekDayNonCountWarning = 0;
      for (let j = 0; j < this._timeNONbill.length; j++) {
        for (let i = 0; i < this._DateArray.length; i++) {
          const dateWeekend = new Date(this._DateArray[i]);
          if (dateWeekend.getDay() === 6 || dateWeekend.getDay() === 0) {
            if (this.timeSheetForm.get('txtNonBillHours_' + j + '_' + i).value !== ''
              && +this.timeSheetForm.get('txtNonBillHours_' + j + '_' + i).value > 0) {
              weekEndNonCountWarning++;
            }
          } else {
            if (this.timeSheetForm.get('txtNonBillHours_' + j + '_' + i).value !== ''
              && +this.timeSheetForm.get('txtNonBillHours_' + j + '_' + i).value > 0) {
              weekDayNonCountWarning++;
            }
          }
        }
      }
    } else {
      for (let i = 0; i < this._DateArray.length; i++) {
        const dateWeekend = new Date(this._DateArray[i]);
        if (dateWeekend.getDay() === 6 || dateWeekend.getDay() === 0) {
          if (this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value !== ''
            && +this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value > 0) {
            weekEndNonCountWarning++;
          }
        } else {
          if (this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value !== ''
            && this.timeSheetForm.get('txtNonBillHoursDefault_' + i).value > 0) {
            if (weekDayNonCountWarning < 0) {
              weekDayNonCountWarning = 0;
            }
            weekDayNonCountWarning++;
          }
        }
      }
    }
    let weekDayErrors = '';
    if (weekEndTandMCountWarning > 0) {
      this._warningMessage += 'You entered hours on the weekend. Is this correct? (Section: Time & Materials)<br/>';
    }
    if (weekDayTandMCountWarning === 0 || (weekDayTandMCountWarning > 0 && weekDayTandMCountWarning !== weekDayCountInArray)) {
      weekDayErrors = 'There are weekdays with no hours entered. Is this correct?<br/>';
    }
    if (weekEndProjCountWarning > 0) {
      this._warningMessage += 'You entered hours on the weekend. Is this correct? (Section: Project Billable)<br/>';
    }
    if (weekDayProjCountWarning === 0 || (weekDayProjCountWarning > 0 && weekDayProjCountWarning !== weekDayCountInArray)) {
      weekDayErrors = 'There are weekdays with no hours entered. Is this correct?<br/>';
    }
    if (weekEndNonCountWarning > 0) {
      this._warningMessage += 'You entered hours on the weekend. Is this correct? (Section: Non-Billable)<br/>';
    }
    if (weekDayNonCountWarning === 0 || (weekDayNonCountWarning > 0 && weekDayProjCountWarning !== weekDayCountInArray)) {
      weekDayErrors = 'There are weekdays with no hours entered. Is this correct?<br/>';
    }
    if (weekDayTandMCountWarning === -1 && weekDayProjCountWarning === -1 && weekDayNonCountWarning === -1
      && this.timeSheetForm.get('txtUserComments').value !== null && this.timeSheetForm.get('txtUserComments').value !== '') {
      weekDayErrors = 'There are weekdays with no hours entered. Is this correct?<br/>';
    }
    if (weekDayErrors !== '') {
      weekDayErrors += 'Are you sure you want to submit your timesheet? Please verify all your entries.';
      this._warningMessage += weekDayErrors;
    }
  }
  nonBillableValidations() {
    const yearEndCodes = new YearEndCodes();
    let checkBothPTONHolidayExists = '';
    if (this._timeNONbill.length > 0) {
      for (let i = 0; i < this._timeNONbill.length; i++) {
        const drpVal = this.timeSheetForm.get('drpNONBill_' + i).value;
        const drptext = this.nonBillable.find(P => P.value === drpVal);
        if (drptext.code === yearEndCodes.HolidayCode + this._peroidStartDate.getFullYear().toString()) {
          checkBothPTONHolidayExists += i + ',';
          this.getHolidayErrors(i);
        }
        if (drptext.code === yearEndCodes.PTOCode + this._peroidStartDate.getFullYear().toString()) {
          checkBothPTONHolidayExists += i + ',';
        }
      }
      // const rowIds = checkBothPTONHolidayExists.split(',');
      // if (rowIds.length > 2) {
      //   this.getHolidayNPTOErrors(checkBothPTONHolidayExists);
      // }
    } {
      const drpVal = this.timeSheetForm.get('drpNonBillDefault').value;
      const drptext = this.nonBillable.find(P => P.value === drpVal);
      if (drptext.code === yearEndCodes.HolidayCode + this._peroidStartDate.getFullYear().toString()) {
        // const cStartDate = this.datePipe.transform(this._peroidStartDate.toString(), 'yyyy-MM-dd');
        // const cEndDate = this.datePipe.transform(this._periodEnddate.toString(), 'yyyy-MM-dd');
        checkBothPTONHolidayExists += 0 + ',';
      }
      if (drptext.code === yearEndCodes.PTOCode + this._peroidStartDate.getFullYear().toString()) {
        checkBothPTONHolidayExists += 1 + ',';
      }
      const rowIds = checkBothPTONHolidayExists.split(',');
      if (rowIds.length > 2) {
        this.getHolidayNPTOErrors(checkBothPTONHolidayExists);
      }
    }
  }
  getVertexHolidaysList(timeSheetUserId, cEndDate, cStartDate) {
    this.timesysSvc.GetClientAndVertexHolidaysForTSPeriod(timeSheetUserId, cEndDate, cStartDate).subscribe(
      (data) => {
        this._holidays = data;
      });
  }
  emptyTimesheetValidation(): any {
    let emptyCount = 0;
    if (this._timeTandM.length > 0) {
      for (let i = 0; i < this._timeTandM.length; i++) {
        if (this.timeSheetForm.get('drpTandM_' + i).value !== '' && +this.timeSheetForm.get('drpTandM_' + i).value >= 0) {
          emptyCount++;
        }
      }
    } else {
      if (this.timeSheetForm.get('drpTandMDefault').value !== '' && +this.timeSheetForm.get('drpTandMDefault').value >= 0) {
        emptyCount++;
      }
    }
    if (this._timeProjBill.length > 0) {
      for (let i = 0; i < this._timeProjBill.length; i++) {
        if (this.timeSheetForm.get('drpProjBill_' + i).value !== '' && +this.timeSheetForm.get('drpProjBill_' + i).value >= 0) {
          emptyCount++;
        }
      }
    } else {
      if (this.timeSheetForm.get('drpProjBillDefault').value !== '' && +this.timeSheetForm.get('drpProjBillDefault').value >= 0) {
        emptyCount++;
      }
    }
    if (this._timeNONbill.length > 0) {
      for (let i = 0; i < this._timeNONbill.length; i++) {
        if (this.timeSheetForm.get('drpNONBill_' + i).value !== '' && +this.timeSheetForm.get('drpNONBill_' + i).value >= 0) {
          emptyCount++;
        }
      }
    } else {
      if (this.timeSheetForm.get('drpNonBillDefault').value !== '' && +this.timeSheetForm.get('drpNonBillDefault').value >= 0) {
        emptyCount++;
      }
    }
    if (emptyCount === 0) {
      return true;
    }
    return false;
  }
  Save() {
    this._errorMessage = '';
    this._errorBlock = '';
    this._warningBlock = '';
    this._warningMessage = '';
    this.showConfirmSubmit = false;
    let emptyTimesheet = false;
    // this.divError.nativeElement.innerHTML = '';
    this.saveClickValidations();
    if (this._employee[0].CompanyHolidays) {
      this.nonBillableValidations();
    }
    this.getWeekendHours();
    if (this._errorMessage !== '') {
      this._errorBlock = this._errorMessage;
    } else {
      if (this._TotalValidationErrors === 0) {
        emptyTimesheet = this.emptyTimesheetValidation();
        if (emptyTimesheet) {
          if (this.timeSheetForm.get('txtUserComments').value !== null && this.timeSheetForm.get('txtUserComments').value !== '') {
            this.SaveSPCall(false, '');
          } else {
            this._errorMessage = 'You cannot save an empty timesheet without specifying the reason in the comment section';
          }
        } else {
          this.SaveSPCall(false, '');
        }
      }
      if (this._errorMessage !== '') {
        this._errorBlock = this._errorMessage;
      }
    }
  }

  Submit() {
    // this.saveClickValidations();
    // if (this._TotalValidationErrors === 0) {
    //   this.SaveSPCall(true);
    // }
    this._errorMessage = '';
    this._warningMessage = '';
    this._errorBlock = '';
    this._warningBlock = '';
    this.showConfirmSubmit = false;
    let emptyTimesheet = false;
    // this.divError.nativeElement.innerHTML = '';
    this.saveClickValidations();
    if (this._employee[0].CompanyHolidays) {
      this.nonBillableValidations();
    }
    this.getWeekendHours();
    emptyTimesheet = this.emptyTimesheetValidation();
    if (emptyTimesheet && this._employee[0].IsTimesheetVerficationNeeded && this._supervisor !== undefined && this._supervisor.length > 0) {
      this._errorMessage = 'You cannot submit an empty timesheet to your supervisor';
    }
    if (this._errorMessage !== '') {
      this._errorBlock = this._errorMessage;
    } else if (this._warningMessage !== '') {
      this._warningBlock = this._warningMessage;
      this.showConfirmSubmit = true;
    } else {
      if (this._TotalValidationErrors === 0) {
        if (emptyTimesheet) {
          if (this.timeSheetForm.get('txtUserComments').value !== null && this.timeSheetForm.get('txtUserComments').value !== '') {
            this.SaveSPCall(true, '');
          } else {
            this._errorMessage = 'You cannot submit an empty timesheet without specifying the reason in the comment section';
          }
        } else {
          this.SaveSPCall(true, '');
        }
        if (this._errorMessage !== '') {
          this._errorBlock = this._errorMessage;
        }
      }
    }

  }
  ConfirmSubmit() {
    this._errorMessage = '';
    this._errorBlock = '';
    this._warningBlock = '';
    this._warningMessage = '';
    this.showConfirmSubmit = false;
    let emptyTimesheet = false;
    // this.divError.nativeElement.innerHTML = '';
    this.saveClickValidations();
    if (this._employee[0].CompanyHolidays) {
      this.nonBillableValidations();
    }
    // this.getWeekendHours();
    if (this._errorMessage !== '') {
      this._errorBlock = this._errorMessage;
    } else {
      if (this._TotalValidationErrors === 0) {
        emptyTimesheet = this.emptyTimesheetValidation();
        if (emptyTimesheet) {
          if (this._employee[0].IsTimesheetVerficationNeeded && this._supervisor !== undefined && this._supervisor.length > 0) {
            this._errorMessage = 'You cannot submit an empty timesheet to your supervisor';
          } else {
            if (this.timeSheetForm.get('txtUserComments').value !== null && this.timeSheetForm.get('txtUserComments').value !== '') {
              this.SaveSPCall(true, '');
            } else {
              this._errorMessage = 'You cannot submit an empty timesheet without specifying the reason in the comment section';
            }
          }
        } else {
          this.SaveSPCall(true, '');
        }
        if (this._errorMessage !== '') {
          this._errorBlock = this._errorMessage;
        }
      }
    }
  }
  SaveSPCall(submitted: boolean, type: string) {
    this.showSpinner = true;
    let timeSheetSubmit: TimeSheetSubmit;
    timeSheetSubmit = {};
    timeSheetSubmit.timeSheet = {};
    timeSheetSubmit.timeSheet.Id = this._timesheetId;
    timeSheetSubmit.timeSheet.PeriodEnd = this.datePipe.transform(this._periodEnddate.toString(), 'yyyy-MM-dd');
    if (this.timeSheetForm.get('txtUserComments') !== undefined &&
      this.timeSheetForm.get('txtUserComments') !== null && this.timeSheetForm.get('txtUserComments').value !== null &&
      this.timeSheetForm.get('txtUserComments').value.toString() !== ''
    ) {
      timeSheetSubmit.timeSheet.Comments = this.timeSheetForm.get('txtUserComments').value.toString();
    } else {
      timeSheetSubmit.timeSheet.Comments = '';
    }
    timeSheetSubmit.timeSheet.EmployeeId = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
    // tslint:disable-next-line:max-line-length
    if (this._employee !== undefined && this._employee[0].IsTimesheetVerficationNeeded && this._supervisor !== undefined && this._supervisor.length > 0) {
      timeSheetSubmit.timeSheet.Submitted = false;
      if (submitted) {
        timeSheetSubmit.timeSheet.ApprovalStatus = '1';
      }
    } else {
      timeSheetSubmit.timeSheet.Submitted = submitted;
    }
    if (+this._timesheetId.toString() < 0) {
      this.timesysSvc.timeSheetInsert(timeSheetSubmit.timeSheet).subscribe((dataNew) => {
        this._timesheetId = +dataNew;
        timeSheetSubmit.timeSheet.Id = this._timesheetId;
        this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
          , 'Page', 'SaveSPCall', 'Timesheet Created', '', '', this._timesheetId.toString()); // ActivityLog

        let timeLineAndTimeCellSaveArr: TimeLineAndTimeCell[];
        timeLineAndTimeCellSaveArr = [];
        if (type === '' || type === 'TandM') {
          for (let i = 0; i < this._timeTandM.length; i++) {
            this.buildValues(timeLineAndTimeCellSaveArr, 'drpTandM_' + i, 'txttimeTandMHours_' + i + '_', 'TANDM');
          }
          this.buildValues(timeLineAndTimeCellSaveArr, 'drpTandMDefault', 'txttimeTandMHoursDefault_', 'TANDM');
        }
        if (type === '' || type === 'ProjBill') {
          for (let i = 0; i < this._timeProjBill.length; i++) {
            this.buildValues(timeLineAndTimeCellSaveArr, 'drpProjBill_' + i, 'txtProjBillHours_' + i + '_', 'PROJBILL');
          }
          this.buildValues(timeLineAndTimeCellSaveArr, 'drpProjBillDefault', 'txtProjBillHoursDefault_', 'PROJBILL');
        }
        if (type === '' || type === 'NonBill') {
          for (let i = 0; i < this._timeNONbill.length; i++) {
            this.buildValues(timeLineAndTimeCellSaveArr, 'drpNONBill_' + i, 'txtNonBillHours_' + i + '_', 'NONBILL');
          }
        }
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpNonBillDefault', 'txtNonBillHoursDefault_', 'NONBILL');
        if (timeLineAndTimeCellSaveArr.length > 0) {
          timeSheetSubmit.timeLineAndTimeCellArr = timeLineAndTimeCellSaveArr;
          this.timesysSvc.TimeLineAndTimeCell_DeleteAndInsert(timeSheetSubmit)
            .subscribe(
              (outputData) => {
                if (outputData !== null && outputData.ErrorMessage !== '') {
                  // this.msgSvc.add({
                  //   key: 'alert',
                  //   sticky: true,
                  //   severity: 'error',
                  //   summary: 'Error!',
                  //   detail: outputData.ErrorMessage
                  // });
                  this._errorMessage += outputData.ErrorMessage + '<br/>';
                } else {

                  if (submitted) {
                    this._IsTimeSheetSubmittedJustNow = true;
                    // tslint:disable-next-line:max-line-length
                    if (this._employee !== undefined && this._employee[0].IsTimesheetVerficationNeeded && this._supervisor !== undefined && this._supervisor.length > 0) {
                      const timeSheetApp = new TimeSheetForApproval();
                      timeSheetApp.EmployeeId = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
                      timeSheetApp.SupervisorId = this._supervisor[0].ID;
                      timeSheetApp.TimesheetId = this._timesheetId;
                      timeSheetApp.PeriodEnd = this._periodEndDateDisplay;
                      this.timesysSvc.timeSheetPendingForApprovalInsert(timeSheetApp)
                        .subscribe(
                          (inputData) => {
                            // tslint:disable-next-line:max-line-length
                            this._submitMessage = 'Your timesheet has been submitted for approval to your supervisor: ' + this._supervisor[0].LastName + ', ' + this._supervisor[0].FirstName;
                          });
                      // tslint:disable-next-line:max-line-length
                    } else {
                      this._submitMessage = 'Your timesheet has been submitted';
                    }
                    this.msgSvc.add({
                      key: 'saveSuccess', severity: 'success'
                      , summary: 'Info Message', detail: 'Timesheet submitted successfully'
                    });
                    this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                      , 'Page', 'SaveSPCall', 'Timesheet values submitted', '', '', this._timesheetId.toString()); // ActivityLog
                  } else {
                    this.msgSvc.add({
                      key: 'saveSuccess', severity: 'success'
                      , summary: 'Info Message', detail: 'Timesheet saved successfully'
                    });
                    this.resetForm();
                    this.defaultControlsToForm();
                    this.getClientProjectCategoryDropDown(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId'));
                    this.getTimesheetTimeLineTimeCellDetails();
                    this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                      , 'Page', 'SaveSPCall', 'Timesheet values Saved', '', '', this._timesheetId.toString()); // ActivityLog
                  }

                  this.showSpinner = false;
                }
              },
              (error) => {
                console.log(error);
              });
          // if (this._actualTimeSheetId.toString() === '-1') {
          //   sessionStorage.removeItem('PeriodEndDate');
          //   this.router.navigate(['/menu/maintaintimesheet/' + this._timesheetId], { skipLocationChange: true });
          // }
        } else {
          this.showSpinner = false;
          if (submitted) {
            if (this._warningMessage === '') {
              this._IsTimeSheetSubmittedJustNow = true;
              // tslint:disable-next-line:max-line-length
              if (this._employee !== undefined && this._employee[0].IsTimesheetVerficationNeeded && this._supervisor !== undefined && this._supervisor.length > 0) {
                const timeSheetApp = new TimeSheetForApproval();
                timeSheetApp.EmployeeId = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
                timeSheetApp.SupervisorId = this._supervisor[0].ID;
                timeSheetApp.TimesheetId = this._timesheetId;
                timeSheetApp.PeriodEnd = this._periodEndDateDisplay;
                this.timesysSvc.timeSheetPendingForApprovalInsert(timeSheetApp)
                  .subscribe(
                    (inputData) => {
                      // tslint:disable-next-line:max-line-length
                      this._submitMessage = 'Your timesheet has been submitted for approval to your supervisor: ' + this._supervisor[0].LastName + ', ' + this._supervisor[0].FirstName;
                    });
                this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                  , 'Page', 'SaveSPCall', 'Timesheet values submitted and sent for approval',
                  '', '', this._timesheetId.toString()); // ActivityLog
              } else {
                this.timesysSvc.SendEmptyTimesheetToFinance(this._timesheetId.toString()).subscribe(
                  (outputData) => {
                    this._submitMessage = 'Your timesheet has been submitted';
                  });
                this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                  , 'Page', 'SaveSPCall', 'Timesheet with empty values submitted', '', '', this._timesheetId.toString()); // ActivityLog
              }
              this.msgSvc.add({
                key: 'saveSuccess', severity: 'success'
                , summary: 'Info Message', detail: 'Timesheet submitted successfully'
              });
              this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                , 'Page', 'SaveSPCall', 'Timesheet values submitted', '', '', this._timesheetId.toString()); // ActivityLog
            }
          } else {
            this.msgSvc.add({
              key: 'saveSuccess', severity: 'success'
              , summary: 'Info Message', detail: 'Timesheet saved successfully'
            });
            this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
              , 'Page', 'SaveSPCall', 'Timesheet values saved', '', '', this._timesheetId.toString()); // ActivityLog
          }
        }
      });
    } else {
      let timeLineAndTimeCellSaveArr: TimeLineAndTimeCell[];
      timeLineAndTimeCellSaveArr = [];
      if (type === '' || type === 'TandM') {
        for (let i = 0; i < this._timeTandM.length; i++) {
          this.buildValues(timeLineAndTimeCellSaveArr, 'drpTandM_' + i, 'txttimeTandMHours_' + i + '_', 'TANDM');
        }
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpTandMDefault', 'txttimeTandMHoursDefault_', 'TANDM');
      }
      if (type === '' || type === 'ProjBill') {
        for (let i = 0; i < this._timeProjBill.length; i++) {
          this.buildValues(timeLineAndTimeCellSaveArr, 'drpProjBill_' + i, 'txtProjBillHours_' + i + '_', 'PROJBILL');
        }
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpProjBillDefault', 'txtProjBillHoursDefault_', 'PROJBILL');
      }
      if (type === '' || type === 'NonBill') {
        for (let i = 0; i < this._timeNONbill.length; i++) {
          this.buildValues(timeLineAndTimeCellSaveArr, 'drpNONBill_' + i, 'txtNonBillHours_' + i + '_', 'NONBILL');
        }
        this.buildValues(timeLineAndTimeCellSaveArr, 'drpNonBillDefault', 'txtNonBillHoursDefault_', 'NONBILL');
      }
      if (timeLineAndTimeCellSaveArr.length > 0) {
        timeSheetSubmit.timeLineAndTimeCellArr = timeLineAndTimeCellSaveArr;
        this.timesysSvc.TimeLineAndTimeCell_DeleteAndInsert(timeSheetSubmit)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '') {
                // this.msgSvc.add({
                //   key: 'alert',
                //   sticky: true,
                //   severity: 'error',
                //   summary: 'Error!',
                //   detail: outputData.ErrorMessage
                // });
                this._errorMessage += outputData.ErrorMessage + '<br/>';
              } else {
                if (submitted) {
                  this._IsTimeSheetSubmittedJustNow = true;
                  // tslint:disable-next-line:max-line-length
                  if (this._employee !== undefined && this._employee[0].IsTimesheetVerficationNeeded && this._supervisor !== undefined && this._supervisor.length > 0) {
                    const timeSheetApp = new TimeSheetForApproval();
                    timeSheetApp.EmployeeId = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
                    timeSheetApp.SupervisorId = this._supervisor[0].ID;
                    timeSheetApp.TimesheetId = this._timesheetId;
                    timeSheetApp.PeriodEnd = this._periodEndDateDisplay;
                    this.timesysSvc.timeSheetPendingForApprovalInsert(timeSheetApp)
                      .subscribe(
                        (inputData) => {
                          // tslint:disable-next-line:max-line-length
                          this._submitMessage = 'Your timesheet has been submitted for approval to your supervisor: ' + this._supervisor[0].LastName + ', ' + this._supervisor[0].FirstName;
                        });
                    this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                      , 'Page', 'SaveSPCall', 'Timesheet values submitted and sent for approval',
                      '', '', this._timesheetId.toString()); // ActivityLog
                  } else {
                    this._submitMessage = 'Your timesheet has been submitted';
                  }
                  this.msgSvc.add({
                    key: 'saveSuccess', severity: 'success'
                    , summary: 'Info Message', detail: 'Timesheet submitted successfully'
                  });
                  this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                    , 'Page', 'SaveSPCall', 'Timesheet values submitted', '', '', this._timesheetId.toString()); // ActivityLog
                } else {
                  this.msgSvc.add({
                    key: 'saveSuccess', severity: 'success'
                    , summary: 'Info Message', detail: 'Timesheet saved successfully'
                  });
                  this.resetForm();
                  this.defaultControlsToForm();
                  this.getClientProjectCategoryDropDown(this._timesheetUserId);
                  this.getTimesheetTimeLineTimeCellDetails();
                  this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                    , 'Page', 'SaveSPCall', 'Timesheet values saved', '', '', this._timesheetId.toString()); // ActivityLog
                }

                this.showSpinner = false;
              }
            },
            (error) => {
              console.log(error);
            });
      } else {
        timeSheetSubmit.timeSheet.Id = this._timesheetId;
        this.timesysSvc.timesheetUpdate(timeSheetSubmit.timeSheet).subscribe((dataNew) => {
          this.showSpinner = false;
          if (submitted) {
            if (this._warningMessage === '') {
              this._IsTimeSheetSubmittedJustNow = true;
              // tslint:disable-next-line:max-line-length
              if (this._employee !== undefined && this._employee[0].IsTimesheetVerficationNeeded && this._supervisor !== undefined && this._supervisor.length > 0) {
                const timeSheetApp = new TimeSheetForApproval();
                timeSheetApp.EmployeeId = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
                timeSheetApp.SupervisorId = this._supervisor[0].ID;
                timeSheetApp.TimesheetId = this._timesheetId;
                timeSheetApp.PeriodEnd = this._periodEndDateDisplay;
                this.timesysSvc.timeSheetPendingForApprovalInsert(timeSheetApp)
                  .subscribe(
                    (inputData) => {
                      // tslint:disable-next-line:max-line-length
                      this._submitMessage = 'Your timesheet has been submitted for approval to your supervisor: ' + this._supervisor[0].LastName + ', ' + this._supervisor[0].FirstName;
                    });
                this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                  , 'Page', 'SaveSPCall', 'Timesheet values submitted and sent for approval',
                  '', '', this._timesheetId.toString()); // ActivityLog
              } else {
                this._submitMessage = 'Your timesheet has been submitted';
              }
              this.msgSvc.add({
                key: 'saveSuccess', severity: 'success'
                , summary: 'Info Message', detail: 'Timesheet submitted successfully'
              });
              this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                , 'Page', 'SaveSPCall', 'Timesheet values submitted', '', '', this._timesheetId.toString()); // ActivityLog
            }
          } else {
            this.msgSvc.add({
              key: 'saveSuccess', severity: 'success'
              , summary: 'Info Message', detail: 'Timesheet saved successfully'
            });
            this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
              , 'Page', 'SaveSPCall', 'Timesheet values saved', '', '', this._timesheetId.toString()); // ActivityLog
          }
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
    if (this._timesheetUserId !== undefined &&
      this._timesheetUserId.toString() !== sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId')) {
      // this.timesysSvc.getTimeSheetForApprovalCheck(this._timesheetUserId.toString())
      //   .subscribe(
      //     (data) => {
      for (let i = 0; i < this._timeSheetForApprovalsOnLoad.length; i++) {
        if (this._timesheetId.toString() === this._timeSheetForApprovalsOnLoad[i].TimesheetId.toString()) {
          if (this._pageState !== '' && this._pageState === 'A'
            && this._timeSheetUsersSupervisor !== undefined && this._timeSheetUsersSupervisor !== null
            && this._timeSheetUsersSupervisor.length > 0
            && this._timeSheetUsersSupervisor[0].SupervisorId.toString() ===
            sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId')
          ) {
            this._isTimesheetToAprrove = true;
            this._showComments = true;
          }
          break;
        }
      }
      if (!this._isTimesheetToAprrove) {
        this._isTimesheetView = true;
        this._showComments = true;
      }
      this.getClientProjectCategoryDropDown(this._timesheetUserId.toString());
      // if (this._isTimesheetToAprrove) {
      //   this.getClientProjectCategoryDropDown(this._employee[0].ID.toString());
      // } else {
      //   this.getClientProjectCategoryDropDown(sessionStorage.getItem(environment.buildType.toString() + '_' +'UserId'));
      // }
      // });
    } else {
      this._showComments = true;
      this.getClientProjectCategoryDropDown(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId'));
    }
  }
  Approve() {
    this.showSpinner = true;
    const timeSheetApp = new TimeSheetForApproval();
    timeSheetApp.Id = this._ApprovalId;
    timeSheetApp.Status = 'A';
    timeSheetApp.Comments = this.timeSheetForm.get('txtSuperComments').value;
    this.timesysSvc.timeSheetPendingForApprovalUpdate(timeSheetApp)
      .subscribe(
        (inputData) => {
          // tslint:disable-next-line:max-line-length
          // this.router.navigate(['/menu/dashboard/'], { skipLocationChange: true });
          const timesheet = new TimeSheet();
          timesheet.TimesheetID = this._timesheetId.toString();
          timesheet.Status = '2';
          this.timesysSvc.timeSheetApprovalStatusUpdate(timesheet)
            .subscribe(
              (inputTime) => {
                this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                  , 'Page', 'Approve', 'Timesheet approved', ''
                  , this._timesheetId.toString(), this._ApprovalId.toString()); // ActivityLog
                this.showSpinner = false;
                // tslint:disable-next-line:max-line-length
                this.router.navigate(['/menu/dashboard/'], { queryParams: { Id: -1 }, skipLocationChange: true });
              });
        });
  }
  Reject() {
    this.showSpinner = true;
    const timeSheetApp = new TimeSheetForApproval();
    timeSheetApp.Id = this._ApprovalId;
    timeSheetApp.Status = 'R';
    timeSheetApp.Comments = this.timeSheetForm.get('txtSuperComments').value;
    this.timesysSvc.timeSheetPendingForApprovalUpdate(timeSheetApp)
      .subscribe(
        (inputData) => {
          // tslint:disable-next-line:max-line-length
          // this.router.navigate(['/menu/dashboard/'], { skipLocationChange: true });
          const timesheet = new TimeSheet();
          timesheet.TimesheetID = this._timesheetId.toString();
          timesheet.Status = '3';
          this.timesysSvc.timeSheetApprovalStatusUpdate(timesheet)
            .subscribe(
              (inputTime) => {
                this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
                  , 'Page', 'Reject', 'Timesheet rejected', ''
                  , this._timesheetId.toString(), this._ApprovalId.toString()); // ActivityLog
                this.showSpinner = false;
                // tslint:disable-next-line:max-line-length
                this.router.navigate(['/menu/dashboard/'], { queryParams: { Id: -1 }, skipLocationChange: true });
              });
        });

  }
  getWantedDetailsOnLoad() {

  }
  saveByType(rowData: any, type: string) {
    this._errorMessage = '';
    this._errorBlock = '';
    this._warningBlock = '';
    this._warningMessage = '';
    this.TotalHoursExceedValidation();
    if (type === 'TandM') {
      this.DataMissingValidations('drpTandM_', 'txtTANDMWeeklyTotals_',
        'drpTandMDefault', 'txtTANDMWeeklyTotalDefault', 'Time & Materials Billable', this._timeTandM, 1);
    } else if (type === 'ProjBill') {
      this.DataMissingValidations('drpProjBill_', 'txtProjBillWeeklyTotals_',
        'drpProjBillDefault', 'txtProjBillWeeklyTotalDefault', 'Project Billable', this._timeProjBill, 1);
    } else if (type === 'NonBill') {
      this.DataMissingValidations('drpNONBill_', 'txtNonBillWeeklyTotals_',
        'drpNonBillDefault', 'txtNonBillWeeklyTotalDefault', 'Non Billable ', this._timeNONbill, 1);

      if (this._employee[0].CompanyHolidays) {
        this.nonBillableValidations();
      }
      this.getWeekendHours();
    }
    if (this._errorMessage !== '') {
      this._errorBlock = this._errorMessage;
    } else {
      this.SaveSPCall(false, type);
    }
  }
  deleteByType(rowData: TimeLine) {
    this._errorMessage = '';
    this._errorBlock = '';
    this.confSvc.confirm({
      message: 'Are you sure want to delete this row?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.timesysSvc.onlyTimeLineAndCellDelete(rowData)
          .subscribe((data) => {
            if (+this._timesheetId.toString() < 0) {
              this.resetForm();
              this.defaultControlsToForm();
              this.getClientProjectCategoryDropDown(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId'));
              this.getTimesheetTimeLineTimeCellDetails();
            } else {
              this.resetForm();
              this.defaultControlsToForm();
              this.getClientProjectCategoryDropDown(this._timesheetUserId);
              this.getTimesheetTimeLineTimeCellDetails();
            }
            this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
              , 'Page', 'deleteByType', 'Timesheet Timeline and Timecell deleted', ''
              , this._timesheetId.toString(), rowData.Id.toString()); // ActivityLog
          });
      },
      reject: () => {
      }
    });

  }

  exportClick() {
    this.logSvc.ActionLog(PageNames.Timesheets, 'MaintainTimesheet'
      , 'Page', 'exportClick', 'Timesheet Exported', ''
      , this._timesheetId.toString(), ''); // ActivityLog
    const sheetName = 'EmployeeTimesheet';
    let exHeader = '';
    exHeader += '"Employee Timesheet"' + '\n';
    this.ExportCSV(sheetName, exHeader, this.dtTimesheet.nativeElement);
  }

  ExportCSV(sheetName, exHeader, dataElement) {
    const dtNow = new Date();
    const dtFileName = sheetName + '_' + this.datePipe.transform(dtNow, 'yyyy_MM_dd_hh_mm_ss');
    const exFooter = '';
    // exFooter += '"Report Generated By:' +
    //   sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser').toString() + '",' + '\n';
    // exFooter += '"Report Generated On:' + this.datePipe.transform(dtNow, 'yyyy-MM-dd hh:mm:ss') + '",' + '\n';
    const tblExport = new TableExport(dataElement, {
      headers: true,
      formats: ['csv'],
      filename: dtFileName,
      bootstrap: false,
      exportButtons: false,
      position: 'bottom',
      ignoreRows: null,
      ignoreCols: null,
      trimWhitespace: true,
      RTL: false,
      sheetname: 'EmployeeTimesheet',
    });
    const key = this.dtTimesheet.nativeElement.attributes['tableexport-key'] ?
      this.dtTimesheet.nativeElement.attributes['tableexport-key'].value : 'tableexport-1';
    if (tblExport.getExportData()[key] !== undefined && tblExport.getExportData()[key] !== null) {
      const objCSV = tblExport.getExportData()[key].csv;
      tblExport.export2file(
        '\n' +
        exHeader +
        '\n' + '\n' +
        objCSV.data +
        '\n' + '\n' +
        exFooter,
        objCSV.mimeType,
        objCSV.filename,
        objCSV.fileExtension);
    }
    tblExport.remove();
  }

}
