import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { TimeSheetForEmplyoee } from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.css']
})
export class TimesheetsComponent implements OnInit {
  _timeSheets: TimeSheetForEmplyoee[];
  selectedValues: Boolean;
  cols: any[];
  constructor(private timesysSvc: TimesystemService, private router: Router
    , private msgSvc: MessageService, private confSvc: ConfirmationService) { }

  ngOnInit() {
    this.cols = [
      { field: 'PeriodEnd', header: 'PeriodEnd' },
      { field: 'Submitted', header: 'Holiday Name' },
      { field: 'SubmitDate', header: 'Date Submitted' },
      { field: 'Resubmitted', header: 'Resubmitted' },
      { field: 'SemiMonthly', header: 'Semi-Monthly' },
      { field: 'Hours', header: 'Hours' },
      { field: 'ApprovalStatus', header: 'Approval Status' },
    ];
    this.getTimeSheets();
  }
  getTimeSheets() {
    if (this.selectedValues) {
      this.timesysSvc.getEmployeeTimeSheetList((localStorage.getItem('UserId')), '1')
        .subscribe(
          (data) => {
            this._timeSheets = data;
          }
        );
    } else {
      this.timesysSvc.getEmployeeTimeSheetList((localStorage.getItem('UserId')), '0')
        .subscribe(
          (data) => {
            this._timeSheets = data;
          }
        );
    }

  }
  ShowAllTimesheets() {
    console.log(this.selectedValues);
    this.getTimeSheets();
  }
  addTimesheet() {
    this.router.navigate(['/menu/selecttimesheetperiod']);
  }
  OpenHoursCharged() {

  }
}
