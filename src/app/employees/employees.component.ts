import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Employee } from '../model/objects';
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
  activeColumn = true;
  cols: any;
  _recData: any;
  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService) {
    this.types = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.salaryTypes = [
      { label: 'Salaried', value: 0 },
      { label: 'Inactive', value: 1 },
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
    console.log(this.selectedType, this.selectedSalaryType);
    this.timesysSvc.getAllEmployee(this.selectedType, this.selectedSalaryType)
      .subscribe(
        (data) => {
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

  }
  manageProjects(dataRow: any) {

  }
  manageNonBillables(dataRow: any) {

  }
  manageRates(dataRow: any) {

  }
  addEmployee() {
    this.router.navigate(['/menu/addemployee']);
  }
  editEmployee(dataRow: any) {
    this.router.navigate(['/menu/addemployee/' + dataRow.ID]);
  }
}
