import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Clients } from '../model/objects';
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
  _companies: SelectItem[];
  _customerNames: SelectItem[];

  selectedCycle: string;
  // tslint:disable-next-line:max-line-length
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private confSvc: ConfirmationService) {
  }

  ngOnInit() {
    this.types = [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Both', value: 'Both' }
    ];
    this.selectedType = 'Active';

    this._billingCycle = [
      { label: '', value: '' },
      { label: 'Bi-Weekly', value: 'B' },
      { label: 'Monthly', value: 'M' },
      { label: 'Weekly', value: 'W' }
    ];
    this.selectedCycle = 'M';


    this.cols = [
      { field: 'ClientName', header: 'Client Name' },
      { field: 'Key', header: 'Code' },
      { field: 'CustomerName', header: 'Customer Name' },
      { field: 'PONumber', header: 'PO#' },
    ];
    this.selectedType = 'Active';
    this.getClients();
    this.addControls();
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
            this.cols = [
              { field: 'ClientName', header: 'Client Name' },
              { field: 'Key', header: 'Code' },
              { field: 'Inactive', header: 'Inactive' },
              { field: 'CustomerName', header: 'Customer Name' },
              { field: 'PONumber', header: 'PO#' },
            ];
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
              console.log('unused');
            }
          }
          console.log(this._clients);
          console.log(this._clientsUsed);
        }
      );
  }
  clickButton(event: any) {
    this.cols = [
      { field: 'ClientName', header: 'Client Name' },
      { field: 'Key', header: 'Code' },
      { field: 'CustomerName', header: 'Customer Name' },
      { field: 'PONumber', header: 'PO#' },
    ];
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
    this._frm.controls['customerName'].setValue(data.CustomerName);
    this._frm.controls['parentCompany'].setValue(data.Key);
  }
  addControls() {
    this._frm.addControl('clientCode', new FormControl(null, Validators.required));
    this._frm.addControl('clientName', new FormControl(null, Validators.required));
    this._frm.addControl('billingCycle', new FormControl(null, Validators.required));
    this._frm.addControl('poNumber', new FormControl(null, Validators.required));
    this._frm.addControl('customerName', new FormControl(null, Validators.required));
    this._frm.addControl('parentCompany', new FormControl(null, Validators.required));
  }
  saveCustomer() {
    this.clientDialog = false;
  }
  cancelCustomer() {
    this.clientDialog = false;
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
