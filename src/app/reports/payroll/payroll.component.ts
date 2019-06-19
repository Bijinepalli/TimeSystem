import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { BillingCodes, BillingCodesSpecial, TimeSheet, PageNames } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { ActivitylogService } from 'src/app/service/activitylog.service';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.css'],
  providers: [DatePipe]
})
export class PayrollComponent implements OnInit {
  dates: SelectItem[];
  dateFormat: string;
  periodEnd: any;
  selectedDate: string;
  timesheet: TimeSheet[] = [];
  showReport = false;
  showSpinner = false;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  _timesheet: TimeSheet;
  selectedPeriod: any;
  showBillingCodeList = false;
  changeCodeList = false;
  ParamSubscribe: any;
  IsSecure = false;
  _DisplayDateFormat = '';
  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    public commonSvc: CommonService,
    private datePipe: DatePipe
  ) {
    this.CheckActiveSession();
    this.commonSvc.setAppSettings();
  }
  CheckActiveSession() {
    let sessionActive = false;
    if (sessionStorage !== undefined && sessionStorage !== null && sessionStorage.length > 0) {
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null) {
        sessionActive = true;
      }
    }

    if (!sessionActive) {
      this.router.navigate(['/access'], { queryParams: { Message: 'Session Expired' } }); // Session Expired
    }
  }
  /* #endregion*/

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.Payroll, '', 'Fine', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
    this.showSpinner = false;
  }

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }

  ClearAllProperties() {
    this.dates = [];
    this.dateFormat = '';
    this.periodEnd = '';
    this.selectedDate = '';
    this.timesheet = [];
    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    this.cols = {};
    this._timesheet = new TimeSheet();
    this.selectedPeriod = '';
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showSpinner = false;
  }

  Initialisations() {
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this.populateDateDrop();
    // this.dates.push({ label: 'Select Period End', value: '' });
    // this.selectedDate = '0';
  }
  populateDateDrop() {
    this.showSpinner = true;
    this.timesheet = [];
    this.dates = [];
    this.selectedDate = '';
    const PeriodEndReportPeriods = 48;
    this.timesysSvc.getDatebyPeriod()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this.timesheet = data;
            for (let i = 0; i < PeriodEndReportPeriods; i++) {
              this.dates.push({
                label:
                  this.datePipe.transform(this.timesheet[i].PeriodEndDate, this._DisplayDateFormat),
                value: this.timesheet[i].PeriodEnd
              });
            }
          }
          this.showSpinner = false;
        }
      );
  }
  getPeriodEndDetails(e) {
    this.showSpinner = true;
    this.showReport = false;
    this.buildCols();
    this._timesheet = new TimeSheet();
    let _date = '';

    if (this.selectedDate !== null && this.selectedDate !== '') {
      _date = this.datePipe.transform(this.selectedDate, 'yyyy/MM/dd');
      // this.selectedDate = _date;
    }
    if (_date !== null && _date !== '') {
      this.timesysSvc.GetTimeSheetsPerEmployeePeriodStart(_date).subscribe(
        (data) => {
          this.showTable(data);
        }
      );
    } else {
      this.showTable(null);
    }
  }
  showTable(data: TimeSheet[]) {
    this._reports = [];
    this._recData = 0;
    if (data !== undefined && data !== null && data.length > 0) {
      this._reports = data;
      this._recData = ((this._reports.length) - 4);
    }
    this.showReport = true;
    this.showBillingCodeList = false;
    this.changeCodeList = true;
    this.showSpinner = false;
  }
  buildCols() {
    this.cols = [
      { field: 'Salaried', header: 'Salaried', align: 'center', width: '80px' },
      { field: 'EmployeeNumber', header: 'Employee Number', align: 'left', width: '155px' },
      { field: 'EmployeeName', header: 'Employee Name', align: 'left', width: '200px' },
      { field: 'Worked', header: 'Worked', align: 'right', width: '80px' },
      { field: 'HolidayHours', header: 'Holiday Hours', align: 'right', width: '124px' },
      { field: 'PTOHours', header: 'PTO Hours', align: 'right', width: '100px' },
      { field: 'IPayHours', header: 'IPay Hours', align: 'right', width: '105px' },
      { field: 'HoursPaid', header: 'Hours Paid', align: 'right', width: '105px' },
      { field: 'NonBillableHours', header: 'Non-Billable Hours', align: 'right', width: '160px' },
      { field: 'TotalHours', header: 'Total Hours', align: 'right', width: '110px' },
      { field: 'HasOutstandingTimesheets', header: 'Has Outstanding Timesheets', align: 'center', width: '200px' }
    ];
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this.showSpinner = false;
  }
  viewTimeSheet(rowData: TimeSheet) {
    this.navigateToTimesheet(rowData.TimesheetID, '');
  }
  navigateToTimesheet(TimesheetId, TimesheetDate) {
    // this.timesheetDialog = false;
    let routerLinkTimesheet = '/menu/maintaintimesheet/' + TimesheetId;
    if (TimesheetDate !== '') {
      routerLinkTimesheet += '/' + TimesheetDate;
    }
    this.router.navigate([routerLinkTimesheet], { skipLocationChange: true });
  }
}
