import { Component, OnInit } from '@angular/core';
import { CommonService } from '../service/common.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TimesystemService } from '../service/timesystem.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  PendingTimesheetsNotification: string;
  constructor(
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
  ) { }

  ngOnInit() {
    this.Initialisations();
    this.GetMethods();
  }

  Initialisations() {

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
        this.timesysSvc.getEmployeesNoTimesheetforInvoice(localStorage.getItem('UserId').toString())
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
