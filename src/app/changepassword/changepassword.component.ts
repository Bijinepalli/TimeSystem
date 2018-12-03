
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AppSettings, LoginErrorMessage, Employee, EmailOptions, EmployeePasswordHistory } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { PasswordValidator } from '../sharedpipes/password.validator';


@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {

  // Component Related Properties

  // Global or Common Properties
  appSettings: AppSettings[] = [];


  // Form Related Properties
  signInForm: FormGroup;
  FinanceEmailAddress = '';
  PasswordHistoryCheckLength: any;

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
    this.BuildFormControls();
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
    this.PasswordHistoryCheckLength = this.GetAppSettingsValue('PasswordHistoryCheckLength');
    const employeePasswordHistory: EmployeePasswordHistory = {};
    employeePasswordHistory.CheckLength = this.PasswordHistoryCheckLength;
    employeePasswordHistory.Password = this.currentFormControls.password.value;
    this.timesysSvc.ValidateEmployeePasswordHistory(employeePasswordHistory).subscribe(_employeePasswordHistory => {
      if (_employeePasswordHistory !== null && _employeePasswordHistory.length > 0) {

      } else {
        this.UpdatePassword();
      }
    });
  }

  UpdatePassword() {


    this.SendEmailChangePassword();
  }

  SendEmailChangePassword() {
    this.FinanceEmailAddress = this.GetAppSettingsValue('FinanceEmailAddress');

    const _EmailOptions: EmailOptions = {};
    _EmailOptions.From = this.FinanceEmailAddress;
    _EmailOptions.EmailType = 'Change Password';
    _EmailOptions.To = localStorage.getItem('UserEmailAddress');
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
