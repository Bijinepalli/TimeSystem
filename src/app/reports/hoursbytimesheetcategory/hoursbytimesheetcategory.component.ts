import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { BillingCodes, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-hoursbytimesheetcategory',
  templateUrl: './hoursbytimesheetcategory.component.html',
  styleUrls: ['./hoursbytimesheetcategory.component.css'],
  providers: [DatePipe]
})
export class HoursbytimesheetcategoryComponent implements OnInit {
  _startDate = '';
  _endDate = '';
  _storeDate = '';
  showReport = false;
  showSpinner = false;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  _billingCodesSpecial: BillingCodesSpecial;
  showTotals = false;
  showTotalsonGenerate = false;
  DisplayDateFormat = '';
  ParamSubscribe: any;
  IsSecure = false;

  @ViewChild('dt') dt: Table;
  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    public commonSvc: CommonService,
    private datePipe: DatePipe
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
    this.showSpinner = true;
    this.resetSort();
    this._startDate = '';
    this._endDate = '';
    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    this.cols = {};
    this._billingCodesSpecial = new BillingCodesSpecial();
    this.showTotals = false;
    this.showTotalsonGenerate = false;
    this.showSpinner = false;
  }
  Initialisations() {
    this.DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    console.log(this._startDate);
    this._startDate = this.datePipe.transform(this._startDate, this.DisplayDateFormat);
    this._endDate = '';
  }
  generateReport() {
    this.showSpinner = true;
    this.resetSort();
    this.buildCols();
    // if (this.showAll === false) {
    this._billingCodesSpecial = new BillingCodesSpecial();
    let _start = '';
    let _end = '';

    const date = Date.parse(this._startDate);
    if (Number.isNaN(date)) {
      const today = new Date();
      const month = today.getMonth();
      const year = today.getFullYear();
      this._storeDate = new Date(year, month - 1, 1).toString();
      console.log(this._storeDate);
    } else {
      this._storeDate = this._startDate;
    }
    if (this._storeDate !== null && this._storeDate !== '') {
      _start = this.datePipe.transform(this._storeDate, 'yyyy-MM-dd');
      this._startDate = this.datePipe.transform(this._storeDate, this.DisplayDateFormat);
    }
    if (this._endDate !== null && this._endDate !== '') {
      _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
      this._endDate = this.datePipe.transform(this._endDate, this.DisplayDateFormat);
    }
    this._billingCodesSpecial.startDate = _start;
    this._billingCodesSpecial.endDate = _end;
    this._billingCodesSpecial.includeTotals = this.showTotals === true ? 1 : 0;
    this.showTotalsonGenerate = this.showTotals === true ? true : false;
    // }
    // else {
    //   this._billingCodesSpecial.startDate = '';
    //   this._billingCodesSpecial.endDate = '';
    // }
    this.timesysSvc.ListEmployeeHoursByTimeSheetCategory(this._billingCodesSpecial).subscribe(
      (data) => {
        this.showTable(data);
      }
    );
  }
  showTable(data: BillingCodes[]) {
    this._reports = [];
    this._recData = 0;
    if (data !== undefined && data !== null) {
      this._reports = data;
      this._recData = this._reports.length;
    }
    this.showReport = true;
    this.showSpinner = false;
  }
  buildCols() {
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '200px' },
      { field: 'BillingName', header: 'Billing Code', align: 'left', width: 'auto' },
      { field: 'TANDM', header: 'T & M', align: 'right', width: '100px' },
      { field: 'Project', header: 'Project', align: 'right', width: '101px' },
      { field: 'NonBill', header: 'NonBillable', align: 'right', width: '133px' },
    ];
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, [], ['TANDM', 'Project', 'NonBill']);
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
}
