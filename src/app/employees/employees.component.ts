import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Employee, NonBillables, Projects, Clients } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  _employees: Employee[] = null;
  _nonBillablesAssignToEmp: NonBillables[] = null;
  _nonBillablesNotAssignToEmp: NonBillables[] = null;
  _projectsAssignToEmp: Projects[] = null;
  _projectsNotAssignToEmp: Projects[] = null;
  _clientsAssignToEmp: Clients[] = null;
  _clientsNotAssignToEmp: Clients[] = null;
  activeColumn = true;
  cols: any;
  _recData: any;
  _popUpHeader = '';
  employeePopupHdr = '';
  nonBillablesIcon = false;
  projectsIcon = false;
  clientsIcon = false;
  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService) {
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
    this.getEmployees();
  }

  getEmployees() {
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
    console.log('InActive - ' + _InActive + ' , ' + 'Salaried - ' + _Salaried);

    this.timesysSvc.getAllEmployee(_InActive, _Salaried)
      .subscribe(
        (data) => {
          console.log(data);
          this._employees = data;
          this._recData = this._employees.length + ' customers found';
        }
      );
  }

  clickButton(event: any) {
    if (this.selectedType === 2) {
      this.cols = [
        { field: 'LastName', header: 'Last Name' },
        { field: 'FirstName', header: 'First Name' },
        { field: 'Salaried', header: 'Salaried' },
        { field: 'Inactive', header: 'Inactive' },
      ];
    } else {
      this.cols = [
        { field: 'LastName', header: 'Last Name' },
        { field: 'FirstName', header: 'First Name' },
        { field: 'Salaried', header: 'Salaried' },
      ];
    }
    if (this.selectedType === 1) {
      this.activeColumn = false;
    } else {
      this.activeColumn = true;
    }
    this.getEmployees();
  }

  deleteEmployee(dataRow: any) {
    this.confSvc.confirm({
      message: 'Are you sure you want to Terminate ' + dataRow.LastName + ' ' + dataRow.FirstName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
      },
      reject: () => {
        /* do nothing */
      }

    });
  }
  manageClients(dataRow: any) {
    this.clientsIcon = true;
    this._popUpHeader = 'Client';
    this.employeePopupHdr = 'Assign Clients to ' + dataRow.LastName + ' ' + dataRow.FirstName;
    this.getClients(dataRow.ID);
  }
  manageProjects(dataRow: any) {
    this.projectsIcon = true;
    this._popUpHeader = 'Project';
    this.employeePopupHdr = 'Assign Projects to ' + dataRow.LastName + ' ' + dataRow.FirstName;
    this.getProjects(dataRow.ID);
  }
  manageNonBillables(dataRow: any) {
    this.nonBillablesIcon = true;
    this._popUpHeader = 'Non-Billable Item';
    this.employeePopupHdr = 'Assign Non-Billable Items to ' + dataRow.LastName + ' ' + dataRow.FirstName;
    this.getNonBillables(dataRow.ID);
  }
  manageRates(dataRow: any) {
  }
  addEmployee() {
    this.router.navigate(['/menu/addemployee']);
  }
  editEmployee(dataRow: any) {
    this.router.navigate(['/menu/addemployee/' + dataRow.ID]);
  }

  getNonBillables(epmId: number) {
    this.timesysSvc.getNonBillablesAssignToEmployee(epmId)
      .subscribe(
        (data) => {
          this._nonBillablesAssignToEmp = data;
          console.log(this._nonBillablesAssignToEmp);
          this.timesysSvc.getNonBillablesNotAssignToEmployee(epmId)
            .subscribe(
              (empdata) => {
                this._nonBillablesNotAssignToEmp = empdata;
                console.log(this._nonBillablesNotAssignToEmp);
              }
            );

        }
      );
  }

  getProjects(epmId: number) {
    this.timesysSvc.getProjectsAssignToEmployee(epmId)
      .subscribe(
        (data) => {
          this._projectsAssignToEmp = data;
          console.log(this._projectsAssignToEmp);
          this.timesysSvc.getProjectsNotAssignToEmployee(epmId)
            .subscribe(
              (empdata) => {
                this._projectsNotAssignToEmp = empdata;
                console.log(this._projectsNotAssignToEmp);
              }
            );

        }
      );
  }

  getClients(epmId: number) {
    this.timesysSvc.getClientsAssignToEmployee(epmId)
      .subscribe(
        (data) => {
          this._clientsAssignToEmp = data;
          console.log(this._clientsAssignToEmp);
          this.timesysSvc.getClientsNotAssignToEmployee(epmId)
            .subscribe(
              (empdata) => {
                this._clientsNotAssignToEmp = empdata;
                console.log(this._clientsNotAssignToEmp);
              }
            );

        }
      );
  }

  sortTarget() {
    /**** Very very important code */
    if (this._nonBillablesAssignToEmp != null && this._nonBillablesAssignToEmp.length > 0) {
      this._nonBillablesAssignToEmp = this._nonBillablesAssignToEmp.sort(
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
    if (this._projectsAssignToEmp != null && this._projectsAssignToEmp.length > 0) {
      this._projectsAssignToEmp = this._projectsAssignToEmp.sort(
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
    if (this._clientsAssignToEmp != null && this._clientsAssignToEmp.length > 0) {
      this._clientsAssignToEmp = this._clientsAssignToEmp.sort(
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
  sortSource() {
    /**** Very very important code */
    if (this._nonBillablesNotAssignToEmp != null && this._nonBillablesNotAssignToEmp.length > 0) {
      this._nonBillablesNotAssignToEmp = this._nonBillablesNotAssignToEmp.sort(
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
    if (this._projectsNotAssignToEmp != null && this._projectsNotAssignToEmp.length > 0) {
      this._projectsNotAssignToEmp = this._projectsNotAssignToEmp.sort(
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
    if (this._clientsNotAssignToEmp != null && this._clientsNotAssignToEmp.length > 0) {
      this._clientsNotAssignToEmp = this._clientsNotAssignToEmp.sort(
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
}
