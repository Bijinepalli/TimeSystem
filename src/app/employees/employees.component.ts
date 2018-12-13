import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Employee, NonBillables, Projects, Clients } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {
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

  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService, private commonSvc: CommonService) {
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
    this.selectedType = 0;
    this.selectedSalaryType = 0;
  }

  ngOnInit() {
    this.cols = [
      { field: 'LastName', header: 'Last Name' },
      { field: 'FirstName', header: 'First Name' },
      { field: 'Salaried', header: 'Salaried' },
    ];
    this.addControlsEmployee();
    this.getEmployees();
  }

  getEmployees() {

    if (this.selectedType === 2 && this.selectedSalaryType === 2) {
      this.cols = [
        { field: 'LastName', header: 'Last Name' },
        { field: 'FirstName', header: 'First Name' },
        { field: 'Salaried', header: 'Salaried' },
        { field: 'Inactive', header: 'Inactive' },
      ];
    } else {
      if (this.selectedType !== 2 && this.selectedSalaryType === 2) {
        this.cols = [
          { field: 'LastName', header: 'Last Name' },
          { field: 'FirstName', header: 'First Name' },
          { field: 'Salaried', header: 'Salaried' },
        ];
      } else if (this.selectedSalaryType !== 2 && this.selectedType === 2) {
        this.cols = [
          { field: 'LastName', header: 'Last Name' },
          { field: 'FirstName', header: 'First Name' },
          { field: 'Inactive', header: 'Inactive' },
        ];
      } else {
        this.cols = [
          { field: 'LastName', header: 'Last Name' },
          { field: 'FirstName', header: 'First Name' },
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

    this.timesysSvc.getAllEmployee(_InActive, _Salaried)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._employees = data;
            this._recData = this._employees.length + ' employees found';
          } else {
            this._employees = [];
            this._recData = 'No employees found';
          }
        }
      );
  }

  getNonBillables(epmId: number) {
    this.timesysSvc.getNonBillablesAssignToEmployee(epmId)
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
    this.timesysSvc.getNonBillablesNotAssignToEmployee(epmId)
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

  getProjects(epmId: number) {
    this.timesysSvc.getProjectsAssignToEmployee(epmId)
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
    this.timesysSvc.getProjectsNotAssignToEmployee(epmId)
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

  getClients(epmId: number) {
    this.timesysSvc.getClientsAssignToEmployee(epmId)
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
    this.timesysSvc.getClientsNotAssignToEmployee(epmId)
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
    this._popUpHeader = 'Rate';
    this._employeeNameHdr = dataRow.LastName + ' ' + dataRow.FirstName;
    this.rateDialog = true;
  }

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
  }
  setDataToControlsEmployee(data: Employee) {
    this._frmEmployee.controls['frmLastName'].setValue(data.LastName);
    this._frmEmployee.controls['frmFirstName'].setValue(data.FirstName);
    this._frmEmployee.controls['frmNickName'].setValue(data.NickName);
    this._frmEmployee.controls['frmLoginID'].setValue(data.LoginID);
    this._frmEmployee.controls['frmPayrollID'].setValue(data.PayRoleID);
    this._frmEmployee.controls['frmEmailAddress'].setValue(data.EmailAddress);
    this._frmEmployee.controls['frmSecondaryEmailAddress'].setValue(data.SecondaryEmailAddress);
    this._frmEmployee.controls['frmSecurityLevel'].setValue(data.UserLevel);
    this._frmEmployee.controls['frmHireDate'].setValue(data.HireDate);
    this._frmEmployee.controls['frmStartDate'].setValue(data.StartDate);
    this._frmEmployee.controls['frmHoursPerDay'].setValue(data.HoursPerDay);
    this._frmEmployee.controls['frmSupervisor'].setValue(data.SupervisorId);
    if (data.Salaried !== undefined && data.Salaried !== null) {
      this.chkSalaried = data.Salaried;
    } else {
      this.chkSalaried = false;
    }
    if (data.SubmitsTime !== undefined && data.SubmitsTime !== null) {
      this.chkSubmitsTime = data.SubmitsTime;
    } else {
      this.chkSubmitsTime = false;
    }
    if (data.IPayEligible !== undefined && data.IPayEligible !== null) {
      this.chkIPayEligible = data.IPayEligible;
    } else {
      this.chkIPayEligible = false;
    }
    if (data.CompanyHolidays !== undefined && data.CompanyHolidays !== null) {
      this.chkCompanyHolidays = data.CompanyHolidays;
    } else {
      this.chkCompanyHolidays = false;
    }
    if (data.PayAvailableAlert !== undefined && data.PayAvailableAlert !== null) {
      this.chkPayAvailableAlert = data.PayAvailableAlert;
    } else {
      this.chkPayAvailableAlert = false;
    }
    if (data.Officer !== undefined && data.Officer !== null) {
      this.chkOfficer = data.Officer;
    } else {
      this.chkOfficer = false;
    }
    if (data.IsSupervisor !== undefined && data.IsSupervisor !== null) {
      this.chkSupervisor = data.IsSupervisor;
    } else {
      this.chkSupervisor = false;
    }
    if (data.IsTimesheetVerficationNeeded !== undefined && data.IsTimesheetVerficationNeeded !== null) {
      this.chkTimesheetVerification = data.IsTimesheetVerficationNeeded;
    } else {
      this.chkTimesheetVerification = false;
    }
    if (data.Inactive !== undefined && data.Inactive !== null) {
      this.chkInactive = data.Inactive;
    } else {
      this.chkInactive = false;
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
  editEmployee(data: any) {
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
    }
    this._selectedEmployee.LastName = this._frmEmployee.controls['frmLastName'].value.toString().trim();
    this._selectedEmployee.FirstName = this._frmEmployee.controls['frmFirstName'].value.toString().trim();
    this._selectedEmployee.NickName = this._frmEmployee.controls['frmNickName'].value.toString().trim();
    this._selectedEmployee.EmailAddress = this._frmEmployee.controls['frmEmailAddress'].value.toString().trim();
    this._selectedEmployee.SecondaryEmailAddress = this._frmEmployee.controls['frmSecondaryEmailAddress'].value.toString().trim();
    this._selectedEmployee.LoginID = this._frmEmployee.controls['frmLoginID'].value.toString().trim();
    this._selectedEmployee.PayRoleID = this._frmEmployee.controls['frmPayrollID'].value.toString().trim();
    this._selectedEmployee.UserLevel = this._frmEmployee.controls['frmSecurityLevel'].value.toString().trim();
    this._selectedEmployee.HireDate = this._frmEmployee.controls['frmHireDate'].value.toString().trim();
    this._selectedEmployee.StartDate = this._frmEmployee.controls['frmStartDate'].value.toString().trim();
    this._selectedEmployee.HoursPerDay = this._frmEmployee.controls['frmHoursPerDay'].value.toString().trim();
    this._selectedEmployee.SupervisorId = this._frmEmployee.controls['frmSupervisor'].value.toString().trim();

    this._selectedEmployee.Salaried = this.chkSalaried;
    this._selectedEmployee.SubmitsTime = this.chkSubmitsTime;
    this._selectedEmployee.IPayEligible = this.chkIPayEligible;
    this._selectedEmployee.CompanyHolidays = this.chkCompanyHolidays;
    this._selectedEmployee.PayAvailableAlert = this.chkPayAvailableAlert;
    this._selectedEmployee.Officer = this.chkOfficer;
    this._selectedEmployee.IsSupervisor = this.chkSupervisor;
    this._selectedEmployee.IsTimesheetVerficationNeeded = this.chkTimesheetVerification;
    this._selectedEmployee.Inactive = this.chkInactive;
    this.SaveEmployeeSPCall();
  }

  SaveEmployeeSPCall() {
    this.timesysSvc.Employee_InsertOrUpdate(this._selectedEmployee)
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
            this.clearControlsEmployee();
            this.getEmployees();
          }
        },
        (error) => {
          console.log(error);
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
        /* do nothing */
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
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: 'Employee password reset successfully'
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
        cancelApproval = true;
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
        cancelApproval = true;
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

}
