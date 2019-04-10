import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SelectItem, SortEvent } from 'primeng/api';
import {
  Employee, NonBillables, Projects, Clients, BillingCodesPendingTimesheet,
  AssignForEmployee, EmailOptions, LoginErrorMessage, Invoice, Departments, Customers, Rates
} from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { BillingCode, YearEndCodes } from '../model/constants';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { PickList } from 'primeng/primeng';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
  providers: [DatePipe]
})
export class EmployeesComponent implements OnInit {

  /* #region Global Variables */



  _DisplayDateFormat = '';
  _billingCodes: BillingCode;
  _yec: YearEndCodes = new YearEndCodes();
  types: SelectItem[];
  salaryTypes: SelectItem[];
  selectedType: number;
  selectedSalaryType: number;

  _employees: Employee[] = [];

  _nonBillablesAssignToEmp: NonBillables[] = [];
  _nonBillablesNotAssignToEmp: NonBillables[] = [];
  _nonBillablesAssignToEmpSaved: NonBillables[] = [];

  _projectsAssignToEmp: Projects[] = [];
  _projectsNotAssignToEmp: Projects[] = [];
  _projectsAssignToEmpSaved: Projects[] = [];

  _clientsAssignToEmp: Clients[] = [];
  _clientsNotAssignToEmp: Clients[] = [];
  _clientsAssignToEmpSaved: Clients[] = [];

  activeColumn = true;

  cols: any;
  _recData = 0;

  _popUpHeader = '';
  _terminateHeader = '';
  _employeeNameHdr = '';
  employeeHdr = '';

  employeeDialog = false;
  nonBillableDialog = false;
  projectDialog = false;
  clientDialog = false;
  rateDialog = false;
  terminateDialog = false;

  _frmEmployee = new FormGroup({});
  SupEmpCnt = 0;
  SupEmployeeList: Employee[] = [];
  SupEmpcols: any;

  _selectedEmployee: Employee;
  _selectedEmployeeForAction: Employee;

  _frmTerminateEmployee = new FormGroup({});
  _IsEditEmployee = false;
  lblTerminationDate = '';
  today = new Date();

  _frmRate = new FormGroup({});
  _IsEditRate = false;
  _IsAddRate = false;
  _ratecols: any;
  _rates: Rates[] = [];
  _recRateData: any;
  chkrateInactive = false;
  _employeeId = '';
  _rateId = '';
  _clients: SelectItem[] = [];
  _customerId: string;
  _selectedRate: Rates;
  _ratePlaceholder = '';

  chkSalaried = false;
  chkSubmitsTime = false;
  chkIPayEligible = false;
  chkCompanyHolidays = false;
  chkPayAvailableAlert = false;
  chkOfficer = false;
  chkSupervisor = false;
  chkTimesheetVerification = false;
  chkInactive = false;
  chkIsLocked = false;
  _Supervisors: SelectItem[];
  _SecurityLevels: SelectItem[];
  _departmentsList: SelectItem[];
  _selectedDepartment: Departments;

  _HasEdit = true;
  _employeesPageNo: number;

  errMsg: string;
  _userAdmin = false;
  _clientId: any;

  showSpinner = false;

  ParamSubscribe: any;
  IsSecure = false;
  DisplayDateFormat = '';
  showReport: boolean;
  _sortArray: string[];
  _sortArrayRates: string[];
  _hiredatechange: string;
  _ShowClients: boolean;
  _EditClients: boolean;
  _ShowProjects: boolean;
  _EditProjects: boolean;
  _ShowNonBillables: boolean;
  _EditNonBillables: boolean;
  _ShowRates: boolean;
  _EditRates: boolean;
  _ShowTerminate: boolean;
  _ShowReset: boolean;
  _ShowUnlock: boolean;

  @ViewChild('pcklNonBillable') pcklNonBillable: PickList;
  @ViewChild('pcklProject') pcklProject: PickList;
  @ViewChild('pcklClient') pcklClient: PickList;

  /* #endregion */

