import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial, TimeSheet, Employee, TimePeriods } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../service/common.service';
import { TimesheetsComponent } from 'src/app/timesheets/timesheets.component';
import { parse } from 'querystring';
import { DateFormats } from 'src/app/model/constants';

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

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private commonSvc: CommonService, private datepipe: DatePipe) {
  }

  ngOnInit() {
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto' },
      { field: 'PeriodEnd', header: 'Period Ending', align: 'center', width: '200px' },
      { field: 'Status', header: 'Status', align: 'left', width: '200px' },
    ];
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
}
