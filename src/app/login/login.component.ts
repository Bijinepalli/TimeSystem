import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { LoginErrorMessage, Employee, EmailOptions, ForgotPasswordHistory } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { PasswordValidator } from '../sharedpipes/password.validator';
import { CommonService } from '../service/common.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  // Component Related Properties

  // Global or Common Properties
  returnUrl: string;
  isIEOrEdge = false;

  ByPassPassword = '';

  ValidateUserNameErrors: LoginErrorMessage[] = [];
  ValidateCredentialsErrors: LoginErrorMessage[] = [];
  EmployeeData: Employee[] = [];
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
    localStorage.clear();
    this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
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
    this.ByPassPassword = this.commonSvc.getAppSettingsValue('ByPassPassword');
    if (this.ByPassPassword !== '' && this.ByPassPassword === 'true') {
      this.signInForm = this.fb.group({
        username: ['ramesh.rao', [Validators.required]],
        password: ['']
      });
    } else {
      this.signInForm = this.fb.group({
        username: ['ramesh.rao', [Validators.required]],
        password: ['pa55w0rd!!', [Validators.required]]
      });
    }
  }

  get currentFormControls() {
    return this.signInForm.controls;
  }

  // Buttons Related Events

  hasFormErrors() {
    return !this.signInForm.valid;
  }

  hasFormErrorsForgot() {
    return !this.currentFormControls.username.valid;
  }

  onSubmit() {
    if (this.signInForm.invalid) {
      return;
    } else {
      this.validateUserName('submit');
    }
  }

  // Business Logic Methods
  validateUserName(key: string) {
    this.timesysSvc.EmployeeValidateByLoginID(this.currentFormControls.username.value)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            this.ValidateUserNameErrors = data;
            if (this.ValidateUserNameErrors.length > 0) {
              this.msgSvc.add({
                key: 'alert',
                sticky: true,
                severity: 'error',
                summary: 'Login Failed!',
                detail: this.ValidateUserNameErrors[0].ErrorMessage
              });
            } else {
              if (key === 'submit') {
                if (this.ByPassPassword !== '' && this.ByPassPassword === 'true') {
                  this.getEmployeeData('', this.currentFormControls.username.value, '');
                } else {
                  this.validateCredentials();
                }
              } else {
                this.SendEmailForgotPassword();
              }
            }
          }
        }
      );
  }

  validateCredentials() {
    this.timesysSvc.EmployeeValidateByCredentials(
      this.commonSvc.getAppSettingsValue('LoginAttemptsLimit'),
      this.currentFormControls.username.value,
      this.currentFormControls.password.value)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            this.ValidateCredentialsErrors = data;
            if (this.ValidateCredentialsErrors.length > 0) {
              this.msgSvc.add({
                key: 'alert',
                sticky: true,
                severity: 'error',
                summary: 'Login Failed!',
                detail: this.ValidateCredentialsErrors[0].ErrorMessage
              });
            } else {
              this.getEmployeeData('', this.currentFormControls.username.value, this.currentFormControls.password.value);
            }
          }
        }
      );
  }

  getEmployeeData(EmployeeID: string, LoginID: string, Password: string) {
    this.timesysSvc.getEmployee(EmployeeID, LoginID, Password)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this.EmployeeData = data;
            localStorage.setItem('UserId', this.EmployeeData[0].ID.toString());
            localStorage.setItem('UserRole', this.EmployeeData[0].UserLevel.toString());
            localStorage.setItem('currentUser',
              this.EmployeeData[0].FirstName.toString() + (
                (this.EmployeeData[0].LastName.toString() !== '') ?
                  (' ' + this.EmployeeData[0].LastName.toString()) : ''
              ));
            localStorage.setItem('UserEmailAddress', this.EmployeeData[0].EmailAddress.toString());
            let PasswordExpired = false;
            const PasswordLastUpdatedDays = this.EmployeeData[0].LastUpdatedDays;
            if (PasswordLastUpdatedDays !== undefined && PasswordLastUpdatedDays !== null) {
              const PasswordExpiryDays = this.commonSvc.getAppSettingsValue('PasswordExpiryDays');
              const ExpiryDays = +PasswordExpiryDays - PasswordLastUpdatedDays;
              if (ExpiryDays < 0) {
                PasswordExpired = true;
              }
            }
            if (PasswordExpired) {
              let forgotPasswordHistory: ForgotPasswordHistory = {};
              forgotPasswordHistory.EmployeeID = +(this.EmployeeData[0].ID.toString());
              forgotPasswordHistory.EmailAddress = this.EmployeeData[0].EmailAddress.toString();
              this.timesysSvc.InsertForgotPasswordHistory(forgotPasswordHistory).subscribe(dataForgot => {
                if (dataForgot !== null) {
                  forgotPasswordHistory = dataForgot;
                  this.navigateTo('/changepassword/' + forgotPasswordHistory.UniqueCode.toString());
                }
              });
            } else {
              this.navigateTo('/menu/dashboard');
            }
          }
        }
      );
  }

  ForgotPasswordClick() {
    this.validateUserName('forgot');
  }

  SendEmailForgotPassword() {

    const LinkExpiryMin = this.commonSvc.getAppSettingsValue('LinkExpiryMin');
    const WebsiteAddress = this.commonSvc.getAppSettingsValue('WebsiteAddress');
    const FinanceEmailAddress = this.commonSvc.getAppSettingsValue('FinanceEmailAddress');

    this.timesysSvc.getEmployee('', this.currentFormControls.username.value, '')
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this.EmployeeData = data;

            let forgotPasswordHistory: ForgotPasswordHistory = {};
            forgotPasswordHistory.EmployeeID = +(this.EmployeeData[0].ID.toString());
            forgotPasswordHistory.EmailAddress = this.EmployeeData[0].EmailAddress.toString();
            this.timesysSvc.InsertForgotPasswordHistory(forgotPasswordHistory).subscribe(dataForgot => {
              if (dataForgot !== null) {
                forgotPasswordHistory = dataForgot;
                const _EmailOptions: EmailOptions = {};
                _EmailOptions.From = FinanceEmailAddress;
                _EmailOptions.EmailType = 'Forgot Password';
                _EmailOptions.To = this.EmployeeData[0].EmailAddress.toString();
                _EmailOptions.SendAdmin = false;
                _EmailOptions.SendOnlyAdmin = false;
                _EmailOptions.ReplyTo = '';
                const BodyParams: string[] = [];
                BodyParams.push(WebsiteAddress + 'changepassword/' + forgotPasswordHistory.UniqueCode.toString());
                BodyParams.push(LinkExpiryMin);
                _EmailOptions.BodyParams = BodyParams;
                this.timesysSvc.sendMail(_EmailOptions).subscribe(_mailOptions => {
                  const Msg = 'Email is sent with a link to Change Password that will expire in ' + LinkExpiryMin + ' minutes.';
                  this.msgSvc.add({
                    key: 'alert',
                    sticky: true,
                    severity: 'info',
                    summary: 'Mail Sent!',
                    detail: Msg
                  });
                });
              }
            });
          }
        }
      );
  }


}