  /* #region Constructor */
  // tslint:disable-next-line:max-line-length
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    public commonSvc: CommonService,
    public datepipe: DatePipe
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
  /* #endregion*/

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
  }
  /* #endregion */

  /* #region Basic Methods */

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          if (data[0].HasEdit) {
            this._HasEdit = false;
            if (data[0].Sections !== undefined && data[0].Sections !== null
              && data[0].Sections.length > 0) {
              for (let j = 0; j < data[0].Sections.length; j++) {
                switch (data[0].Sections[j].ModuleName) {
                  case 'Clients':
                    if (data[0].Sections[j].HasView) {
                      this._ShowClients = false;
                      if (data[0].Sections[j].HasEdit) {
                        this._EditClients = false;
                      }
                    }
                    break;
                  case 'Projects':
                    if (data[0].Sections[j].HasView) {
                      this._ShowProjects = false;
                      if (data[0].Sections[j].HasEdit) {
                        this._EditProjects = false;
                      }
                    }
                    break;
                  case 'Non-Billables':
                    if (data[0].Sections[j].HasView) {
                      this._ShowNonBillables = false;
                      if (data[0].Sections[j].HasEdit) {
                        this._EditNonBillables = false;
                      }
                    }
                    break;
                  case 'Rates':
                    if (data[0].Sections[j].HasView) {
                      this._ShowRates = false;
                      if (data[0].Sections[j].HasEdit) {
                        this._EditRates = false;
                      }
                    }
                    break;
                  case 'Unlock Employee':
                    if (data[0].Sections[j].HasView) {
                      this._ShowUnlock = false;
                    }
                    break;
                  case 'Terminate Employee':
                    if (data[0].Sections[j].HasView) {
                      this._ShowTerminate = false;
                    }
                    break;
                  case 'Reset Password':
                    if (data[0].Sections[j].HasView) {
                      this._ShowReset = false;
                    }
                    break;
                  default:
                    break;
                }
              }
            }
          }
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }

  ClearAllProperties() {
    this._billingCodes = new BillingCode();
    this.selectedType = 0;
    this.selectedSalaryType = 2;

    this.types = [];
    this.salaryTypes = [];

    this.activeColumn = true;

    this.cols = {};
    this._recData = 0;

    this._employeesPageNo = 0;
    this._employees = [];


    this._nonBillablesAssignToEmp = [];
    this._nonBillablesNotAssignToEmp = [];
    this._nonBillablesAssignToEmpSaved = [];

    this._projectsAssignToEmp = [];
    this._projectsNotAssignToEmp = [];
    this._projectsAssignToEmpSaved = [];

    this._clientsAssignToEmp = [];
    this._clientsNotAssignToEmp = [];
    this._clientsAssignToEmpSaved = [];

    this._popUpHeader = '';
    this._employeeNameHdr = '';
    this.employeeHdr = '';
    this._terminateHeader = '';

    this.employeeDialog = false;
    this.nonBillableDialog = false;
    this.projectDialog = false;
    this.clientDialog = false;
    this.rateDialog = false;
    this.terminateDialog = false;
    this.showReport = false;

    this._selectedEmployee = {};
    this._selectedEmployeeForAction = {};

    this._frmEmployee = new FormGroup({});
    this.SupEmpCnt = 0;
    this.SupEmployeeList = [];
    this._IsEditEmployee = false;

    this._frmTerminateEmployee = new FormGroup({});
    this.lblTerminationDate = '';

    this._frmRate = new FormGroup({});
    this._IsEditRate = false;
    this._IsAddRate = false;
    this._ratecols = '';
    this._rates = [];
    this._recRateData = '';
    this.chkrateInactive = false;
    this._employeeId = '';
    this._rateId = '';
    this._clients = [];
    this._customerId = '';
    this._selectedRate = {};
    this._ratePlaceholder = '';

    this.chkSalaried = false;
    this.chkSubmitsTime = false;
    this.chkIPayEligible = false;
    this.chkCompanyHolidays = false;
    this.chkPayAvailableAlert = false;
    this.chkOfficer = false;
    this.chkSupervisor = false;
    this.chkTimesheetVerification = false;
    this.chkInactive = false;
    this.chkIsLocked = false;
    this._Supervisors = [];
    this._SecurityLevels = [];
    this._departmentsList = [];
    this._selectedDepartment = {};

    this._HasEdit = true;
    this._ShowClients = true;
    this._EditClients = true;
    this._ShowProjects = true;
    this._EditProjects = true;
    this._ShowNonBillables = true;
    this._EditNonBillables = true;
    this._ShowRates = true;
    this._EditRates = true;
    this._ShowUnlock = true;
    this._ShowTerminate = true;
    this._ShowReset = true;

    if (this.pcklNonBillable !== undefined && this.pcklNonBillable !== null) {
      this.pcklNonBillable.resetFilter();
    }

    if (this.pcklClient !== undefined && this.pcklClient !== null) {
      this.pcklClient.resetFilter();
    }

    if (this.pcklProject !== undefined && this.pcklProject !== null) {
      this.pcklProject.resetFilter();
    }
  }

  Initialisations() {
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this.showSpinner = true;
    this.cols = [
      { field: 'Department', header: 'Department', align: 'left', width: 'auto' },
      { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto' },
      { field: 'Salaried', header: 'Salaried', align: 'center', width: '100px' },
    ];
    this._SecurityLevels = [
      { label: 'Admin', value: 'A' },
      { label: 'Employee', value: 'E' },
      { label: 'Program Manager', value: 'P' },
      { label: 'Payroll', value: 'Y' },
      { label: 'Billing', value: 'B' },
    ];
    this.types = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.salaryTypes = [
      { label: 'Salaried', value: 0 },
      { label: 'Hourly', value: 1 },
      { label: 'Both', value: 2 }
    ];
    if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString() === 'A') {
      this._userAdmin = true;
    }
    this.AddFormControls();
    this.showSpinner = false;
    this.GetMethods();
  }

  AddFormControls() {
    this.addControlsEmployee();
    this.addControlsRate();
    this.addControlsTerminate();
  }

  GetMethods() {
    console.log('oeeeee');
    this.getEmployees();
    this.getSupervisors();
    this.getDepartments();
  }
  /* #endregion */

  /* #region Get Calls */
  getEmployees() {
    this.showSpinner = true;
    this.showReport = false;
    this.setCols();
    if (this.selectedType === 1) {
      this.activeColumn = false;
    } else {
      this.activeColumn = true;
    }

    let _InActive = '';
    let _Salaried = '';
    if (this.selectedType !== 2) {
      _InActive = this.selectedType.toString();
    }
    if (this.selectedSalaryType === 0) {
      _Salaried = '1';
    } else if (this.selectedSalaryType === 1) {
      _Salaried = '0';
    }

    this._employeesPageNo = 0;
    this._employees = [];
    this._recData = 0;

    const expirydays = this.commonSvc.getAppSettingsValue('PasswordExpiryDays');
    this.timesysSvc.getAllEmployee(_InActive, _Salaried)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._employeesPageNo = 0;
            this._employees = data;
            this._recData = this._employees.length;
          }
          this.showReport = true;
          this.showSpinner = false;
        }
      );
  }

  setCols() {
    if (this.selectedType === 2 && this.selectedSalaryType === 2) {
      this.cols = [
        { field: 'Department', header: 'Department', align: 'left', width: 'auto' },
        { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
        { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto' },
        { field: 'Salaried', header: 'Salaried', align: 'center', width: '130px' },
        { field: 'PasswordExpiresOn', header: 'Password Expiry Date', align: 'center', width: '202px' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '100px' },
      ];
    } else {
      if (this.selectedType !== 2 && this.selectedSalaryType === 2) {
        this.cols = [
          { field: 'Department', header: 'Department', align: 'left', width: 'auto' },
          { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
          { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto' },
          { field: 'Salaried', header: 'Salaried', align: 'center', width: '130px' },
          { field: 'PasswordExpiresOn', header: 'Password Expiry Date', align: 'center', width: '202px' },
        ];
      } else if (this.selectedSalaryType !== 2 && this.selectedType === 2) {
        this.cols = [
          { field: 'Department', header: 'Department', align: 'left', width: 'auto' },
          { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
          { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto' },
          { field: 'Inactive', header: 'Inactive', align: 'center', width: '100px' },
          { field: 'PasswordExpiresOn', header: 'Password Expiry Date', align: 'center', width: '202px' },
        ];
      } else {
        this.cols = [
          { field: 'Department', header: 'Department', align: 'left', width: 'auto' },
          { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
          { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto' },
          { field: 'PasswordExpiresOn', header: 'Password Expiry Date', align: 'center', width: '202px' },
        ];
      }
      this._sortArray = ['Department', 'LastName', 'FirstName', 'Salaried', 'PasswordExpiresOnSearch', 'Inactive'];
    }
  }

  getNonBillables(empId: number) {

    this.showSpinner = true;

    if (this.pcklNonBillable !== undefined && this.pcklNonBillable !== null) {
      this.pcklNonBillable.resetFilter();
    }

    this.timesysSvc.getEmployee(empId.toString(), '', '')
      .subscribe(
        (empdata) => {
          this.timesysSvc.getNonBillablesAssignToEmployee(empId)
            .subscribe(
              (dataAssign) => {
                this.timesysSvc.getNonBillablesNotAssignToEmployee(empId)
                  .subscribe(
                    (dataUnAssign) => {
                      this._nonBillablesAssignToEmp = [];
                      this._nonBillablesAssignToEmpSaved = [];
                      this._nonBillablesNotAssignToEmp = [];
                      if (empdata[0].Salaried.toUpperCase() === 'TRUE' || (empdata[0].LastName.indexOf('B -') === 0)) {
                        if (dataAssign !== undefined && dataAssign !== null && dataAssign.length > 0) {
                          dataAssign = dataAssign.filter(m => !(m.Key.indexOf(this._yec.HolidayCode) > -1));
                          this._nonBillablesAssignToEmp = this._nonBillablesAssignToEmp.concat(dataAssign);
                          this._nonBillablesAssignToEmpSaved = this._nonBillablesAssignToEmpSaved.concat(dataAssign);
                        }
                        if (dataUnAssign !== undefined && dataUnAssign !== null && dataUnAssign.length > 0) {
                          dataUnAssign = dataUnAssign.filter(m => !(m.Key.indexOf(this._yec.HolidayCode) > -1));
                          this._nonBillablesNotAssignToEmp = dataUnAssign;
                        }
                      } else {
                        if (dataAssign !== undefined && dataAssign !== null && dataAssign.length > 0) {
                          this._nonBillablesAssignToEmp = this._nonBillablesAssignToEmp.concat(dataAssign);
                          this._nonBillablesAssignToEmpSaved = this._nonBillablesAssignToEmpSaved.concat(dataAssign);
                        }
                        if (dataUnAssign !== undefined && dataUnAssign !== null && dataUnAssign.length > 0) {
                          dataUnAssign = dataUnAssign.filter(m =>
                            !(m.Key.indexOf(this._yec.PTOCode) > -1) &&
                            !(m.Key.indexOf(this._yec.HolidayCode) > -1));
                          this._nonBillablesNotAssignToEmp = dataUnAssign;
                        }
                      }
                      this.showSpinner = false;
                    });
              });
        });
  }

  getProjects(empId: number) {

    this.showSpinner = true;

    if (this.pcklProject !== undefined && this.pcklProject !== null) {
      this.pcklProject.resetFilter();
    }

    this.timesysSvc.getProjectsAssignToEmployee(empId)
      .subscribe(
        (dataAssign) => {
          this.timesysSvc.getProjectsNotAssignToEmployee(empId)
            .subscribe(
              (dataUnAssign) => {
                this._projectsAssignToEmp = [];
                this._projectsAssignToEmpSaved = [];
                this._projectsNotAssignToEmp = [];
                if (dataAssign !== undefined && dataAssign !== null && dataAssign.length > 0) {
                  this._projectsAssignToEmp = this._projectsAssignToEmp.concat(dataAssign);
                  this._projectsAssignToEmpSaved = this._projectsAssignToEmpSaved.concat(dataAssign);
                }
                if (dataUnAssign !== undefined && dataUnAssign !== null && dataUnAssign.length > 0) {
                  this._projectsNotAssignToEmp = dataUnAssign;
                }
                this.showSpinner = false;
              }
            );
        }
      );
  }

  getClients(empId: number) {
    this.showSpinner = true;
    if (this.pcklClient !== undefined && this.pcklClient !== null) {
      this.pcklClient.resetFilter();
    }
    this.timesysSvc.getClientsAssignToEmployee(empId)
      .subscribe(
        (dataAssign) => {
          this.timesysSvc.getClientsNotAssignToEmployee(empId)
            .subscribe(
              (dataUnAssign) => {
                this._clientsAssignToEmp = [];
                this._clientsAssignToEmpSaved = [];
                this._clientsNotAssignToEmp = [];
                if (dataAssign !== undefined && dataAssign !== null && dataAssign.length > 0) {
                  this._clientsAssignToEmp = this._clientsAssignToEmp.concat(dataAssign);
                  this._clientsAssignToEmpSaved = this._clientsAssignToEmpSaved.concat(dataAssign);
                }
                if (dataUnAssign !== undefined && dataUnAssign !== null && dataUnAssign.length > 0) {
                  this._clientsNotAssignToEmp = dataUnAssign;
                }
                this.showSpinner = false;
              }
            );
        }
      );
  }
  filterSupervisor(empData: Employee) {
    this._Supervisors = this._Supervisors.filter(P => P.value.toString() !== empData.ID.toString());
  }
  getSupervisors() {

    this.showSpinner = true;
    this.timesysSvc.Supervisor_Get()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._Supervisors = data;
          } else {
            this._Supervisors = [];
          }

          this.showSpinner = false;
        }
      );
  }

  getDepartments() {
    this.showSpinner = true;
    this._departmentsList = [];
    this.timesysSvc.getDepartments('')
      .subscribe(
        (data) => {
          this._departmentsList = [];
          if (data !== undefined && data !== null && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              this._departmentsList.push({ label: data[i].Name, value: data[i].Id });
            }
          }
          this.showSpinner = false;
        });
  }

  /* #endregion */

  /* #region Sort Calls */
  sortTarget() {
    /**** Very very important code */
    this.showSpinner = true;
    this.sortNonBillables(this._nonBillablesAssignToEmp);
    this.sortClients(this._projectsAssignToEmp);
    this.sortClients(this._clientsAssignToEmp);

    this.showSpinner = false;
  }
  sortSource() {
    /**** Very very important code */
    this.showSpinner = true;
    this.sortNonBillables(this._nonBillablesNotAssignToEmp);
    this.sortClients(this._projectsNotAssignToEmp);
    this.sortClients(this._clientsNotAssignToEmp);
    this.showSpinner = false;
  }

  sortNonBillables(nonBillablesData: NonBillables[]) {

    if (nonBillablesData != null && nonBillablesData.length > 0) {
      nonBillablesData = nonBillablesData.sort(
        function (a, b) {
          if (a.ProjectName < b.ProjectName) {
            return -1;
          } else if (a.ProjectName > b.ProjectName) {
            return 1;
          } else {
            return 0;
          }
        }
      );
    }
  }
  sortProjects(projectsData: Projects[]) {
    if (projectsData != null && projectsData.length > 0) {
      projectsData = projectsData.sort(
        function (a, b) {
          if (a.ProjectName < b.ProjectName) {
            return -1;
          } else if (a.ProjectName > b.ProjectName) {
            return 1;
          } else {
            return 0;
          }
        }
      );
    }
  }

  sortClients(clientsData: Clients[]) {
    if (clientsData != null && clientsData.length > 0) {
      clientsData = clientsData.sort(
        function (a, b) {
          if (a.ClientName < b.ClientName) {
            return -1;
          } else if (a.ClientName > b.ClientName) {
            return 1;
          } else {
            return 0;
          }
        }
      );
    }
  }
  /* #endregion */

  /* #region Manage Calls for Popup Opening */
  manageClients(dataRow: any) {
    this._selectedEmployeeForAction = dataRow;
    this.getClients(dataRow.ID);
    this._popUpHeader = 'Client';
    this._employeeNameHdr = dataRow.LastName + ' ' + dataRow.FirstName;
    this.clientDialog = true;
  }
  manageProjects(dataRow: any) {
    this._selectedEmployeeForAction = dataRow;
    this.getProjects(dataRow.ID);
    this._popUpHeader = 'Project';
    this._employeeNameHdr = dataRow.LastName + ' ' + dataRow.FirstName;
    this.projectDialog = true;
  }
  manageNonBillables(dataRow: any) {
    this._selectedEmployeeForAction = dataRow;
    this.getNonBillables(dataRow.ID);
    this._popUpHeader = 'Non-Billable Item';
    this._employeeNameHdr = dataRow.LastName + ' ' + dataRow.FirstName;
    this.nonBillableDialog = true;
  }
  manageRates(dataRow: any) {
    this._selectedEmployeeForAction = dataRow;
    this._employeeId = this._selectedEmployeeForAction.ID.toString();
    this.populateTable();
    this._popUpHeader = 'Rate';
    this._employeeNameHdr = dataRow.LastName + ' ' + dataRow.FirstName;
    this.rateDialog = true;
  }
  /* #endregion */

  /* #region Employee Post Calls Related Functionalities */
  addControlsEmployee() {
    this._frmEmployee.addControl('frmLastName', new FormControl(null, Validators.required));
    this._frmEmployee.addControl('frmFirstName', new FormControl(null, Validators.required));
    this._frmEmployee.addControl('frmNickName', new FormControl(null, Validators.required));
    this._frmEmployee.addControl('frmLoginID', new FormControl(null, null));
    this._frmEmployee.addControl('frmPayrollID', new FormControl(null, Validators.required));
    this._frmEmployee.addControl('frmEmailAddress', new FormControl(null, Validators.required));
    this._frmEmployee.addControl('frmSecondaryEmailAddress', new FormControl(null, null));
    this._frmEmployee.addControl('frmSecurityLevel', new FormControl('E'));
    this._frmEmployee.addControl('frmHireDate', new FormControl(null));
    this._frmEmployee.addControl('frmStartDate', new FormControl(null));
    this._frmEmployee.addControl('frmHoursPerDay', new FormControl(null));
    this._frmEmployee.addControl('frmSupervisor', new FormControl(null));
    this._frmEmployee.addControl('frmDepartment', new FormControl(null, Validators.required));
    this.lblTerminationDate = '';
    this.chkSalaried = false;
    this.chkSubmitsTime = false;
    this.chkIPayEligible = false;
    this.chkCompanyHolidays = false;
    this.chkPayAvailableAlert = false;
    this.chkOfficer = false;
    this.chkSupervisor = false;
    this.chkTimesheetVerification = false;
    this.chkInactive = false;
    this.chkIsLocked = false;
  }
  setDataToControlsEmployee(data: Employee) {
    if (data !== undefined && data !== null && data.ID !== undefined && data.ID !== null && data.ID.toString() !== '') {
      this.timesysSvc.departmentEmployee_GetByEmployeeId(data.ID.toString())
        .subscribe(
          (outputdata) => {
            this.timesysSvc.getEmployeesBySupervisor(data.ID.toString())
              .subscribe(
                (empdata) => {
                  this.setControlsData(data, outputdata, empdata);
                });
          });
    } else {
      this.setControlsData(data, null, null);
    }
  }


  setControlsData(data: Employee, outputdata: Departments[], empdata: Employee[]) {
    this._frmEmployee.controls['frmLastName'].setValue(data.LastName);
    this._frmEmployee.controls['frmFirstName'].setValue(data.FirstName);
    if (data.NickName !== undefined && data.NickName !== null && data.NickName.toString() !== '') {
      this._frmEmployee.controls['frmNickName'].setValue(data.NickName);
    }
    this._frmEmployee.controls['frmLoginID'].setValue(data.LoginID);
    this._frmEmployee.controls['frmPayrollID'].setValue(data.PayRoleID);
    this._frmEmployee.controls['frmEmailAddress'].setValue(data.EmailAddress);
    // tslint:disable-next-line:max-line-length
    if (data.SecondaryEmailAddress !== undefined && data.SecondaryEmailAddress !== null && data.SecondaryEmailAddress.toString() !== '') {
      this._frmEmployee.controls['frmSecondaryEmailAddress'].setValue(data.SecondaryEmailAddress);
    }
    if (data.UserLevel !== undefined && data.UserLevel !== null && data.UserLevel.toString() !== '') {
      this._frmEmployee.controls['frmSecurityLevel'].setValue(data.UserLevel);
    } else {
      this._frmEmployee.controls['frmSecurityLevel'].setValue('E');
    }
    if (data.HireDate !== undefined && data.HireDate !== null && data.HireDate.toString() !== '') {
      this._frmEmployee.controls['frmHireDate'].setValue(new Date(data.HireDate.toString()));
      this._hiredatechange = data.HireDate;
    } else {
      this._frmEmployee.controls['frmHireDate'].setValue(new Date());
    }
    if (data.StartDate !== undefined && data.StartDate !== null && data.StartDate.toString() !== '') {
      this._frmEmployee.controls['frmStartDate'].setValue(new Date(data.StartDate.toString()));
    }
    if (data.HoursPerDay !== undefined && data.HoursPerDay !== null && data.HoursPerDay.toString() !== '') {
      this._frmEmployee.controls['frmHoursPerDay'].setValue(data.HoursPerDay);
    } else {
      this._frmEmployee.controls['frmHoursPerDay'].setValue('8');
    }

    if (data.SupervisorId !== undefined && data.SupervisorId !== null && data.SupervisorId.toString() !== '') {
      this._frmEmployee.controls['frmSupervisor'].setValue(data.SupervisorId);
    }
    if (data.TerminationDate !== undefined && data.TerminationDate !== null && data.TerminationDate.toString() !== '') {
      this.lblTerminationDate = data.TerminationDate;
    } else {
      this.lblTerminationDate = '';
    }
    // if (data.Dep !== undefined && data.SupervisorId !== null && data.SupervisorId.toString() !== '') {
    //   this._frmEmployee.controls['frmSupervisor'].setValue(data.SupervisorId);
    // this._frmEmployee.controls['frmSupervisor'].setValue(data.SupervisorId);
    // }

    if (data.Salaried !== undefined && data.Salaried !== null) {
      this.chkSalaried = data.Salaried.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkSalaried = true;
    }
    if (data.SubmitsTime !== undefined && data.SubmitsTime !== null) {
      this.chkSubmitsTime = data.SubmitsTime.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkSubmitsTime = true;
    }
    if (data.IPayEligible !== undefined && data.IPayEligible !== null) {
      this.chkIPayEligible = data.IPayEligible.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkIPayEligible = true;
    }
    if (data.CompanyHolidays !== undefined && data.CompanyHolidays !== null) {
      this.chkCompanyHolidays = data.CompanyHolidays.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkCompanyHolidays = false;
    }
    if (data.PayAvailableAlert !== undefined && data.PayAvailableAlert !== null) {
      this.chkPayAvailableAlert = data.PayAvailableAlert.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkPayAvailableAlert = false;
    }
    if (data.Officer !== undefined && data.Officer !== null) {
      this.chkOfficer = data.Officer.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkOfficer = false;
    }
    if (data.IsSupervisor !== undefined && data.IsSupervisor !== null) {
      this.chkSupervisor = data.IsSupervisor.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkSupervisor = false;
    }
    if (data.IsTimesheetVerficationNeeded !== undefined && data.IsTimesheetVerficationNeeded !== null) {
      this.chkTimesheetVerification = data.IsTimesheetVerficationNeeded.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkTimesheetVerification = false;
    }
    if (data.Inactive !== undefined && data.Inactive !== null) {
      this.chkInactive = data.Inactive.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkInactive = false;
    }
    if (data.IsLocked !== undefined && data.IsLocked !== null) {
      this.chkIsLocked = data.IsLocked.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkIsLocked = false;
    }

    if (outputdata !== undefined && outputdata !== null && outputdata.length > 0) {
      if (outputdata[0].Id !== undefined && outputdata[0].Id !== null && outputdata[0].Id.toString() !== '') {
        this._frmEmployee.controls['frmDepartment'].setValue(outputdata[0].Id);
      }
    }

    if (empdata !== undefined && empdata !== null && empdata.length > 0) {
      this.SupEmpcols = [
        { field: 'Name', header: 'Name', align: 'left', width: 'auto' },
        { field: 'EmailAddress', header: 'Email Address', align: 'left', width: 'auto' },
      ];
      this.SupEmpCnt = empdata.length;
      this.SupEmployeeList = empdata;
    }

  }


  hasFormErrorsEmployee() {
    return !this._frmEmployee.valid;
  }

  resetFormEmployee() {
    this._frmEmployee.markAsPristine();
    this._frmEmployee.markAsUntouched();
    this._frmEmployee.updateValueAndValidity();
    this._frmEmployee.reset();
  }

  clearControlsEmployee() {
    this._IsEditEmployee = false;
    this._selectedEmployee = null;
    this._selectedDepartment = null;
    this.resetFormEmployee();
    this.employeeHdr = 'Add New Employee';
    this.employeeDialog = false;
    this.SupEmpCnt = 0;
  }

  addEmployee() {
    // this.router.navigate(['/menu/addemployee']);
    this._IsEditEmployee = false;
    this._selectedEmployee = {};
    this._selectedDepartment = {};
    this.resetFormEmployee();
    this.setDataToControlsEmployee({});
    this.employeeHdr = 'Add New Employee';
    this.employeeDialog = true;
  }

  editEmployee(data: Employee) {
    // this.router.navigate(['/menu/addemployee/' + data.ID]);
    this._IsEditEmployee = true;
    this._selectedDepartment = {};
    this._selectedEmployee = data;
    this.resetFormEmployee();
    this.setDataToControlsEmployee(data);
    this.employeeHdr = 'Edit Employee';
    this.employeeDialog = true;
    this.filterSupervisor(data);
  }

  cancelEmployee() {
    this.clearControlsEmployee();
    console.log('cancel');
    this.GetMethods();
  }
  saveEmployee() {
    this.errMsg = '';
    if (this._IsEditEmployee === false) {
      if (this._selectedEmployee === undefined || this._selectedEmployee === null) {
        this._selectedEmployee = {};
      }
      this._selectedEmployee.ID = -1;
      this._selectedEmployee.Password = this.datepipe.transform(new Date(), 'yyyyMMddHHmmss');
    } else {
      this._selectedEmployee.Password = this._selectedEmployee.DecryptedPassword;
    }
    this._selectedEmployee.LastName = this._frmEmployee.controls['frmLastName'].value.toString().trim();
    this._selectedEmployee.FirstName = this._frmEmployee.controls['frmFirstName'].value.toString().trim();
    if (this.IsControlUndefined('frmNickName')) {
      this._selectedEmployee.NickName = '';
    } else {
      this._selectedEmployee.NickName = this._frmEmployee.controls['frmNickName'].value.toString().trim();
    }
    this._selectedEmployee.EmailAddress = this._frmEmployee.controls['frmEmailAddress'].value.toString().trim();
    if (this.IsControlUndefined('frmSecondaryEmailAddress')) {
      this._selectedEmployee.SecondaryEmailAddress = '';
    } else {
      this._selectedEmployee.SecondaryEmailAddress = this._frmEmployee.controls['frmSecondaryEmailAddress'].value.toString().trim();
    }
    if (this.IsControlUndefined('frmLoginID')) {
      this._selectedEmployee.LoginID = this._selectedEmployee.FirstName + '.' + this._selectedEmployee.LastName;
    } else {
      this._selectedEmployee.LoginID = this._frmEmployee.controls['frmLoginID'].value.toString().trim();
    }
    if (this.IsControlUndefined('frmPayrollID')) {
      this._selectedEmployee.PayRoleID = '';
    } else {
      this._selectedEmployee.PayRoleID = this._frmEmployee.controls['frmPayrollID'].value.toString().trim().toUpperCase();
    }
    if (this.IsControlUndefined('frmSecurityLevel')) {
      this._selectedEmployee.UserLevel = 'E';
    } else {
      this._selectedEmployee.UserLevel = this._frmEmployee.controls['frmSecurityLevel'].value.toString().trim();
    }
    if (this.IsControlUndefined('frmHoursPerDay')) {
      this._selectedEmployee.HoursPerDay = '8.00';
    } else {
      if (this._frmEmployee.controls['frmHoursPerDay'].value.toString().trim() < 24 &&
        this._frmEmployee.controls['frmHoursPerDay'].value.toString().trim() > 0) {
        this._selectedEmployee.HoursPerDay = this._frmEmployee.controls['frmHoursPerDay'].value.toString().trim();
      } else {
        this.errMsg += 'Hours Per Day should be greater than 0 hours and less than 24 hours<br>';
      }
    }
    if (this.IsControlUndefined('frmHireDate')) {
      this._selectedEmployee.HireDate = '';
    } else {
      this._selectedEmployee.HireDate = this.datepipe.transform(
        this._frmEmployee.controls['frmHireDate'].value.toString(),
        'yyyy-MM-dd');
    }
    if (this.IsControlUndefined('frmStartDate')) {
      this._selectedEmployee.StartDate = '';
    } else {
      this._selectedEmployee.StartDate = this.datepipe.transform(
        this._frmEmployee.controls['frmStartDate'].value.toString(),
        'yyyy-MM-dd');
    }
    if (this._selectedEmployee.HireDate !== '' && this._selectedEmployee.StartDate !== '') {
      if (new Date(this._selectedEmployee.StartDate) < new Date(this._selectedEmployee.HireDate)) {
        this.errMsg += 'Start Date can not be before than Hire Date<br>';
      }
    }
    if (this.IsControlUndefined('frmSupervisor')) {
      this._selectedEmployee.SupervisorId = -1;
    } else {
      this._selectedEmployee.SupervisorId = this._frmEmployee.controls['frmSupervisor'].value;
    }
    this._selectedEmployee.Salaried = this.chkSalaried;
    this._selectedEmployee.SubmitsTime = this.chkSubmitsTime;
    this._selectedEmployee.IPayEligible = this.chkIPayEligible;
    this._selectedEmployee.CompanyHolidays = this.chkCompanyHolidays;
    this._selectedEmployee.PayAvailableAlert = this.chkPayAvailableAlert;
    this._selectedEmployee.Officer = this.chkOfficer;
    this._selectedEmployee.IsSupervisor = this.chkSupervisor;
    this._selectedEmployee.IsTimesheetVerficationNeeded = this.chkTimesheetVerification;
    this._selectedEmployee.Inactive = this.chkInactive;
    this._selectedEmployee.IsLocked = this.chkIsLocked;
    this._selectedDepartment = {};
    if (this._IsEditEmployee === false) {
      this._selectedDepartment.EmployeeId = -1;
    } else {
      this._selectedDepartment.EmployeeId = this._selectedEmployee.ID;
    }
    if (this.IsControlUndefined('frmDepartment')) {
      this._selectedDepartment.Id = null;
    } else {
      this._selectedDepartment.Id = this._frmEmployee.controls['frmDepartment'].value;
    }
    if (this.errMsg === '') {
      this.checkWarnings();
    }
  }

  IsControlUndefined(ctrlName: string): boolean {
    let IsUndefined = true;
    if (this._frmEmployee.controls[ctrlName] !== undefined &&
      this._frmEmployee.controls[ctrlName] !== null &&
      this._frmEmployee.controls[ctrlName].value !== undefined &&
      this._frmEmployee.controls[ctrlName].value !== null &&
      this._frmEmployee.controls[ctrlName].value.toString().trim() !== ''
    ) {
      IsUndefined = false;
    }
    return IsUndefined;
  }

  checkWarnings() {
    let errorMsg = '';
    if (this._frmEmployee.controls['frmHoursPerDay'].value.toString().trim() < 8) {
      errorMsg += 'Hours per day is not 8 hours. Is this correct?<br>';
    }
    if (this.chkSalaried && !this.chkIPayEligible) {
      errorMsg += 'Salaried employee is not eligible for IPay.<br>';
    }
    if (!this.chkSubmitsTime && !this.chkOfficer) {
      errorMsg += 'Employee is not required to submit timesheets and is not an officer.<br>';
    }
    if (this._IsEditEmployee !== false) {
      if (this.datepipe.transform(this._frmEmployee.controls['frmHireDate'].value, 'yyyy-MM-dd') !== this._hiredatechange) {
        errorMsg += 'Employee original hire date has changed. Is this correct?<br>';
      }
    }
    if (errorMsg.trim() !== '') {
      this.confSvc.confirm({
        message: errorMsg,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.ValidateEmployee();
        },
        reject: () => {
        }
      });
    } else {
      this.ValidateEmployee();
    }
  }

  ValidateEmployee() {
    this.timesysSvc.Employee_Validate(this._selectedEmployee)
      .subscribe(
        (outputData) => {
          if (outputData !== undefined && outputData !== null) {
            if (outputData.ErrorMessage.toString() !== '') {
              this.msgSvc.add({
                key: 'alert',
                sticky: true,
                severity: 'error',
                summary: 'Error!',
                detail: outputData.ErrorMessage
              });
            } else {
              this.SaveEmployeeSPCall();
            }
          }
        });
  }

  SaveEmployeeSPCall() {
    if (this._IsEditEmployee === false) {
      this.timesysSvc.Employee_Insert(this._selectedEmployee)
        .subscribe(
          (outputData) => {
            if (outputData !== undefined && outputData !== null) {
              if (outputData.ErrorMessage.toString() !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage
                });
              } else {
                if (outputData.ReturnVal.toString() !== '') {
                  this.SendEmailChangePassword(this._selectedEmployee.EmailAddress, this._selectedEmployee.Password);
                  this._selectedDepartment.EmployeeId = +outputData.ReturnVal;
                  this.SaveDepartmentSPCall();
                } else {
                  this.msgSvc.add({
                    key: 'alert',
                    sticky: true,
                    severity: 'error',
                    summary: 'Error!',
                    detail: 'Error Occurred'
                  });
                }
              }
            } else {
              this.msgSvc.add({
                key: 'alert',
                sticky: true,
                severity: 'error',
                summary: 'Error!',
                detail: 'Error Occurred'
              });
            }
          },
          (error) => {
            console.log(error);
          });
    } else {
      this.timesysSvc.Employee_Update(this._selectedEmployee)
        .subscribe(
          (outputData) => {
            if (outputData !== undefined && outputData !== null && outputData.ErrorMessage !== '') {
              this.msgSvc.add({
                key: 'alert',
                sticky: true,
                severity: 'error',
                summary: 'Error!',
                detail: outputData.ErrorMessage
              });
            } else {
              this.SaveDepartmentSPCall();
            }
          },
          (error) => {
            console.log(error);
          });
    }
  }

  SaveDepartmentSPCall() {
    if (this._selectedDepartment.Id !== undefined && this._selectedDepartment.Id !== null && this._selectedDepartment.Id > 0) {
      this.timesysSvc.employeeDepartment_Insert(this._selectedDepartment)
        .subscribe(
          (outputData) => {
            if (outputData !== undefined && outputData !== null && outputData.ErrorMessage !== '') {
              this.msgSvc.add({
                key: 'alert',
                sticky: true,
                severity: 'error',
                summary: 'Error!',
                detail: outputData.ErrorMessage
              });
            } else {
              this.msgSvc.add({
                key: 'saveSuccess', severity: 'success',
                summary: 'Info Message', detail: 'Employee saved successfully'
              });
              if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId').toString() ===
                this._selectedEmployee.ID.toString()) {
                this.confSvc.confirm({
                  message: 'Do you want to see the changes in action right away by logging in again?',
                  header: 'Confirmation',
                  icon: 'pi pi-exclamation-triangle',
                  accept: () => {
                    /* do nothing */
                    this.router.navigate(['']);
                  },
                  reject: () => {
                    /* do nothing */
                  }
                });
              }
              this.clearControlsEmployee();
              this.getEmployees();
              this.getSupervisors();
              this.getDepartments();
            }
          });
    }
  }

  unlockEmployee(dataRow: Employee) {
    this.confSvc.confirm({
      message: 'Are you sure you want to Unlock ' + dataRow.LastName + ' ' + dataRow.FirstName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Employee_Unlock(dataRow)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: 'Employee unlocked successfully'
                });
                this.getEmployees();
              }
            },
            (error) => {
              console.log(error);
            });
      },
      reject: () => {
        /* do nothing */
      }
    });
  }

  terminateEmployee(dataRow: Employee) {
    this._selectedEmployeeForAction = dataRow;
    this._employeeNameHdr = dataRow.LastName + ' ' + dataRow.FirstName;
    this._terminateHeader = 'Terminate ' + this._employeeNameHdr;
    this.terminateDialog = true;
  }

  saveTerminate() {
    this.confSvc.confirm({
      message: 'Are you sure you want to Terminate ' + this._employeeNameHdr + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // tslint:disable-next-line:max-line-length
        this._selectedEmployeeForAction.TerminationDate = this.datepipe.transform(this._frmTerminateEmployee.controls['frmTerminateEmployeeDate'].value, 'yyyy-MM-dd').toString().trim();
        /* do nothing */
        this.timesysSvc.Employee_Terminate(this._selectedEmployeeForAction)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: 'Employee terminated successfully'
                });
                this.getEmployees();
                this.clearControlsTerminate();
              }
            },
            (error) => {
              console.log(error);
            });
      },
      reject: () => {
        /* do nothing */
      }
    });
  }

  resetEmployeePassword(dataRow: Employee) {
    this.confSvc.confirm({
      message: 'Are you sure you want to reset password of ' + dataRow.LastName + ' ' + dataRow.FirstName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing yyyyMMddHHmmss*/
        dataRow.Password = this.datepipe.transform(new Date(), 'yyyyMMddHHmmss');
        this.timesysSvc.Employee_ResetPassword(dataRow)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage
                });
              } else {
                this.SendEmailChangePassword(dataRow.EmailAddress, dataRow.Password);
              }
            },
            (error) => {
              console.log(error);
            });
      },
      reject: () => {
        /* do nothing */
      }
    });
  }

  SendEmailChangePassword(EmailAddress: string, NewPassword: string) {
    const BodyParams: string[] = [];
    BodyParams.push(NewPassword);
    this.timesysSvc.EmailByType(EmailAddress,
      BodyParams,
      'Password Changed'
      , false.toString().toLowerCase()).
      subscribe(dataEmail => {
        if (dataEmail !== undefined && dataEmail !== null && dataEmail.length > 0) {
          let Errors = '';
          for (let cnt = 0; cnt < dataEmail.length; cnt++) {
            Errors += dataEmail[cnt].Value + '<br>';
          }
          this.msgSvc.add({
            key: 'alert',
            sticky: true,
            severity: 'error',
            summary: 'Error!',
            detail: Errors,
          });
        }
      });
  }
  /* #endregion */

  /* #region Modal Popups Related Functionality */

  hasFormErrorsModal() {
    // let isValidModal = false;
    let cancelApproval = false;
    switch (this._popUpHeader) {
      case 'Non-Billable Item':
        cancelApproval = this.commonSvc.isArrayEqual(this._nonBillablesAssignToEmpSaved, this._nonBillablesAssignToEmp);
        break;
      case 'Project':
        cancelApproval = this.commonSvc.isArrayEqual(this._projectsAssignToEmpSaved, this._projectsAssignToEmp);
        break;
      case 'Client':
        cancelApproval = this.commonSvc.isArrayEqual(this._clientsAssignToEmpSaved, this._clientsAssignToEmp);
        break;
      case 'Rate':
        break;
      default:
        break;
    }

    // switch (this._popUpHeader) {
    //   case 'Non-Billable Item':
    //     isValidModal = cancelApproval || !(cancelApproval === false && this._nonBillablesAssignToEmp.length > 0);
    //     break;
    //   case 'Project':
    //     isValidModal = cancelApproval || !(cancelApproval === false && this._projectsAssignToEmp.length > 0);
    //     break;
    //   case 'Client':
    //     isValidModal = cancelApproval || !(cancelApproval === false && this._clientsAssignToEmp.length > 0);
    //     break;
    //   case 'Rate':
    //     isValidModal = true;
    //     break;
    //   default:
    //     break;
    // }
    return cancelApproval;
  }
  cancelModal() {
    let cancelApproval = false;
    switch (this._popUpHeader) {
      case 'Non-Billable Item':
        cancelApproval = this.commonSvc.isArrayEqual(this._nonBillablesAssignToEmpSaved, this._nonBillablesAssignToEmp);
        break;
      case 'Project':
        cancelApproval = this.commonSvc.isArrayEqual(this._projectsAssignToEmpSaved, this._projectsAssignToEmp);
        break;
      case 'Client':
        cancelApproval = this.commonSvc.isArrayEqual(this._clientsAssignToEmpSaved, this._clientsAssignToEmp);
        break;
      case 'Rate':
        break;
      default:
        break;
    }
    if (cancelApproval) {
      this.clearModalControls();
    } else {
      this.closeConfirmation();
    }
  }

  saveModal() {
    this.checkForSumittedTimesheets();
  }

  checkForSumittedTimesheets() {
    // 'Some of the billing code(s) selected to be removed are used on unsubmitted timesheet(s) for this employee.'
    // 'Click the email icon (before clicking 'confirm') to inform the employee that these codes will be removed.'
    let removedItems: string[] = [];
    let newItems: string[] = [];
    let billingCodeVal = '';
    switch (this._popUpHeader) {
      case 'Non-Billable Item':
        removedItems = this.getRemovedItems(this._nonBillablesAssignToEmpSaved, this._nonBillablesAssignToEmp);
        newItems = this.getNewItems(this._nonBillablesAssignToEmpSaved, this._nonBillablesAssignToEmp);
        billingCodeVal = this._billingCodes.NonBillable;
        break;
      case 'Project':
        removedItems = this.getRemovedItems(this._projectsAssignToEmpSaved, this._projectsAssignToEmp);
        newItems = this.getNewItems(this._projectsAssignToEmpSaved, this._projectsAssignToEmp);
        billingCodeVal = this._billingCodes.Project;
        break;
      case 'Client':
        removedItems = this.getRemovedItems(this._clientsAssignToEmpSaved, this._clientsAssignToEmp);
        newItems = this.getNewItems(this._clientsAssignToEmpSaved, this._clientsAssignToEmp);
        billingCodeVal = this._billingCodes.Client;
        break;
      case 'Rate':
        break;
      default:
        break;
    }
    if (removedItems.length > 0) {
      let billingCodesPendingTimesheet: BillingCodesPendingTimesheet = {};
      billingCodesPendingTimesheet = {};
      billingCodesPendingTimesheet.ChargeID = removedItems.join();
      billingCodesPendingTimesheet.EmployeeID = this._selectedEmployeeForAction.ID;
      billingCodesPendingTimesheet.ChargeType = billingCodeVal;
      this.timesysSvc.PendingTimesheet_BillingCodes_Get(billingCodesPendingTimesheet).subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this.confirmRemovalofUnSubmittedTimesheets(this.getUsedItemsNames(data), removedItems, newItems);
          } else {
            this.saveModalSPCall(removedItems, newItems);
          }
        });
    } else {
      this.saveModalSPCall(removedItems, newItems);
    }
  }

  getRemovedItems(arrSaved: any[], arrNew: any[]) {
    const removedItems: string[] = [];
    for (let cnt = 0; cnt < arrSaved.length; cnt++) {
      const itemPresent = arrNew.find(m =>
        m.Id === arrSaved[cnt].Id);
      if (itemPresent === undefined) {
        removedItems.push(arrSaved[cnt].Id);
      }
    }
    return removedItems;
  }

  getNewItems(arrSaved: any[], arrNew: any[]) {
    const newItems: string[] = [];
    for (let cnt = 0; cnt < arrNew.length; cnt++) {
      const itemPresent = arrSaved.find(m =>
        m.Id === arrNew[cnt].Id);
      if (itemPresent === undefined) {
        newItems.push(arrNew[cnt].Id);
      }
    }
    return newItems;
  }

  getUsedItemsNames(data: BillingCodesPendingTimesheet[]) {
    let removedItemsNames = '';
    for (let cnt = 0; cnt < data.length; cnt++) {

      switch (this._popUpHeader) {
        case 'Non-Billable Item':
          const nonBillableSaved = this._nonBillablesAssignToEmpSaved.find(m => m.Id === +(data[cnt].ChargeID));
          if (nonBillableSaved !== undefined) {
            removedItemsNames += nonBillableSaved.ProjectName;
          }
          break;
        case 'Project':
          const projectSaved = this._projectsAssignToEmpSaved.find(m => m.Id === +(data[cnt].ChargeID));
          if (projectSaved !== undefined) {
            removedItemsNames += projectSaved.ProjectName;
          }
          break;
        case 'Client':
          const clientSaved = this._clientsAssignToEmpSaved.find(m => m.Id === +(data[cnt].ChargeID));
          if (clientSaved !== undefined) {
            removedItemsNames += clientSaved.ClientName;
          }
          break;
        case 'Rate':
          break;
        default:
          break;
      }
      if (cnt !== data.length - 1) { } else { removedItemsNames += ','; }
    }

    return removedItemsNames;
  }

  confirmRemovalofUnSubmittedTimesheets(ItemsNames: string, removedItems: string[], newItems: string[]) {
    this.confSvc.confirm({
      message:
        'Some of the billing code(s) selected to be removed such as (' + ItemsNames +
        ') are used on unsubmitted timesheet(s) for this employee.' +
        ' Click the email icon (before clicking confirm) to inform the employee that these codes will be removed.',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.saveModalSPCall(removedItems, newItems);
      },
      reject: () => {
        /* do nothing */
      }
    });

  }

  saveModalSPCall(removedItems: string[], newItems: string[]) {
    let _AssignForEmployee: AssignForEmployee = {};
    _AssignForEmployee = {};
    _AssignForEmployee.UpdateItems = {};
    _AssignForEmployee.AddItems = [];
    let billingCodesPendingTimesheet: BillingCodesPendingTimesheet = {};
    let AssignType = '';
    let ChargeType = '';
    switch (this._popUpHeader) {
      case 'Non-Billable Item':
        AssignType = 'Non-Billable';
        ChargeType = this._billingCodes.NonBillable;
        break;
      case 'Project':
        AssignType = 'Project';
        ChargeType = this._billingCodes.Project;
        break;
      case 'Client':
        AssignType = 'Client';
        ChargeType = this._billingCodes.Client;
        break;
      case 'Rate':
        break;
      default:
        break;
    }
    if (removedItems.length > 0) {
      billingCodesPendingTimesheet = {};
      billingCodesPendingTimesheet.EmployeeID = this._selectedEmployeeForAction.ID;
      billingCodesPendingTimesheet.ChargeType = ChargeType;
      billingCodesPendingTimesheet.AssignType = AssignType;
      billingCodesPendingTimesheet.ChargeID = removedItems.join();
      _AssignForEmployee.UpdateItems = billingCodesPendingTimesheet;
    } else {
      _AssignForEmployee.UpdateItems = null;
    }
    if (newItems.length > 0) {
      for (let cnt = 0; cnt < newItems.length; cnt++) {
        billingCodesPendingTimesheet = {};
        billingCodesPendingTimesheet.EmployeeID = this._selectedEmployeeForAction.ID;
        billingCodesPendingTimesheet.ChargeType = ChargeType;
        billingCodesPendingTimesheet.AssignType = AssignType;
        billingCodesPendingTimesheet.ChargeID = newItems[cnt];
        _AssignForEmployee.AddItems.push(billingCodesPendingTimesheet);
      }
    } else {
      _AssignForEmployee.AddItems = null;
    }
    this.timesysSvc.AssignForEmployee(_AssignForEmployee)
      .subscribe(
        (outputData) => {
          if (outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: 'alert',
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage
            });
          } else {
            this.msgSvc.add({
              key: 'saveSuccess', severity: 'success', summary: 'Info Message',
              detail: this._popUpHeader + ' saved successfully'
            });
            this.clearModalControls();
            this.getEmployees();
          }
        },
        (error) => {
          console.log(error);
        });

  }

  closeConfirmation() {
    this.confSvc.confirm({
      message: 'You have some unsaved changes. Are you sure you want to close ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.clearModalControls();
      },
      reject: () => {
        /* do nothing */
      }
    });
  }

  clearModalControls() {
    this._selectedEmployeeForAction = null;





    switch (this._popUpHeader) {
      case 'Non-Billable Item':
        if (this.pcklNonBillable !== undefined && this.pcklNonBillable !== null) {
          this.pcklNonBillable.resetFilter();
        }
        this._nonBillablesAssignToEmp = [];
        this._nonBillablesAssignToEmpSaved = [];
        this._nonBillablesNotAssignToEmp = [];
        this.nonBillableDialog = false;
        break;
      case 'Project':
        if (this.pcklProject !== undefined && this.pcklProject !== null) {
          this.pcklProject.resetFilter();
        }
        this._projectsAssignToEmp = [];
        this._projectsAssignToEmpSaved = [];
        this._projectsNotAssignToEmp = [];
        this.projectDialog = false;
        break;
      case 'Client':
        if (this.pcklClient !== undefined && this.pcklClient !== null) {
          this.pcklClient.resetFilter();
        }
        this._clientsAssignToEmp = [];
        this._clientsAssignToEmpSaved = [];
        this._clientsNotAssignToEmp = [];
        this.clientDialog = false;
        break;
      case 'Rate':
        this.rateDialog = false;
        break;
      default:
        break;
    }
    this._popUpHeader = '';
  }
  /* #endregion */

  /* #region Rates Modal Popup Related Functionality */




  addControlsRate() {
    this._frmRate.addControl('frmClientName', new FormControl(null, Validators.required));
    this._frmRate.addControl('frmCustomerName', new FormControl(null, Validators.required));
    this._frmRate.addControl('frmEffectiveDate', new FormControl(null, Validators.required));
    this._frmRate.addControl('frmRatetext', new FormControl(null, Validators.required));
    // Validators.pattern('^\s*(?=.*[1-9])\d*(?:\.\d{1,2})?\s*$') Decimal Greater than 0 with 2 precision
    this._frmRate.addControl('frmInactive', new FormControl(null, null));
    this.chkrateInactive = false;
  }

  hasFormErrorsRate() {
    return !this._frmRate.valid;
  }

  addNewRate() {
    this._IsEditRate = true;
    this._IsAddRate = true;
    this.resetRateControls();
    this._rateId = '';
    this._ratePlaceholder = 'Please select a Client Name';
    this._frmRate.controls['frmCustomerName'].disable();
    this._frmRate.controls['frmEffectiveDate'].setValue(new Date());
    this.timesysSvc.getClientsAssignToEmployee(+this._employeeId)
      .subscribe(
        (dataClients: Clients[] = []) => {
          this._clients = [];
          if (dataClients !== undefined && dataClients !== null && dataClients.length > 0) {
            for (let i = 0; i < dataClients.length; i++) {
              this._clients.push({ label: dataClients[i].ClientName, value: dataClients[i].Id });
            }
            this._frmRate.controls['frmClientName'].setValue(this._clients[0].value);
            this.getCustomerForClient();
          }
        }
      );
  }

  editRate(dataRow: Rates) {
    this.resetRateControls();
    this._IsEditRate = true;
    this._IsAddRate = false;
    this._ratePlaceholder = null;
    this._rateId = dataRow.ID.toString();
    this._clientId = dataRow.ClientID.toString();
    this.timesysSvc.listClientforRateId(+dataRow.ID.toString())
      .subscribe(
        (dataClients: Clients[] = []) => {
          this._clients = [];
          if (dataClients !== undefined && dataClients !== null && dataClients.length > 0) {
            for (let i = 0; i < dataClients.length; i++) {
              this._clients.push({ label: dataClients[i].ClientName, value: dataClients[i].Id });
            }
          }
          this.timesysSvc.getRate(+dataRow.ID.toString())
            .subscribe(
              (data: Rates[] = []) => {
                if (data !== undefined && data !== null && data.length > 0) {
                  this._frmRate.controls['frmClientName'].setValue(data[0].ClientID);
                  this.getCustomerForClient();
                  this._frmRate.controls['frmRatetext'].setValue(data[0].Rate);
                  if (data[0].EffectiveDate !== undefined && data[0].EffectiveDate !== null && data[0].EffectiveDate.toString() !== '') {
                    this._frmRate.controls['frmEffectiveDate'].setValue(new Date(data[0].EffectiveDate.replace(new RegExp('-', 'g'), '/')));
                  }
                  if (data[0].Inactive !== undefined && data[0].Inactive !== null) {
                    this.chkrateInactive = data[0].Inactive.toString().toLowerCase() === 'true' ? true : false;
                  } else {
                    this.chkrateInactive = false;
                  }
                }
              });
        }
      );
  }

  deleteRate(dataRow: Rates) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete this rate?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        console.log(dataRow);
        this.timesysSvc.DeleteRate(dataRow)
          .subscribe(
            (outputData) => {
              this.showSpinner = false;
              if (outputData !== null && outputData.ErrorMessage !== '' && outputData.ErrorMessage !== '0') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: 'Rate deleted successfully'
                });

                this.populateTable();
              }
            },
            (error) => {
              console.log(error);
            });
      },
      reject: () => {
        /* do nothing */
      }
    });
  }


  getCustomerForClient() {
    const ClientID = this._frmRate.controls['frmClientName'].value.toString();
    this._customerId = '';
    this._frmRate.controls['frmCustomerName'].enable();
    this._frmRate.controls['frmCustomerName'].setValue('');
    this._frmRate.controls['frmCustomerName'].disable();
    this.timesysSvc.GetCustomerForClient(ClientID)
      .subscribe(
        (data: Customers[] = []) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._customerId = data[0].Id.toString();
            this._frmRate.controls['frmCustomerName'].enable();
            this._frmRate.controls['frmCustomerName'].setValue(data[0].CustomerName);
            this._frmRate.controls['frmCustomerName'].disable();
          }
        }
      );
  }

  resetRateControls() {
    this._frmRate.markAsPristine();
    this._frmRate.markAsUntouched();
    this._frmRate.updateValueAndValidity();
    this._frmRate.reset();
    this.chkrateInactive = false;
    this._clients = [];
  }

  populateTable() {
    this._IsEditRate = false;
    this._IsAddRate = false;
    this._ratecols = [
      { field: 'ClientName', header: 'Client Name', align: 'left', width: 'auto' },
      { field: 'CustomerName', header: 'Customer Name', align: 'left', width: 'auto' },
      { field: 'EffectiveDate', header: 'Effective Date', align: 'center', width: '150px' },
      { field: 'Rate', header: 'Rate', align: 'right', width: '75px' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '75px' },
    ];
    this._sortArrayRates = ['ClientName', 'CustomerName', 'EffectiveDateSearch', 'Rate', 'Inactive'];
    this.timesysSvc.getEmployeeRates(+this._employeeId.toString())
      .subscribe(
        (data: Rates[] = []) => {
          this._rates = [];
          this._recRateData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._rates = data;
            this._recRateData = this._rates.length;
          }
        }
      );
  }

  cancelRateModal() {
    this.resetRateControls();
    if (this._IsEditRate === true) {
      this._IsEditRate = false;
      this._IsAddRate = false;
    } else {
      this.rateDialog = false;
    }
    this.populateTable();
  }

  saveRateModal() {
    this._selectedRate = {};
    this._selectedRate.ID = +this._rateId;
    this._selectedRate.EmployeeID = +this._employeeId.toString();
    this._selectedRate.CustomerID = +this._customerId.toString();
    this._selectedRate.ClientID = this._frmRate.controls['frmClientName'].value.toString();
    // tslint:disable-next-line:max-line-length
    this._selectedRate.EffectiveDate = this.datepipe.transform(this._frmRate.controls['frmEffectiveDate'].value.toString().trim(), 'MM-dd-yyyy');
    this._selectedRate.Rate = this._frmRate.controls['frmRatetext'].value.toString().trim();
    this._selectedRate.Inactive = this.chkrateInactive;
    if (this._IsAddRate === true) {
      this.saveRateSPCall();
    } else {
      this.confSvc.confirm({
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        message: 'You are retroactively changing a rate. Is this correct?',
        accept: () => {
          this.saveRateSPCall();
        }
      });
    }
  }

  saveRateSPCall() {
    this.timesysSvc.InsertOrUpdateRate(this._selectedRate)
      .subscribe(
        (outputData) => {
          if (outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: 'alert',
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage
            });
          } else {
            this.msgSvc.add({
              key: 'saveSuccess', severity: 'success',
              summary: 'Info Message', detail: 'Rate saved successfully'
            });
            this._IsAddRate = false;
            this._IsEditRate = false;
            this.resetRateControls();
            this.populateTable();
          }
        }
      );
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 46) {
      if (this._frmRate.controls['frmRatetext'].value.toString().trim().indexOf('.') === -1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }
  }
  /* #endregion */

  addControlsTerminate() {
    this._frmTerminateEmployee.addControl('frmTerminateEmployeeDate', new FormControl(null, Validators.required));
  }


  hasFormErrorsTerminate() {
    return !this._frmTerminateEmployee.valid;
  }

  resetFormTerminate() {
    this._frmTerminateEmployee.markAsPristine();
    this._frmTerminateEmployee.markAsUntouched();
    this._frmTerminateEmployee.updateValueAndValidity();
    this._frmTerminateEmployee.reset();
  }

  clearControlsTerminate() {
    this.resetFormTerminate();
    this.employeeHdr = '';
    this.terminateDialog = false;
    this.lblTerminationDate = '';
  }

  cancelTerminate() {
    this.clearControlsTerminate();
  }


  isArrayEqual(value, other) {

    // Get the value type
    const type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) { return false; }

    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) { return false; }

    // Compare the length of the length of the two items
    const valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    const otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) { return false; }

    // Compare two items
    const compare = function (item1, item2) {

      // Get the object type
      const itemType = Object.prototype.toString.call(item1);

      // If an object or array, compare recursively
      if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
        if (!this.isArrayEqual(item1, item2)) { return false; } // Need to check same function calling
      } else {

        // If the two items are not the same type, return false
        if (itemType !== Object.prototype.toString.call(item2)) { return false; }

        // Else if it's a function, convert to a string and compare
        // Otherwise, just compare
        if (itemType === '[object Function]') {
          if (item1.toString() !== item2.toString()) { return false; }
        } else {
          if (item1 !== item2) { return false; }
        }

      }
    };

    // Compare properties
    if (type === '[object Array]') {
      for (let i = 0; i < valueLen; i++) {
        if (compare(value[i], other[i]) === false) { return false; }
      }
    } else {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          if (compare(value[key], other[key]) === false) { return false; }
        }
      }
    }

    // If nothing failed, return true
    return true;

  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['PasswordExpiresOn'], ['Rate']);
  }

}

