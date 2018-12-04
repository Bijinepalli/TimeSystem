import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Employee } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css']
})
export class AddEmployeeComponent implements OnInit {
  visibleHelp: boolean;
  helpText: string;

  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute) { }
  _frm = new FormGroup({});
  _securityLevel: SelectItem[];
  _securityLevelDefault: string;
  _employeeId: number;
  _employees: Employee[] = null;
  isEdit = false;
  ngOnInit() {
    this.addControls();

    this._securityLevel = [
      { label: 'Admin', value: 'A' },
      { label: 'Employee', value: 'E' },
      { label: 'Program Manager', value: 'P' },
      { label: 'Payroll', value: 'Y' },
      { label: 'Billing', value: 'B' },
    ];
    this._securityLevelDefault = 'E';

    this.activatedRoute.params.subscribe((params) => {
      this._employeeId = params['id'] === undefined ? -1 : params['id'];
      this.getEmployees();
      if (this._employeeId !== -1) {
        this.isEdit = true;
      }
    });

  }
  getEmployeeDetails(empId: number) {
    this.timesysSvc.getEmployee(empId.toString(), '', '')
      .subscribe(
        (data) => {
          this._employees = data;
        }
      );
  }
  getEmployees() {
    this.timesysSvc.getAllEmployee('', '')
      .subscribe(
        (data) => {
          this._employees = data;
          console.log(this._employees);
          const _employee = this._employees.filter(P => P.ID === +this._employeeId);
          console.log(_employee);
          this.setDataToControls(_employee[0]);

        }
      );
  }
  setDataToControls(data: any) {
    this._frm.controls['lastName'].setValue(data.LastName);
    this._frm.controls['firstName'].setValue(data.FirstName);
    this._frm.controls['nickName'].setValue(data.NickName);
    this._frm.controls['payrollId'].setValue(data.PayRoleID);
    this._frm.controls['emailAddress'].setValue(data.EmailAddress);
    this._frm.controls['secondaryEmailAddress'].setValue(data.SecondaryEmailAddress);
    this._frm.controls['securityLevel'].setValue(data.UserLevel);
    this._frm.controls['hireDate'].setValue(data.HireDate);
    this._frm.controls['hoursPerDay'].setValue(data.HoursPerDay);
    this._frm.controls['salariedEmployee'].setValue(data.Salaried);
    this._frm.controls['employeTimesheets'].setValue(data.SubmitsTime);
    this._frm.controls['employeIncentive'].setValue(data.IPayEligible);
    this._frm.controls['employeeSchedule'].setValue(data.CompanyHolidays);
    this._frm.controls['companyOfficer'].setValue(data.Officer);
    this._frm.controls['inactiveForm'].setValue(data.Inactive);
  }
  addControls() {
    this._frm.addControl('lastName', new FormControl(null, Validators.required));
    this._frm.addControl('firstName', new FormControl(null, Validators.required));
    this._frm.addControl('nickName', new FormControl(null, null));
    this._frm.addControl('payrollId', new FormControl(null, Validators.required));
    this._frm.addControl('emailAddress', new FormControl(null, Validators.required));
    this._frm.addControl('secondaryEmailAddress', new FormControl(null, null));
    this._frm.addControl('securityLevel', new FormControl('E'));
    this._frm.addControl('hireDate', new FormControl(null));
    this._frm.addControl('hoursPerDay', new FormControl(null));
    this._frm.addControl('salariedEmployee', new FormControl(null));
    this._frm.addControl('employeTimesheets', new FormControl(null));
    this._frm.addControl('employeIncentive', new FormControl(null));
    this._frm.addControl('employeeSchedule', new FormControl(null));
    this._frm.addControl('companyOfficer', new FormControl(null));
    this._frm.addControl('inactiveForm', new FormControl(null));
    this._frm.addControl('resetPassword', new FormControl(null));
  }

  hasFormErrors() {
    return !this._frm.valid;
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

  resetForm() {
    this._frm.markAsPristine();
    this._frm.markAsUntouched();
    this._frm.updateValueAndValidity();
    this._frm.reset();
  }
  saveEmployee() {
    this.router.navigate(['/menu/employees']);
  }
  cancelEmployee() {
    this.router.navigate(['/menu/employees']);
  }
}
