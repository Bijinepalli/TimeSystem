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
import { ActivitylogService } from '../../service/activitylog.service'; // ActivityLog - Default

@Component({
  selector: 'app-billablehours',
  templateUrl: './billablehours.component.html',
  styleUrls: ['./billablehours.component.css'],
  providers: [DatePipe]
})
export class BillablehoursComponent implements OnInit {

  types: SelectItem[];
  selectedType: number;
  assignStatus: SelectItem[];
  selectedassignStatus: number;
  billingType: SelectItem[];
  selectedBillingType: number;
  showReport = false;
  showBillingCodeList = false;
  changeCodeList = false;
  _clients: Clients[];
  _projects: Projects[];
  _nonBillables: NonBillables[];
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  showSpinner = false;
  _codeCount: string;
  codes: SelectItem[];
  selectedCode: string;
  startDate: Date;
  endDate: Date;
  admin = false;
  _codeType: string;
  ParamSubscribe: any;
  _DateFormat: any;
  _DisplayDateFormat: any;
  IsSecure = false;
  _sortArray: string[];

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    public commonSvc: CommonService,
  ) {
    this.CheckActiveSession();
    this.commonSvc.setAppSettings();
  }

  @ViewChild('dt') dt: Table;

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
    this.logSvc.ActionLog(PageNames.BillableHoursbyBillingCodesorProject, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this.selectedType = 0;
    this.assignStatus = [];
    this.selectedassignStatus = 0;
    this.billingType = [];
    this.selectedBillingType = 0;
    this.showReport = false;
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this._clients = [];
    this._projects = [];
    this._nonBillables = [];
    this._reports = [];
    this._recData = 0;
    this.cols = {};
    this.showSpinner = false;
    this._codeCount = '';
    this.codes = [];
    this.selectedCode = '';
    this.startDate = null;
    this.endDate = null;
    this.admin = false;
    this._codeType = '';
    this.resetSort();
  }
  Initialisations() {
    this.showSpinner = true;
    this.resetSort();
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.types = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.assignStatus = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.billingType = [
      { label: 'Billing Code', value: 0 },
      { label: 'Project', value: 1 },
    ];
    this.cols = [
      { field: 'Name', header: 'Name', align: 'left', width: '15em' },
      { field: 'Key', header: 'Code', align: 'left', width: '10em' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '5em' },
      { field: 'InactiveRel', header: 'Currently Associated', align: 'center', width: '5em' },
      { field: 'CalendarDate', header: 'Date', align: 'center', width: '10em' },
      { field: 'LastName', header: 'Last Name', align: 'left', width: '15em' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '15em' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '10em' },
    ];
    this._sortArray = ['Name', 'Key', 'Inactive', 'InactiveRel', 'LastName', 'FirstName', 'Hours', 'CalendarDateSearch'];
    this.selectedType = 0;
    this.selectedBillingType = 0;
    this.selectedassignStatus = 0;
    this.admin = true; // check if role is admin
    this.showSpinner = false;
  }

  showBillingCodes() {
    this.showSpinner = true;

    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      selectedBillingType: this.selectedBillingType.toString(),
      selectedType: this.selectedType.toString(),
    }
    this.logSvc.ActionLog(PageNames.BillableHoursbyBillingCodesorProject, '', 'Reports/Event', 'showBillingCodes', 'Show Billing Codes', '', '', JSON.stringify(ActivityParams)); // ActivityLog

    this.codes = [];
    this.selectedCode = '';
    if (this.selectedBillingType === 0) {
      this.timesysSvc.getClients().subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            if (this.selectedType < 2) {
              data = data.filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
              if (data !== undefined && data !== null && data.length > 0) {
                this._clients = data;
              }
            } else {
              this._clients = data;
            }
          }
          for (let i = 0; i < this._clients.length; i++) {
            this.codes.push({ label: this._clients[i].ClientName, value: this._clients[i].Key });
          }
          this._codeCount = 'Select from ' + this._clients.length + ' matching Billing Codes';
          this.showBillingCodeList = true;
          this._codeType = 'Billing Codes';
          this.showSpinner = false;
        }
      );
    } else if (this.selectedBillingType === 1) {
      this.timesysSvc.getProjects('').subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            if (data[0] !== undefined && data[0] !== null && data[0].length > 0) {
              if (this.selectedType < 2) {
                this._projects = data[0].filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
              } else {
                this._projects = data[0];
              }
            }
          }
          for (let i = 0; i < this._projects.length; i++) {
            this.codes.push({ label: this._projects[i].ProjectName, value: this._projects[i].Key });
          }
          this._codeCount = 'Select from ' + this._projects.length + ' matching Projects';
          this.showBillingCodeList = true;
          this.showSpinner = false;
          this._codeType = 'Projects';
        }
      );
    }
  }

  generateReport() {
    this.showSpinner = true;

    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    let start = '';
    let end = '';
    if (this.startDate !== undefined && this.startDate !== null && this.startDate.toString() !== '') {
      start = this.datePipe.transform(this.startDate.toString(), 'MM-dd-yyyy');
    }
    if (this.endDate !== undefined && this.endDate !== null && this.endDate.toString() !== '') {
      end = this.datePipe.transform(this.endDate.toString(), 'MM-dd-yyyy');
    }

    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      selectedBillingType: this.selectedBillingType.toString(),
      selectedCode: this.selectedCode.toString(),
      selectedType: this.selectedType.toString(),
      selectedassignStatus: this.selectedassignStatus.toString(),
      start: start,
      end: end
    }
    this.logSvc.ActionLog(PageNames.BillableHoursbyBillingCodesorProject, '', 'Reports/Event', 'generateReport', 'Generate Report', '', '', JSON.stringify(ActivityParams)); // ActivityLog

    this.timesysSvc.getBillableHours(
      this.selectedBillingType.toString(),
      this.selectedCode.toString(),
      this.selectedType.toString(),
      this.selectedassignStatus.toString(),
      start,
      end)
      .subscribe(
        (data) => {
          this.showReport = false;
          this._reports = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this._recData = this._reports[0].RowCount;
            this.showReport = true;
          }
          this.showBillingCodeList = false;
          this.changeCodeList = true;
          this.showSpinner = false;
        });
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this.selectedassignStatus = 0;
    this.showSpinner = false;
    this.resetSort();
  }
  changeCodes() {
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
    this.resetSort();
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
}
