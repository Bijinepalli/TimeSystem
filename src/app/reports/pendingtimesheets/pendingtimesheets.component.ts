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
  _recData = '';
  _selectedEmployees: any;
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
  }

  //#region 'Populate Dropdown'
  populateDateDrop() {
    this.dates = [];
    const _pastPeriods = this.commonSvc.getAppSettingsValue('OutstandingTimePeriods');
    const _futurePeriods = this.commonSvc.getAppSettingsValue('FutureTimePeriods');
    const _dateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this.timesysSvc.getPeriodEndDatesforDropdown(_pastPeriods, _futurePeriods, _dateFormat)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            console.log(data);
            for (let i = 0; i < data.length; i++) {
              this.dates.push({ label: data[i].FuturePeriodEnd, value: data[i].FuturePeriodEnd });
            }
          }
          this.selectedDate = data[0].PresentPeriodEnd.toString();
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
    this._reports = null;
    console.log(this.selectedDate);
    const _periodEndDate = new Date(this.selectedDate);
    this.getPendingTimesheets(_periodEndDate);
    this.timesysSvc.getOutstandingTimesheetReport(this.previousDates.toString().slice(1))
      .subscribe(
        (data) => {
          if (data !== null) {
            this.showReport = true;
            this._reports = data;
            this._recData = this._reports.length;
          }
        }
      );
  }

  getPendingTimesheets(_periodEndDate: Date) {
    let pastPeriods = this.commonSvc.getAppSettingsValue('UnsubmittedTimePeriods');
    const currentDate = new Date();
    this.getPriorPeriodDates(_periodEndDate, currentDate, ++pastPeriods, 'dates');
  }

  getDaysTillFriday(date: Date) {
    let daysTillFriday = 0;
    switch (date.getDay()) {
      case 0:
        daysTillFriday = 5;
        break;
      case 1:
        daysTillFriday = 4;
        break;
      case 2:
        daysTillFriday = 3;
        break;
      case 3:
        daysTillFriday = 2;
        break;
      case 4:
        daysTillFriday = 1;
        break;
      case 5:
        daysTillFriday = 0;
        break;
      case 6:
        daysTillFriday = 6;
        break;
    }
    return new Date(date.getFullYear(), date.getMonth(), (date.getDate() + daysTillFriday));
  }

  getPriorFridayDate(date: Date) {
    let daysTillFriday = 0;
    switch (date.getDay()) {
      case 0:
        daysTillFriday = -2;
        break;
      case 1:
        daysTillFriday = -3;
        break;
      case 2:
        daysTillFriday = -4;
        break;
      case 3:
        daysTillFriday = -5;
        break;
      case 4:
        daysTillFriday = -6;
        break;
      case 5:
        daysTillFriday = 0;
        break;
      case 6:
        daysTillFriday = -1;
        break;
    }
    return new Date(date.getFullYear(), date.getMonth(), (date.getDate() + daysTillFriday));
  }

  sortDate(_periodend: Date) {
    let date = _periodend.getDate().toString();
    let month = (_periodend.getMonth() + 1).toString();
    if (_periodend.getDate().toString().length === 1) {
      date = '0' + _periodend.getDate().toString();
    }
    if ((_periodend.getMonth() + 1).toString().length === 1) {
      month = '0' + (_periodend.getMonth() + 1).toString();
    }
    return (month + '-' + date + '-' + _periodend.getFullYear());
  }

  getPriorPeriodDates(_periodend: Date, currentDate: Date, _pastPeriods: number, mode = 'drop') {
    const _semiMonthlyStart = new Date(this.commonSvc.getAppSettingsValue('SemiMonthlyStartDate'));
    let useSemiMonthly = false;
    if (_periodend >= _semiMonthlyStart) {
      useSemiMonthly = true;
    }
    for (let i = 0; i < _pastPeriods; i++) {
      if (mode === 'drop') {
        if (_periodend >= new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), currentDate.getDate())) {
          let dateForDrop = this.sortDate(_periodend);
          this.dates.push({ label: dateForDrop, value: dateForDrop });
          if (useSemiMonthly) {
            _periodend = this.getPriorPeriodEndDate(_periodend, false);
            if (_periodend < _semiMonthlyStart) {
              _periodend = new Date(_semiMonthlyStart.getFullYear(), _semiMonthlyStart.getMonth(), (_semiMonthlyStart.getDate() - 1));
              dateForDrop = this.sortDate(_periodend);
              this.dates.push({ label: dateForDrop, value: dateForDrop });
              _periodend = this.getPriorFridayDate(_periodend);
              useSemiMonthly = false;
            }
          } else {
            _periodend = this.getPriorPeriodEndDate(_periodend, true);
          }
        }
      } else {
        if (_periodend >= new Date(currentDate.getFullYear() - 2, currentDate.getMonth(), currentDate.getDate())) {
          this.previousDates += ',' + this.sortDate(_periodend);
          if (useSemiMonthly) {
            _periodend = this.getPriorPeriodEndDate(_periodend, false);
            if (_periodend < _semiMonthlyStart) {
              _periodend = new Date(_semiMonthlyStart.getFullYear(), _semiMonthlyStart.getMonth(), (_semiMonthlyStart.getDate() - 1));
              this.previousDates += this.sortDate(_periodend);
              _periodend = this.getPriorFridayDate(_periodend);
              useSemiMonthly = false;
            }
          } else {
            _periodend = this.getPriorPeriodEndDate(_periodend, true);
          }
        }
      }
    }
  }

  getPriorPeriodEndDate(_periodend: Date, sevenDay: boolean) {
    const _semiMonthlyStart = new Date(this.commonSvc.getAppSettingsValue('SemiMonthlyStartDate'));
    if (sevenDay) {
      if (_periodend === new Date(_semiMonthlyStart.getFullYear(), _semiMonthlyStart.getMonth(), (_semiMonthlyStart.getDate() - 1))) {
        _periodend = this.getPriorFridayDate(_periodend);
      } else {
        _periodend = new Date(_periodend.getFullYear(), _periodend.getMonth(), (_periodend.getDate() - 7));
      }
    }
    if (_periodend.getDate() <= 15) {
      _periodend = new Date(_periodend.getFullYear(), _periodend.getMonth(), _periodend.getDate() - 15);
    } else {
      _periodend = new Date(_periodend.getFullYear(), _periodend.getMonth(), 15);
    }
    return _periodend;
  }

  emailEmployee() {
    for (let i = 0; i < this._selectedEmployees.length; i++) {

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
