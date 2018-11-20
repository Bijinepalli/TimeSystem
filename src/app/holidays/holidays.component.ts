import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Holidays } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.css']
})
export class HolidaysComponent implements OnInit {

  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService) { }

  _holidays: Holidays[] = [];
  _yec: YearEndCodes = new YearEndCodes();
  _years; any;
  selectedYear: any;
  cols: any;
  _recData: any;

  ngOnInit() {
    // This should be dynamic
    this._years = [
      { label: '2010', value: '2010' },
      { label: '2011', value: '2011' },
      { label: '2012', value: '2012' },
      { label: '2013', value: '2013' },
      { label: '2014', value: '2014' },
      { label: '2015', value: '2015' },
      { label: '2016', value: '2016' },
      { label: '2017', value: '2017' },
      { label: '2018', value: '2018' },
      { label: '2019', value: '2019' },
      { label: '2020', value: '2020' },
    ];

    this.cols = [
      { field: 'CalendarYear', header: 'Year' },
      { field: 'HolidayName', header: 'Holiday Name' },
      { field: 'HolidayDate', header: 'Date' },
    ];
    const _date: Date = new Date();

    this.selectedYear = _date.getFullYear();
    this.getHolidays();

  }

  getHolidays() {
    console.log(this._yec.HolidayCode + this.selectedYear);
    this.timesysSvc.getHolidays(this.selectedYear, this._yec.HolidayCode + this.selectedYear)
      .subscribe(
        (data) => {
          this._holidays = data;
          this._recData = data.length + ' holidays found';
        }
      );
  }

  deleteHoliday(data: Holidays) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.HolidayName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
      },
      reject: () => {
        /* do nothing */
      }

    });
  }

  addHoliday() {
    this.router.navigate(['/menu/addholidays']);
  }


}
