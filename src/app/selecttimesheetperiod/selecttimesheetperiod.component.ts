import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { TimeSheetForEmplyoee, TimePeriods, TimeSheet, TimeSheetBinding, TimeSheetForApproval } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DateTimeFormatPipe } from '../sharedpipes/dateformat';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-selecttimesheetperiod',
  templateUrl: './selecttimesheetperiod.component.html',
  styleUrls: ['./selecttimesheetperiod.component.css'],
  providers: [DatePipe],
})
export class SelecttimesheetperiodComponent implements OnInit {
  _periodEndAsc: TimePeriods[];
  _periodEndDesc: TimePeriods[];
  _periodEndPast: TimePeriods[];
  _dates: Date[];
  _timePeriods: TimeSheetBinding[];
  _timesheets: TimeSheet[];
  _timesheetApproval: TimeSheetForApproval[];
  selectTimePeriod: string;
  showConfirm = false;
  constructor(private timesysSvc: TimesystemService, private router: Router
    , private msgSvc: MessageService, private confSvc: ConfirmationService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.getTimeSheetPeriods();
  }
  getTimeSheetPeriods() {
    console.log(localStorage.getItem('HireDate'));
    this.timesysSvc.getTimeSheetAfterDateDetails(localStorage.getItem('UserId'), localStorage.getItem('HireDate')).subscribe(
      (data1) => {
        this._timePeriods = data1;
        this.selectTimePeriod = this._timePeriods[0].value.toString();
      }
    );
  }
  CreateTS() {
    this.timesysSvc.getTimeSheetDetails(this.selectTimePeriod).subscribe(
      (data) => {
        console.log(data);
        this._timesheets = data;
        this.timesysSvc.getTimeSheetForApprovalCheck(localStorage.getItem('UserId')).subscribe(
          (data1) => {
            console.log(data1);
            this._timesheetApproval = data1.filter(P => P.PeriodEnd === this._timesheets[0].PeriodEnd && P.Status === 'P');
            console.log(this._timesheets[0].PeriodEnd);
            if (this._timesheetApproval.length > 0) {
              this.msgSvc.add({
                key: 'alert',
                sticky: true,
                severity: 'error',
                summary: 'Login Failed!',
                detail: 'A timesheet already has been submitted for this period and waiting for approval.',
              });
              this.showConfirm = false;
            } else {
              this.showConfirm = true;
            }
          }
        );
      }
    );
  }
  onReject() {
    this.msgSvc.clear('alert');
  }
  ConfirmTS() {
    this.CreateTS();
  }
}
