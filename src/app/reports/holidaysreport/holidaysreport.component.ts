import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { SelectItem } from 'primeng/api';
import { Holidays } from '../../model/objects';

@Component({
  selector: 'app-holidaysreport',
  templateUrl: './holidaysreport.component.html',
  styleUrls: ['./holidaysreport.component.css']
})
export class HolidaysreportComponent implements OnInit {

  _years; any;
  selectedYear: any;
  _holidayList: Holidays[] = [];
  _selectedHolidays: Holidays;
  _recData: any;
  cols: any;
  helpText: any;
  visibleHelp = false;

  constructor(private timesysSvc: TimesystemService) { }

  ngOnInit() {
    this.cols = [
      { field: 'CalendarYear', header: 'Year', align: 'center', width: '75px' },
      { field: 'CompanyName', header: 'Company Name', align: 'left', width: 'auto' },
      { field: 'HolidayName', header: 'Holiday Name', align: 'left', width: 'auto' },
      { field: 'HolidayDate', header: 'Holiday Date', align: 'center', width: '100px' },
    ];
    this.getHolidayYears();
  }
  getHolidayYears() {
    this._years = [];
    this._years.push({ label: 'All Years', value: 0 });
    this.timesysSvc.getHolidayYears()
      .subscribe(
        (data) => {
          for (let i = 0; i < data.length; i++) {
            this._years.push({ label: data[i].CalendarYear.toString(), value: data[i].CalendarYear.toString() });
          }
          const _date: Date = new Date();
          this.selectedYear = _date.getFullYear();
          this.getHolidays();
        }
      );
  }

  getHolidays() {
    let year = '';
    if (this.selectedYear.toString() !== '0') {
      year = this.selectedYear.toString();
    } else {
      year = '';
    }
    this.timesysSvc.getHolidayList(year)
      .subscribe(
        (data) => {
          this._holidayList = data;
          this._recData = data.length + ' holidays found';
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
}
