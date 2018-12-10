import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AppSettings, LoginErrorMessage, Employee, EmailOptions, ForgotPasswordHistory } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { PasswordValidator } from '../sharedpipes/password.validator';


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
  appSettings: AppSettings[] = [];
  ByPassPassword = '';
  LoginAttemptsLimit = '';
  PasswordExpiryDays = '';
  LinkExpiryMin = '';
  ValidateUserNameErrors: LoginErrorMessage[] = [];
  ValidateCredentialsErrors: LoginErrorMessage[] = [];
  EmployeeData: Employee[] = [];
  // Form Related Properties

  signInForm: FormGroup;
  FinanceEmailAddress: string;
  WebsiteAddress: string;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private timesysSvc: TimesystemService,
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
    this.signInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
    this.GetAppSettings();
  }

  // Common Methods

  navigateTo(url: any) {
    this.router.navigate([url]);
  }

  onReject() {
    this.msgSvc.clear('alert');
  }

  GetAppSettings() {
    this.appSettings = [];
    this.timesysSvc.getAppSettings()
      .subscribe(
        (data) => {
          this.appSettings = data;
          this.BuildFormControls();
        }
      );
  }
  GetAppSettingsValue(DataKey: string): any {
    let AppSettingsValue = '';
    if (this.appSettings !== undefined && this.appSettings !== null && this.appSettings.length > 0) {
      const AppsettingsVal: AppSettings = this.appSettings.find(m => m.DataKey === DataKey);
      if (AppsettingsVal !== undefined && AppsettingsVal !== null) {
        AppSettingsValue = AppsettingsVal.Value;
      }
    }
    return AppSettingsValue;
  }

  BuildFormControls() {
    this.ByPassPassword = this.GetAppSettingsValue('ByPassPassword');
    this.LoginAttemptsLimit = this.GetAppSettingsValue('LoginAttemptsLimit');
    this.PasswordExpiryDays = this.GetAppSettingsValue('PasswordExpiryDays');
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
    this.timesysSvc.EmployeeValidateByCredentials(this.LoginAttemptsLimit,
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
            localStorage.setItem('HireDate', this.EmployeeData[0].HireDate.toString());
            localStorage.setItem('currentUser',
              this.EmployeeData[0].FirstName.toString() + (
                (this.EmployeeData[0].LastName.toString() !== '') ?
                  (' ' + this.EmployeeData[0].LastName.toString()) : ''
              ));
            localStorage.setItem('UserEmailAddress', this.EmployeeData[0].EmailAddress.toString());
            this.navigateTo('/menu/dashboard');
          }
        }
      );
  }

  ForgotPasswordClick() {
    this.validateUserName('forgot');
  }

  SendEmailForgotPassword() {

    this.LinkExpiryMin = this.GetAppSettingsValue('LinkExpiryMin');
    this.WebsiteAddress = this.GetAppSettingsValue('WebsiteAddress');
    this.FinanceEmailAddress = this.GetAppSettingsValue('FinanceEmailAddress');

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
                _EmailOptions.From = this.FinanceEmailAddress;
                _EmailOptions.EmailType = 'Forgot Password';
                _EmailOptions.To = this.EmployeeData[0].EmailAddress.toString();
                _EmailOptions.SendAdmin = false;
                _EmailOptions.SendOnlyAdmin = false;
                _EmailOptions.ReplyTo = '';
                const BodyParams: string[] = [];
                BodyParams.push(this.WebsiteAddress + 'changepassword/' + forgotPasswordHistory.UniqueCode.toString());
                BodyParams.push(this.LinkExpiryMin);
                _EmailOptions.BodyParams = BodyParams;
                console.log(_EmailOptions);
                this.timesysSvc.sendMail(_EmailOptions).subscribe(_mailOptions => {
                  const Msg = 'Email is sent with a link to Change Password that will expire in ' + this.LinkExpiryMin + ' minutes.';
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
