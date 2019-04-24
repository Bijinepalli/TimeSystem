
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
  IsSecure: boolean;
  showSpinner: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private fb: FormBuilder,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private timesysSvc: TimesystemService,
    public commonSvc: CommonService,

  ) {

  }


  ngOnInit() {
    this.showSpinner = true;
    this.IsSecure = false;
    this.activatedRoute.params.subscribe((params) => {
      this.IsSecure = false;
      if (params !== undefined && params !== null &&
        params['code'] !== undefined && params['code'] !== null &&
        params['code'].toString() !== '') {
        this.IsSecure = true;
        this.ClearAllFields();
        this.UniqueCode = params['code'];
        this.Initialisations();
      }
    });
  }

  // Component Related Initialisations

  ClearAllFields() {
    this.forgotPasswordHistory = {};
    this.UniqueCode = '';
  }

  Initialisations() {
    this.ValidateUniqueCode();
  }

  // Common Methods

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
    this.showSpinner = true;
    const LinkExpiryMin = this.commonSvc.getAppSettingsValue('LinkExpiryMin');

    this.forgotPasswordHistory.UniqueCode = this.UniqueCode;
    this.forgotPasswordHistory.LinkExpiryMin = +LinkExpiryMin;

    this.timesysSvc.ValidateForgotPassword(this.forgotPasswordHistory).subscribe(_forgotPasswordHistory => {
      this.showSpinner = false;
      this.BuildFormControls();
      this.forgotPasswordHistory = null;
      if (_forgotPasswordHistory !== null && _forgotPasswordHistory.length > 0) {
        this.forgotPasswordHistory = _forgotPasswordHistory[0];
        this.IsValidLink = true;
      } else {
        this.IsValidLink = false;
        this.msgSvc.add({
          key: 'Expired',
          sticky: true,
          severity: 'error',
          summary: 'Error!',
          detail: 'Link Expired. Click OK to go to Login Page and try regenerating the link using Forgot Password option.'
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
          key: 'Expired',
          sticky: true,
          severity: 'error',
          summary: 'Error!',
          detail: 'Link Expired. Click OK to go to Login Page and try regenerating the link using Forgot Password option.'
        });
      }
      return;
    } else {
      this.SubmitFunctionality();
    }
  }

  CancelClick() {
    this.router.navigate(['/login']);
  }

  // Business Logic Methods

  SubmitFunctionality() {
    if (this.forgotPasswordHistory !== undefined && this.forgotPasswordHistory !== null &&
      this.forgotPasswordHistory.EmployeeID !== undefined && this.forgotPasswordHistory.EmployeeID !== null &&
      this.forgotPasswordHistory.EmployeeID.toString() !== '') {

      const PasswordHistoryCheckLength = this.commonSvc.getAppSettingsValue('PasswordHistoryCheckLength');

      const employeePasswordHistory: EmployeePasswordHistory = {};
      employeePasswordHistory.EmployeeID = +this.forgotPasswordHistory.EmployeeID;
      employeePasswordHistory.CheckLength = +PasswordHistoryCheckLength;
      employeePasswordHistory.Password = this.currentFormControls.password.value;

      this.showSpinner = true;
      this.timesysSvc.ValidateEmployeePasswordHistory(employeePasswordHistory).subscribe(_employeePasswordHistory => {
        this.showSpinner = false;
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
  }

  UpdatePassword() {
    if (this.forgotPasswordHistory !== undefined && this.forgotPasswordHistory !== null &&
      this.forgotPasswordHistory.EmployeeID !== undefined && this.forgotPasswordHistory.EmployeeID !== null &&
      this.forgotPasswordHistory.EmployeeID.toString() !== '') {
      const employee: Employee = {};
      employee.ID = +this.forgotPasswordHistory.EmployeeID.toString();
      employee.CreatedBy = +this.forgotPasswordHistory.EmployeeID.toString();
      employee.Password = this.currentFormControls.password.value;

      this.showSpinner = true;
      this.timesysSvc.Employee_UpdatePassword(employee).subscribe(_employee => {
        this.showSpinner = false;
        this.SendEmailChangePassword(this.currentFormControls.password.value);
      });
    }
  }

  SendEmailChangePassword(NewPassword: string) {
    if (this.forgotPasswordHistory !== undefined && this.forgotPasswordHistory !== null &&
      this.forgotPasswordHistory.EmailAddress !== undefined && this.forgotPasswordHistory.EmailAddress !== null &&
      this.forgotPasswordHistory.EmailAddress.toString() !== '') {
      const BodyParams: string[] = [];
      BodyParams.push(NewPassword);
      this.showSpinner = true;
      this.timesysSvc.EmailByType(this.forgotPasswordHistory.EmailAddress.toString(),
        BodyParams,
        'Change Password'
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
          } else {
            this.msgSvc.add({
              key: 'saveSuccess',
              sticky: true,
              severity: 'success',
              summary: 'Email sent',
              detail: 'Password changed successfully',
            });
            this.router.navigate(['/login']);
          }
        });
    }
  }

}
