import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial, TimeSheet, Employee, TimePeriods, EmailOptions, Email, SendEmail } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../service/common.service';
import { TimesheetsComponent } from 'src/app/timesheets/timesheets.component';
import { parse } from 'querystring';
import { DateFormats } from 'src/app/model/constants';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';

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
  _selectedEmployees: TimeSheet[];
  visibleHelp: boolean;
  helpText: string;
  ParamSubscribe: any;
  IsSecure = false;
  _DisplayDateFormat: any;
  _sortArray: string[];
  @ViewChild('dt') dt: Table;

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
    this._selectedEmployees = [];
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
    this.resetSort();
    this._reports = [];
    this.timesysSvc.getOutstandingTimesheetReport(this.selectedDate)
      .subscribe(
        (data) => {
          this._reports = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this._recData = this._reports.length;
          }
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

  emailEmployee() {
    console.log(this._selectedEmployees);
    if (this._selectedEmployees !== undefined && this._selectedEmployees !== null && this._selectedEmployees.length > 0) {




      let EmailType = this.byCob ? 'Time Sheets Due by Close of Business' : 'Time Sheets Due';
      const From = this.commonSvc.getAppSettingsValue('FinanceEmailAddress');
      const DisplayName = this.commonSvc.getAppSettingsValue('FinanceEmailDisplayName');

      this.timesysSvc.getEmails(EmailType).subscribe(data => {
        if (data !== undefined && data !== null && data.length > 0) {
          let emailContent: Email;
          emailContent = {};
          emailContent = data[0];
          for (let cnt = 0; cnt < this._selectedEmployees.length; cnt++) {
            let emailOptions: EmailOptions;
            emailOptions = {};
            // emailOptions.EmailType = EmailType;
            emailOptions.From = From;
            emailOptions.DisplayName = DisplayName;
            emailOptions.To = this._selectedEmployees[cnt].EmailAddress.toString();

            let _sendEmail: SendEmail;
            _sendEmail = {};
            _sendEmail.EmailOptions = emailOptions;
            _sendEmail.EmailContent = emailContent;
            console.log(_sendEmail);

            this.timesysSvc.sendMail(_sendEmail).subscribe(dataSend => {
              console.log(dataSend);
              if (dataSend !== undefined && dataSend !== null && dataSend.toString() !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: dataSend.toString(),
                });
              }
            });
          }
        }
      });
      if (this.ccFinance) {
        let emailOptions: EmailOptions;
        emailOptions = {};
        // emailOptions.EmailType = 'Employees With Unsubmitted Timesheets';
        emailOptions.From = From;
        emailOptions.DisplayName = DisplayName;
        emailOptions.To = From;

        const DistinctNames = this._selectedEmployees.map(m => m.LastName + ',' + m.FirstName).filter(
          function (value, index, self) {
            return self.indexOf(value) === index;
          }).join('\r\n');

        console.log(DistinctNames);

        let bodyParams: string[];
        bodyParams = [];
        bodyParams.push(DistinctNames);
        emailOptions.BodyParams = bodyParams;

        EmailType = 'Employees With Unsubmitted Timesheets';
        this.timesysSvc.getEmails(EmailType).subscribe(data => {
          if (data !== undefined && data !== null && data.length > 0) {
            let emailContent: Email;
            emailContent = {};
            emailContent = data[0];

            emailContent.Subject += ' ' + this.selectedDate.toString();

            let _sendEmail: SendEmail;
            _sendEmail = {};
            _sendEmail.EmailOptions = emailOptions;
            _sendEmail.EmailContent = emailContent;
            console.log(_sendEmail);

            this.timesysSvc.sendMail(_sendEmail).subscribe(dataSend => {
              console.log(dataSend);
              if (dataSend !== undefined && dataSend !== null && dataSend.toString() !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: dataSend.toString(),
                });
              }
            });
          }
        });
      }
    }
  }

  // onlyUnique(value, index, self) {
  //   return self.indexOf(value) === index;
  // }

}
