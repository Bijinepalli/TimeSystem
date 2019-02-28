import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BillingCodes } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SortEvent } from 'primeng/api';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-revenuereport',
  templateUrl: './revenuereport.component.html',
  styleUrls: ['./revenuereport.component.css'],
  providers: [DatePipe]
})
export class RevenuereportComponent implements OnInit {

  _revenueslist: BillingCodes[] = [];
  _startDateSelect: Date;
  _endDateSelect: Date;

  cols: any;
  _recData = 0;
  _revenuesPageNo: number;

  showReport = false;
  showSpinner = false;

  visibleHelp: boolean;
  helpText: string;

  _errorBlock = '';
  _errorMessage = '';

  _frm = new FormGroup({});
  _DateFormat: any;
  _DisplayDateFormat: any;
  ParamSubscribe: any;
  IsSecure = false;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private commonSvc: CommonService,
  ) {
    this.CheckActiveSession();
    this.commonSvc.setAppSettings();
  }

  CheckActiveSession() {
    let sessionActive = false;
    if (sessionStorage !== undefined && sessionStorage !== null && sessionStorage.length > 0) {
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null) {
        sessionActive = true;
      }
    }

    if (!sessionActive) {
      this.router.navigate(['/access'], { queryParams: { Message: 'Session Expired' } }); // Session Expired
    }
  }
  /* #endregion*/

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.showSpinner = true;
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
    this.showSpinner = false;
  }
  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }
  ClearAllProperties() {
    this._revenueslist = [];
    this._startDateSelect = null;
    this._endDateSelect = null;

    this.cols = {};
    this._recData = 0;
    this._revenuesPageNo = 0;

    this.showReport = false;
    this.showSpinner = false;

    this.visibleHelp = false;
    this.helpText = '';

    this._errorBlock = '';
    this._errorMessage = '';
  }

  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.cols = [
      { field: 'Name', header: 'Client Name', align: 'left', width: 'auto' },
      { field: 'PeriodEnd', header: 'Period End', align: 'left', width: '150px' },
      { field: 'Hours', header: 'T & M Hours', align: 'right', width: '140px' },
    ];
    this.addControls();
    this.showSpinner = false;
  }

  addControls() {
    this._frm = new FormGroup({});
    this._frm.addControl('_startDateSelect', new FormControl(null, Validators.required));
    this._frm.addControl('_endDateSelect', new FormControl(null, Validators.required));
  }

  hasFormErrors() {
    return !this._frm.valid;
  }

  resetForm() {
    this._frm.markAsPristine();
    this._frm.markAsUntouched();
    this._frm.updateValueAndValidity();
    this._frm.reset();
  }

  get currentFormControls() {
    return this._frm.controls;
  }
  showRevenueReport() {
    this.showSpinner = true;
    this.clearControls();
    let startDate = this._frm.controls['_startDateSelect'].value.toString().trim();
    startDate = this.datePipe.transform(new Date(startDate), 'yyyy-MM-dd');
    let endDate = this._frm.controls['_endDateSelect'].value.toString().trim();
    endDate = this.datePipe.transform(new Date(endDate), 'yyyy-MM-dd');

    this.timesysSvc.getRevenueReports(startDate, endDate)
      .subscribe(
        (outputData) => {
          this.showReport = true;
          this._revenueslist = [];
          this._recData = 0;
          if (outputData !== undefined && outputData !== null && outputData.length > 0) {
            this._revenueslist = outputData;
            this._recData = this._revenueslist.length;
          }
          this.showSpinner = false;
        });
  }

  clearControls() {
    this._errorBlock = '';
    this._errorMessage = '';
    this._revenueslist = [];
    this._recData = 0;
    this._revenuesPageNo = 0;
  }

  startOver() {
    this.showReport = false;
    this.clearControls();
    this.resetForm();
  }

  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['PeriodEnd'], ['Hours']);
  }

}
