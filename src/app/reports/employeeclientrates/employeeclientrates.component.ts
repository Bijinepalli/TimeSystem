import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Invoice, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { InvokeFunctionExpr } from '@angular/compiler';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-employeeclientrates',
  templateUrl: './employeeclientrates.component.html',
  styleUrls: ['./employeeclientrates.component.css'],
  providers: [DatePipe]
})
export class EmployeeclientratesComponent implements OnInit {

  _startDate: Date;
  _endDate: Date;

  _showAll = false;
  showReport = false;
  showSpinner = false;
  _invoice: Invoice;
  _billingCodesSpecial: BillingCodesSpecial;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  visibleHelp: boolean;
  helpText: string;

  ParamSubscribe: any;
  IsSecure = false;
  _HasEdit = true;

  _DisplayDateFormat = '';
  _DateFormat = '';

  @ViewChild('dt') dt: Table;

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
      this.IsSecure = false;
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
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1);
    this.showSpinner = false;
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this.resetSort();
    this._startDate = null;
    this._endDate = null;
    this._showAll = false;
    this.showReport = false;
    this._invoice = null;
    this._billingCodesSpecial = null;
    this._reports = [];
    this._recData = 0;
    this.cols = [];
    this.visibleHelp = false;
    this.helpText = '';
    this.showSpinner = false;
  }

  generateReport() {
    this.showSpinner = true;
    this.showReport = false;
    this.resetSort();
    this.buildCols();
    let _start = '';
    let _end = '';
    if (this._showAll === false) {
      if (this._startDate !== undefined && this._startDate !== null && this._startDate.toString() !== '') {
        _start = this.datePipe.transform(this._startDate, this._DateFormat);
      } else {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        _start = this.datePipe.transform(new Date(year, month - 1, 1), this._DateFormat);
      }
      if (this._endDate !== undefined && this._endDate !== null && this._endDate.toString() !== '') {
        _end = this.datePipe.transform(this._endDate, this._DateFormat);
      }
    }
    this._billingCodesSpecial = new BillingCodesSpecial();
    this._billingCodesSpecial.startDate = _start;
    this._billingCodesSpecial.endDate = _end;
    this.timesysSvc.ListEmployeeClientRates(this._billingCodesSpecial).subscribe(
      (data) => {
        this.showTable(data);
      }
    );
  }

  showTable(data: Invoice[]) {
    this._reports = [];
    this._recData = 0;
    this.showReport = false;
    if (data !== undefined && data !== null) {
      this._reports = data;
      this._recData = this._reports.length;
    }
    this.showReport = true;
    this.showSpinner = false;
  }

  buildCols() {
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '130px' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '130px' },
      { field: 'EmployeeID', header: 'Employee ID', align: 'right', width: '140px' },
      { field: 'ClientName', header: 'Client Name', align: 'left', width: 'auto' },
      { field: 'ClientID', header: 'Client ID', align: 'right', width: '120px' },
      { field: 'Rate', header: 'Rate', align: 'right', width: '85px' },
      { field: 'EffectiveDate', header: 'Effective Date', align: 'center', width: '150px' },
    ];
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
    this.commonSvc.customSortByCols(event, ['EffectiveDate'], ['Rate', 'EmployeeID', 'ClientID']);
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
}
