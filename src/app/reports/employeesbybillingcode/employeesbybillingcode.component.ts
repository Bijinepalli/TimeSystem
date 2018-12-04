import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial } from 'src/app/model/objects';

@Component({
  selector: 'app-employeesbybillingcode',
  templateUrl: './employeesbybillingcode.component.html',
  styleUrls: ['./employeesbybillingcode.component.css']
})

export class EmployeesbybillingcodeComponent implements OnInit {
  types: SelectItem[];
  assignStatus: SelectItem[];
  selectedassignStatus: number;
  billingType: SelectItem[];
  selectedType: number;
  selectedBillingType: number;
  showReport = false;
  showBillingCodeList = false;
  changeCodeList = false;
  allcheckbox = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _clients: Clients[];
  _projects: Projects[];
  _nonBillables: NonBillables[];
  _selectString = '';
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  _billingCodesSpecial: BillingCodesSpecial;
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService) {
    this.types = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.assignStatus = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.billingType = [
      { label: 'Client', value: 0 },
      { label: 'Project', value: 1 },
      { label: 'Non-Billable', value: 2 }
    ];
    this.cols = [
      { field: 'Name', header: 'Name' },
      { field: 'Key', header: 'Code' },
      { field: 'Inactive', header: 'Inactive' },
      { field: 'InactiveRel', header: 'Currently Associated' },
      { field: 'LastName', header: 'Last Name' },
      { field: 'FirstName', header: 'First Name' },
      { field: 'Salaried', header: 'Salaried' },
    ];
    this.selectedType = 0;
    this.selectedBillingType = 0;
    this.selectedassignStatus = 0;
  }

  ngOnInit() {
  }
  showBillingCodes() {
    this._displayCheckBoxes = [];
    if (this.selectedBillingType === 0) {
      this.timesysSvc.getClients().subscribe(
        (data) => {
          if (this.selectedType < 2) {
            this._clients = data.filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
          } else {
            this._clients = data;
          }
          for (let i = 0; i < this._clients.length; i++) {
            this._displayCheckBoxes.push({ label: this._clients[i].ClientName, value: this._clients[i].Key });
          }
          this._selectString = 'Clients (' + this._clients.length + ' matching codes found)';
          this.showBillingCodeList = true;
        }
      );
    } else if (this.selectedBillingType === 1) {
      this.timesysSvc.getProjects('').subscribe(
        (data) => {
          if (this.selectedType < 2) {
            this._projects = data[0].filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
          } else {
            this._projects = data[0];
          }
          for (let i = 0; i < this._projects.length; i++) {
            this._displayCheckBoxes.push({ label: this._projects[i].ProjectName, value: this._projects[i].Key });
          }
          this._selectString = 'Projects (' + this._projects.length + ' matching codes found)';
          this.showBillingCodeList = true;
        }
      );
    } else {
      this.timesysSvc.getNonBillables('').subscribe(
        (data) => {
          if (this.selectedType < 2) {
            this._nonBillables = data[0].filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
          } else {
            this._nonBillables = data[0];
          }
          for (let i = 0; i < this._nonBillables.length; i++) {
            this._displayCheckBoxes.push({ label: this._nonBillables[i].ProjectName, value: this._nonBillables[i].Key });
          }
          this._selectString = 'Non Billables (' + this._nonBillables.length + ') matching codes found';
          this.showBillingCodeList = true;
        }
      );
    }
  }
  selectAll() {
    this._selectcheckbox = [];
    for (let i = 0; i < this._displayCheckBoxes.length; i++) {
      this._selectcheckbox.push(this._displayCheckBoxes[i].value);
    }
    if (this.allcheckbox === false) {
      this._selectcheckbox = [];
    }
  }
  selectcheck() {
    if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
      this.allcheckbox = true;
    } else {
      this.allcheckbox = false;
    }
  }
  generateReport() {
    if (this._selectcheckbox.length > 0) {
      this._billingCodesSpecial = new BillingCodesSpecial();
      console.log(this._selectcheckbox.length, this._displayCheckBoxes.length);
      if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
        this._billingCodesSpecial.value = '';
      } else {
        this._billingCodesSpecial.value = this._selectcheckbox.join();
      }
      this._billingCodesSpecial.codeStatus = this.selectedType.toString();
      this._billingCodesSpecial.relStatus = this.selectedassignStatus.toString();
      console.log('Inactive=' + this.selectedType.toString());
      console.log('Rel=' + this.selectedassignStatus.toString());

      if (this.selectedBillingType === 0) {
        // tslint:disable-next-line:max-line-length
        this.timesysSvc.listAllClientItemsForBillingCodesPost(this._billingCodesSpecial).subscribe(
          (data) => {
            console.log(data);
            this._reports = data;
            this._recData = this._reports.length;
            this.showBillingCodeList = false;
            this.showReport = true;
            this.changeCodeList = true;
          }
        );
      } else if (this.selectedBillingType === 1) {
        this.timesysSvc.listAllProjectDataForBillingCodesPost(this._billingCodesSpecial).subscribe(
          (data) => {
            console.log(data);
            this._reports = data;
            this._recData = this._reports.length;
            this.showBillingCodeList = false;
            this.showReport = true;
            this.changeCodeList = true;
          }
        );
      } else {
        this.timesysSvc.listAllBillingItemsForBillingCodesPost(this._billingCodesSpecial).subscribe(
          (data) => {
            console.log(data);
            this._reports = data;
            this._recData = this._reports.length;
            this.showBillingCodeList = false;
            this.showReport = true;
            this.changeCodeList = true;
          }
        );
      }
    } else {
      this.msgSvc.add({ severity: 'error', summary: 'Error in report generation', detail: 'No Billing Codes Selected' });
    }
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._selectcheckbox = [];
    this.allcheckbox = false;
    this.selectedassignStatus = 0;
  }
  changeCodes() {
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
  }
}
