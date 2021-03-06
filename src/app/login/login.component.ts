import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { LoginErrorMessage, Employee, EmailOptions, ForgotPasswordHistory, PageNames } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { PasswordValidator } from '../sharedpipes/password.validator';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { ActivitylogService } from '../service/activitylog.service'; // ActivityLog - Default
import { debug } from 'util';


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
  showSpinner = false;

  _type = 'password';
  _class = 'fa fa-eye';
  _bool = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    public commonSvc: CommonService,
  ) {

  }


  ngOnInit() {
    this.Initialisations();
  }

  // Component Related Initialisations

  Initialisations() {
    this.showSpinner = true;
    localStorage.clear();
    sessionStorage.clear();
    this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    this.showSpinner = false;
    this.BuildFormControls();
  }

  // Common Methods

  navigateTo(url: any, queryParams: any) {
    this.router.navigate([url], { queryParams: queryParams, skipLocationChange: true });
  }

  onReject() {
    this.msgSvc.clear('alert');
  }

  BuildFormControls() {
    this.showSpinner = true;
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
    this.showSpinner = false;
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
      sessionStorage.setItem(environment.buildType.toString() + '_' + 'UserName', this.currentFormControls.username.value.toString());
      this.validateUserName('submit');
    }
  }

  // Business Logic Methods
  validateUserName(key: string) {
    this.showSpinner = true;
    this.timesysSvc.EmployeeValidateByLoginID(this.currentFormControls.username.value)
      .subscribe(
        (data) => {
          this.showSpinner = false;
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
              this.logSvc.ActionLog(PageNames.Login, '', 'Error', 'Validate UserName',
                this.ValidateUserNameErrors[0].ErrorMessage, '', '', ''); // ActivityLog
            } else {
              // this.logSvc.ActionLog(0, 'Login', '', 'Success', 'Validate UserName', 'Validation Successful');
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
    this.showSpinner = true;
    this.timesysSvc.EmployeeValidateByCredentials(
      this.commonSvc.getAppSettingsValue('LoginAttemptsLimit'),
      this.currentFormControls.username.value,
      this.currentFormControls.password.value)
      .subscribe(
        (data) => {
          this.showSpinner = false;
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
              this.logSvc.ActionLog(PageNames.Login, '', 'Error', 'Validate Credentials',
                this.ValidateCredentialsErrors[0].ErrorMessage, '', '', ''); // ActivityLog
              if (this.ValidateCredentialsErrors[0].ErrorMessage.toString().indexOf('The user name is locked') > -1) {
                this.showSpinner = true;
                this.timesysSvc.EmailByType('',
                  [this.currentFormControls.username.value],
                  'User Lock On Failed Login Attempts'
                  , true.toString().toLowerCase()).
                  subscribe(dataEmail => {
                    this.showSpinner = false;
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
                      this.router.navigate(['/login']);
                    }
                  });
              }

            } else {
              // this.logSvc.ActionLog(0, 'Login', '', 'Success', 'Validate Credentials', 'Validation Successful');
              this.getEmployeeData('', this.currentFormControls.username.value, this.currentFormControls.password.value);
            }
          }
        }
      );
  }

  getEmployeeData(EmployeeID: string, LoginID: string, Password: string) {
    this.showSpinner = true;
    this.timesysSvc.getEmployee(EmployeeID, LoginID, Password)
      .subscribe(
        (data) => {
          this.showSpinner = false;
          if (data !== undefined && data !== null && data.length > 0) {
            this.EmployeeData = data;
            sessionStorage.setItem(environment.buildType.toString() + '_' + 'UserId', this.EmployeeData[0].ID.toString());
            sessionStorage.setItem(environment.buildType.toString() + '_' + 'UserRole', this.EmployeeData[0].UserLevel.toString());
            sessionStorage.setItem(environment.buildType.toString() + '_' + 'HireDate', this.EmployeeData[0].HireDate.toString());
            sessionStorage.setItem(environment.buildType.toString() + '_' + 'currentUser',
              this.EmployeeData[0].FirstName.toString() + (
                (this.EmployeeData[0].LastName.toString() !== '') ?
                  (' ' + this.EmployeeData[0].LastName.toString()) : ''
              ));
            sessionStorage.setItem(environment.buildType.toString() + '_' + 'UserEmailAddress',
              this.EmployeeData[0].EmailAddress.toString());
            sessionStorage.setItem(environment.buildType.toString() + '_' + 'PayRollName',
              this.EmployeeData[0].PayRoleID.toString());
            sessionStorage.setItem(environment.buildType.toString() + '_' + 'SubmitsTime',
              this.EmployeeData[0].SubmitsTime.toString().toLowerCase());
            sessionStorage.setItem(environment.buildType.toString() + '_' + 'IsSupervisor',
              this.EmployeeData[0].IsSupervisor.toString().toLowerCase());
            let PasswordExpired = false;
            const PasswordLastUpdatedDays = this.EmployeeData[0].LastUpdatedDays;
            if (PasswordLastUpdatedDays !== undefined && PasswordLastUpdatedDays !== null) {
              const PasswordExpiryDays = this.commonSvc.getAppSettingsValue('PasswordExpiryDays');
              const ExpiryDays = +PasswordExpiryDays + PasswordLastUpdatedDays;
              if (ExpiryDays < 0) {
                PasswordExpired = true;
              }
            }
            if (PasswordExpired) {
              this.logSvc.ActionLog(PageNames.Login, '', 'Error', 'Employee Data', 'Password Expired', '', '', ''); // ActivityLog
              let forgotPasswordHistory: ForgotPasswordHistory = {};
              forgotPasswordHistory.EmployeeID = +(this.EmployeeData[0].ID.toString());
              forgotPasswordHistory.EmailAddress = this.EmployeeData[0].EmailAddress.toString();
              this.showSpinner = true;
              this.timesysSvc.InsertForgotPasswordHistory(forgotPasswordHistory).subscribe(dataForgot => {
                this.showSpinner = false;
                if (dataForgot !== null) {
                  forgotPasswordHistory = dataForgot;
                  this.navigateTo('/changepassword/' + forgotPasswordHistory.UniqueCode.toString(), {});
                }
              });
            } else {
              this.logSvc.ActionLog(PageNames.Login, '', 'Success', 'Login', 'Logged In', '', '', ''); // ActivityLog
              this.navigateTo('/menu/dashboard', { Id: -1 });
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

    this.showSpinner = true;
    this.timesysSvc.getEmployee('', this.currentFormControls.username.value, '')
      .subscribe(
        (data) => {
          this.showSpinner = false;
          if (data !== undefined && data !== null && data.length > 0) {
            this.EmployeeData = data;

            let forgotPasswordHistory: ForgotPasswordHistory = {};
            forgotPasswordHistory.EmployeeID = +(this.EmployeeData[0].ID.toString());
            forgotPasswordHistory.EmailAddress = this.EmployeeData[0].EmailAddress.toString();

            this.showSpinner = true;
            this.timesysSvc.InsertForgotPasswordHistory(forgotPasswordHistory).subscribe(dataForgot => {
              this.showSpinner = false;
              if (dataForgot !== null) {
                forgotPasswordHistory = dataForgot;
                // const _EmailOptions: EmailOptions = {};
                // _EmailOptions.From = FinanceEmailAddress;
                // _EmailOptions.EmailType = 'Forgot Password';
                // _EmailOptions.To = this.EmployeeData[0].EmailAddress.toString();
                // _EmailOptions.SendAdmin = false;
                // _EmailOptions.SendOnlyAdmin = false;
                // _EmailOptions.ReplyTo = '';
                const BodyParams: string[] = [];
                BodyParams.push(WebsiteAddress + 'changepassword/' + forgotPasswordHistory.UniqueCode.toString());
                BodyParams.push(LinkExpiryMin);
                // _EmailOptions.BodyParams = BodyParams;

                this.showSpinner = true;
                this.timesysSvc.EmailByType(this.EmployeeData[0].EmailAddress.toString(),
                  BodyParams,
                  'Forgot Password'
                  , false.toString().toLowerCase()).
                  subscribe(dataEmail => {
                    this.showSpinner = false;
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
                      this.logSvc.ActionLog(PageNames.Login, '', 'Error', 'Forgot Password', Errors, '', '', ''); // ActivityLog
                    } else {
                      this.msgSvc.add({
                        key: 'saveSuccess',
                        sticky: false,
                        severity: 'success',
                        summary: 'Info',
                        detail: 'Email is sent with a link to Change Password that will expire in '
                          + LinkExpiryMin.toString() + ' minutes.',
                      });
                      this.logSvc.ActionLog(PageNames.Login, '', 'Success', 'Forgot Password',
                        'Email is sent with a link to Change Password that will expire in '
                        + LinkExpiryMin.toString() + ' minutes.', '', '', ''); // ActivityLog
                    }
                  });

                // this.timesysSvc.sendMail(_EmailOptions).subscribe(_mailOptions => {
                //   const Msg = 'Email is sent with a link to Change Password that will expire in ' + LinkExpiryMin + ' minutes.';
                //   this.msgSvc.add({
                //     key: 'alert',
                //     sticky: true,
                //     severity: 'info',
                //     summary: 'Mail Sent!',
                //     detail: Msg
                //   });
                // });
              }
            });
          }
        }
      );
  }

  showPassword() {
    if (this._type === 'password') {
      this._type = 'text';
      this._class = 'fa fa-eye-slash';
    } else {
      this._type = 'password';
      this._class = 'fa fa-eye';
    }
  }


}
