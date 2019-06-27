import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { NonBillables, DrpList, PageNames } from '../model/objects';
import { BillingCode } from '../model/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { ActivitylogService } from '../service/activitylog.service'; // ActivityLog - Default

@Component({
  selector: 'app-nonbillables',
  templateUrl: './nonbillables.component.html',
  styleUrls: ['./nonbillables.component.css']
})
export class NonbillablesComponent implements OnInit {

  _selectedStatus: string;
  _status: { label: string; value: string; }[];
  nonBillableDialog: boolean;
  nonBillableHdr: string;
  _bc: BillingCode = new BillingCode();
  _companies: DrpList[] = [];
  _nonBillable: NonBillables[] = [];
  cols: any;
  _recData = 0;
  _frm = new FormGroup({});
  _IsEdit = false;
  _selectedNonBillable: NonBillables;
  chkInactive = false;
  _HasEdit = true;
  showSpinner = false;

  ParamSubscribe: any;
  IsSecure: boolean;
  showReport: boolean;
  _sortArray: string[];
  _DisplayDateFormat: any;
  _OldCompanyID = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    public commonSvc: CommonService,
    private logSvc: ActivitylogService, // ActivityLog - Default
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
    this.logSvc.ActionLog(PageNames.NonBillables, '', 'Pages', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this._status = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
      { label: 'Both', value: '2' }
    ];
    this._selectedStatus = '1';

