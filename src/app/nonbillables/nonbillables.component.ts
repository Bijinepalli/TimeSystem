import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { NonBillables, DrpList } from '../model/objects';
import { BillingCode } from '../model/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';

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
  visibleHelp: boolean;
  helpText: string;

  constructor(
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
  ) { }

  _bc: BillingCode = new BillingCode();
  _companies: DrpList[] = [];
  _nonBillable: NonBillables[] = [];
  cols: any;
  _recData: string;
  _frm = new FormGroup({});
  _IsEdit = false;
  _selectedNonBillable: NonBillables;
  chkInactive = false;
  _HasEdit = true;
  ngOnInit() {
    this.CheckSecurity();
    this._status = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
      { label: 'Both', value: '2' }
    ];
    this._selectedStatus = '1';

    this.cols = [
      { field: 'ProjectName', header: 'Non-Billable Item Name', align: 'left', width: 'auto' },
      { field: 'Key', header: 'Code', align: 'left', width: '250px' },
      { field: 'CreatedOn', header: 'Created On', align: 'center', width: '120px' },
    ];

    this.addControls();
    this.getNonBillables();
    this.getCompanies();
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
            this._recData = this._nonBillable.length + ' matching non-billable items';
          } else {
            this._recData = 'No non-billable items found';
          }
        }
      );
  }



  addNonBillable() {
    this._IsEdit = false;
    this._selectedNonBillable = {};
    this.chkInactive = false;
    this.resetForm();
    this.setDataToControls(this._selectedNonBillable);
    this.nonBillableHdr = 'Add New Non-Billable Item';
    this.nonBillableDialog = true;
  }

  editNonBillable(data: NonBillables) {
    this._IsEdit = true;
    this._selectedNonBillable = data;
    this.chkInactive = false;
    this.resetForm();
    this.setDataToControls(data);
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
    this.SaveNonBillableSPCall();
  }
  SaveNonBillableSPCall() {
    console.log(this._selectedNonBillable);
    this.timesysSvc.NonBillable_InsertOrUpdate(this._selectedNonBillable)
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
              detail: 'Non-Billable Item saved successfully'
            });
            this.clearControls();
            this.getNonBillables();
          }
        },
        (error) => {
          console.log(error);
        });
  }
  deleteNonBillable(data: NonBillables) {
    data.ChargeType = this._bc.NonBillable;
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.ProjectName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.NonBillable_Delete(data)
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
  }
}
