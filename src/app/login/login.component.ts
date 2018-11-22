import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AppSettings, LoginErrorMessage, Employee } from '../model/objects';
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
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        PasswordValidator.strong
      ]
      ]
    });
    this.GetAppSettings();
    this.BuildFormControls();
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
    if (this.ByPassPassword !== '' && this.ByPassPassword === 'true') {

      this.signInForm = this.fb.group({
        username: ['ramesh.rao', [Validators.required]],
        password: ['pa55w0rd@']
      });
    } else {
      this.signInForm = this.fb.group({
        username: ['ramesh.rao', [Validators.required]],
        password: ['pa55w0rd@', [
          Validators.required,
          Validators.minLength(8),
          PasswordValidator.strong
        ]
        ]
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

  onSubmit() {
    if (this.signInForm.invalid) {
      return;
    } else {
      this.validateuser();
    }
  }

  // Business Logic Methods

  validateuser() {
    this.validateUserName();
  }

  validateUserName() {
    this.timesysSvc.EmployeeValidateByLoginID(this.currentFormControls.username.value)
      .subscribe(
        (data) => {
          console.log('Validate User Name Errors -');
          console.log(data);
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
              if (this.ByPassPassword !== '' && this.ByPassPassword === 'true') {
                this.getEmployeeData('', this.currentFormControls.username.value, '');
              } else {
                this.validateCredentials();
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
          console.log('Validate Credentials Errors -');
          console.log(data);
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
          console.log('Get Employee Data -');
          console.log(data);
          if (data !== undefined && data !== null && data.length > 0) {
            this.EmployeeData = data;
            localStorage.setItem('UserId', this.EmployeeData[0].ID.toString());
            localStorage.setItem('LoginID', this.EmployeeData[0].LoginID.toString());
            localStorage.setItem('UserName', this.EmployeeData[0].FirstName.toString() +
              (this.EmployeeData[0].LastName.toString() !== '') ? (' ' + this.EmployeeData[0].LastName.toString()) : '');
            localStorage.setItem('UserRole', this.EmployeeData[0].UserLevel.toString());

            this.navigateTo('/menu/dashboard');
          }
        }
      );
  }




}