    this.cols = [
      { field: 'ProjectName', header: 'Non-Billable Item Name', align: 'left', width: 'auto' },
      { field: 'Key', header: 'Code', align: 'left', width: '250px' },
      { field: 'CreatedOn', header: 'Created On', align: 'center', width: '250px' },
    ];
    this._sortArray = ['ProjectName', 'Key', 'CreatedOnSearch'];
    this.addControls();
    this.getNonBillables();
    this.getCompanies();
  }
  ClearAllProperties() {
    this._selectedStatus = '';
    this._status = [];
    this.nonBillableDialog = false;
    this.nonBillableHdr = '';
    this._bc = new BillingCode();
    this._companies = [];
    this._nonBillable = [];
    this.cols = {};
    this._recData = 0;
    this._frm = new FormGroup({});
    this._IsEdit = false;
    this._selectedNonBillable = new NonBillables();
    this.chkInactive = false;
    this._HasEdit = true;
    this.showSpinner = false;
  }
  changeStatus() {
    if (this._selectedStatus === '2') {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name', align: 'left', width: 'auto' },
        { field: 'Key', header: 'Code', align: 'left', width: '250px' },
        { field: 'Inactive', header: 'Inactive', align: 'left', width: '120px' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '120px' },
      ];
    } else {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name', align: 'left', width: '250px' },
        { field: 'Key', header: 'Code', align: 'left', width: '250px' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '120px' },
      ];
    }
    this._sortArray = ['ProjectName', 'Key', 'Inactive', 'CreatedOnSearch'];
    this.getNonBillables();
  }

  getCompanies() {
    this.timesysSvc.getCompanies()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            for (let r = 0; r < data.length; r++) {
              this._companies.push({ label: data[r].CompanyName, value: data[r].Id.toString() });
            }
          } else {
            this._companies = [];
          }
        }
      );
  }

  getNonBillables() {
    this.showSpinner = true;
    this.showReport = false;
    this._recData = 0;
    this.timesysSvc.getNonBillables(this._bc.NonBillable)
      .subscribe(
        (data) => {

          if (data !== undefined && data !== null && data.length > 0) {
            if (data[0] !== undefined && data[0] !== null && data[0].length > 0) {
              if (this._selectedStatus === '1') {
                this._nonBillable = data[0].filter((s) => s.Inactive === false);
              } else if (this._selectedStatus === '0') {
                this._nonBillable = data[0].filter((s) => s.Inactive === true);
              } else {
                this._nonBillable = data[0];
              }
              if (data[1] !== undefined && data[1] !== null && data[1].length > 0
                && this._nonBillable !== null && this._nonBillable.length > 0) {
                let _tmpCharge: NonBillables[] = [];
                _tmpCharge = data[1];

                for (let r = 0; r < this._nonBillable.length; r++) {
                  const exists = _tmpCharge.filter((f) => f.Id === this._nonBillable[r].Id).length;
                  if (exists > 0) {
                    this._nonBillable[r].CanBeDeleted = 1;
                  }
                }
              }
            } else {
              this._nonBillable = [];
            }
          } else {
            this._nonBillable = [];
          }

          if (this._nonBillable !== null && this._nonBillable.length > 0) {
            this._recData = this._nonBillable.length;
          }
          this.showReport = true;
          this.showSpinner = false;
          // else {
          //   this._recData = 'No non-billable items found';
          // }
        }
      );
  }
  addNonBillable() {
    this._IsEdit = false;
    this._selectedNonBillable = {};
    this.chkInactive = false;
    this.resetForm();
    this.logSvc.ActionLog(PageNames.NonBillables,
      '', 'Pages/Event', 'addNonBillable', 'Add Non-Billable', '', '', JSON.stringify(this._selectedNonBillable)); // ActivityLog
    this.setDataToControls(this._selectedNonBillable);
    this.nonBillableHdr = 'Add New Non-Billable Item';
    this.nonBillableDialog = true;
  }

  editNonBillable(data: NonBillables) {
    this._IsEdit = true;
    this._selectedNonBillable = new NonBillables();
    this._selectedNonBillable.Id = data.Id;
    this._selectedNonBillable.ProjectName = data.ProjectName;
    this._selectedNonBillable.Key = data.Key;
    this._selectedNonBillable.Inactive = data.Inactive;
    this._selectedNonBillable.CreatedOn = data.CreatedOn;
    this.chkInactive = false;
    this.resetForm();
    this.logSvc.ActionLog(PageNames.NonBillables,
      '', 'Pages/Event', 'editNonBillable', 'Edit Non-Billable', '', '', JSON.stringify(this._selectedNonBillable)); // ActivityLog
    this.setDataToControls(this._selectedNonBillable);
    this.nonBillableHdr = 'Edit Non-Billable Item';
    this.nonBillableDialog = true;
  }

  addControls() {
    this._frm.addControl('itemName', new FormControl(null, Validators.required));
    this._frm.addControl('itemCode', new FormControl(null,
      [Validators.required,
      Validators.pattern('^[a-zA-Z0-9\\040\\047\\046\\055\\056\\057]*$'),
      ]
    ));
  }

  setDataToControls(data: NonBillables) {
    this._frm.controls['itemName'].setValue(data.ProjectName);
    this._frm.controls['itemCode'].setValue(data.Key);
    if (data.Inactive !== undefined) {
      this.chkInactive = data.Inactive;
    } else {
      this.chkInactive = false;
    }
  }

  hasFormErrors() {
    return !this._frm.valid;
  }

  resetForm() {
    this._frm.markAsPristine();
    this._frm.markAsUntouched();
    this._frm.updateValueAndValidity();
    this._frm.reset();
  }

  clearControls() {
    this._IsEdit = false;
    this._selectedNonBillable = null;
    this.chkInactive = false;
    this.resetForm();
    this.nonBillableHdr = 'Add New Non-Billable Item';
    this.nonBillableDialog = false;
  }

  cancelNonBillable() {
    this.clearControls();
  }

  saveNonBillable() {
    if (this._IsEdit === false) {
      if (this._selectedNonBillable === undefined || this._selectedNonBillable === null) {
        this._selectedNonBillable = {};
      }
      this._selectedNonBillable.Id = -1;
    }
    this._selectedNonBillable.ProjectName = this._frm.controls['itemName'].value.toString().trim();
    this._selectedNonBillable.Key = this._frm.controls['itemCode'].value.toString().toUpperCase().trim();
    this._selectedNonBillable.Inactive = this.chkInactive;
    this._selectedNonBillable.ChargeType = this._bc.NonBillable;
    this.checkWarnings();
  }

  checkWarnings() {
    let errorMsg = '';
    if (this.chkInactive) {
      if (this._IsEdit) {
        this.timesysSvc.IsBillingCodeUsedOnAnyPendingTimesheets(this._selectedNonBillable.Id.toString(), this._bc.NonBillable)
          .subscribe(
            (outputData) => {
              if (outputData !== undefined && outputData !== null && outputData.length > 0) {
                errorMsg += 'Inactivating this client will remove it and associated hours from all unsubmitted timesheets.<br>';
              } else {
                errorMsg += 'Client is marked as inactive. It will not appear on new timesheets.<br>';
              }
              if (errorMsg.trim() !== '') {
                this.showConfirmation(errorMsg, 0);
              } else {
                this.CheckDBWarnings();
              }
            });
      } else {
        this.CheckDBWarnings();
      }
    } else {
      // if (this.IsControlUndefinedAndHasValue('parentCompany')) {
      //   errorMsg += 'No company was selected. No holiday schedule will be assigned to this client.<br>';
      // }
      // if (this.IsControlUndefinedAndHasValue('customerName')) {
      //   errorMsg += 'No customer to invoice was selected.<br>';
      // }
      // if (this.IsControlUndefinedAndHasValue('poNumber')) {
      //   errorMsg += 'No purchase order number was entered.<br>';
      // }
      if (errorMsg.trim() !== '') {
        this.showConfirmation(errorMsg, 0);
      } else {
        this.CheckDBWarnings();
      }
    }
  }


  IsControlUndefinedAndHasValue(ctrlName: string): boolean {
    let IsUndefined = true;
    if (this._frm.controls[ctrlName] !== undefined &&
      this._frm.controls[ctrlName] !== null &&
      this._frm.controls[ctrlName].value !== undefined &&
      this._frm.controls[ctrlName].value !== null &&
      this._frm.controls[ctrlName].value.toString().trim() !== ''
    ) {
      IsUndefined = false;
    }
    return IsUndefined;
  }


  showConfirmation(errorMsg: string, mode: number) {
    this.confSvc.confirm({
      message: errorMsg + 'Do you want to continue?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (mode === 0) {
          this.CheckDBWarnings();
        } else {
          this.SaveNonBillableSPCall();
        }
      },
      reject: () => {
      }
    });
  }


  CheckDBWarnings() {
      this.SaveNonBillableSPCall();
  }

  SaveNonBillableSPCall() {
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.NonBillables,
      '', 'Pages/Event', 'SaveNonBillableSPCall', 'Save Non-Billable', '', '', JSON.stringify(this._selectedNonBillable)); // ActivityLog
    this.timesysSvc.NonBillable_InsertOrUpdate(this._selectedNonBillable)
      .subscribe(
        (outputData) => {
          if (outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: outputData.ErrorType,
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage,
              data: outputData.ExceptionDetails,
            });
          } else {
            this.msgSvc.add({
              key: 'saveSuccess',
              severity: 'success',
              summary: 'Info Message',
              detail: 'Non-Billable Item saved successfully'
            });
            this.clearControls();
            this.getNonBillables();
          }
        },
        (error) => {
          console.log(error);
        });
    this.showSpinner = false;
  }
  deleteNonBillable(data: NonBillables) {
    this.showSpinner = true;
    data.ChargeType = this._bc.NonBillable;
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.ProjectName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.logSvc.ActionLog(PageNames.NonBillables,
          '', 'Pages/Event', 'deleteNonBillable', 'Delete Non-Billable', '', '', JSON.stringify(data)); // ActivityLog
        this.timesysSvc.NonBillable_Delete(data)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: outputData.ErrorType,
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage,
                  data: outputData.ExceptionDetails,
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: 'Non-Billable Item deleted successfully'
                });
                this.getNonBillables();
              }
            },
            (error) => {
              console.log(error);
            });
      },
      reject: () => {
        /* do nothing */
      }
    });
    this.showSpinner = false;
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['CreatedOn'], []);
  }
}
