import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial, TimeSheet, Employee, TimePeriods } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../service/common.service';
import { TimesheetsComponent } from 'src/app/timesheets/timesheets.component';
import { parse } from 'querystring';
import { DateFormats } from 'src/app/model/constants';
import { environment } from 'src/environments/environment';

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
  _selectedEmployees: TimeSheet;
  visibleHelp: boolean;
  helpText: string;
  ParamSubscribe: any;
  IsSecure = false;
  _DisplayDateFormat: any;
  _sortArray: string[];

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private commonSvc: CommonService,
    private datepipe: DatePipe
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
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.showSpinner = true;
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
    this.previousDates = '';
    this.submittedTimesheets = [];
    this.timesheetDate = [];
    this._reports = [];
    this.showReport = false;
    this.cols = {};
    this.byCob = false;
    this.ccFinance = false;
    this._recData = 0;
    this._selectedEmployees = new TimeSheet();
    this.visibleHelp = false;
    this.helpText = '';
    this.showSpinner = false;
  }
  Initialisations() {
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto' },
      { field: 'PeriodEnd', header: 'Period Ending', align: 'center', width: '200px' },
      { field: 'Status', header: 'Status', align: 'left', width: '200px' },
    ];
    this._sortArray = ['LastName', 'FirstName', 'PeriodEndSearch', 'Status'];
    this.populateDateDrop();
    this.ccFinance = true;
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
          console.log(this.dates);
          this.selectedDate = data[0].PresentPeriodEnd.toString();
          this.showSpinner = false;
          this.getDatefortheperiod();
        });
  }

  //#endregion

  onDateChange(e) {
    this.previousDates = '';
    this.getDatefortheperiod();
    // this.getPendngTimesheets();
  }

  getDatefortheperiod() {
    this.showSpinner = true;
    this._reports = [];
    console.log(this.selectedDate);
    this.timesysSvc.getOutstandingTimesheetReport(this.selectedDate)
      .subscribe(
        (data) => {
          this._reports = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this._recData = this._reports.length;
          }
          console.log(this._reports);
          this.showReport = true;
          this.showSpinner = false;
        }
      );
  }

  showHelp(file: string) {
    this.timesysSvc.getHelp(file)
      .subscribe(
        (data) => {
          // this.helpText = data;
          this.visibleHelp = true;
          const parser = new DOMParser();
          const parsedHtml = parser.parseFromString(data, 'text/html');
          this.helpText = parsedHtml.getElementsByTagName('body')[0].innerHTML;
        }
      );
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['PeriodEnd'], []);
  }

}
