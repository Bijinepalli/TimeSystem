import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Employee, NonBillables, Projects, Clients } from '../../model/objects';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';

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
  visibleHelp = false;
  showSpinner = false;
  helpText: any;

  ParamSubscribe: any;
  IsSecure = false;
  _HasEdit = true;
  showReport: boolean;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private fb: FormBuilder,
    private commonSvc: CommonService,
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
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }

  Initialisations() {
    this.showSpinner = true;
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
    this.getEmployeesForReport();
  }

  ClearAllProperties() {
    this.types = [];
    this.salaryTypes = [];
    this.selectedType = '0';
    this.selectedSalaryType = '2';
    this.cols = {};
    this._listEmployeeLoginData = [];
    this._recData = '';
    this.visibleHelp = false;
    this.showSpinner = false;
    this.helpText = '';
  }

  showHelp(file: string) {
    this.timesysSvc.getHelp(file)
      .subscribe(
        (data) => {
          this.visibleHelp = true;
          const parser = new DOMParser();
          const parsedHtml = parser.parseFromString(data, 'text/html');
          this.helpText = parsedHtml.getElementsByTagName('body')[0].innerHTML;
        }
      );
  }

  getEmployeesForReport() {
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '150px' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '150px' },
      { field: 'LoginID', header: 'Login ID', align: 'left', width: '200px' },
      { field: 'DecryptedPassword', header: 'Password', align: 'left', width: 'auto' },
      { field: 'EmailAddress', header: 'Email Address', align: 'left', width: 'auto' },
      { field: 'Salaried', header: 'Salaried', align: 'center', width: '110px' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '110px' },
    ];
    this.showSpinner = true;
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
}
