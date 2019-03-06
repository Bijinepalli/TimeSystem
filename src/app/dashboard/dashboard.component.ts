import { Component, OnInit } from '@angular/core';
import { CommonService } from '../service/common.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TimesystemService } from '../service/timesystem.service';
import { environment } from 'src/environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  PendingTimesheetsNotification: string;
  showOutStandingTimesheets = false;
  showApprovalTimesheets = false;
  showSpinner = false;
  ParamSubscribe: any;
  DisplayDateFormat: any;
  IsSecure: boolean;
  _HasEdit: boolean;
  visibleHelp: boolean;
  helpText: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
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
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
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
    this.showOutStandingTimesheets = false;
    this.showApprovalTimesheets = false;
    this.PendingTimesheetsNotification = null;
    this.showSpinner = false;
  }

  Initialisations() {
    this.DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this.CheckInternalSecurity();
    this.GetMethods();
  }

  CheckInternalSecurity() {
    this.showSpinner = true;
    if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'SubmitsTime') !== undefined &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'SubmitsTime') !== null &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'SubmitsTime').toString() !== '' &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'SubmitsTime').toString() === 'false'
    ) {
      this.showOutStandingTimesheets = false;
    } else {
      this.showOutStandingTimesheets = true;
    }
    if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'IsSupervisor') !== undefined &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'IsSupervisor') !== null &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'IsSupervisor').toString() !== '' &&
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'IsSupervisor').toString() === 'false'
    ) {
      this.showApprovalTimesheets = false;
    } else {
      this.showApprovalTimesheets = true;
    }
    this.showSpinner = false;
  }

  GetMethods() {
    if (this.showOutStandingTimesheets) {
      this.getIncompleteTimeSheets();
    }
  }

  getIncompleteTimeSheets() {
    this.showSpinner = true;
    this.PendingTimesheetsNotification = null;
    const TimeSheetIntimationCountDown = this.commonSvc.getAppSettingsValue('TimeSheetIntimationCountDown');
    if (TimeSheetIntimationCountDown !== '') {
      const dtToday = new Date();
      const daysInMonth = new Date(dtToday.getFullYear(), dtToday.getMonth() + 1, 0).getDate();
      if ((+daysInMonth) - (+dtToday.getDate()) <= (+TimeSheetIntimationCountDown)) {
        this.timesysSvc.getEmployeesNoTimesheetforInvoice(
          sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString())
          .subscribe(
            (data) => {
              if (data !== undefined && data !== null && data.length > 0) {
                let pends: string[] = [];
                pends = [];
                for (let cnt = 0; cnt < data.length; cnt++) {
                  if (data[cnt] !== undefined && data[cnt] !== null) {
                    if (data[cnt].PeriodEnd !== undefined && data[cnt].PeriodEnd !== null && data[cnt].PeriodEnd.toString() !== '') {
                      pends.push(this.datepipe.transform(data[cnt].PeriodEnd, this.DisplayDateFormat));
                    }
                  }
                }
                this.PendingTimesheetsNotification =
                  'Please make sure you save the hours (not necessarily submit) for the following time periods: '
                  + pends.join(', ') + ' to ensure proper month-end invoicing.';
              }
              this.showSpinner = false;
            });
      } else {
        this.showSpinner = false;
      }
    } else {
      this.showSpinner = false;
    }
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

}
