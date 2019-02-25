
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Employee, EmailOptions, ForgotPasswordHistory, EmployeePasswordHistory } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { PasswordValidator } from '../sharedpipes/password.validator';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {

  // Component Related Properties

  // Global or Common Properties


  // Form Related Properties
  signInForm: FormGroup;

  UniqueCode = '';
  forgotPasswordHistory: ForgotPasswordHistory = {};
  IsValidLink = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,

  ) {

  }


  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this.UniqueCode = params['code'] === undefined ? '' : params['code'];
    });
    this.Initialisations();
    this.ValidateUniqueCode();
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

  ValidateUniqueCode() {
    const LinkExpiryMin = this.commonSvc.getAppSettingsValue('LinkExpiryMin');

    this.forgotPasswordHistory.UniqueCode = this.UniqueCode;
    this.forgotPasswordHistory.LinkExpiryMin = +LinkExpiryMin;
    this.timesysSvc.ValidateForgotPassword(this.forgotPasswordHistory).subscribe(_forgotPasswordHistory => {
      if (_forgotPasswordHistory !== null && _forgotPasswordHistory.length > 0) {
        this.forgotPasswordHistory = _forgotPasswordHistory[0];
        this.IsValidLink = true;
      } else {
        this.IsValidLink = false;
        this.msgSvc.add({
          key: 'alert',
          sticky: true,
          severity: 'error',
          summary: 'Error!',
          detail: 'Link Expired!'
        });
      }
    });
  }

  // Buttons Related Events
  hasFormErrors() {
    return (!this.signInForm.valid || !this.IsValidLink);
  }



  onSubmit() {
    if (this.signInForm.invalid && !this.IsValidLink) {
      if (!this.IsValidLink) {
        this.msgSvc.add({
          key: 'alert',
          sticky: true,
          severity: 'error',
          summary: 'Error!',
          detail: 'Link Expired!'
        });
      }
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
    employeePasswordHistory.CheckLength = +PasswordHistoryCheckLength;
    employeePasswordHistory.Password = this.currentFormControls.password.value;
    this.timesysSvc.ValidateEmployeePasswordHistory(employeePasswordHistory).subscribe(_employeePasswordHistory => {
      if (_employeePasswordHistory !== null && _employeePasswordHistory.length > 0) {
        this.msgSvc.add({
          key: 'alert',
          sticky: true,
          severity: 'error',
          summary: 'Error!',
          detail: 'Password already used. Please change the password to a different one from the last '
            + PasswordHistoryCheckLength + ' passwords'
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
      this.SendEmailChangePassword();
    });
  }

  SendEmailChangePassword() {
    const _EmailOptions: EmailOptions = {};
    _EmailOptions.From = this.commonSvc.getAppSettingsValue('FinanceEmailAddress');
    _EmailOptions.EmailType = 'Change Password';
    _EmailOptions.To = sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserEmailAddress');
    _EmailOptions.SendAdmin = false;
    _EmailOptions.SendOnlyAdmin = false;
    _EmailOptions.ReplyTo = '';
    const BodyParams: string[] = [];
    BodyParams.push('pa55w0rd!!');
    _EmailOptions.BodyParams = BodyParams;
    this.timesysSvc.sendMail(_EmailOptions).subscribe(_mailOptions => {
      this.navigateTo('/login');
    });
  }

}
