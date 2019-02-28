import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-invoicedata',
  templateUrl: './invoicedata.component.html',
  styleUrls: ['./invoicedata.component.css'],
  providers: [DatePipe]
})
export class InvoicedataComponent implements OnInit {

  _billingCycle: SelectItem[];
  _selectedBillingCycle: string;
  _invoiceDate: any;
  _startDate: any;
  _endDate: any;
  showInvoiceList = false;
  showSpinner = false;
  showReport = false;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  visibleHelp: boolean;
  helpText: string;
  DisplayDateFormat = '';

  ParamSubscribe: any;
  IsSecure = false;
  _HasEdit = true;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    private commonSvc: CommonService) {
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
    this.DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
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
    this.Initialisations();
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
      { field: 'Amount', header: 'Amount', align: 'right', width: '80px' },
      { field: 'StartDate', header: 'Start Date', align: 'center', width: '100px' },
      { field: 'EndDate', header: 'End Date', align: 'center', width: '100px' },
      { field: 'ClientName', header: 'Description', align: 'left', width: 'auto' },
      { field: 'PONumber', header: 'PO #', align: 'right', width: '100px' },
    ];
    this._selectedBillingCycle = 'A';

    const dateNow = new Date();
    const end = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0);
    const start = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1);
    this._invoiceDate = dateNow;
    this._startDate = start;
    this._endDate = end;
  }

  ClearAllProperties() {
    this._billingCycle = [];
    this._selectedBillingCycle = '';
    this._invoiceDate = '';
    this._startDate = '';
    this._endDate = '';
    this.showInvoiceList = false;
    this.showSpinner = false;
    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    this.cols = {};
    this.visibleHelp = false;
    this.helpText = '';
  }

  generateReport() {
    this.showSpinner = true;
    this.showReport = false;
    let selectedValue = '';
    let start = '';
    let end = '';
    let formattedStart = '';
    let formattedEnd = '';
    let invoicedate = '';

    const divisionId = this.commonSvc.getAppSettingsValue('EbixDivision');
    const productCode = this.commonSvc.getAppSettingsValue('EbixProductCode');
    const DateFormat = this.commonSvc.getAppSettingsValue('DateFormat');
    const DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    if (this._invoiceDate !== undefined && this._invoiceDate !== null && this._invoiceDate.toString() !== '') {
      invoicedate = this.datePipe.transform(this._invoiceDate.toString(), DisplayDateFormat);
    }
    if (this._startDate !== undefined && this._startDate !== null && this._startDate.toString() !== '') {
      start = this.datePipe.transform(this._startDate.toString(), DisplayDateFormat);
      formattedStart = this.datePipe.transform(this._startDate.toString(), DateFormat);
    }
    if (this._endDate !== undefined && this._endDate !== null && this._endDate.toString() !== '') {
      end = this.datePipe.transform(this._endDate.toString(), DisplayDateFormat);
      formattedEnd = this.datePipe.transform(this._endDate.toString(), DateFormat);
    }
    if (!(this._selectedBillingCycle === 'A')) {
      selectedValue = this._selectedBillingCycle;
    }
    this.timesysSvc
      .getInvoiceData(invoicedate, start, end, divisionId, productCode, selectedValue, formattedStart, formattedEnd)
      .subscribe(
        (data) => {
          this._reports = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this._recData = this._reports.length;
            this.showReport = true;
          }
          this.showInvoiceList = true;
          this.showSpinner = false;
        }
      );
  }


  startOver() {
    this.showInvoiceList = false;
    this.showReport = false;
    this.showSpinner = false;
  }

  showHelp(file: string) {
    this.timesysSvc.getHelp(file)
      .subscribe(
        (data) => {
          // this.helpText = data;
          this.visibleHelp = true;
          const parser = new DOMParser();
          const parsedHtml = parser.parseFromString(data, 'text/html');
          this.helpText = parsedHtml.getElementsByTagName('body')[0].innerHTML;
        }
      );
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['InvoiceDate', 'StartDate', 'EndDate'], ['Hours', 'Rate', 'Amount']);
  }
}
