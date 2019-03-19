
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Employee, EmailOptions, EmployeePasswordHistory } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { PasswordValidator } from '../sharedpipes/password.validator';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';


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
    this.router.navigate([url], { skipLocationChange: true });
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
    employeePasswordHistory.EmployeeID = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
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
    employee.ID = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
    employee.CreatedBy = +sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId');
    employee.Password = this.currentFormControls.password.value;
    this.timesysSvc.Employee_UpdatePassword(employee).subscribe(_employee => {
      this.SendEmailChangePassword(this.currentFormControls.password.value);
    });
  }

  SendEmailChangePassword(NewPassword: string) {
    const _EmailOptions: EmailOptions = {};
    // _EmailOptions.From = this.commonSvc.getAppSettingsValue('FinanceEmailAddress');
    // _EmailOptions.EmailType = 'Change Password';
    // _EmailOptions.To = sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserEmailAddress');
    // _EmailOptions.SendAdmin = false;
    // _EmailOptions.SendOnlyAdmin = false;
    // _EmailOptions.ReplyTo = '';
    const BodyParams: string[] = [];
    BodyParams.push(NewPassword);
    // _EmailOptions.BodyParams = BodyParams;

    this.timesysSvc.EmailByType(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserEmailAddress'),
      BodyParams,
      'Change Password'
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
        } else {
          this.msgSvc.add({
            key: 'alert',
            sticky: true,
            severity: 'success',
            summary: 'Email sent',
            detail: 'Password changed successfully',
          });
        }
      });

    // this.timesysSvc.sendMail(_EmailOptions).subscribe(_mailOptions => {
    //   this.navigateTo('/login');
    // });
  }

}
