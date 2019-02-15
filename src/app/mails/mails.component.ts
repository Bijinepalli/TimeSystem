import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Email } from '../model/objects';
import { CommonService } from '../service/common.service';
@Component({
  selector: 'app-mails',
  templateUrl: './mails.component.html',
  styleUrls: ['./mails.component.css']
})

export class MailsComponent implements OnInit {

  _lstEmails: Email[] = [];
  _recData: any;
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
  // tslint:disable-next-line:max-line-length
  constructor(
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
  ) { }

  ngOnInit() {

    this.CheckSecurity();
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
  CheckSecurity() {
    this._HasEdit = true;
    this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        this.timesysSvc.getPagesbyRoles(localStorage.getItem('UserRole').toString(), params['Id'].toString())
          .subscribe((data) => {
            if (data != null && data.length > 0) {
              if (data[0].HasEdit) {
                this._HasEdit = false;
              }
            }
          });
      }
    });
  }
  getEmails() {
    const _email: Email = {};
    _email.EmailType = '';
    this.timesysSvc.getEmails(_email)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            this._lstEmails = data;
            this._recData = data.length + ' email types';
          } else {
            this._lstEmails = [];
            this._recData = 'No emails found';
          }
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
    this._selectedEmail = data;
    this.resetForm();
    this.setDataToControls(data);
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
