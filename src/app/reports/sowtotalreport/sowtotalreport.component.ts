import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';
import { Table } from 'primeng/table';
import { SOWUtilizationReport, SOWDetails, SOW, SOWAnalysis } from 'src/app/model/objects';
import { TableExport } from 'tableexport';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-sowtotalreport',
  templateUrl: './sowtotalreport.component.html',
  styleUrls: ['./sowtotalreport.component.css']
})
export class SowtotalreportComponent implements OnInit {
  cols: any;
  _title = '';
  _recData = 0;
  showReport = false;
  showSpinner = false;

  ParamSubscribe: any;
  IsSecure = false;

  _DateFormat: any;
  _DisplayDateFormat: any;
  _DisplayDateTimeFormat: any;

  lstSOWAnalysis?: SOWAnalysis[];

  _SOWFilesPath: string;
  _queryParams: any;

  @ViewChild('dt') dt: Table;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    public commonSvc: CommonService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
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
  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.showSpinner = true;
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      this._queryParams = params;
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
    this.lstSOWAnalysis = [];
    this.cols = {};
    this._recData = 0;
    this.showReport = false;

    this.resetSort();
  }

  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this._DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat').toString();
    this.showReport = false;
    this._recData = 0;
    this.lstSOWAnalysis = [];
    this.cols = [
      { field: 'CustomerName', header: 'Customer', align: 'left', width: '150px' },
      { field: 'LeadBAName', header: 'Lead BA', align: 'left', width: '150px' },
      { field: 'SOWName', header: 'SOW Name', align: 'left', width: '150px' },
      { field: 'SOWNumber', header: 'SOW Number', align: 'left', width: '150px' },
      { field: 'EffectiveDate', header: 'Effective Date', align: 'center', width: '100px' },
      { field: 'ExpirationDate', header: 'Expiration Date', align: 'center', width: '100px' },
      { field: 'CurrencyType', header: 'Currency Type', align: 'center', width: '90px' },
      { field: 'TotalContractValue', header: 'Total Contract', align: 'right', width: '150px' },
      // { field: 'InvoiceFrequency', header: 'Invoice Frequency', align: 'left', width: 'auto' },
      { field: 'Hours', header: 'Total Hours', align: 'right', width: '100px' },
      // { field: 'Originate', header: 'Originate', align: 'left', width: '100px' },
      // { field: 'OpportunityType', header: 'Opportunity Type', align: 'left', width: '120px' },
      // { field: 'Status', header: 'Status', align: 'left', width: '150px' },
      // { field: 'SOWType', header: 'SOW Type', align: 'left', width: '60px' },
      // { field: 'Notes', header: 'Notes', align: 'left', width: 'auto' },
      // { field: 'SOWFileName', header: 'SOW File', align: 'center', width: 'auto' },
      { field: 'UtilizedHours', header: 'Utilized Hours', align: 'right', width: '100px' },
      // { field: 'RemainingHours', header: 'Remaining Hours', align: 'right', width: 'auto' },
      { field: 'UtilizationPercent', header: 'Utilization %', align: 'right', width: '80px' },
      // { field: 'TimeTaken', header: 'Time Taken', align: 'right', width: 'auto' },
      // { field: 'TimeRemaining', header: 'Time Remaining', align: 'right', width: 'auto' },
      // { field: 'ExpectedDays', header: 'Expected Days', align: 'right', width: 'auto' },
      // { field: 'Probability', header: 'Probability', align: 'right', width: '100px' },
    ];

    this._SOWFilesPath = environment.SOWFiles;

    this.generateReport();
  }

  generateReport() {
    this.showSpinner = true;
    this.showReport = false;
    this._recData = 0;
    this.lstSOWAnalysis = [];
    this.timesysSvc.GetSOWUtilizationReportTotal().subscribe((data) => {
      this.showTable(data);
    });
  }

  showTable(data: SOWUtilizationReport) {
    this.lstSOWAnalysis = [];
    if (data !== undefined && data !== null) {
      this.lstSOWAnalysis = data.lstSOWAnalysis;
      this.showReport = true;
    }
    this._recData = this.lstSOWAnalysis.length;
    this.showSpinner = false;
    this.resetSort();
  }

  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['CreatedOn'], []);
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }

  viewSOWUtilization(rowData: SOWAnalysis) {
    const routerLinkTimesheet = '/menu/sowdetailreport/' + rowData.SOWID;
    this.router.navigate([routerLinkTimesheet], { queryParams: this._queryParams, skipLocationChange: true });
  }

}
