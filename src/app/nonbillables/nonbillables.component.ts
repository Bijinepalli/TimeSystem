import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { NonBillables, DrpList } from '../model/objects';
import { BillingCode } from '../model/constants';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  _createdOn: string;
  visibleHelp: boolean;
  helpText: string;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService) { }

  cols: any;
  _nonBillable: NonBillables[] = [];
  _frm = new FormGroup({});

  _recData: string;
  _bc: BillingCode = new BillingCode();
  _nonBillableItemId: any;
  _companies: DrpList[] = [];

  ngOnInit() {

    this._status = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
      { label: 'Both', value: '2' }
    ];
    this._selectedStatus = '1';

    this.cols = [
      { field: 'ProjectName', header: 'Non-Billable Item Name' },
      { field: 'Key', header: 'Code' },
      { field: 'CreatedOn', header: 'CreatedOn' },
    ];

    // this.getCompanies();
    this.getNonBillables();

    this._frm.addControl('itemName', new FormControl(null, Validators.required));
    this._frm.addControl('itemCode', new FormControl(null, Validators.required));
    this._frm.addControl('itemStatus', new FormControl(null, null));
  }

  changeStatus() {
    if (this._selectedStatus === '2') {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name' },
        { field: 'Key', header: 'Code' },
        { field: 'Inactive', header: 'Inactive' },
        { field: 'CreatedOn', header: 'CreatedOn' },
      ];
    } else {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name' },
        { field: 'Key', header: 'Code' },
        { field: 'CreatedOn', header: 'CreatedOn' },
      ];
    }
    this.getNonBillables();
  }

  getCompanies() {
    this.timesysSvc.getCompanies()
      .subscribe(
        (data) => {
          this._companies.push({ label: '', value: '' });
          for (let r = 0; r < data.length; r++) {
            this._companies.push({ label: data[r].CompanyName, value: data[r].Id.toString() });
          }
        }
      );
  }

  getNonBillables() {
    this.timesysSvc.getNonBillables(this._bc.NonBillable)
      .subscribe(
        (data) => {
          console.log(this._selectedStatus);
          console.log(JSON.stringify(data[0]));
          if (this._selectedStatus === '1') {
            this._nonBillable = data[0].filter((s) => s.Inactive === false);
          } else if (this._selectedStatus === '0') {
            this._nonBillable = data[0].filter((s) => s.Inactive === true);
          } else {
            this._nonBillable = data[0];
          }
          this._recData = this._nonBillable.length + ' matching items';

          let _tmpCharge: NonBillables[] = [];
          _tmpCharge = data[1];

          for (let r = 0; r < this._nonBillable.length; r++) {
            const exists = _tmpCharge.filter((f) => f.Id === this._nonBillable[r].Id).length;
            if (exists > 0) {
              this._nonBillable[r].CanBeDeleted = 1;
            }
          }

        }
      );
  }

  deleteNonBillable(data: NonBillables) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.ProjectName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
      },
      reject: () => {
        /* do nothing */
      }

    });
  }

  addNonBillable() {
    this.nonBillableDialog = true;
    this.nonBillableHdr = 'Add New Non-Billable Item';
    this._nonBillableItemId = '';
    this._createdOn = '';
    this.resetForm();
    this.addControls(undefined);
  }

  addControls(data: NonBillables) {
    this._frm.controls['itemName'].setValue(data.ProjectName);
    this._frm.controls['itemCode'].setValue(data.Key);
    this._frm.controls['itemStatus'].setValue(data.Inactive === true ? 'true' : 'false');

  }

  editNonBillable(data: NonBillables) {
    this.nonBillableDialog = true;
    this.nonBillableHdr = 'Edit Non-Billable Item';
    this._nonBillableItemId = data.Id;
    this._createdOn = data.CreatedOn;
    this.resetForm();
    this.addControls(data);
  }

  cancelNonBillable() {
    this.nonBillableDialog = false;
  }

  saveNonBillable() {
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

  hasFormErrors() {
    return !this._frm.valid;
  }

  resetForm() {
    this._frm.markAsPristine();
    this._frm.markAsUntouched();
    this._frm.updateValueAndValidity();
    this._frm.reset();
  }

}
