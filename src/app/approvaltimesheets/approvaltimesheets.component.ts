import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { TimeSheet, TimeSheetForApproval } from '../model/objects';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-approvaltimesheets',
  templateUrl: './approvaltimesheets.component.html',
  styleUrls: ['./approvaltimesheets.component.css'],
  providers: [DatePipe, DecimalPipe],
})
export class ApprovaltimesheetsComponent implements OnInit {

  _DisplayDateFormat = '';
  _DisplayDateTimeFormat = '';

  _approvals: TimeSheetForApproval[];
  cols: any;

  @ViewChild('dt') dt: Table;
  ParamSubscribe: any;
  showSpinner: boolean;
  IsSecure: boolean;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private decimal: DecimalPipe,
    public commonSvc: CommonService
  ) {
  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }
  ngOnInit() {
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      this.IsSecure = false;
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
  }

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.ClearAllProperties();
    this.IsSecure = true;
    this.showSpinner = false;
    this.Initialisations();
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this.cols = [];
    this._approvals = [];
    this.resetSort();
    this.showSpinner = false;
  }

  Initialisations() {
    this.showSpinner = true;
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this._DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat');
    this.cols = [
      { field: 'PeriodEnd', header: 'Period Ending', align: 'center', width: 'auto' },
      { field: 'EmployeeName', header: 'Employee Name', align: 'left', width: 'auto' },
      { field: 'CreatedOn', header: 'Created On', align: 'center', width: 'auto' },
    ];
    this.showSpinner = false;
    this.getTimesheetForApproval();
  }

  getTimesheetForApproval() {
    this.showSpinner = true;
    this.resetSort();
    this._approvals = [];
    this.timesysSvc.getTimeSheetForApprovalGet(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId')).subscribe(
      (data) => {
        if (data !== undefined && data !== null && data.length > 0) {
          this._approvals = data;
        }
        this.showSpinner = false;
      });
  }

  approveTimeSheet(timeSheet: TimeSheetForApproval) {
    // this.confSvc.confirm({
    //   message: 'Do you want to approve the timesheet?',
    //   accept: () => {
    // tslint:disable-next-line:max-line-length
    this.router.navigate(['/menu/maintaintimesheet/' + timeSheet.TimesheetId + '/' + timeSheet.Id + '/' + 'A'], { skipLocationChange: true });
    // this.router.navigate(['menu/maintaintimesheet'],
    //   { queryParams: { 'id': timeSheet.TimesheetId, 'state': 'A' }, skipLocationChange: true });
    //   }
    // });
  }

  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['PeriodEnd', 'CreatedOn'], []);
  }

  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }

}
