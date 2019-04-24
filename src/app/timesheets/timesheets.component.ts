import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, ViewChild } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
// tslint:disable-next-line:max-line-length
import { TimeSheetForEmplyoee, TimeSheetBinding, TimeSheet, TimeSheetForApproval, TimePeriods, HoursByTimesheet, Employee } from '../model/objects';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CommonService } from '../service/common.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.css'],
  providers: [DatePipe],
})
export class TimesheetsComponent implements OnInit {

  cols: any[];
  hourscols: any[];
  _recData = 0;
  _hoursData = 0;
  _employeeId = 0;
  _employee: Employee[];
  _timeSheets: TimeSheetForEmplyoee[];
  _timePeriods: TimeSheetBinding[];

  selectedValues: Boolean;
  emptyTimeSheet: Boolean;

  timesheetDialog = false;

  selectTimePeriod: TimeSheetBinding = null;
  // selectTimePeriodDate: string;
  _timesheetsTimePeriod: TimeSheet[] = [];
  _timesheetApproval: TimeSheetForApproval[] = [];

  _startDate: Date;
  _endDate: Date;

  Hourschrg = false;
  _mainHeader: string;
  HoursTable = false;
  _hoursbytimesheetlist: HoursByTimesheet[] = [];

  _DisplayDateFormat = '';
  showSpinner = false;
  ParamSubscribe: any;
  IsSecure: boolean;
  _HasEdit: boolean;
  _DateFormat: any;
  _TimeStampFormat: any;
  _DisplayTimeStampFormat: any;
  showReport = false;
  _sortArray: string[];
  _showEmptyTimesheet = true;
  @ViewChild('dt') dt: Table;
  @ViewChild('dtHours') dtHours: Table;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    public commonSvc: CommonService,
    public datepipe: DatePipe
  ) {
    this.CheckActiveSession();
    this.commonSvc.setAppSettings();
  }
  CheckActiveSession() {
    let sessionActive = false;
    if (sessionStorage !== undefined && sessionStorage !== null && sessionStorage.length > 0) {
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null) {
        this._employeeId = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
        this.getEmployeeDetails(this._employeeId.toString());
        sessionActive = true;
      }
    }

    if (!sessionActive) {
      this.router.navigate(['/access'], { queryParams: { Message: 'Session Expired' } }); // Session Expired
    }
  }
  getEmployeeDetails(EmployeeId: string) {
    this.timesysSvc.getEmployee(EmployeeId, '', '').subscribe(
      (dataEmp) => {
        if (dataEmp !== undefined && dataEmp !== null && dataEmp.length > 0) {
          this._employee = dataEmp;
          console.log(this._employee);
          // tslint:disable-next-line:max-line-length
          if (this._employee.length > 0 && this._employee[0].IsTimesheetVerficationNeeded && this._employee[0].Supervisor !== '' && this._employee[0].SupervisorId > 0) {
            this._showEmptyTimesheet = false;
          }
          // if (this._employee[0].SupervisorId !== undefined && this._employee[0].SupervisorId > 0) {
          //   this.timesysSvc.getEmployee(this._employee[0].SupervisorId.toString(), '', '').subscribe((superEmp: Employee) => {
          //     this._supervisor = superEmp;
          //   });
          // }
        }
      });
  }
  /* #endregion*/

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.showSpinner = true;
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      this.IsSecure = false;
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
  }
  /* #endregion */

  /* #region Basic Methods */

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.ClearAllProperties();
    this.IsSecure = true;
    this.showSpinner = false;
    this.Initialisations();
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this.cols = [];
    this._timeSheets = [];
    this._recData = 0;

    this._timePeriods = [];
    this.selectTimePeriod = null;
    this.showReport = false;
    this.HoursTable = false;
    this.Hourschrg = false;
    this._hoursbytimesheetlist = [];
    this._hoursData = 0;
    this._startDate = null;
    this._endDate = null;
    this.resetSort();
    this.showSpinner = false;
  }


  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat');
    this._TimeStampFormat = this.commonSvc.getAppSettingsValue('TimeStampFormat');
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this._DisplayTimeStampFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat');

    this.cols = [
      { field: 'PeriodEnd', header: 'Period End', align: 'center', width: 'auto' },
      { field: 'Submitted', header: 'Submitted', align: 'center', width: '150px' },
      { field: 'SubmitDate', header: 'Date Submitted', align: 'center', width: 'auto' },
      { field: 'Resubmitted', header: 'Resubmitted', align: 'center', width: '150px' },
      { field: 'SemiMonthly', header: 'Semi-Monthly', align: 'center', width: '150px' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '150px' },
      { field: 'ApprovalStatus', header: 'Approval Status', align: 'left', width: 'auto' },
    ];
    this._sortArray = ['PeriodEndSearch', 'Submitted', 'SubmitDateSearch', 'Resubmitted', 'SemiMonthly', 'Hours', 'ApprovalStatus'];
    this.showSpinner = false;
    this.getTimeSheets();
  }
  getTimeSheets() {
    this.showSpinner = true;
    this._mainHeader = 'Your Time Sheets';
    this.showReport = false;
    this.resetSort();
    const Mode = this.selectedValues ? '1' : '0';
    this.timesysSvc.getEmployeeTimeSheetList((sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId')), Mode)
      .subscribe(
        (data) => {
          this._timeSheets = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._timeSheets = data;
            this._recData = data.length;
          }
          this.showReport = true;
          this.showSpinner = false;
        }
      );
  }

  getTimeSheetPeriods() {
    this.showSpinner = true;
    this._timePeriods = [];
    this.selectTimePeriod = null;
    // this.selectTimePeriodDate = '';
    this.timesysSvc.getTimeSheetAfterDateDetails(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId'),
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'HireDate')).subscribe(
        (data) => {
          this.timesysSvc.getDatebyPeriod().subscribe(
            (data1) => {
              this._timePeriods = [];
              this.selectTimePeriod = null;
              if (data !== undefined && data !== null && data.length > 0) {
                this._timePeriods = data;
                if (data1 !== undefined && data1 !== null && data1.length > 0) {
                  const selectedDateVal = data.find(m =>
                    this.datepipe.transform(m.code, this._DisplayDateFormat) === data1[0].PeriodEndDate);
                  if (selectedDateVal !== undefined && selectedDateVal !== null) {
                    this.selectTimePeriod = selectedDateVal;
                  } else {
                    this.selectTimePeriod = data[0];
                  }
                } else {
                  this.selectTimePeriod = data[0];
                }
              }
              this.showSpinner = false;
              this.timesheetDialog = true;
            });
        }
      );
  }

  ShowAllTimesheets() {
    this.getTimeSheets();
  }

  OpenHoursCharged() {
    this.showSpinner = true;
    this._mainHeader = 'Hours by Timesheet Category';
    this.Hourschrg = true;
    const datetoday = new Date();
    datetoday.setMonth(datetoday.getMonth() - 1);
    datetoday.setDate(1);
    this._startDate = datetoday;
    this._endDate = null;
    this.showSpinner = false;
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
    this.showSpinner = true;
    this._timesheetsTimePeriod = [];
    this._timesheetApproval = [];
    if (this.selectTimePeriod !== undefined && this.selectTimePeriod !== null) {
      if (+this.selectTimePeriod.value > 0) {
        this.timesysSvc.getTimeSheetDetails(this.selectTimePeriod.value.toString()).subscribe(
          (data) => {
            this._timesheetsTimePeriod = [];
            this._timesheetApproval = [];
            if (data !== undefined && data !== null && data.length > 0) {
              this._timesheetsTimePeriod = data;
              this.timesysSvc.getTimeSheetForApprovalCheck(
                sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId')).subscribe(
                  (data1) => {
                    if (data1 !== undefined && data1 !== null && data1.length > 0) {
                      this._timesheetApproval = data1.filter(P =>
                        P.PeriodEnd === this._timesheetsTimePeriod[0].PeriodEnd
                        && P.Status === 'P' && this._employee.length > 0 && this._employee[0].SupervisorId > 0);
                      // tslint:disable-next-line:max-line-length
                      if (this._timesheetApproval !== undefined && this._timesheetApproval !== null && this._timesheetApproval.length > 0) {
                        this.msgSvc.add({
                          key: 'alert',
                          sticky: true,
                          severity: 'error',
                          summary: 'Error!',
                          detail: 'A timesheet already has been submitted for this period and waiting for approval.',
                        });
                        this.showSpinner = false;
                      } else {
                        this.showSpinner = false;
                        this.confSvc.confirm({
                          message: 'A timesheet already has been submitted for this period.' +
                            'This will be a resubmittal. Do you want to continue?',
                          accept: () => {
                            this.resubmittal();
                          }
                        });
                      }
                    } else {
                      this.showSpinner = false;
                      this.showSpinner = false;
                      this.confSvc.confirm({
                        message: 'A timesheet already has been submitted for this period.' +
                          'This will be a resubmittal. Do you want to continue?',
                        accept: () => {
                          this.resubmittal();
                        }
                      });
                    }
                  }
                );
            } else {
              this.showSpinner = false;
            }
          }
        );

      } else {
        this.showSpinner = false;
        this.navigateToTimesheet(this.selectTimePeriod.value, this.selectTimePeriod.code);
      }
    } else {
      this.showSpinner = false;
    }
  }
  resubmittal() {
    this.showSpinner = true;
    if (this._timesheetsTimePeriod !== undefined && this._timesheetsTimePeriod !== null && this._timesheetsTimePeriod.length > 0) {
      this.timesysSvc.getUnSubmittedTimeSheetDetails(
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId'),
        this._timesheetsTimePeriod[0].PeriodEnd).subscribe(
          (data1) => {
            if (data1 !== undefined && data1 !== null && data1.length > 0) {
              this.showSpinner = false;
              this.navigateToTimesheet(data1[0].Id, '');
            } else {
              let _selectedTimesheet: TimeSheet = {};
              _selectedTimesheet = new TimeSheet();
              _selectedTimesheet.Id = this.selectTimePeriod.value;
              _selectedTimesheet.TimeStamp = this.datepipe.transform(new Date(), this._TimeStampFormat);
              if (!this.emptyTimeSheet) {
                this.timesysSvc.timesheetCopyInsert(_selectedTimesheet).subscribe(
                  (data2) => {
                    this.showSpinner = false;
                    if (data2 !== undefined && data2 !== null) {
                      this.navigateToTimesheet(data2, '');
                    }
                  });
              } else {
                this.navigateToTimesheet(_selectedTimesheet.Id, '');
              }
            }
          });
    } else {
      this.showSpinner = false;
    }
  }
  navigateToTimesheet(TimesheetId, TimesheetDate) {
    this.timesheetDialog = false;
    let routerLinkTimesheet = '';
    if (this.emptyTimeSheet) {
      routerLinkTimesheet = '/menu/maintaintimesheethourly/' + TimesheetId;
    } else {
      routerLinkTimesheet = '/menu/maintaintimesheet/' + TimesheetId;
    }
    if (TimesheetDate !== '') {
      routerLinkTimesheet += '/' + TimesheetDate;
    }
    this.router.navigate([routerLinkTimesheet], { skipLocationChange: true });
  }

  showHours() {
    this.showSpinner = true;
    this.HoursTable = false;
    this.resetSort();
    this.hourscols = [
      { field: 'BillingName', header: 'Billing Code', align: 'left', width: 'auto' },
      { field: 'TANDM', header: 'T & M', align: 'center', width: '75px' },
      { field: 'Project', header: 'Project', align: 'center', width: '75px' },
      { field: 'NonBillable', header: 'NonBillable', align: 'center', width: '100px' },
    ];
    this._hoursbytimesheetlist = [];
    this._hoursData = 0;
    let _start = '';
    let _end = '';

    if (this._startDate !== undefined && this._startDate !== null && this._startDate.toString() !== '') {
      _start = this.datepipe.transform(this._startDate, this._DateFormat);
    }

    if (this._endDate !== undefined && this._endDate !== null && this._endDate.toString() !== '') {
      _end = this.datepipe.transform(this._endDate, this._DateFormat);
    }

    this.timesysSvc.getHoursbyTimesheetforEmployee(
      _start,
      _end,
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString()).subscribe(
        (data) => {
          this._hoursbytimesheetlist = [];
          this._hoursData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._hoursbytimesheetlist = data;
            this._hoursData = data.length;
          }
          this.HoursTable = true;
          this.showSpinner = false;
        });
  }

  returntoTimesheets() {
    this.showSpinner = true;
    this.HoursTable = false;
    this.Hourschrg = false;
    this._hoursbytimesheetlist = [];
    this._hoursData = 0;
    this._startDate = null;
    this._endDate = null;
    this.showSpinner = false;
    this.getTimeSheets();
  }

  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['SubmitDate', 'PeriodEnd'], ['Hours']);
  }

  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
    if (this.dtHours !== undefined && this.dtHours !== null) {
      this.dtHours.sortOrder = 0;
      this.dtHours.sortField = '';
      this.dtHours.reset();
    }
  }
}
