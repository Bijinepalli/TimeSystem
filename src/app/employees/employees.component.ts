import { Component, OnInit, OnDestroy } from '@angular/core';
import { SelectItem } from 'primeng/api';
import {
  Employee, NonBillables, Projects, Clients, BillingCodesPendingTimesheet,
  AssignForEmployee, EmailOptions, LoginErrorMessage, Invoice
} from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { BillingCode } from '../model/constants';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
  providers: [DatePipe]
})
export class EmployeesComponent implements OnInit {

  /* #region Global Variables */


  ParamSubscribe: any;

  _billingCodes: BillingCode;

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
  _recData: any;

  _popUpHeader = '';
  _employeeNameHdr = '';
  employeeHdr = '';

  employeeDialog = false;
  nonBillableDialog = false;
  projectDialog = false;
  clientDialog = false;
  rateDialog = false;

  _selectedEmployee: Employee;
  _selectedEmployeeForAction: Employee;

  _frmEmployee = new FormGroup({});
  _IsEditEmployee = false;

  _frmRate = new FormGroup({});
  _IsEditRate = false;
  _IsAddRate = false;
  _ratecols: any;
  _rates: Invoice[] = [];
  _recRateData: any;
  chkrateInactive = false;
  _employeeId = '';
  _rateId = '';
  _clients: SelectItem[] = [];
  _customerId: string;
  _selectedRate: Clients;
  _ratePlaceholder = '';

  visibleHelp = false;
  helpText: string;

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

  _HasEdit = true;
  _employeesPageNo: number;

  /* #endregion */

