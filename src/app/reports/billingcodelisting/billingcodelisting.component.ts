import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';

@Component({
  selector: 'app-billingcodelisting',
  templateUrl: './billingcodelisting.component.html',
  styleUrls: ['./billingcodelisting.component.css']
})
export class BillingcodelistingComponent implements OnInit {

  types: SelectItem[];
  billingType: SelectItem[];
  selectedType: number;
  selectedBillingType: number;
  _reports: any[] = [];
  cols: any;
  _recData: any;
  visibleHelp: boolean;
  helpText: string;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService) {
    this.types = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.billingType = [
      { label: 'Client', value: 0 },
      { label: 'Project', value: 1 },
      { label: 'Non-Billable', value: 2 }
    ];
    this.selectedType = 0;
    this.selectedBillingType = 0;
  }

  ngOnInit() {
    this._reports = [];
    this.setCols(this.selectedBillingType.toString());
    this.timesysSvc.listAllClientItems(this.selectedType.toString())
      .subscribe(
        (data) => {
          this._reports = data;
          this._recData = data.length + ' matching rows';
        }
      );
  }

  searchReports() {
    this._reports = [];
    let mode = null;
    if (this.selectedType.toString() === '2') {
      mode = '';
    } else {
      mode = this.selectedType.toString();
    }
    switch (this.selectedBillingType.toString()) {
      case '0':
        this.setCols('0');
        this.timesysSvc.listAllClientItems(mode).subscribe(
          (data) => {
            this._reports = data;
            this._recData = data.length + ' matching rows';
          });
        break;
      case '1':
        this.setCols('1');
        this.timesysSvc.listAllProjectData(mode).subscribe(
          (data) => {
            this._reports = data;
            this._recData = data.length + ' matching rows';
          });
        break;
      case '2':
        this.setCols('2');
        this.timesysSvc.listAllBillingItems(mode).subscribe(
          (data) => {
            this._reports = data;
            this._recData = data.length + ' matching rows';
          });
        break;
    }
  }

  setCols(type: string) {
    this.cols = [];
    if (type === '0') {
      this.cols = [
        { field: 'Key', header: 'Code', align: 'left', width: '200px' },
        { field: 'ClientName', header: 'Name', align: 'left', width: 'auto' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '150px' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '150px' },
        { field: 'BillingCycle', header: 'Billing Cycle', align: 'center', width: '150px' },
        { field: 'CompanyName', header: 'Company Name', align: 'left', width: '250px' },
      ];
    } else if (type === '1') {
      this.cols = [
        { field: 'Key', header: 'Code', align: 'left', width: '200px' },
        { field: 'ProjectName', header: 'Name', align: 'left', width: 'auto' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '150px' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '150px' },
        { field: 'CompanyName', header: 'Company Name', align: 'left', width: '250px' },
      ];
    } else if (type === '2') {
      this.cols = [
        { field: 'Key', header: 'Code', align: 'left', width: '200px' },
        { field: 'ProjectName', header: 'Name', align: 'left', width: 'auto' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '150px' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '150px' },
      ];
    }
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
}
