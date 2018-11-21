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

  }

}
