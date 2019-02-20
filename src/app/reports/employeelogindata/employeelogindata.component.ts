import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Employee, NonBillables, Projects, Clients } from '../../model/objects';

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
  helpText: any;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private fb: FormBuilder) {
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
  }

  ngOnInit() {
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '150px' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '150px' },
      { field: 'LoginID', header: 'Login ID', align: 'left', width: '200px' },
      { field: 'DecryptedPassword', header: 'Password', align: 'left', width: 'auto' },
      { field: 'EmailAddress', header: 'Email Address', align: 'left', width: 'auto' },
      { field: 'Salaried', header: 'Salaried', align: 'center', width: '110px' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '110px' },
    ];
    this.getEmployeesForReport();
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
  getEmployeesForReport() {
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
          this._listEmployeeLoginData = data;
          this._recData = this._listEmployeeLoginData.length + ' matching employees';
        }
      );
  }
}
