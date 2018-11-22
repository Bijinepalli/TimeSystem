import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Customers } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  types: SelectItem[];
  selectedType: string;
  _customers: Customers[] = null;
  _customersUsed: Customers[] = null;
  cols: any;
  _recData: any;

  customerDialog = false;
  customerHdr = 'Add Customer';
  _frm = new FormGroup({});
  visibleHelp: boolean;
  helpText: string;


  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService) {
    this.types = [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Both', value: 'Both' }
    ];
    this.selectedType = 'Active';
  }

  ngOnInit() {
    this.cols = [
      { field: 'CustomerName', header: 'Customer Name' },
      { field: 'CustomerNumber', header: 'Customer Number' },
    ];
    this.selectedType = 'Active';
    this.getCustomers();
    this.addControls();
  }

  getCustomers() {
    this.timesysSvc.getCustomers()
      .subscribe(
        (data) => {
          if (this.selectedType === 'Active') {
            this._customers = data.filter(P => P.Inactive === false);
            this._recData = this._customers.length + ' customers found';
          } else if (this.selectedType === 'Inactive') {
            this._customers = data.filter(P => P.Inactive === true);
            this._recData = this._customers.length + ' customers found';
          } else {
            this._customers = data;
            this.cols = [
              { field: 'CustomerName', header: 'Customer Name' },
              { field: 'CustomerNumber', header: 'Customer Number' },
              { field: 'Inactive', header: 'Inactive' },
            ];
            this._recData = data.length + ' customers found';
          }
          this.getUsedCustomers();
        }
      );
  }
  getUsedCustomers() {
    this.timesysSvc.getUsedCustomers()
      .subscribe(
        (data) => {
          this._customersUsed = data;
          for (let i = 0; i < this._customers.length; i++) {
            const cust = this._customersUsed.filter(P => P.Id === this._customers[i].Id);
            if (cust.length > 0) {
              this._customers[i].used = 1;
            } else {
              this._customers[i].used = 0;
              console.log('unused');
            }
          }
          console.log(this._customers);
          console.log(this._customersUsed);
        }
      );
  }
  clickButton(event: any) {
    this.cols = [
      { field: 'CustomerName', header: 'Customer Name' },
      { field: 'CustomerNumber', header: 'Customer Number' },
    ];
    this.getCustomers();
  }
  deleteCustomer(dataRow: any) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.CustomerName + '?',
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
  addCustomer() {
    this.customerDialog = true;
    this.customerHdr = 'Add New Customer';
    this.resetForm();
    this.setDataToControls(undefined);
  }

  editCustomer(data: Customers) {
    this.customerDialog = true;
    this.customerHdr = 'Edit Customer';
    this.resetForm();
    this.setDataToControls(data);
  }
  setDataToControls(data: Customers) {
    this._frm.controls['customerName'].setValue(data.CustomerName);
    this._frm.controls['customerNumber'].setValue(data.CustomerNumber);
  }
  addControls() {
    this._frm.addControl('customerName', new FormControl(null, Validators.required));
    this._frm.addControl('customerNumber', new FormControl(null, Validators.required));
  }
  saveCustomer() {
    this.customerDialog = false;
  }
  cancelCustomer() {
    this.customerDialog = false;
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
