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
  selectTimePeriod: number;
  selectTimePeriodDate: string;
  selectNewTimePeriod: number;
  _selectedTimesheet: TimeSheet;
  constructor(private timesysSvc: TimesystemService, private router: Router
    , private msgSvc: MessageService, private confSvc: ConfirmationService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.getTimeSheetPeriods();
  }
  getTimeSheetPeriods() {
    // console.log(localStorage.getItem('HireDate'));
    this.timesysSvc.getTimeSheetAfterDateDetails(localStorage.getItem('UserId'), localStorage.getItem('HireDate')).subscribe(
      (data1) => {
        console.log(JSON.stringify(data1));
        this._timePeriods = data1;
        this.selectTimePeriod = this._timePeriods[0].value;
        this.selectTimePeriodDate = this._timePeriods[0].code;
      }
    );
  }
  CreateTS() {
    if (this.selectTimePeriod > 0) {
      this.timesysSvc.getTimeSheetDetails(this.selectTimePeriod.toString()).subscribe(
        (data) => {
          console.log(data);
          this._timesheets = data;
          this.timesysSvc.getTimeSheetForApprovalCheck(localStorage.getItem('UserId')).subscribe(
            (data1) => {
              console.log(data1);
              this._timesheetApproval = data1.filter(P => P.PeriodEnd === this._timesheets[0].PeriodEnd && P.Status === 'P');
              if (this._timesheetApproval.length > 0) {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: '',
                  detail: 'A timesheet already has been submitted for this period and waiting for approval.',
                });
              } else {
                this.confSvc.confirm({
                  message: 'A timesheet already has been submitted for this period.' +
                    'This will be a resubmittal. Do you want to continue?',
                  accept: () => {
                    console.log(this.selectTimePeriod);
                    this.resubmittal();
                  }
                });
              }
            }
          );
        }
      );
    } else {
      // tslint:disable-next-line:max-line-length
      this.router.navigate(['/menu/maintaintimesheet/' + this.selectTimePeriod + '/' + this.selectTimePeriodDate]);
    }
  }
  resubmittal() {
    this.timesysSvc.getTimeSheetDetails(this.selectTimePeriod.toString()).subscribe(
      (data) => {
        this.timesysSvc.getUnSubmittedTimeSheetDetails(localStorage.getItem('UserId'), data[0].PeriodEnd).subscribe(
          (data1) => {
            if (data1.length > 0) {
              this.selectNewTimePeriod = data1[0].Id;
              this.router.navigate(['/menu/maintaintimesheet/' + this.selectNewTimePeriod]);
            } else {
              this._selectedTimesheet = new TimeSheet();
              this._selectedTimesheet.Id = this.selectTimePeriod;
              this._selectedTimesheet.TimeStamp = this.datePipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss');
              this.timesysSvc.timesheetCopyInsert(this._selectedTimesheet).subscribe(
                (data2) => {
                  this.selectNewTimePeriod = data2;
                  this.router.navigate(['/menu/maintaintimesheet/' + this.selectNewTimePeriod]);
                });
            }
          });
      });
  }
  onReject() {
    this.msgSvc.clear('alert');
  }
  ConfirmTS() {
    this.CreateTS();
  }
}
