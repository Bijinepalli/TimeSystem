import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Clients, Customers, Companies } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  types: SelectItem[];
  selectedType: string;
  _clients: Clients[] = null;
  _clientsUsed: Clients[] = null;
  cols: any;
  _recData: any;
  _code: string;

  clientDialog = false;
  clientHdr = 'Add Client';
  _frm = new FormGroup({});
  _billingCycle: SelectItem[];
  _billingCycleDefault: SelectItem[];
  _customerNames: SelectItem[];
  _companyNames: SelectItem[];
  _customers: Customers[] = [];
  _companies: Companies[] = [];
  IsEdit = false;
  selectedCycle: string;
  clientCreatedOn: string;
  selectActiveInactive: string[] = [];

  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService) {
  }

  ngOnInit() {
    // Add Controls to the Form
    this.addControls();

    this.types = [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Both', value: 'Both' }
    ];
    this.selectedType = 'Active';


    // Drop down loading Section - BEGIN
    this._billingCycle = [
      { label: 'Please select', value: '' },
      { label: 'Bi-Weekly', value: 'B' },
      { label: 'Monthly', value: 'M' },
      { label: 'Weekly', value: 'W' }
    ];
    this._billingCycleDefault = [{ label: 'Monthly', value: 'M' }];

    // Initialize the item arrays
    this._customerNames = [{ label: 'Please select', value: '' }];
    this._companyNames = [{ label: 'Please select', value: '' }];

    this.getCompanies();
    this.getCustomers();
    this.getClients();
    // Drop down loading Section - END

    this.cols = [
      { field: 'ClientName', header: 'Client Name' },
      { field: 'Key', header: 'Code' },
      { field: 'CustomerName', header: 'Customer Name' },
      { field: 'PONumber', header: 'PO#' },
    ];
    this.selectedType = 'Active';
  }

  getClients() {
    this.timesysSvc.getClients()
      .subscribe(
        (data) => {
          if (this.selectedType === 'Active') {
            this._clients = data.filter(P => P.Inactive === false);
            this._recData = this._clients.length + ' clients found';
          } else if (this.selectedType === 'Inactive') {
            this._clients = data.filter(P => P.Inactive === true);
            this._recData = this._clients.length + ' clients found';
          } else {
            this._clients = data;
            this._recData = data.length + ' clients found';
          }
          this.getUsedClients();
        }
      );
  }
  getUsedClients() {
    this.timesysSvc.getUsedBillingCodes('TANDM')
      .subscribe(
        (data) => {
          this._clientsUsed = data;
          for (let i = 0; i < this._clients.length; i++) {
            const cust = this._clientsUsed.filter(P => P.Id === this._clients[i].Id);
            if (cust.length > 0) {
              this._clients[i].used = 1;
            } else {
              this._clients[i].used = 0;
            }
          }
        }
      );
  }
  clickButton(event: any) {
    if (this.selectedType === 'Both') {
      this.cols = [
        { field: 'ClientName', header: 'Client Name' },
        { field: 'Key', header: 'Code' },
        { field: 'CustomerName', header: 'Customer Name' },
        { field: 'PONumber', header: 'PO#' },
        { field: 'Inactive', header: 'Inactive' },
      ];
    } else {
      this.cols = [
        { field: 'ClientName', header: 'Client Name' },
        { field: 'Key', header: 'Code' },
        { field: 'CustomerName', header: 'Customer Name' },
        { field: 'PONumber', header: 'PO#' },
      ];
    }
    this.getClients();
  }
  deleteClient(dataRow: any) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.ClientName + '?',
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
  addClient() {
    this.clientDialog = true;
    this.clientHdr = 'Add New Client';
    this.resetForm();
    this.setDataToControls(undefined);
  }

  editClient(data: Clients) {
    this.IsEdit = true;
    this.clientDialog = true;
    this.clientHdr = 'Edit Client';
    this.resetForm();
    this.setDataToControls(data);
  }
  setDataToControls(data: Clients) {
    this._frm.controls['clientCode'].setValue(data.Key);
    this._frm.controls['clientName'].setValue(data.ClientName);
    this._frm.controls['billingCycle'].setValue(data.BillingCycle);
    this._frm.controls['poNumber'].setValue(data.PONumber);
    this._frm.controls['customerName'].setValue(data.CustomerId);
    this._frm.controls['parentCompany'].setValue(data.CompanyId);
    this.clientCreatedOn = data.CreatedOn;
    if (data.Inactive) {
      this._frm.controls['checkActive'].setValue(data.Inactive === true ? 'true' : 'false');
    }
  }
  addControls() {
    this._frm.addControl('clientCode', new FormControl(null, Validators.required));
    this._frm.addControl('clientName', new FormControl(null, Validators.required));
    this._frm.addControl('billingCycle', new FormControl(null, Validators.required));
    this._frm.addControl('poNumber', new FormControl(null, Validators.required));
    this._frm.addControl('customerName', new FormControl(null, Validators.required));
    this._frm.addControl('parentCompany', new FormControl(null, Validators.required));
    this._frm.addControl('checkActive', new FormControl(null));
  }
  saveClient() {
    this.clientDialog = false;
  }
  cancelClient() {
    this.clientDialog = false;
  }
  getCustomers() {
    this.timesysSvc.getCustomers()
      .subscribe(
        (data) => {
          this._customers = data;
          for (let i = 0; i < this._customers.length; i++) {
            this._customerNames.push({ label: this._customers[i].CustomerName, value: this._customers[i].Id });
          }
          console.log(this._customers.length + 'Customer');
        }
      );
  }
  getCompanies() {
    this.timesysSvc.getCompanies()
      .subscribe(
        (data) => {
          this._companies = data;
          for (let i = 0; i < this._companies.length; i++) {
            this._companyNames.push({ label: this._companies[i].CompanyName, value: this._companies[i].Id });
          }
          console.log(this._companies.length + 'Company');
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
