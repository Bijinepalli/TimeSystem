import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial, TimeSheet, Employee } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from '../../service/common.service';
import { TimesheetsComponent } from 'src/app/timesheets/timesheets.component';
import { parse } from 'querystring';

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

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private commonSvc: CommonService, private datepipe: DatePipe) {
    this.populateDateDrop();
    this.getDatefortheperiod();
  }

  ngOnInit() {
    this.cols = [
      { field: 'LastName', header: 'Last Name' },
      { field: 'FirstName', header: 'First Name' },
      { field: 'PeriodEnd', header: 'Period Ending' },
      { field: 'Status', header: 'Status' },
    ];
  }

  //#region 'Populate Dropdown'
  populateDateDrop() {
    this.dates = [];
    const _pastPeriods = this.commonSvc.getAppSettingsValue('OutstandingTimePeriods');
    const _futurePeriods = this.commonSvc.getAppSettingsValue('FutureTimePeriods');
    const currentDate = new Date();
    const _assignperiodend = this.getNextPeriodDate(currentDate);
    this.selectedDate = this.sortDate(_assignperiodend);
    let _periodend = _assignperiodend;
    this.getPriorPeriodDates(_periodend, currentDate, _pastPeriods);
    _periodend = _assignperiodend;
    for (let i = 0; i < _futurePeriods; i++) {
      _periodend = new Date(_periodend.getFullYear(), _periodend.getMonth(), (_periodend.getDate() + 1));
      _periodend = this.getNextPeriodDate(_periodend);
      const dateForDrop = this.sortDate(_periodend);
      this.dates.push({ label: dateForDrop, value: dateForDrop });
    }
    this.dates.sort((val1, val2) => <any>new Date(val1.label) - <any>new Date(val2.label));
  }

  getNextPeriodDate(_periodend: Date) {
    const _semiMonthlyStart = new Date(this.commonSvc.getAppSettingsValue('SemiMonthlyStartDate'));
    if (this.commonSvc.getAppSettingsValue('SemiMonthly')) {
      if (_periodend >= _semiMonthlyStart) {
        // tslint:disable-next-line:max-line-length
        _periodend = _periodend.getDate() > 15 ? new Date(_periodend.getFullYear(), (_periodend.getMonth() + 1), 0) : new Date(_periodend.getFullYear(), _periodend.getMonth(), 15);
      } else {
        _periodend = this.getDaysTillFriday(_periodend);
        if (_periodend >= _semiMonthlyStart) {
          _periodend = new Date(_periodend.getFullYear(), _periodend.getMonth(), (_periodend.getDate() - 1));
        }
      }
    } else {
      _periodend = this.getDaysTillFriday(_periodend);
    }
    return _periodend;
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
  //#endregion

  onDateChange(e) {
    this.previousDates = '';
    this.getDatefortheperiod();
    // this.getPendngTimesheets();
  }

  getDatefortheperiod() {
    this._reports = null;
    const _periodEndDate = new Date(this.selectedDate);
    this.getPendingTimesheets(_periodEndDate);
    this.timesysSvc.getOutstandingTimesheetReport(this.previousDates.toString().slice(1))
      .subscribe(
        (data) => {
          if (data !== null) {
            this.showReport = true;
            this._reports = data;
            this._recData = this._reports.length;
            console.log(this._reports);
          }
        }
      );
  }

  getPendingTimesheets(_periodEndDate: Date) {
    let pastPeriods = this.commonSvc.getAppSettingsValue('UnsubmittedTimePeriods');
    const currentDate = new Date();
    this.getPriorPeriodDates(_periodEndDate, currentDate, ++pastPeriods, 'dates');
  }

  emailEmployee() {
    for (let i = 0; i < this._selectedEmployees.length; i++) {

    }
  }

}
