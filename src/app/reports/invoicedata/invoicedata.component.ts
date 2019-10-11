import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, PageNames } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
import { ActivitylogService } from 'src/app/service/activitylog.service';

@Component({
  selector: 'app-invoicedata',
  templateUrl: './invoicedata.component.html',
  styleUrls: ['./invoicedata.component.css'],
  providers: [DatePipe]
})
export class InvoicedataComponent implements OnInit {

  _billingCycle: SelectItem[];
  _selectedBillingCycle: string;
  _invoiceDate: Date;
  _startDate: Date;
  _endDate: Date;
  showSpinner = false;
  showReport = false;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  _DisplayDateFormat = '';
  _DateFormat = '';

  ParamSubscribe: any;
  IsSecure = false;
  _HasEdit = true;
  @ViewChild('dt') dt: Table;
  _sortArray: string[];

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    public commonSvc: CommonService) {
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

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.InvoiceDatabyCustomer, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
  /* #endregion */

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          if (data[0].HasEdit) {
            this._HasEdit = false;
          }
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }


  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat');
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this.resetSort();
    this._billingCycle = [
      { label: 'Weekly', value: 'W' },
      { label: 'Bi-Weekly', value: 'B' },
      { label: 'Monthly', value: 'M' },
      { label: 'All', value: 'A' }
    ];
    this.cols = [
      { field: 'InvoiceDate', header: 'Invoice Date', align: 'center', width: '120px' },
      { field: 'DivisionNumber', header: 'Division #', align: 'right', width: '100px' },
      { field: 'CustomerNumber', header: 'Customer #', align: 'right', width: '100px' },
      { field: 'ProductCode', header: 'Product Code', align: 'left', width: '150px' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '75px' },
      { field: 'Rate', header: 'Rate', align: 'right', width: '75px' },
      { field: 'Amount', header: 'Amount', align: 'right', width: '100px' },
      { field: 'StartDate', header: 'Start Date', align: 'center', width: '100px' },
      { field: 'EndDate', header: 'End Date', align: 'center', width: '100px' },
      { field: 'ClientName', header: 'Description', align: 'left', width: '250px' },
      { field: 'PONumber', header: 'PO #', align: 'right', width: '120px' },
    ];
    // tslint:disable-next-line:max-line-length
    this._sortArray = ['InvoiceDateSearch', 'DivisionNumber', 'CustomerNumber', 'ProductCode', 'Hours', 'Rate', 'Amount', 'StartDateSearch', 'EndDateSearch', 'ClientName', 'PONumber'];
    this._selectedBillingCycle = 'A';

    const dateNow = new Date();
    this._invoiceDate = dateNow;
    this._startDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1);
    this._endDate = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0);
    this.showSpinner = false;
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this.resetSort();
    this._billingCycle = [];
    this._selectedBillingCycle = '';
    this._invoiceDate = null;
    this._startDate = null;
    this._endDate = null;
    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    this.cols = {};
    this.showSpinner = false;
  }

  generateReport() {
    this.showSpinner = true;
    this.resetSort();
    this.showReport = false;
    let selectedValue = '';
    let start = '';
    let end = '';
    let formattedStart = '';
    let formattedEnd = '';
    let invoicedate = '';

    const divisionId = this.commonSvc.getAppSettingsValue('EbixDivision');
    const productCode = this.commonSvc.getAppSettingsValue('EbixProductCode');
    if (this._invoiceDate !== undefined && this._invoiceDate !== null && this._invoiceDate.toString() !== '') {
      invoicedate = this.datePipe.transform(this._invoiceDate.toString(), this._DisplayDateFormat);
    }
    if (this._startDate !== undefined && this._startDate !== null && this._startDate.toString() !== '') {
      start = this.datePipe.transform(this._startDate.toString(), this._DisplayDateFormat);
      formattedStart = this.datePipe.transform(this._startDate.toString(), this._DateFormat);
    }
    if (this._endDate !== undefined && this._endDate !== null && this._endDate.toString() !== '') {
      end = this.datePipe.transform(this._endDate.toString(), this._DisplayDateFormat);
      formattedEnd = this.datePipe.transform(this._endDate.toString(), this._DateFormat);
    }
    if (!(this._selectedBillingCycle === 'A')) {
      selectedValue = this._selectedBillingCycle;
    }

    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      invoicedate: invoicedate,
      start: start,
      end: end,
      divisionId: divisionId,
      productCode: productCode,
      selectedValue: selectedValue,
      formattedStart: formattedStart,
      formattedEnd: formattedEnd
    }
    this.logSvc.ActionLog(PageNames.InvoiceDatabyCustomer, '', 'Reports/Event', 'generateReport', 'Generate Report', '', '', JSON.stringify(ActivityParams)); // ActivityLog

    this.timesysSvc
      .getInvoiceData(invoicedate, start, end, divisionId, productCode, selectedValue, formattedStart, formattedEnd)
      .subscribe(
        (data) => {
          this._reports = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this._recData = this._reports.length;
          }
          this.showReport = true;
          this.showSpinner = false;
        }
      );
  }


  startOver() {
    this.showSpinner = true;
    this.resetSort();
    this.showReport = false;
    this.showSpinner = false;
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['InvoiceDate', 'StartDate', 'EndDate'], ['Hours', 'Rate', 'Amount']);
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
}
