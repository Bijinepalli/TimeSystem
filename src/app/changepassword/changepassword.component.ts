
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AppSettings, LoginErrorMessage, Employee } from '../model/objects';
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
      this.SendEmailChangePassword();
    }
  }

  CancelClick() {
    this.navigateTo('/login');
  }

  // Business Logic Methods

  SendEmailChangePassword() {
    const Msg = 'Your Password has been changed. Please continue to login page.';
    this.msgSvc.add({
      key: 'alert',
      sticky: true,
      severity: 'info',
      summary: 'Mail Sent!',
      detail: Msg
    });
    // this.navigateTo('/login');
  }

}
