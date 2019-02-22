import { Component, OnInit } from '@angular/core';
import { CommonService } from '../service/common.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TimesystemService } from '../service/timesystem.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  PendingTimesheetsNotification: string;
  showOutStandingTimesheets = false;
  showApprovalTimesheets = false;
  constructor(
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
    private router: Router,
  ) {
    this.CheckActiveSessionAndPageAuthorization();
    this.commonSvc.setAppSettings();
  }
  CheckActiveSessionAndPageAuthorization() {
    let sessionActive = false;
    if (sessionStorage !== undefined && sessionStorage !== null && sessionStorage.length > 0) {
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null) {
        sessionActive = true;
      }
    }

    if (!sessionActive) {
      this.router.navigate(['']);
    }
  }

  ngOnInit() {
    this.Initialisations();
    this.CheckSecurity();
    this.GetMethods();
  }




  Initialisations() {

  }

  CheckSecurity() {
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
  }

  GetMethods() {
    this.getIncompleteTimeSheets();
  }

  getIncompleteTimeSheets() {
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
                  pends.push(data[cnt].PeriodEnd);
                }
                this.PendingTimesheetsNotification =
                  'Please make sure you save the hours (not necessarily submit) for the following time periods: '
                  + pends.join() + ' to ensure proper month-end invoicing.';
              }
            });
      }
    }
  }

}
