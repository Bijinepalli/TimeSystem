import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { TimeSheetForEmplyoee, TimeSheetBinding, TimeSheet, TimeSheetForApproval, TimePeriods, HoursByTimesheet } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.css'],
  providers: [DatePipe],
})
export class TimesheetsComponent implements OnInit {

  cols: any[];
  hourscols: any[];
  _recData: string;
  _hoursData: string;

  _timeSheets: TimeSheetForEmplyoee[];
  _timePeriods: TimeSheetBinding[];

  selectedValues: Boolean;
  emptyTimeSheet: Boolean;

  timesheetDialog = false;

  selectTimePeriod: TimeSheetBinding = null;
  // selectTimePeriodDate: string;
  _timesheetsTimePeriod: TimeSheet[] = [];
  _timesheetApproval: TimeSheetForApproval[] = [];

  _startDate: string;
  _endDate: string;
  Hourschrg = false;
  _mainHeader: string;
  HoursTable = false;
  _hoursbytimesheetlist: HoursByTimesheet[] = [];

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {
    this.cols = [
      { field: 'PeriodEnd', header: 'PeriodEnd', align: 'center', width: 'auto' },
      { field: 'Submitted', header: 'Submitted', align: 'center', width: 'auto' },
      { field: 'SubmitDate', header: 'Date Submitted', align: 'center', width: 'auto' },
      { field: 'Resubmitted', header: 'Resubmitted', align: 'center', width: 'auto' },
      { field: 'SemiMonthly', header: 'Semi-Monthly', align: 'center', width: 'auto' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '75px' },
      { field: 'ApprovalStatus', header: 'Approval Status', align: 'left', width: 'auto' },
    ];
    this.getTimeSheets();
  }
  getTimeSheets() {
    this._mainHeader = 'Your Time Sheets';
    const Mode = this.selectedValues ? '1' : '0';
    this.timesysSvc.getEmployeeTimeSheetList((localStorage.getItem('UserId')), Mode)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._timeSheets = data;
            this._recData = this._timeSheets.length + ' records found';
          } else {
            this._timeSheets = [];
            this._recData = 'No records found';
          }
        }
      );
  }

  getTimeSheetPeriods() {
    this._timePeriods = [];
    this.selectTimePeriod = null;
    // this.selectTimePeriodDate = '';
    this.timesysSvc.getTimeSheetAfterDateDetails(localStorage.getItem('UserId'), localStorage.getItem('HireDate')).subscribe(
      (data) => {
        this.timesysSvc.getDatebyPeriod().subscribe(
          (data1) => {
            if (data !== undefined && data !== null && data.length > 0) {
              this._timePeriods = data;
              if (data1 !== undefined && data1 !== null && data1.length > 0) {
                const selectedDateVal = data.find(m => this.datePipe.transform(m.code, 'MM-dd-yyyy') === data1[0].PeriodEndDate);
                if (selectedDateVal !== undefined && selectedDateVal !== null) {
                  this.selectTimePeriod = selectedDateVal;
                } else {
                  this.selectTimePeriod = data[0];
                }
              } else {
                this.selectTimePeriod = data[0];
              }
            }
            this.timesheetDialog = true;
          });
      }
    );
  }

  ShowAllTimesheets() {
    this.getTimeSheets();
  }

  OpenHoursCharged() {
    this._mainHeader = 'Hours by Timesheet Category';
    this.Hourschrg = true;
    const datetoday = new Date();
    datetoday.setMonth(datetoday.getMonth() - 1);
    datetoday.setDate(1);
    this._startDate = this.datePipe.transform(datetoday, 'MM-dd-yyyy');
    this._endDate = '';
  }
  viewTimeSheet(rowData: TimeSheetForEmplyoee) {
    this.navigateToTimesheet(rowData.Id, '');
  }
  editTimeSheet(rowData: TimeSheetForEmplyoee) {
    // this.confSvc.confirm({
    //   message: 'Do you want to edit the timesheet?',
    //   accept: () => {
    this.navigateToTimesheet(rowData.Id, '');
    //   }
    // });
  }
  deleteTimeSheet(rowData: TimeSheetForEmplyoee) {
    this.confSvc.confirm({
      message: 'Do you want to delete the timesheet?',
      accept: () => {
        const timeSheet = new TimeSheet();
        timeSheet.Id = rowData.Id;
        this.timesysSvc.timesheetDelete(timeSheet)
          .subscribe(
            (data) => {
              this.getTimeSheets();
            });
      }
    });
  }

  addTimesheet() {
    // this.router.navigate(['/menu/selecttimesheetperiod'], { skipLocationChange: true });
    this.getTimeSheetPeriods();
  }

  cancelTimesheetDialog() {
    this.timesheetDialog = false;
    this._timePeriods = [];
    this.selectTimePeriod = null;
    // this.selectTimePeriodDate = '';
  }

  createTimesheetDialog() {
    if (this.selectTimePeriod !== undefined && this.selectTimePeriod !== null) {
      if (+this.selectTimePeriod.value > 0) {
        this.timesysSvc.getTimeSheetDetails(this.selectTimePeriod.value.toString()).subscribe(
          (data) => {
            this._timesheetsTimePeriod = [];
            this._timesheetApproval = [];
            if (data !== undefined && data !== null && data.length > 0) {
              this._timesheetsTimePeriod = data;
              this.timesysSvc.getTimeSheetForApprovalCheck(localStorage.getItem('UserId')).subscribe(
                (data1) => {
                  if (data1 !== undefined && data1 !== null && data1.length > 0) {
                    this._timesheetApproval = data1.filter(P =>
                      P.PeriodEnd === this._timesheetsTimePeriod[0].PeriodEnd
                      && P.Status === 'P');
                    if (this._timesheetApproval !== undefined && this._timesheetApproval !== null && this._timesheetApproval.length > 0) {
                      this.msgSvc.add({
                        key: 'alert',
                        sticky: true,
                        severity: 'error',
                        summary: '',
                        detail: 'A timesheet already has been submitted for this period and waiting for approval.',
                      });
                    } else {
                      this.confSvc.confirm({
                        message: 'A timesheet already has been submitted for this period.' +
                          'This will be a resubmittal. Do you want to continue?',
                        accept: () => {
                          this.resubmittal();
                        }
                      });
                    }
                  }
                }
              );
            }
          }
        );

      } else {
        this.navigateToTimesheet(this.selectTimePeriod.value, this.selectTimePeriod.code);
      }
    }
  }
  resubmittal() {
    if (this._timesheetsTimePeriod !== undefined && this._timesheetsTimePeriod !== null && this._timesheetsTimePeriod.length > 0) {
      this.timesysSvc.getUnSubmittedTimeSheetDetails(localStorage.getItem('UserId'), this._timesheetsTimePeriod[0].PeriodEnd).subscribe(
        (data1) => {
          if (data1 !== undefined && data1 !== null && data1.length > 0) {
            this.navigateToTimesheet(data1[0].Id, '');
          } else {
            let _selectedTimesheet: TimeSheet = {};
            _selectedTimesheet = new TimeSheet();
            _selectedTimesheet.Id = this.selectTimePeriod.value;
            _selectedTimesheet.TimeStamp = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
            this.timesysSvc.timesheetCopyInsert(_selectedTimesheet).subscribe(
              (data2) => {
                if (data2 !== undefined && data2 !== null) {
                  this.navigateToTimesheet(data2, '');
                }
              });
          }
        });
    }
  }
  navigateToTimesheet(TimesheetId, TimesheetDate) {
    this.timesheetDialog = false;
    let routerLinkTimesheet = '/menu/maintaintimesheet/' + TimesheetId;
    if (TimesheetDate !== '') {
      routerLinkTimesheet += '/' + TimesheetDate;
    }
    this.router.navigate([routerLinkTimesheet], { skipLocationChange: true });
  }

  showHours() {
    this.HoursTable = true;
    this.hourscols = [
      { field: 'BillingName', header: 'Billing Code', align: 'left', width: 'auto' },
      { field: 'TANDM', header: 'T & M', align: 'center', width: '75px' },
      { field: 'Project', header: 'Project', align: 'center', width: '75px' },
      { field: 'NonBillable', header: 'NonBillable', align: 'center', width: '100px' },
    ];
    this._hoursData = '0';
    this.timesysSvc.getHoursbyTimesheetforEmployee(
      this._startDate,
      this._endDate,
      localStorage.getItem('UserId').toString()).subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._hoursbytimesheetlist = data;
            this._hoursData = data.length.toString();
          }
        });
  }
  returntoTimesheets() {
    this.HoursTable = false;
    this.Hourschrg = false;
    this._startDate = '';
    this._endDate = '';
  }
}
