import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import {
  Holidays, Employee,
  TimeSheetBinding, TimeSheet, TimeLine, TimeCell, TimePeriods, TimeLineAndTimeCell, TimeSheetSubmit, TimeSheetForApproval, DateArray
} from '../model/objects';
import { YearEndCodes } from '../model/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { from } from 'rxjs';
import { OverlayPanelModule, OverlayPanel } from 'primeng/overlaypanel';
import { InputTextModule, Dropdown } from 'primeng/primeng';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { DISABLED } from '@angular/forms/src/model';
import { environment } from 'src/environments/environment';
import { wrapIntoObservable } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-maintaintimesheethourly',
  templateUrl: './maintaintimesheethourly.component.html',
  styleUrls: ['./maintaintimesheethourly.component.css'],
  providers: [DatePipe, DecimalPipe],
})
export class MaintaintimesheethourlyComponent implements OnInit {
  _timesheetPeriodEnd: any;
  _timesheetId: any;
  _actualTimeSheetId: any;
  _pageState: any;
  _periodEndDateString: any;
  _periodEndDateDisplay: string;
  _employee: Employee[] = [];
  _supervisor: Employee[] = [];
  _EmployeeName = '';
  _IsTimeSheetSubmitted = false;
  _IsTimeSheetSubmittedJustNow = false;
  _SubmittedOn = 'N/A';
  _Resubmittal = 'No';
  showSpinner = false;
  _timeSheetEntries: TimeSheet[] = [];
  _timeLineEntries: TimeLine[] = [];
  _timeNONbill: TimeLine[] = [];
  _timeProjBill: TimeLine[] = [];
  _timeTandM: TimeLine[] = [];
  _timeCellEntries: TimeCell[] = [];
  _submitMessage = '';
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private datePipe: DatePipe, private decimal: DecimalPipe) { }
  _errorMessage = '';
  _errorBlock = '';
  timeSheetForm = new FormGroup({});

  ngOnInit() {
    this._errorMessage = '';
    this.activatedRoute.params.subscribe((params) => {
      this._timesheetId = params['id'] === undefined ? -1 : params['id'];
      this._actualTimeSheetId = params['id'] === undefined ? -1 : params['id'];
      this._timesheetPeriodEnd = params['periodEnd'] === undefined ? -1 : params['periodEnd'];
      this._pageState = params['state'] === undefined ? '' : params['state'];
      if (+this._timesheetId.toString() < 0) {
        this._periodEndDateString = this._timesheetPeriodEnd;
        this._periodEndDateDisplay = this.datePipe.transform(this._timesheetPeriodEnd, 'MM-dd-yyyy');
      }
    });
    this.timeSheetForm.addControl('txtUserComments', new FormControl('', null));
    this.getTimesheetTimeLineTimeCellDetails();
    // this.getEmployeeDetails(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString());
  }
  Submit() {
    let timeSheetSubmit: TimeSheetSubmit;
    timeSheetSubmit = {};
    timeSheetSubmit.timeSheet = {};
    timeSheetSubmit.timeSheet.Id = this._timesheetId;
    timeSheetSubmit.timeSheet.PeriodEnd = this.datePipe.transform(this._periodEndDateString.toString(), 'yyyy-MM-dd');
    if (this.timeSheetForm.get('txtUserComments') !== undefined &&
      this.timeSheetForm.get('txtUserComments') !== null && this.timeSheetForm.get('txtUserComments').value !== null &&
      this.timeSheetForm.get('txtUserComments').value.toString() !== ''
    ) {
      timeSheetSubmit.timeSheet.Comments = this.timeSheetForm.get('txtUserComments').value.toString();
    } else {
      timeSheetSubmit.timeSheet.Comments = '';
    }
    console.log(this.timeSheetForm.get('txtUserComments').value + '-test');
    timeSheetSubmit.timeSheet.EmployeeId = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
    // tslint:disable-next-line:max-line-length
    if (this._employee !== undefined && this._employee[0].IsTimesheetVerficationNeeded && this._supervisor !== undefined && this._supervisor.length > 0) {
      timeSheetSubmit.timeSheet.Submitted = false;
      timeSheetSubmit.timeSheet.ApprovalStatus = '1';
    } else {
      timeSheetSubmit.timeSheet.Submitted = true;
    }
    if (this._timeSheetEntries.length > 0) {
      console.log(this._timeSheetEntries[0]);
      timeSheetSubmit.timeSheet.Resubmitted = this._timeSheetEntries[0].Resubmitted;
      // this.timesysSvc.timesheetUpdate(timeSheetSubmit.timeSheet).subscribe((dataNew) => {
      //   this._IsTimeSheetSubmittedJustNow = true;
      //   this._submitMessage = 'Your timesheet has been submitted';
      // });
    }
    this.timesysSvc.timeSheetInsert(timeSheetSubmit.timeSheet).subscribe((dataNew) => {
      this._IsTimeSheetSubmittedJustNow = true;
      this._submitMessage = 'Your timesheet has been submitted';
    });

  }
  getEmployeeDetails(EmployeeId: string) {
    this.timesysSvc.getEmployee(EmployeeId, '', '').subscribe(
      (dataEmp) => {
        if (dataEmp !== undefined && dataEmp !== null && dataEmp.length > 0) {
          this._employee = dataEmp;
          this._EmployeeName = this._employee[0].FirstName + ' ' + this._employee[0].LastName;
          if (this._employee[0].SupervisorId !== undefined && this._employee[0].SupervisorId > 0) {
            this.timesysSvc.getEmployee(this._employee[0].SupervisorId.toString(), '', '').subscribe((superEmp) => {
              this._supervisor = superEmp;
            });
          }
        }
      });
  }
  getTimesheetTimeLineTimeCellDetails() {
    this._errorMessage = '';
    this._employee = [];
    this.showSpinner = true;
    this._timeSheetEntries = [];
    this._timeLineEntries = [];
    this._timeCellEntries = [];

    this._timeNONbill = [];
    this._timeProjBill = [];
    this._timeTandM = [];

    this._IsTimeSheetSubmitted = false;
    if (this._timesheetId > 0) {
      this.timesysSvc.getTimesheetTimeLineTimeCellDetails(this._timesheetId.toString()).subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            if (data[0].length > 0) {
              this.getEmployeeDetails(data[0][0].EmployeeId.toString());
              this._timeSheetEntries = data[0];
              this._timeLineEntries = data[1];
              this._timeCellEntries = data[2];
              this._timeNONbill = this._timeLineEntries.filter(P => P.ChargeType === 'NONBILL');
              this._timeProjBill = this._timeLineEntries.filter(P => P.ChargeType === 'PROJBILL');
              this._timeTandM = this._timeLineEntries.filter(P => P.ChargeType === 'TANDM');
              if (this._timeSheetEntries !== undefined && this._timeSheetEntries !== null && this._timeSheetEntries.length > 0) {
                this._SubmittedOn = this._timeSheetEntries[0].SubmitDate !== '' ? (this._timeSheetEntries[0].SubmitDate) : 'N/A';
                this._Resubmittal = this._timeSheetEntries[0].Resubmitted === true ? 'Yes' : 'No';
                if (this._timeSheetEntries[0].Submitted) {
                  this._IsTimeSheetSubmitted = true;
                }
                this._periodEndDateString = this._timeSheetEntries[0].PeriodEnd;
                this._periodEndDateDisplay = this.datePipe.transform(this._timeSheetEntries[0].PeriodEnd, 'MM-dd-yyyy');
                // this.getPeriodDates(this._timeSheetEntries[0].PeriodEnd);
              }
            } else {
              this.showSpinner = false;
              this._errorMessage = 'Problem exists with this timesheet please contact administrator.<br/>';
            }
          } else {
            this.showSpinner = false;
            this._errorMessage = 'Problem exists with this timesheet please contact administrator.<br/>';
          }
          if (this._errorMessage !== '') {
            this._errorBlock = this._errorMessage;
          }
        });
    } else {
      this.getEmployeeDetails(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString());
    }
  }
}
