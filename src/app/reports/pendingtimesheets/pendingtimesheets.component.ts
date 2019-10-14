import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { TimeSheet, PageNames } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
import { ActivitylogService } from 'src/app/service/activitylog.service';

@Component({
  selector: 'app-pendingtimesheets',
  templateUrl: './pendingtimesheets.component.html',
  styleUrls: ['./pendingtimesheets.component.css'],
  providers: [DatePipe]
})
export class PendingtimesheetsComponent implements OnInit {
  dates: SelectItem[];
  dateFormat: string;
  periodEnd: any;
  selectedDate: string;
  timesheet: TimeSheet[] = [];
  showSpinner = false;
  previousDates = '';
  submittedTimesheets: TimeSheet[] = [];
  timesheetDate: TimeSheet[] = [];
  _reports: any;
  showReport = false;
  cols: any;
  byCob = false;
  ccFinance = false;
  _recData = 0;
  _UnSubmittedCnt = 0;
  _NotCreatedCnt = 0;
  _selectedEmployees: TimeSheet[];
  ParamSubscribe: any;
  IsSecure = false;
  _DisplayDateFormat: any;
  _sortArray: string[];

  @ViewChild('dt') dt: Table;

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    public commonSvc: CommonService  ) {
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
    this.logSvc.ActionLog(PageNames.OutstandingTimesheets, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      this.IsSecure = false;
      this.showSpinner = false;
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
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
    this.showSpinner = true;
    this.resetSort();
    this.dates = [];
    this.dateFormat = '';
    this.periodEnd = '';
    this.selectedDate = '';
    this.timesheet = [];
    this.previousDates = '';
    this.submittedTimesheets = [];
    this.timesheetDate = [];
    this._reports = [];
    this.showReport = false;
    this.cols = {};
    this.byCob = false;
    this.ccFinance = false;
    this._recData = 0;
    this._UnSubmittedCnt = 0;
    this._NotCreatedCnt = 0;
    this._selectedEmployees = [];
    this.showSpinner = false;
  }
  Initialisations() {
    this.showSpinner = true;
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '20em' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '20em' },
      { field: 'PeriodEnd', header: 'Period Ending', align: 'center', width: '10em' },
      { field: 'Status', header: 'Status', align: 'left', width: '10em' },
    ];
    this._sortArray = ['LastName', 'FirstName', 'PeriodEndSearch', 'Status'];
    this.ccFinance = true;
    this.showSpinner = false;
    this.populateDateDrop();
  }

  //#region 'Populate Dropdown'
  populateDateDrop() {
    this.showSpinner = true;
    this.dates = [];
    const _pastPeriods = this.commonSvc.getAppSettingsValue('OutstandingTimePeriods');
    const _futurePeriods = this.commonSvc.getAppSettingsValue('FutureTimePeriods');
    const _dateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this.timesysSvc.getPeriodEndDatesforDropdown(_pastPeriods, _futurePeriods, _dateFormat)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              this.dates.push({ label: data[i].FuturePeriodEnd, value: data[i].FuturePeriodEnd });
            }
          }
          this.selectedDate = data[0].PresentPeriodEnd.toString();
          this.showSpinner = false;
          this.getPeriodforDate();
        });
  }

  //#endregion

  onDateChange() {
    this.previousDates = '';
    this.getPeriodforDate();
    // this.getPendngTimesheets();
  }

  getPeriodforDate() {
    this.showSpinner = true;
    this.resetSort();
    this._reports = [];
    this._recData = 0;
    this._UnSubmittedCnt = 0;
    this._NotCreatedCnt = 0;
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      selectedDate: this.selectedDate.toString()
    };
    this.logSvc.ActionLog(PageNames.OutstandingTimesheets,
      '', 'Reports/Event', 'getPeriodforDate', 'Get Period For Date', '', '', JSON.stringify(ActivityParams)); // ActivityLog

    this.timesysSvc.getOutstandingTimesheetReport(this.selectedDate)
      .subscribe(
        (data) => {
          this._reports = [];
          this._recData = 0;
          this._UnSubmittedCnt = 0;
          this._NotCreatedCnt = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this._recData = data.length;
            const NotCreated = data.filter(m => m.Status.toString() === 'Not Created');
            if (NotCreated !== undefined && NotCreated !== null && NotCreated.length > 0) {
              this._NotCreatedCnt = NotCreated.length;
            }
            const UnSubmitted = data.filter(m => m.Status.toString() === 'Not Submitted');
            if (UnSubmitted !== undefined && UnSubmitted !== null && UnSubmitted.length > 0) {
              this._UnSubmittedCnt = UnSubmitted.length;
            }
          }
          this.showReport = true;
          this.showSpinner = false;
        }
      );
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['PeriodEnd'], []);
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
  checkSelectedEmployees() {
    if (this._selectedEmployees !== undefined && this._selectedEmployees !== null && this._selectedEmployees.length > 0) {
      return false;
    }
    return true;
  }

  DistinctFilter(value, index, self) {
    return self.indexOf(value) === index;
  }

  emailEmployee() {
    this.showSpinner = true;
    if (this._selectedEmployees !== undefined && this._selectedEmployees !== null && this._selectedEmployees.length > 0) {
      const DistinctEmails = this._selectedEmployees.map(m => ({
        EmailAddress: m.EmailAddress,
        Name: m.LastName + ',' + m.FirstName
      })).filter(
        this.DistinctFilter);
      let ActivityParams: any; // ActivityLog
      ActivityParams = {
        Emails: DistinctEmails,
        byCob: this.byCob.toString().toLowerCase(),
        ccFinance: this.ccFinance.toString().toLowerCase(),
        selectedDate: this.selectedDate.toString()
      };
      this.logSvc.ActionLog(PageNames.OutstandingTimesheets,
        '', 'Reports/Event', 'emailEmployee', 'Email Employee', '', '', JSON.stringify(ActivityParams)); // ActivityLog

      this.timesysSvc.PendingTimesheetEmail(
        JSON.stringify(DistinctEmails).toString(),
        this.byCob.toString().toLowerCase(),
        this.ccFinance.toString().toLowerCase(),
        this.selectedDate.toString()).
        subscribe(data => {
          if (data !== undefined && data !== null && data.length > 0) {
            let Errors: string;
            Errors = '';
            const DistinctErrors = data.map(m => m.Value).filter(
              this.DistinctFilter);
            for (let cnt = 0; cnt < DistinctErrors.length; cnt++) {
              const Names = data.filter(m => m.Value === DistinctErrors[cnt]).map(m => m.Key).join('<br>');
              Errors += DistinctErrors[cnt] + ' - <br><b>' + Names + '</b><br>';
            }

            this.msgSvc.add({
              key: 'alert',
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: Errors,
            });
          } else {
            this.msgSvc.add({
              key: 'saveSuccess', severity: 'success',
              summary: 'Info Message', detail: 'Email(s) sent successfully'
            });
          }
          this.showSpinner = false;
        });
    } else {
      this.showSpinner = false;
    }
  }
}
