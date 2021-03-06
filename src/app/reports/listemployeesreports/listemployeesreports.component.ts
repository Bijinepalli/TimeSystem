import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, ViewChild } from '@angular/core';
import { SelectItem, SortEvent } from 'primeng/api';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Employee, NonBillables, Projects, Clients, PageNames } from '../../model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
import { ActivitylogService } from 'src/app/service/activitylog.service';

@Component({
  selector: 'app-listemployeesreports',
  templateUrl: './listemployeesreports.component.html',
  styleUrls: ['./listemployeesreports.component.css'],
  providers: [DatePipe]
})
export class ListemployeesreportsComponent implements OnInit {
  _status: SelectItem[];
  _paid: SelectItem[];
  _Ipay: SelectItem[];
  _timesheets: SelectItem[];
  _holidays: SelectItem[];
  _statusselected: string;
  _paidselected: string;
  _Ipayselected: string;
  _timesheetsselected: string;
  _holidaysselected: string;
  _headerLabels: any[];
  _defaultselected: any[];
  selectedColumns: any[];
  _listEmployeesForReport: Employee[];
  cols: any;
  _recData: any;
  _endDate: Date;
  _startDate: Date;
  _DateFormat = '';
  _DisplayDateFormat = '';

  showSpinner = false;
  ParamSubscribe: any;
  IsSecure = false;
  _HasEdit = true;
  showReport: boolean;
  @ViewChild('dt') dt: Table;
  _sortArray: string[];

  constructor(private timesysSvc: TimesystemService,
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
    this.logSvc.ActionLog(PageNames.ListEmployees, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this.resetSort();
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat');
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this._startDate = null;
    this._endDate = null;
    this._status = [
      { label: 'Active', value: '0' },
      { label: 'Inactive', value: '1' },
      { label: 'Both', value: '' }
    ];
    this._paid = [
      { label: 'Salary', value: '1' },
      { label: 'Hourly', value: '0' },
      { label: 'Both', value: '' }
    ];
    this._Ipay = [
      { label: 'Eligible', value: '1' },
      { label: 'Ineligible', value: '0' },
      { label: 'Both', value: '' }
    ];
    this._timesheets = [
      { label: 'Submits', value: '1' },
      { label: 'Exempt', value: '0' },
      { label: 'Both', value: '' }
    ];
    this._holidays = [
      { label: 'Vertex', value: '1' },
      { label: 'Billing Code', value: '0' },
      { label: 'Both', value: '' }
    ];

    this._statusselected = '0';
    this._paidselected = '';
    this._Ipayselected = '';
    this._timesheetsselected = '';
    this._holidaysselected = '';

    this._headerLabels = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '147px' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '134px' },
      { field: 'NickName', header: 'Nick Name', align: 'left', width: '120px' },
      { field: 'PayRoleID', header: 'Payroll ID', align: 'left', width: '100px' },
      { field: 'EmailAddress', header: 'Email Address', align: 'left', width: '300px' },
      { field: 'LoginID', header: 'Login ID', align: 'left', width: '189px' },
      { field: 'HireDate', header: 'Hire Date', align: 'center', width: '100px' },
      { field: 'UserLevel', header: 'Security', align: 'center', width: '75px' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '75px' },
      { field: 'Salaried', header: 'Salaried', align: 'center', width: '75px' },
      { field: 'IPayEligible', header: 'IPay', align: 'center', width: '50px' },
      { field: 'SubmitsTime', header: 'Submits Time', align: 'center', width: '100px' },
      { field: 'CompanyHolidays', header: 'Vertex Holidays', align: 'center', width: '135px' }
    ];
    this._defaultselected = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '147px' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '134px' },
      { field: 'PayRoleID', header: 'Payroll ID', align: 'left', width: '100px' },
      { field: 'LoginID', header: 'Login ID', align: 'left', width: '189px' },
      { field: 'HireDate', header: 'Hire Date', align: 'center', width: '100px' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '75px' },
      { field: 'Salaried', header: 'Salaried', align: 'center', width: '75px' },
    ];
    // tslint:disable-next-line:max-line-length
    this._sortArray = ['LastName', 'FirstName', 'NickName', 'PayRoleID', 'EmailAddress', 'LoginID', 'HireDateSearch', 'UserLevel', 'Inactive', 'Salaried', 'IPayEligible', 'SubmitsTime', 'CompanyHolidays'];
    this.selectedColumns = this._defaultselected;
    this.showSpinner = false;
    this.getEmployeesForReport();
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this.resetSort();
    this._status = [];
    this._paid = [];
    this._Ipay = [];
    this._timesheets = [];
    this._holidays = [];
    this._statusselected = '0';
    this._paidselected = '';
    this._Ipayselected = '';
    this._timesheetsselected = '';
    this._holidaysselected = '';
    this._headerLabels = [];
    this._defaultselected = [];
    this.selectedColumns = [];
    this._listEmployeesForReport = [];
    this.cols = {};
    this._recData = '';
    this._startDate = null;
    this._endDate = null;
    this.showSpinner = false;
  }
  getEmployeesForReport() {
    this.showSpinner = true;
    this.resetSort();
    let _start = '';
    let _end = '';
    this.showReport = false;
    if (this._startDate !== undefined && this._startDate !== null && this._startDate.toString() !== '') {
      _start = this.datePipe.transform(this._startDate, this._DateFormat);
    }
    if (this._endDate !== undefined && this._endDate !== null && this._endDate.toString() !== '') {
      _end = this.datePipe.transform(this._endDate, this._DateFormat);
    }
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      statusselected: this._statusselected.toString(),
      Ipayselected: this._Ipayselected.toString(),
      paidselected: this._paidselected.toString(),
      timesheetsselected: this._timesheetsselected.toString(),
      holidaysselected: this._holidaysselected.toString(),
      startDate: _start.toString(),
      endDate: _end.toString(),
    };
    this.logSvc.ActionLog(PageNames.ListEmployees,
      '', 'Reports/Event', 'getEmployeesForReport', 'Get Employees For Report', '', '', JSON.stringify(ActivityParams)); // ActivityLog

    this.timesysSvc.getEmployeesForReport(this._statusselected, this._Ipayselected, this._paidselected,
      this._timesheetsselected, this._holidaysselected, _start, _end)
      .subscribe(
        (data) => {
          this._listEmployeesForReport = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._listEmployeesForReport = data;
            this._recData = data.length;
          }
          this.showReport = true;
          this.showSpinner = false;
        });
  }
  customSort(event: SortEvent) {
    this.showSpinner = true;
    this.commonSvc.customSortByCols(event, ['HireDate'], []);
    this.showSpinner = false;
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
}
