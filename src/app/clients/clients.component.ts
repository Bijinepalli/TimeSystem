import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Clients, Customers, Companies } from '../model/objects';
import { BillingCode } from '../model/constants';
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

  types: SelectItem[] = [];
  selectedType = '';

  _billingCodes: BillingCode;

  _clients: Clients[] = [];
  _clientsUsed: Clients[] = [];
  cols: any;
  _recData: any;

  clientDialog = false;
  clientHdr = 'Add New Client';

  _frm = new FormGroup({});

  _IsEdit = false;
  _selectedClient: Clients;
  chkInactive = false;

  _billingCycle: SelectItem[] = [];
  _customerNames: SelectItem[] = [];
  _companyNames: SelectItem[] = [];

  _customers: Customers[] = [];
  _companies: Companies[] = [];

  visibleHelp: boolean;
  helpText: string;

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
      { label: 'Bi-Weekly', value: 'B' },
      { label: 'Monthly', value: 'M' },
      { label: 'Weekly', value: 'W' }
    ];

    this._billingCodes = new BillingCode();

    this.getClients();
    this.getCompanies();
    this.getCustomers();

    // Drop down loading Section - END

    this.cols = [
      { field: 'ClientName', header: 'Client Name' },
      { field: 'Key', header: 'Code' },
      { field: 'CustomerName', header: 'Customer Name' },
      { field: 'PONumber', header: 'PO#' },
    ];
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

  getClients() {
    this.timesysSvc.getClients()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            if (this.selectedType === 'Active') {
              this._clients = data.filter(P => P.Inactive === false);
            } else if (this.selectedType === 'Inactive') {
              this._clients = data.filter(P => P.Inactive === true);
            } else {
              this._clients = data;
            }
          } else {
            this._clients = [];
          }
          if (this._clients !== undefined && this._clients !== null && this._clients.length > 0) {
            this._recData = this._clients.length + ' clients found';
            this.getUsedClients();
          } else {
            this._recData = 'No clients found';
          }
        }
      );
  }
  getUsedClients() {
    this.timesysSvc.getUsedBillingCodes(this._billingCodes.Client)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._clientsUsed = data;
            for (let i = 0; i < this._clients.length; i++) {
              const cust = this._clientsUsed.filter(P => P.Id === this._clients[i].Id);
              if (cust.length > 0) {
                this._clients[i].InUse = true;
              } else {
                this._clients[i].InUse = false;
              }
            }
          }
        }
      );
  }
  getCustomers() {
    this.timesysSvc.getCustomers()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._customers = data;
            for (let i = 0; i < this._customers.length; i++) {
              this._customerNames.push({ label: this._customers[i].CustomerName, value: this._customers[i].Id });
            }
          } else {
            this._customers = [];
            this._customerNames = [];
          }
        }
      );
  }
  getCompanies() {
    this.timesysSvc.getCompanies()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._companies = data;
            for (let i = 0; i < this._companies.length; i++) {
              this._companyNames.push({ label: this._companies[i].CompanyName, value: this._companies[i].Id });
            }
          } else {
            this._companies = [];
            this._companyNames = [];
          }
        }
      );
  }

  addClient() {
    this._IsEdit = false;
    this._selectedClient = {};
    this.chkInactive = false;
    this.resetForm();
    this.setDataToControls(this._selectedClient);
    this.clientHdr = 'Add New Client';
    this.clientDialog = true;
  }

  editClient(data: Clients) {
    this._IsEdit = true;
    this._selectedClient = data;
    this.chkInactive = false;
    this.resetForm();
    this.setDataToControls(data);
    this.clientHdr = 'Edit Client';
    this.clientDialog = true;
  }

  addControls() {
    this._frm.addControl('clientCode', new FormControl(null, Validators.required));
    this._frm.addControl('clientName', new FormControl(null, Validators.required));
    this._frm.addControl('billingCycle', new FormControl(null));
    this._frm.addControl('poNumber', new FormControl(null));
    this._frm.addControl('customerName', new FormControl(null));
    this._frm.addControl('parentCompany', new FormControl(null));
    this.chkInactive = false;
  }

  setDataToControls(data: Clients) {
    this._frm.controls['clientCode'].setValue(data.Key);
    this._frm.controls['clientName'].setValue(data.ClientName);
    this._frm.controls['poNumber'].setValue(data.PONumber);
    if (data.BillingCycle !== undefined) {
      this._frm.controls['billingCycle'].setValue(data.BillingCycle);
    } else {
      this._frm.controls['billingCycle'].setValue('M');
    }
    if (data.CustomerId !== undefined) {
      this._frm.controls['customerName'].setValue(data.CustomerId.toString());
    }
    if (data.CompanyId !== undefined) {
      this._frm.controls['parentCompany'].setValue(data.CompanyId.toString());
    }
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
    this._selectedClient = null;
    this.chkInactive = false;
    this.resetForm();
    this.clientHdr = 'Add New Client';
    this.clientDialog = false;
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


  cancelClient() {
    this.clearControls();
  }

  saveClient() {
    if (this._IsEdit === false) {
      if (this._selectedClient === undefined || this._selectedClient === null) {
        this._selectedClient = {};
      }
      this._selectedClient.Id = -1;
    }
    this._selectedClient.ClientName = this._frm.controls['clientName'].value.toString().trim();
    this._selectedClient.Key = this._frm.controls['clientCode'].value.toString().toUpperCase().trim();
    this._selectedClient.CompanyId = this._frm.controls['parentCompany'].value.toString().trim();
    this._selectedClient.CustomerId = this._frm.controls['customerName'].value.toString().trim();
    this._selectedClient.BillingCycle = this._frm.controls['billingCycle'].value.toString().trim();
    this._selectedClient.PONumber = this._frm.controls['poNumber'].value.toString().trim();
    this._selectedClient.Inactive = this.chkInactive;
    this._selectedClient.ChargeType = this._billingCodes.Client;
    this.SaveClientSPCall();
  }

  SaveClientSPCall() {
    this.timesysSvc.Client_InsertOrUpdate(this._selectedClient)
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
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Client saved successfully' });
            this.clearControls();
            this.getClients();
          }
        },
        (error) => {
          console.log(error);
        });
  }

  deleteClient(dataRow: any) {
    dataRow.ChargeType = this._billingCodes.Client;
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.ClientName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Client_Delete(dataRow)
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
                  detail: 'Client deleted successfully'
                });
                this.getClients();
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
