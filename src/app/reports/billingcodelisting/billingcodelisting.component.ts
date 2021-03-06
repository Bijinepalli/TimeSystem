import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';
import { Table } from 'primeng/table';
import { ActivitylogService } from '../../service/activitylog.service'; // ActivityLog - Default
import { PageNames } from 'src/app/model/objects';

@Component({
  selector: 'app-billingcodelisting',
  templateUrl: './billingcodelisting.component.html',
  styleUrls: ['./billingcodelisting.component.css']
})
export class BillingcodelistingComponent implements OnInit {

  types: SelectItem[];
  billingType: SelectItem[];
  selectedType: number;
  selectedBillingType: number;

  _reports: any[] = [];
  cols: any;

  _recData: any;
  showReport = false;
  showSpinner = false;
  ParamSubscribe: any;
  IsSecure = false;

  _DateFormat: any;
  _DisplayDateFormat: any;
  _sortArray = [];
  @ViewChild('dt') dt: Table;

  _DisplayDateTimeFormat: any;
  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    public commonSvc: CommonService,
    private route: ActivatedRoute,
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
    this.logSvc.ActionLog(PageNames.ListBillingCodes, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this.types = [];
    this.billingType = [];
    this.selectedType = 0;
    this.selectedBillingType = 0;
    this._reports = [];
    this.cols = {};
    this._recData = '';
    this.showReport = false;
    this.resetSort();
  }

  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this._DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat').toString();
    this.types = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.billingType = [
      { label: 'Billing Code', value: 0 },
      { label: 'Project', value: 1 },
      { label: 'Non-Billable', value: 2 }
    ];
    this.selectedType = 0;
    this.selectedBillingType = 0;
    this._reports = [];
    this.showReport = false;
    this.generateReport();
  }



  generateReport() {
    this.showSpinner = true;
    let mode = null;

    this._reports = [];
    this.setCols(this.selectedBillingType.toString());
    this.showReport = false;
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      selectedBillingType: this.selectedBillingType.toString(),
      selectedType: this.selectedType.toString(),
    }
    this.logSvc.ActionLog(PageNames.ListBillingCodes, '', 'Reports/Event', 'generateReport', 'Generate Report', '',
     '', JSON.stringify(ActivityParams)); // ActivityLog
    if (this.selectedType.toString() === '2') {
      mode = '';
    } else {
      mode = this.selectedType.toString();
    }
    switch (this.selectedBillingType.toString()) {
      case '0':
        this.timesysSvc.listAllClientItems(mode).subscribe(
          (data) => {
            this.showTable(data);
          });
        break;
      case '1':
        this.timesysSvc.listAllProjectData(mode).subscribe(
          (data) => {
            this.showTable(data);
          });
        break;
      case '2':
        this.timesysSvc.listAllBillingItems(mode).subscribe(
          (data) => {
            this.showTable(data);
          });
        break;
    }
  }
  showTable(data: any) {
    this._reports = [];
    if (data !== undefined && data !== null
      && data.length > 0) {
      this._reports = data;
      this.showReport = true;
    }
    this._recData = this._reports.length;
    this.showSpinner = false;
    this.resetSort();
  }

  setCols(type: string) {
    this.cols = [];
    if (type === '0') {
      this.cols = [
        /*{ field: 'Key', header: 'Code', align: 'left', width: '200px' },
        { field: 'ClientName', header: 'Name', align: 'left', width: 'auto' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '150px' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '250px' },
        { field: 'BillingCycle', header: 'Billing Cycle', align: 'center', width: '150px' },
        { field: 'CompanyName', header: 'Company Name', align: 'left', width: '250px' },*/
        { field: 'Key', header: 'Code', align: 'left', width: '20em' },
        { field: 'ClientName', header: 'Name', align: 'left', width: '25em' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '10em' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '12em' },
        { field: 'BillingCycle', header: 'Billing Cycle', align: 'center', width: '10em' },
        { field: 'CompanyName', header: 'Company Name', align: 'left', width: '15em' },
      ];
    } else if (type === '1') {
      this.cols = [
        { field: 'Key', header: 'Code', align: 'left', width: '20em' },
        { field: 'ProjectName', header: 'Name', align: 'left', width: '30em' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '15em' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '15em' },
        { field: 'CompanyName', header: 'Company Name', align: 'left', width: '20em' },
      ];
    } else if (type === '2') {
      this.cols = [
        { field: 'Key', header: 'Code', align: 'left', width: '20em' },
        { field: 'ProjectName', header: 'Name', align: 'left', width: '40em' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '10em' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '15em' },
      ];
    }
    this._sortArray = ['Key', 'ClientName', 'Inactive', 'CreatedOnSearch', 'BillingCycle', 'CompanyName', 'ProjectName'];
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

}
