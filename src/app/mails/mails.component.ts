import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Email } from '../model/objects';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-mails',
  templateUrl: './mails.component.html',
  styleUrls: ['./mails.component.css']
})

export class MailsComponent implements OnInit {

  _lstEmails: Email[] = [];
  _recData = 0;
  cols: any;

  emailDialog = false;
  emailHdr = 'Add Client';
  _frmEmail = new FormGroup({});
  _selectedEmail: Email;
  _IsEdit = false;

  visibleHelp: boolean;
  helpText: string;

  chkIsHighPriority = false;
  chkIsSubjectTemplate = false;
  chkIsBodyTemplate = false;
  chkIsDefaultSignature = false;
  _emailSignature = '';
  _HasEdit = true;
  showSpinner = false;

  ParamSubscribe: any;
  IsSecure: boolean;
  showReport: boolean;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
    public datepipe: DatePipe
  ) {
    this.CheckActiveSession();
    this.commonSvc.setAppSettings();
  }
  CheckActiveSession() {
    let sessionActive = false;
    if (sessionStorage !== undefined && sessionStorage !== null && sessionStorage.length > 0) {
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null) {
        sessionActive = true;
      }
    }

    if (!sessionActive) {
      this.router.navigate(['/access'], { queryParams: { Message: 'Session Expired' } }); // Session Expired
    }
  }
  /* #endregion*/

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.showSpinner = true;
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
  }
  /* #endregion */

  /* #region Basic Methods */

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          if (data[0].HasEdit) {
            this._HasEdit = false;
          }
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }

  Initialisations() {
    this.cols = [
      { field: 'EmailType', header: 'Email Type', align: 'left', width: 'auto' },
      { field: 'Subject', header: 'Subject', align: 'left', width: 'auto' },
      { field: 'Body', header: 'Body', align: 'left', width: 'auto' },
      { field: 'HighPriority', header: 'Is High Priority', align: 'center', width: 'auto' },
      { field: 'SubjectIsTemplate', header: 'Is Subject Template', align: 'center', width: 'auto' },
      { field: 'BodyIsTemplate', header: 'Is Body Template', align: 'center', width: 'auto' },
      { field: 'AddSignature', header: 'Is Signature Added', align: 'center', width: 'auto' },
    ];
    this.getEmails();
    this.addControls();
  }
  ClearAllProperties() {
    this._lstEmails = [];
    this._recData = 0;
    this.cols = {};
    this.emailDialog = false;
    this.emailHdr = 'Add Client';
    this._frmEmail = new FormGroup({});
    this._selectedEmail = new Email();
    this._IsEdit = false;
    this.visibleHelp = false;
    this.helpText = '';
    this.chkIsHighPriority = false;
    this.chkIsSubjectTemplate = false;
    this.chkIsBodyTemplate = false;
    this.chkIsDefaultSignature = false;
    this._emailSignature = '';
    this._HasEdit = true;
    this.showSpinner = false;
  }
  getEmails() {
    this.showSpinner = true;
    this.showReport = false;
    this._recData = 0;
    this.timesysSvc.getEmails('')
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._lstEmails = data;
            this._recData = data.length;
          }
          this.showReport = true;
          this.showSpinner = false;
          // else {
          //   this._lstEmails = [];
          //   this._recData = 'No emails found';
          // }
        }
      );
    this.getEmailSignature();
  }
  getEmailSignature() {
    this.timesysSvc.EmailSignature_Get()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            const _lstEmailSignature: Email[] = data;
            this._emailSignature = _lstEmailSignature[0].Signature;
          }
        }
      );
  }

  addEmail() {
    this._IsEdit = false;
    this._selectedEmail = {};
    this.resetForm();
    this.setDataToControls(this._selectedEmail);
    this.emailHdr = 'Add New Email';
    this.emailDialog = true;
  }

  editEmail(data: Email) {
    this._IsEdit = true;
    this._selectedEmail = new Email();
    this._selectedEmail.AddSignature = data.AddSignature;
    this._selectedEmail.Body = data.Body;
    this._selectedEmail.BodyIsTemplate = data.BodyIsTemplate;
    this._selectedEmail.EmailType = data.EmailType;
    this._selectedEmail.EmailTypeId = data.EmailTypeId;
    this._selectedEmail.HighPriority = data.HighPriority;
    this._selectedEmail.ID = data.ID;
    this._selectedEmail.Signature = data.Signature;
    this._selectedEmail.Subject = data.Subject;
    this._selectedEmail.SubjectIsTemplate = data.SubjectIsTemplate;
    this.resetForm();
    this.setDataToControls(this._selectedEmail);
    this.emailHdr = 'Edit Email';
    this.emailDialog = true;
  }

  addControls() {
    this._frmEmail.addControl('txtEmailType', new FormControl(null, Validators.required));
    this._frmEmail.addControl('txtSubject', new FormControl(null, Validators.required));
    this._frmEmail.addControl('txtBody', new FormControl(null, Validators.required));
    this._frmEmail.addControl('txtSignature', new FormControl(null, Validators.required));
  }

  setDataToControls(data: Email) {
    if (data !== undefined) {
      this._frmEmail.controls['txtEmailType'].setValue(data.EmailType);
      this._frmEmail.controls['txtSubject'].setValue(data.Subject);
      this._frmEmail.controls['txtBody'].setValue(data.Body);
      this._frmEmail.controls['txtSignature'].setValue(this._emailSignature);

      this.chkIsHighPriority = data.HighPriority;
      this.chkIsSubjectTemplate = data.SubjectIsTemplate;
      this.chkIsBodyTemplate = data.BodyIsTemplate;
      this.chkIsDefaultSignature = data.AddSignature;
    }
  }

  hasFormErrors() {
    return !this._frmEmail.valid;
  }

  resetForm() {
    this._frmEmail.markAsPristine();
    this._frmEmail.markAsUntouched();
    this._frmEmail.updateValueAndValidity();
    this._frmEmail.reset();
  }

  clearControls() {
    this._IsEdit = false;
    this._selectedEmail = null;
    this.resetForm();
    this.emailHdr = 'Add New Holiday';
    this.emailDialog = false;
  }

  showHelp(file: string) {
    this.timesysSvc.getHelp(file)
      .subscribe(
        (data) => {
          // this.helpText = data;
          this.visibleHelp = true;
          const parser = new DOMParser();
          const parsedHtml = parser.parseFromString(data, 'text/html');
          this.helpText = parsedHtml.getElementsByTagName('body')[0].innerHTML;
        }
      );
  }

  cancelEmail() {
    this.clearControls();
  }
  saveEmail() {
    if (this._IsEdit === false) {
      if (this._selectedEmail === undefined || this._selectedEmail === null) {
        this._selectedEmail = {};
      }
      this._selectedEmail.ID = -1;
      this._selectedEmail.EmailType = this._frmEmail.controls['txtEmailType'].value;
    }
    this.SaveEmailSPCall();
  }

  deleteEmail(dataRow: Email) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.EmailType + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Email_Delete(dataRow)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: 'Email deleted successfully'
                });
                this.getEmails();
              }
            });
      },
      reject: () => {
        /* do nothing */
      }
    });
  }

  SaveEmailSPCall() {
    this._selectedEmail.Subject = this._frmEmail.controls['txtSubject'].value.toString().trim();
    this._selectedEmail.Body = this._frmEmail.controls['txtBody'].value.toString().trim();
    this._selectedEmail.Signature = this._frmEmail.controls['txtSignature'].value.toString().trim();
    this._selectedEmail.HighPriority = this.chkIsHighPriority;
    this._selectedEmail.SubjectIsTemplate = this.chkIsSubjectTemplate;
    this._selectedEmail.BodyIsTemplate = this.chkIsBodyTemplate;
    this._selectedEmail.AddSignature = this.chkIsDefaultSignature;
    this.timesysSvc.Email_InsertOrUpdate(this._selectedEmail)
      .subscribe(
        (outputData) => {
          if (outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: 'alert',
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage
            });
          } else {
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Email saved successfully' });
            this.clearControls();
            this.getEmails();
          }
        });
  }

}
