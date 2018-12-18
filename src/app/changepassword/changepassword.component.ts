
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Employee, EmailOptions, EmployeePasswordHistory } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { PasswordValidator } from '../sharedpipes/password.validator';
import { CommonService } from '../service/common.service';


@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {

  // Component Related Properties

  // Global or Common Properties



  // Form Related Properties
  signInForm: FormGroup;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
  ) {

  }


  ngOnInit() {
    this.Initialisations();
  }

  // Component Related Initialisations

  Initialisations() {
    this.BuildFormControls();
  }

  // Common Methods

  navigateTo(url: any) {
    this.router.navigate([url]);
  }

  onReject() {
    this.msgSvc.clear('alert');
  }



  BuildFormControls() {
    this.signInForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        PasswordValidator.strong,
        PasswordValidator.validateEqualConfirmPassword,
      ]
      ],
      confirmpassword: ['', [
        Validators.required,
        Validators.minLength(8),
        PasswordValidator.strong,
        PasswordValidator.validateEqualPassword,
      ]
      ],
    });
  }

  get currentFormControls() {
    return this.signInForm.controls;
  }

  // Buttons Related Events
  hasFormErrors() {
    return !this.signInForm.valid;
  }

  onSubmit() {
    if (this.signInForm.invalid) {
      return;
    } else {
      this.SubmitFunctionality();
    }
  }

  CancelClick() {
    this.navigateTo('/login');
  }

  // Business Logic Methods

  SubmitFunctionality() {
    const PasswordHistoryCheckLength = this.commonSvc.getAppSettingsValue('PasswordHistoryCheckLength');
    const employeePasswordHistory: EmployeePasswordHistory = {};
    employeePasswordHistory.CheckLength = PasswordHistoryCheckLength;
    employeePasswordHistory.Password = this.currentFormControls.password.value;
    this.timesysSvc.ValidateEmployeePasswordHistory(employeePasswordHistory).subscribe(_employeePasswordHistory => {
      if (_employeePasswordHistory !== null && _employeePasswordHistory.length > 0) {
        this.msgSvc.add({
          key: 'alert',
          sticky: true,
          severity: 'error',
          summary: 'Error!',
          detail: 'Password already used. Please change the password to a different one from the last '
            + PasswordHistoryCheckLength.ToString() + ' passwords'
        });
      } else {
        this.UpdatePassword();
      }
    });
  }

  UpdatePassword() {
    const employee: Employee = {};
    employee.ID = +localStorage.getItem('UserId');
    employee.CreatedBy = +localStorage.getItem('UserId');
    employee.Password = this.currentFormControls.password.value;
    this.timesysSvc.Employee_UpdatePassword(employee).subscribe(_employee => {
      this.SendEmailChangePassword(this.currentFormControls.password.value);
    });
  }

  SendEmailChangePassword(NewPassword: string) {
    const _EmailOptions: EmailOptions = {};
    _EmailOptions.From = this.commonSvc.getAppSettingsValue('FinanceEmailAddress');
    _EmailOptions.EmailType = 'Change Password';
    _EmailOptions.To = localStorage.getItem('UserEmailAddress');
    _EmailOptions.SendAdmin = false;
    _EmailOptions.SendOnlyAdmin = false;
    _EmailOptions.ReplyTo = '';
    const BodyParams: string[] = [];
    BodyParams.push(NewPassword);
    _EmailOptions.BodyParams = BodyParams;
    this.timesysSvc.sendMail(_EmailOptions).subscribe(_mailOptions => {
      this.navigateTo('/login');
    });
  }

}
