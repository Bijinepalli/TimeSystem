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
  _recData: string;
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
    const Mode = this.selectedValues ? '1' : '0';
    this.timesysSvc.getEmployeeTimeSheetList((localStorage.getItem('UserId')), Mode)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._timeSheets = data;
            this._recData = this._timeSheets.length + ' records found';
          } else {
            this._timeSheets = [];
            this._recData = 'No records found';
          }
        }
      );
  }
  ShowAllTimesheets() {
    this.getTimeSheets();
  }
  addTimesheet() {
    this.router.navigate(['/menu/selecttimesheetperiod']);
  }
  OpenHoursCharged() {

  }
  viewTimeSheet(rowData: TimeSheetForEmplyoee) {
    this.router.navigate(['/menu/maintaintimesheet/' + rowData.Id]);
  }
  editTimeSheet(rowData: TimeSheetForEmplyoee) {
    this.confSvc.confirm({
      message: 'Do you want to edit the timesheet?',
      accept: () => {
        this.router.navigate(['/menu/maintaintimesheet/' + rowData.Id]);
      }
    });
  }
  deleteTimeSheet(rowData: TimeSheetForEmplyoee) {
    this.confSvc.confirm({
      message: 'Do you want to delete the timesheet?',
      accept: () => {
        this.getTimeSheets();
      }
    });
  }
}
