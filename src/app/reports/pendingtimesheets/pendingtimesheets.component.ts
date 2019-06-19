import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial, TimeSheet, Employee, TimePeriods, EmailOptions, Email, SendEmail, PageNames } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../service/common.service';
import { TimesheetsComponent } from 'src/app/timesheets/timesheets.component';
import { parse } from 'querystring';
import { DateFormats } from 'src/app/model/constants';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
import { not } from '@angular/compiler/src/output/output_ast';
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
    private confSvc: ConfirmationService,
    public commonSvc: CommonService,
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
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.OutstandingTimesheets, '', 'Fine', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
      { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto' },
      { field: 'PeriodEnd', header: 'Period Ending', align: 'center', width: '200px' },
      { field: 'Status', header: 'Status', align: 'left', width: '200px' },
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
    this._recData = 0;
    this._UnSubmittedCnt = 0;
    this._NotCreatedCnt = 0;
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

  // groupBy(xs, key) {
  //   return xs.reduce(function (rv, x) {
  //     (rv[x[key]] = rv[x[key]] || []).push(x);
  //     return rv;
  //   }, {});
  // }

  // emailEmployee() {
  //   this.showSpinner = true;
  //   if (this._selectedEmployees !== undefined && this._selectedEmployees !== null && this._selectedEmployees.length > 0) {

  //     let EmailType = this.byCob ? 'Time Sheets Due by Close of Business' : 'Time Sheets Due';
  //     const From = this.commonSvc.getAppSettingsValue('FinanceEmailAddress');
  //     const DisplayName = this.commonSvc.getAppSettingsValue('FinanceEmailDisplayName');
  //     const DistinctEmails: string[] = this._selectedEmployees.map(m => m.EmailAddress).filter(
  //       function (value, index, self) {
  //         return self.indexOf(value) === index;
  //       });

  //     this.timesysSvc.getEmails(EmailType).subscribe(data => {
  //       this.showSpinner = false;
  //       if (data !== undefined && data !== null && data.length > 0) {


  //         let emailContent: Email;
  //         emailContent = {};
  //         emailContent = data[0];



  //         for (let cnt = 0; cnt < DistinctEmails.length; cnt++) {
  //           let emailOptions: EmailOptions;
  //           emailOptions = {};
  //           // emailOptions.EmailType = EmailType;
  //           emailOptions.From = From;
  //           emailOptions.DisplayName = DisplayName;
  //           emailOptions.To = DistinctEmails[cnt];

  //           let _sendEmail: SendEmail;
  //           _sendEmail = {};
  //           _sendEmail.EmailOptions = emailOptions;
  //           _sendEmail.EmailContent = emailContent;

  //           this.timesysSvc.sendMail(_sendEmail).subscribe(dataSend => {
  //             if (dataSend !== undefined && dataSend !== null && dataSend.toString() !== '') {
  //               this.msgSvc.add({
  //                 key: 'alert',
  //                 sticky: true,
  //                 severity: 'error',
  //                 summary: 'Error!',
  //                 detail: dataSend.toString(),
  //               });
  //             }
  //           });
  //         }
  //       }


  //     });
  //     if (this.ccFinance) {
  //       let emailOptions: EmailOptions;
  //       emailOptions = {};
  //       // emailOptions.EmailType = 'Employees With Unsubmitted Timesheets';
  //       emailOptions.From = From;
  //       emailOptions.DisplayName = DisplayName;
  //       emailOptions.To = From;

  //       const DistinctNames = this._selectedEmployees.map(m => m.LastName + ',' + m.FirstName).filter(
  //         function (value, index, self) {
  //           return self.indexOf(value) === index;
  //         }).join('\r\n');

  //       let bodyParams: string[];
  //       bodyParams = [];
  //       bodyParams.push(DistinctNames);
  //       emailOptions.BodyParams = bodyParams;

  //       EmailType = 'Employees With Unsubmitted Timesheets';
  //       this.timesysSvc.getEmails(EmailType).subscribe(data => {
  //         if (data !== undefined && data !== null && data.length > 0) {
  //           let emailContent: Email;
  //           emailContent = {};
  //           emailContent = data[0];

  //           emailContent.Subject += ' ' + this.selectedDate.toString();

  //           let _sendEmail: SendEmail;
  //           _sendEmail = {};
  //           _sendEmail.EmailOptions = emailOptions;
  //           _sendEmail.EmailContent = emailContent;

  //           this.timesysSvc.sendMail(_sendEmail).subscribe(dataSend => {
  //             if (dataSend !== undefined && dataSend !== null && dataSend.toString() !== '') {
  //               this.msgSvc.add({
  //                 key: 'alert',
  //                 sticky: true,
  //                 severity: 'error',
  //                 summary: 'Error!',
  //                 detail: dataSend.toString(),
  //               });
  //             }
  //           });
  //         }
  //       });
  //     }
  //   } else {
  //     this.showSpinner = false;
  //   }
  // }

  // onlyUnique(value, index, self) {
  //   return self.indexOf(value) === index;
  // }

}
