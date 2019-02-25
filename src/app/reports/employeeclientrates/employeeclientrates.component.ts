import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Invoice, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { InvokeFunctionExpr } from '@angular/compiler';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-employeeclientrates',
  templateUrl: './employeeclientrates.component.html',
  styleUrls: ['./employeeclientrates.component.css'],
  providers: [DatePipe]
})
export class EmployeeclientratesComponent implements OnInit {
  _startDate = '';
  _endDate = '';
  showAll = false;
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
    this.showSpinner = true;
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
  }
  ClearAllProperties() {
    this._startDate = '';
    this._reports = [];
    this.showReport = false;
  }

  generateReport() {
    this.showSpinner = true;
    this.buildCols();
    this._billingCodesSpecial = new BillingCodesSpecial();
    if (this.showAll === false) {
      let _start = '';
      let _end = '';

      if (this._startDate !== null && this._startDate !== '') {
        _start = this.datePipe.transform(this._startDate, 'yyyy-MM-dd');
        this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
      }
      if (this._endDate !== null && this._endDate !== '') {
        _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
        this._endDate = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
      }
      this._billingCodesSpecial.startDate = _start;
      this._billingCodesSpecial.endDate = _end;
    } else {
      this._billingCodesSpecial.startDate = '';
      this._billingCodesSpecial.endDate = '';
    }
    this.timesysSvc.ListEmployeeClientRates(this._billingCodesSpecial).subscribe(
      (data) => {
        this.showTable(data);
      }
    );
  }

  showTable(data: Invoice[]) {
    if (data !== undefined && data !== null) {
      this._reports = data;
      this._recData = this._reports.length;
    } else {
      this._reports = [];
      this._recData = 0;
      this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No matching data for the selected criteria' });
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
}
