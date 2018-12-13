import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Holidays } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-maintaintimesheet',
  templateUrl: './maintaintimesheet.component.html',
  styleUrls: ['./maintaintimesheet.component.css']
})
export class MaintaintimesheetComponent implements OnInit {

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService) { }

  _peroidStartDate: Date = new Date('2018-11-01');
  _periodEnddate: Date = new Date('2018-11-15');
  _days = 0;
  _DateArray: Date[] = [];
  _weekArray: number[] = [];
  _tmpDt: any;
  _dt: number;
  ngOnInit() {
    this._days = this.calculateDate(this._peroidStartDate, this._periodEnddate);
    console.log('days in timesheet:' + this._days);
    console.log(this._peroidStartDate);
    this._tmpDt = new Date('2018-11-01');

    // this._DateArray.push(this._peroidStartDate);
    for (let i = 0; i < this._days - 1; i++) {
      this._dt = this._tmpDt.setDate(this._tmpDt.getDate() + 1);
      this._DateArray.push(new Date(this._dt));
      this._weekArray.push(new Date(this._dt).getDay());
    }

    console.log(this._peroidStartDate);
    console.log('dates array:' + this._DateArray.length);
  }

  private calculateDate(date1, date2) {
    // our custom function with two parameters, each for a selected date
    const diffc = date1.getTime() - date2.getTime();
    // getTime() function used to convert a date into milliseconds. This is needed in order to perform calculations.
    const days = Math.round(Math.abs(diffc / (1000 * 60 * 60 * 24)));
    // this is the actual equation that calculates the number of days.
    return days + 1;
  }


}
