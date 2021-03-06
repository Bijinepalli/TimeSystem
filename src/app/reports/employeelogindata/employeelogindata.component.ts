import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Employee, NonBillables, Projects, Clients, PageNames } from '../../model/objects';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
import { ActivitylogService } from 'src/app/service/activitylog.service';

@Component({
  selector: 'app-employeelogindata',
  templateUrl: './employeelogindata.component.html',
  styleUrls: ['./employeelogindata.component.css']
})
export class EmployeelogindataComponent implements OnInit {

  types: SelectItem[];
  salaryTypes: SelectItem[];
  selectedType: string;
  selectedSalaryType: string;
  _listEmployeeLoginData: Employee[];
  cols: any;
  _recData: any;
  showSpinner = false;

  ParamSubscribe: any;
  IsSecure = false;
  _HasEdit = true;
  showReport: boolean;
  @ViewChild('dt') dt: Table;

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private msgSvc: MessageService,
    private fb: FormBuilder,
    public commonSvc: CommonService,
    private route: ActivatedRoute) {
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
    this.logSvc.ActionLog(PageNames.EmployeeLoginData, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this.types = [
      { label: 'Active', value: '0' },
      { label: 'Inactive', value: '1' },
      { label: 'Both', value: '2' }
    ];
    this.salaryTypes = [
      { label: 'Salaried', value: '0' },
      { label: 'Hourly', value: '1' },
      { label: 'Both', value: '2' }
    ];
    this.selectedType = '0';
    this.selectedSalaryType = '2';
    this.generateReport();
    this.showSpinner = false;
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this.resetSort();
    this.types = [];
    this.salaryTypes = [];
    this.selectedType = '0';
    this.selectedSalaryType = '2';
    this.cols = {};
    this._listEmployeeLoginData = [];
    this._recData = '';
    this.showSpinner = false;
  }
  generateReport() {
    this.showSpinner = true;
    this.resetSort();
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '15em' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '15em' },
      { field: 'LoginID', header: 'Login ID', align: 'left', width: '15em' },
      { field: 'DecryptedPassword', header: 'Password', align: 'left', width: '15em' },
      { field: 'EmailAddress', header: 'Email Address', align: 'left', width: '20em' },
      { field: 'Salaried', header: 'Salaried', align: 'center', width: '10em' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '10em' },
    ];
    this.showReport = false;
    let _InActive = '';
    let _Salaried = '';
    if (this.selectedType !== '2') {
      _InActive = this.selectedType.toString();
    }
    if (this.selectedSalaryType === '0') {
      _Salaried = '1';
    } else if (this.selectedSalaryType === '1') {
      _Salaried = '0';
    }
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      _InActive: _InActive,
      _Salaried: _Salaried,
    }
    this.logSvc.ActionLog(PageNames.EmployeeLoginData, '', 'Reports/Event', 'generateReport', 'Generate Report', 
    '', '', JSON.stringify(ActivityParams)); // ActivityLog
    this.timesysSvc.getAllEmployee(_InActive, _Salaried)
      .subscribe(
        (data) => {
          this._listEmployeeLoginData = [];
          this._listEmployeeLoginData = data;
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._recData = data.length + ' matching employees';
            this.showReport = true;
          }
        }
      );
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
