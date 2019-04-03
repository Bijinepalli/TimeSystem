import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { TimeSheet } from '../model/objects';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-outstandingtimesheets',
  templateUrl: './outstandingtimesheets.component.html',
  styleUrls: ['./outstandingtimesheets.component.css'],
  providers: [DatePipe, DecimalPipe],
})
export class OutstandingtimesheetsComponent implements OnInit {

  _DisplayDateFormat = '';
  _DisplayDateTimeFormat = '';

  _outStandings: TimeSheet[];
  cols: any;

  @ViewChild('dt') dt: Table;
  ParamSubscribe: any;
  showSpinner: boolean;
  IsSecure: boolean;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private decimal: DecimalPipe,
    private commonSvc: CommonService
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
    this._outStandings = [];
    this.resetSort();
    this.showSpinner = false;
  }

  Initialisations() {
    this.showSpinner = true;
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this._DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat');
    console.log('this._DisplayDateTimeFormat');
    console.log(this._DisplayDateTimeFormat);
    this.cols = [
      { field: 'PeriodEnd', header: 'Period Ending', align: 'center', width: 'auto' },
      { field: 'ApprovalStatus', header: 'Status', align: 'left', width: 'auto' },
      { field: 'TimeStamp', header: 'Created On', align: 'center', width: 'auto' },
    ];
    this.showSpinner = false;
    this.getOutStandingTimesheets();
  }

  getOutStandingTimesheets() {
    this.showSpinner = true;
    this.resetSort();
    this._outStandings = [];
    const numbers = this.commonSvc.getAppSettingsValue('UnsubmittedTimePeriods2');
    this.timesysSvc.getOutStandingTimesheets(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId'),
      numbers).subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._outStandings = data;
            console.log(this._outStandings);
          }
          this.showSpinner = false;
        });
  }

  editTimeSheet(timeSheet: TimeSheet) {
    // this.confSvc.confirm({
    //   message: 'Do you want to edit the timesheet?',
    //   accept: () => {
    if (timeSheet.Id < 0) {
      // sessionStorage.setItem(environment.buildType.toString() + '_' + 'PeriodEndDate', timeSheet.PeriodEnd);
      this.router.navigate(['/menu/maintaintimesheet/' + timeSheet.Id + '/' + timeSheet.PeriodEndDate], { skipLocationChange: true });
    } else {
      this.router.navigate(['/menu/maintaintimesheet/' + timeSheet.Id], { skipLocationChange: true });
    }
    // }
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