  /* #region Constructor */
  // tslint:disable-next-line:max-line-length
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
    public datepipe: DatePipe
  ) { }
  /* #endregion*/

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      this.ClearAllProperties();
      this.Initialisations();
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        this.CheckSecurity(params['Id'].toString());
        this.AddFormControls();
        this.GetMethods();
      }
    });
  }
  /* #endregion */

  /* #region Basic Methods */
  ClearAllProperties() {
    this._billingCodes = new BillingCode();
    this.selectedType = 0;
    this.selectedSalaryType = 2;

    this.types = [];
    this.salaryTypes = [];

    this.activeColumn = true;

    this.cols = {};
    this._recData = '';

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

    this.employeeDialog = false;
    this.nonBillableDialog = false;
    this.projectDialog = false;
    this.clientDialog = false;
    this.rateDialog = false;

    this._selectedEmployee = {};
    this._selectedEmployeeForAction = {};

    this._frmEmployee = new FormGroup({});
    this._IsEditEmployee = false;

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

    this.visibleHelp = false;
    this.helpText = '';

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

    this._HasEdit = true;
  }

  Initialisations() {
    this.cols = [
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
  }

  AddFormControls() {
    this.addControlsEmployee();
    this.addControlsRate();
  }

  GetMethods() {
    this.getEmployees();
    this.getSupervisors();
  }

  CheckSecurity(PageId: string) {
    this._HasEdit = true;

    this.timesysSvc.getPagesbyRoles(localStorage.getItem('UserRole').toString(), PageId)
      .subscribe((data) => {
        if (data != null && data.length > 0) {
          if (data[0].HasEdit) {
            this._HasEdit = false;
          }
        }
      });
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
  /* #endregion */

  /* #region Get Calls */
  getEmployees() {

    if (this.selectedType === 2 && this.selectedSalaryType === 2) {
      this.cols = [
        { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
        { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto'  },
        { field: 'Salaried', header: 'Salaried', align: 'center', width: '100px'  },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '100px'  },
      ];
    } else {
      if (this.selectedType !== 2 && this.selectedSalaryType === 2) {
        this.cols = [
          { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto'  },
          { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto'  },
          { field: 'Salaried', header: 'Salaried', align: 'center', width: '100px'  },
        ];
      } else if (this.selectedSalaryType !== 2 && this.selectedType === 2) {
        this.cols = [
          { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto'  },
          { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto'  },
          { field: 'Inactive', header: 'Inactive', align: 'center', width: '100px'  },
        ];
      } else {
        this.cols = [
          { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto'  },
          { field: 'FirstName', header: 'First Name', align: 'left', width: 'auto'  },
        ];
      }
    }
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
    this._recData = 'No employees found';

    this.timesysSvc.getAllEmployee(_InActive, _Salaried)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._employeesPageNo = 0;
            this._employees = data;
            this._recData = this._employees.length + ' employees found';
          } else {
            this._employeesPageNo = 0;
            this._employees = [];
            this._recData = 'No employees found';
          }
        }
      );
  }

  getNonBillables(empId: number) {
    this.timesysSvc.getNonBillablesAssignToEmployee(empId)
      .subscribe(
        (data: NonBillables[] = []) => {
          this._nonBillablesAssignToEmp = [];
          this._nonBillablesAssignToEmpSaved = [];
          if (data !== undefined && data !== null && data.length > 0) {
            this._nonBillablesAssignToEmp = this._nonBillablesAssignToEmp.concat(data);
            this._nonBillablesAssignToEmpSaved = this._nonBillablesAssignToEmpSaved.concat(data);
          }
        }
      );
    this.timesysSvc.getNonBillablesNotAssignToEmployee(empId)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._nonBillablesNotAssignToEmp = data;
          } else {
            this._nonBillablesNotAssignToEmp = [];
          }
        }
      );
  }

  getProjects(empId: number) {
    this.timesysSvc.getProjectsAssignToEmployee(empId)
      .subscribe(
        (data) => {
          this._projectsAssignToEmp = [];
          this._projectsAssignToEmpSaved = [];
          if (data !== undefined && data !== null && data.length > 0) {
            this._projectsAssignToEmp = this._projectsAssignToEmp.concat(data);
            this._projectsAssignToEmpSaved = this._projectsAssignToEmpSaved.concat(data);
          }
        }
      );
    this.timesysSvc.getProjectsNotAssignToEmployee(empId)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._projectsNotAssignToEmp = data;
          } else {
            this._projectsNotAssignToEmp = [];
          }
        }
      );
  }

  getClients(empId: number) {
    this.timesysSvc.getClientsAssignToEmployee(empId)
      .subscribe(
        (data) => {
          this._clientsAssignToEmp = [];
          this._clientsAssignToEmpSaved = [];
          if (data !== undefined && data !== null && data.length > 0) {
            this._clientsAssignToEmp = this._clientsAssignToEmp.concat(data);
            this._clientsAssignToEmpSaved = this._clientsAssignToEmpSaved.concat(data);
          }
        }
      );
    this.timesysSvc.getClientsNotAssignToEmployee(empId)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._clientsNotAssignToEmp = data;
          } else {
            this._clientsNotAssignToEmp = [];
          }
        }
      );
  }

  getSupervisors() {
    this.timesysSvc.Supervisor_Get()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._Supervisors = data;
          } else {
            this._Supervisors = [];
          }
        }
      );
  }

  /* #endregion */

  /* #region Sort Calls */
  sortTarget() {
    /**** Very very important code */
    this.sortNonBillables(this._nonBillablesAssignToEmp);
    this.sortClients(this._projectsAssignToEmp);
    this.sortClients(this._clientsAssignToEmp);
  }
  sortSource() {
    /**** Very very important code */
    this.sortNonBillables(this._nonBillablesNotAssignToEmp);
    this.sortClients(this._projectsNotAssignToEmp);
    this.sortClients(this._clientsNotAssignToEmp);
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
    this.populateTable(dataRow.ID);
    this._popUpHeader = 'Rate';
    this._employeeNameHdr = dataRow.LastName + ' ' + dataRow.FirstName;
    this.rateDialog = true;
  }
  /* #endregion */

  /* #region Employee Post Calls Related Functionalities */
  addControlsEmployee() {
    this._frmEmployee.addControl('frmLastName', new FormControl(null, Validators.required));
    this._frmEmployee.addControl('frmFirstName', new FormControl(null, Validators.required));
    this._frmEmployee.addControl('frmNickName', new FormControl(null, null));
    this._frmEmployee.addControl('frmLoginID', new FormControl(null, null));
    this._frmEmployee.addControl('frmPayrollID', new FormControl(null, Validators.required));
    this._frmEmployee.addControl('frmEmailAddress', new FormControl(null, Validators.required));
    this._frmEmployee.addControl('frmSecondaryEmailAddress', new FormControl(null, null));
    this._frmEmployee.addControl('frmSecurityLevel', new FormControl('E'));
    this._frmEmployee.addControl('frmHireDate', new FormControl(null));
    this._frmEmployee.addControl('frmStartDate', new FormControl(null));
    this._frmEmployee.addControl('frmHoursPerDay', new FormControl(null));
    this._frmEmployee.addControl('frmSupervisor', new FormControl(null));
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
    this._frmEmployee.controls['frmLastName'].setValue(data.LastName);
    this._frmEmployee.controls['frmFirstName'].setValue(data.FirstName);
    if (data.NickName !== undefined && data.NickName !== null && data.NickName.toString() !== '') {
      this._frmEmployee.controls['frmNickName'].setValue(data.NickName);
    }
    this._frmEmployee.controls['frmLoginID'].setValue(data.LoginID);
    this._frmEmployee.controls['frmPayrollID'].setValue(data.PayRoleID);
    this._frmEmployee.controls['frmEmailAddress'].setValue(data.EmailAddress);
    if (data.SecondaryEmailAddress !== undefined && data.SecondaryEmailAddress !== null && data.SecondaryEmailAddress.toString() !== '') {
      this._frmEmployee.controls['frmSecondaryEmailAddress'].setValue(data.SecondaryEmailAddress);
    }
    this._frmEmployee.controls['frmSecurityLevel'].setValue(data.UserLevel);
    if (data.HireDate !== undefined && data.HireDate !== null && data.HireDate.toString() !== '') {
      this._frmEmployee.controls['frmHireDate'].setValue(new Date(data.HireDate.replace(new RegExp('-', 'g'), '/')));
    }
    if (data.StartDate !== undefined && data.StartDate !== null && data.StartDate.toString() !== '') {
      this._frmEmployee.controls['frmStartDate'].setValue(new Date(data.StartDate.replace(new RegExp('-', 'g'), '/')));
    }

    this._frmEmployee.controls['frmHoursPerDay'].setValue(data.HoursPerDay);

    if (data.SupervisorId !== undefined && data.SupervisorId !== null && data.SupervisorId.toString() !== '') {
      this._frmEmployee.controls['frmSupervisor'].setValue(data.SupervisorId);
    }

    if (data.Salaried !== undefined && data.Salaried !== null) {
      this.chkSalaried = data.Salaried.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkSalaried = false;
    }
    if (data.SubmitsTime !== undefined && data.SubmitsTime !== null) {
      this.chkSubmitsTime = data.SubmitsTime.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkSubmitsTime = false;
    }
    if (data.IPayEligible !== undefined && data.IPayEligible !== null) {
      this.chkIPayEligible = data.IPayEligible.toString().toLowerCase() === 'true' ? true : false;
    } else {
      this.chkIPayEligible = false;
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
    this.resetFormEmployee();
    this.employeeHdr = 'Add New Employee';
    this.employeeDialog = false;
  }

  addEmployee() {
    // this.router.navigate(['/menu/addemployee']);
    this._IsEditEmployee = false;
    this._selectedEmployee = {};
    this.resetFormEmployee();
    this.setDataToControlsEmployee({});
    this.employeeHdr = 'Add New Employee';
    this.employeeDialog = true;
  }

  editEmployee(data: Employee) {
    // this.router.navigate(['/menu/addemployee/' + data.ID]);
    this._IsEditEmployee = true;
    this._selectedEmployee = data;
    this.resetFormEmployee();
    this.setDataToControlsEmployee(data);
    this.employeeHdr = 'Edit Employee';
    this.employeeDialog = true;
  }

  cancelEmployee() {
    this.clearControlsEmployee();
  }
  saveEmployee() {
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
    this._selectedEmployee.NickName = this._frmEmployee.controls['frmNickName'].value.toString().trim();
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
      this._selectedEmployee.HoursPerDay = this._frmEmployee.controls['frmHoursPerDay'].value.toString().trim();
    }

    if (this.IsControlUndefined('frmHireDate')) {
      this._selectedEmployee.HireDate = '';
    } else {
      this._selectedEmployee.HireDate = this.datepipe.transform(
        this._frmEmployee.controls['frmHireDate'].value.toString().trim().replace(new RegExp('-', 'g'), '/'),
        'MM/dd/yyyy');
    }
    if (this.IsControlUndefined('frmStartDate')) {
      this._selectedEmployee.StartDate = '';
    } else {
      this._selectedEmployee.StartDate = this.datepipe.transform(
        this._frmEmployee.controls['frmStartDate'].value.toString().trim().replace(new RegExp('-', 'g'), '/'),
        'MM/dd/yyyy');
    }
    if (this.IsControlUndefined('frmSupervisor')) {
      this._selectedEmployee.SupervisorId = null;
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
    this.SaveEmployeeSPCall();
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

  SaveEmployeeSPCall() {
    if (this._IsEditEmployee === false) {
      this.timesysSvc.Employee_Insert(this._selectedEmployee)
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
              const _EmailOptions: EmailOptions = {};
              _EmailOptions.From = this.commonSvc.getAppSettingsValue('FinanceEmailAddress');
              _EmailOptions.EmailType = 'Password Changed';
              _EmailOptions.To = this._selectedEmployee.EmailAddress;
              _EmailOptions.SendAdmin = false;
              _EmailOptions.SendOnlyAdmin = false;
              _EmailOptions.ReplyTo = '';
              const BodyParams: string[] = [];
              BodyParams.push(this._selectedEmployee.Password);
              _EmailOptions.BodyParams = BodyParams;
              this.timesysSvc.sendMail(_EmailOptions).subscribe(_mailOptions => {
                this.msgSvc.add({
                  key: 'saveSuccess', severity: 'success',
                  summary: 'Info Message', detail: 'Employee saved successfully'
                });
                this.clearControlsEmployee();
                this.getEmployees();
                this.getSupervisors();
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
                summary: 'Info Message', detail: 'Employee saved successfully'
              });
              this.clearControlsEmployee();
              this.getEmployees();
              this.getSupervisors();
            }
          },
          (error) => {
            console.log(error);
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
    this.confSvc.confirm({
      message: 'Are you sure you want to Terminate ' + dataRow.LastName + ' ' + dataRow.FirstName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Employee_Terminate(dataRow)
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
    const _EmailOptions: EmailOptions = {};
    _EmailOptions.From = this.commonSvc.getAppSettingsValue('FinanceEmailAddress');
    _EmailOptions.EmailType = 'Password Changed';
    _EmailOptions.To = EmailAddress;
    _EmailOptions.SendAdmin = false;
    _EmailOptions.SendOnlyAdmin = false;
    _EmailOptions.ReplyTo = '';
    const BodyParams: string[] = [];
    BodyParams.push(NewPassword);
    _EmailOptions.BodyParams = BodyParams;
    this.timesysSvc.sendMail(_EmailOptions).subscribe(_mailOptions => {
      this.msgSvc.add({
        key: 'saveSuccess',
        severity: 'success',
        summary: 'Info Message',
        detail: 'Employee password reset successfully'
      });
      this.getEmployees();
    });
  }
  /* #endregion */

  /* #region Modal Popups Related Functionality */

  hasFormErrorsModal() {
    let isValidModal = false;
    switch (this._popUpHeader) {
      case 'Non-Billable Item':
        isValidModal = !(this._nonBillablesAssignToEmp.length > 0);
        break;
      case 'Project':
        isValidModal = !(this._projectsAssignToEmp.length > 0);
        break;
      case 'Client':
        isValidModal = !(this._clientsAssignToEmp.length > 0);
        break;
      case 'Rate':
        isValidModal = true;
        break;
      default:
        break;
    }
    return isValidModal;
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
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Client saved successfully' });
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
        this.nonBillableDialog = false;
        this._nonBillablesAssignToEmp = [];
        this._nonBillablesAssignToEmpSaved = [];
        this._nonBillablesNotAssignToEmp = [];
        break;
      case 'Project':
        this.projectDialog = false;
        this._projectsAssignToEmp = [];
        this._projectsAssignToEmpSaved = [];
        this._projectsNotAssignToEmp = [];
        break;
      case 'Client':
        this.clientDialog = false;
        this._clientsAssignToEmp = [];
        this._clientsAssignToEmpSaved = [];
        this._clientsNotAssignToEmp = [];
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
  addNewRate() {
    this._IsEditRate = true;
    this._IsAddRate = true;
    this.resetRateControls();
    this._ratePlaceholder = 'Please select a Client Name';
    this._frmRate.controls['frmCustomerName'].enable();
    this.timesysSvc.getClientsAssignToEmployee(+this._employeeId)
      .subscribe(
        (data: Clients[] = []) => {
          let clients = [];
          clients = data;
          // this._clients = [{ label: clients[i].ClientName, value: clients[i].ID }];
          for (let i = 0; i < clients.length; i++) {
            this._clients.push({ label: clients[i].ClientName, value: clients[i].Id });
          }
        }
      );
  }
  editRate(dataRow: any) {
    this.resetRateControls();
    this._IsEditRate = true;
    this._IsAddRate = false;
    this._ratePlaceholder = null;
    this._rateId = dataRow.ID;
    this.timesysSvc.getEmployeeforRates(+this._employeeId)
      .subscribe(
        (data: Employee[] = []) => {
        }
      );
    this.timesysSvc.listClientforRateId(+dataRow.ID)
      .subscribe(
        (data: Clients[] = []) => {
          let clients = [];
          clients = data;
          for (let i = 0; i < clients.length; i++) {
            this._clients.push({ label: clients[i].ClientName, value: clients[i].Id });
          }
        }
      );
    this.timesysSvc.getRate(+dataRow.ID)
      .subscribe(
        (data: Clients[] = []) => {
          this._employeeId = data[0].EmployeeID.toString();
          this._customerId = data[0].CustomerId.toString();
          this._frmRate.controls['frmClientName'].setValue(data[0].ClientName);
          this._frmRate.controls['frmCustomerName'].setValue(data[0].CustomerName);
          this._frmRate.controls['frmCustomerName'].disable();
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
      );

  }

  addControlsRate() {
    this._frmRate.addControl('frmClientName', new FormControl(null, null));
    this._frmRate.addControl('frmCustomerName', new FormControl(null, null));
    this._frmRate.addControl('frmEffectiveDate', new FormControl(null, null));
    this._frmRate.addControl('frmRatetext', new FormControl(null, Validators.required));
    this._frmRate.addControl('frmInactive', new FormControl(null, null));
    this.chkrateInactive = false;
  }

  hasFormErrorsRate() {
    return !this._frmRate.valid;
  }
  populateTable(empId: number) {
    this._IsEditRate = false;
    this._IsAddRate = false;
    this._employeeId = empId.toString();
    this._ratecols = [
      { field: 'ClientName', header: 'Client Name', align: 'left', width: 'auto' },
      { field: 'CustomerName', header: 'Customer Name', align: 'left', width: 'auto' },
      { field: 'EffectiveDate', header: 'Effective Date', align: 'left', width: '100px' },
      { field: 'Rate', header: 'Rate', align: 'right', width: '75px' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '75px' },
    ];
    this.timesysSvc.getEmployeeRates(empId)
      .subscribe(
        (data: Invoice[] = []) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._rates = data;
            // for (let i = 0; i < this._rates.length; i++) {
            //   this._rates[i].EffectiveDate = this._rates[i].EffectiveDate;
            // }
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
  }

  resetRateControls() {
    this._frmRate.markAsPristine();
    this._frmRate.markAsUntouched();
    this._frmRate.updateValueAndValidity();
    this._frmRate.reset();
    this.chkrateInactive = false;
    this._clients = [];
  }

  saveRateModal() {
    this._selectedRate = {};
    console.log(this._frmRate);
    this._selectedRate.ClientName = this._frmRate.controls['frmClientName'].value.toString().trim();
    this._selectedRate.CustomerName = this._frmRate.controls['frmCustomerName'].value.toString().toUpperCase().trim();
    this._selectedRate.CustomerId = +this._customerId.toString();
    // tslint:disable-next-line:max-line-length
    this._selectedRate.EffectiveDate = this.datepipe.transform(this._frmRate.controls['frmEffectiveDate'].value.toString().trim(), 'MM-dd-yyyy');
    this._selectedRate.Rate = this._frmRate.controls['frmRatetext'].value.toString().trim();
    this._selectedRate.EmployeeID = +this._employeeId.toString();
    this._selectedRate.Inactive = this.chkrateInactive;
    this._selectedRate.Id = +this._rateId;
    if (this._IsAddRate === true) {
      this._selectedRate.RateMode = 'A';
    } else {
      this._selectedRate.RateMode = 'E';
    }
    console.log(this._selectedRate);
    this.timesysSvc.updateRate(this._selectedRate)
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
              summary: 'Info Message', detail: 'Employee saved successfully'
            });
            this._IsAddRate = false;
            this._IsEditRate = false;
            this.resetRateControls();
          }
        }
      );
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  /* #endregion */
}
