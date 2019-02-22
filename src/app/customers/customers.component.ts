import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Customers } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {

  visibleHelp: boolean;
  helpText: string;

  types: SelectItem[];
  selectedType: string;

  _customers: Customers[] = null;
  _customersUsed: Customers[] = null;
  cols: any;
  _recData = '';

  customerDialog = false;
  customerHdr = 'Add Customer';
  _frm = new FormGroup({});
  _IsEdit = false;
  _selectedCustomer: Customers;
  chkInactive = false;

  // tslint:disable-next-line:max-line-length
  constructor(
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
  ) {
    this.types = [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Both', value: 'Both' }
    ];
    this.selectedType = 'Active';
  }
  _HasEdit = true;

  ngOnInit() {
    this.CheckSecurity();
    this.cols = [
      { field: 'CustomerName', header: 'Customer Name', align: 'left', width: 'auto' },
      { field: 'CustomerNumber', header: 'Customer Number', align: 'right', width: '200px' },
    ];
    this.selectedType = 'Active';
    this.getCustomers();
    this.addControls();
  }

  CheckSecurity() {
    this._HasEdit = true;
    this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(),
          params['Id'].toString())
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

  getCustomers() {
    this.timesysSvc.getCustomers()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            if (this.selectedType === 'Active') {
              this._customers = data.filter(P => P.Inactive === false);
            } else if (this.selectedType === 'Inactive') {
              this._customers = data.filter(P => P.Inactive === true);
            } else {
              this._customers = data;
            }
          } else {
            this._customers = [];
          }
          if (this._customers !== null && this._customers.length > 0) {
            this._recData = this._customers.length + ' matching customers';
          } else {
            this._recData = 'No customers found';
          }
        }
      );
  }
  clickButton(event: any) {
    if (this.selectedType === 'Both') {
      this.cols = [
        { field: 'CustomerName', header: 'Customer Name' },
        { field: 'CustomerNumber', header: 'Customer Number' },
        { field: 'Inactive', header: 'Inactive' },
      ];
    } else {
      this.cols = [
        { field: 'CustomerName', header: 'Customer Name' },
        { field: 'CustomerNumber', header: 'Customer Number' },
      ];
    }
    this.clearControls();
    this.getCustomers();
  }

  addCustomer() {
    this._IsEdit = false;
    this.chkInactive = false;
    this._selectedCustomer = {};
    this.resetForm();
    this.setDataToControls(this._selectedCustomer);
    this.customerHdr = 'Add New Customer';
    this.customerDialog = true;
  }

  editCustomer(data: Customers) {
    this._IsEdit = true;
    this.chkInactive = false;
    this._selectedCustomer = data;
    this.resetForm();
    this.setDataToControls(data);
    this.customerHdr = 'Edit Customer';
    this.customerDialog = true;
  }

  addControls() {
    this._frm.addControl('customerName', new FormControl(null,
      [Validators.required,
      Validators.pattern('^[a-zA-Z0-9\\040\\047\\055]*$'),
      ]
    ));
    this._frm.addControl('customerNumber', new FormControl(null,
      [Validators.required,
      Validators.pattern('^[0-9]{7}$'),
      ]
    ));
    this.chkInactive = false;
  }

  setDataToControls(data: Customers) {
    this._frm.controls['customerName'].setValue(data.CustomerName);
    this._frm.controls['customerNumber'].setValue(data.CustomerNumber);
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
    this.chkInactive = false;
    this._selectedCustomer = null;
    this.resetForm();
    this.customerHdr = 'Add New Customer';
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

  cancelCustomer() {
    this.clearControls();
  }

  saveCustomer() {
    if (this._IsEdit === false) {
      if (this._selectedCustomer === undefined || this._selectedCustomer === null) {
        this._selectedCustomer = {};
      }
      this._selectedCustomer.Id = -1;
    }
    this._selectedCustomer.CustomerName = this._frm.controls['customerName'].value.toString().trim();
    this._selectedCustomer.CustomerNumber = this._frm.controls['customerNumber'].value.toString().trim();
    this._selectedCustomer.Inactive = this.chkInactive;
    this.SaveCustomerSPCall();
  }

  SaveCustomerSPCall() {
    this.timesysSvc.Customer_InsertOrUpdate(this._selectedCustomer)
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
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Customer saved successfully' });
            this.clearControls();
            this.getCustomers();
          }
        },
        (error) => {
          console.log(error);
        });
  }
  deleteCustomer(dataRow: Customers) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.CustomerName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Customer_Delete(dataRow)
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
                  detail: 'Customer deleted successfully'
                });
                this.getCustomers();
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
