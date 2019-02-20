import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-billablehours',
  templateUrl: './billablehours.component.html',
  styleUrls: ['./billablehours.component.css'],
  providers: [DatePipe]
})
export class BillablehoursComponent implements OnInit {

  types: SelectItem[];
  selectedType: number;
  assignStatus: SelectItem[];
  selectedassignStatus: number;
  billingType: SelectItem[];
  selectedBillingType: number;
  showReport = false;
  showBillingCodeList = false;
  changeCodeList = false;
  _clients: Clients[];
  _projects: Projects[];
  _nonBillables: NonBillables[];
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  showSpinner = false;
  _codeCount: string;
  codes: SelectItem[];
  selectedCode: string;
  startDate: Date;
  endDate: Date;
  admin = false;
  _codeType: string;
  _totalhours: any;
  helpText: any;
  visibleHelp = false;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
  }

  ngOnInit() {
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
    ];
    this.cols = [
      { field: 'Name', header: 'Name', align: 'left', width: 'auto' },
      { field: 'Key', header: 'Code', align: 'left', width: '200px' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '110px' },
      { field: 'InactiveRel', header: 'Currently Associated', align: 'center', width: '200px' },
      { field: 'CalendarDate', header: 'Date', align: 'center', width: '100px' },
      { field: 'LastName', header: 'Last Name', align: 'left', width: '126px' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '130px' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '95px' },
    ];
    this.selectedType = 0;
    this.selectedBillingType = 0;
    this.selectedassignStatus = 0;
    this.admin = true; // check if role is admin
  }

  showBillingCodes() {
    this.showSpinner = true;
    this.codes = [];
    this.selectedCode = '';
    if (this.selectedBillingType === 0) {
      this.timesysSvc.getClients().subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            if (this.selectedType < 2) {
              data = data.filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
              if (data !== undefined && data !== null && data.length > 0) {
                this._clients = data;
              }
            } else {
              this._clients = data;
            }
          }
          for (let i = 0; i < this._clients.length; i++) {
            this.codes.push({ label: this._clients[i].ClientName, value: this._clients[i].Key });
          }
          this._codeCount = 'Select from ' + this._clients.length + ' matching Clients';
          this.showBillingCodeList = true;
          this._codeType = 'Clients';
          this.showSpinner = false;
        }
      );
    } else if (this.selectedBillingType === 1) {
      this.timesysSvc.getProjects('').subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            if (data[0] !== undefined && data[0] !== null && data[0].length > 0) {
              if (this.selectedType < 2) {
                this._projects = data[0].filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
              } else {
                this._projects = data[0];
              }
            }
          }
          for (let i = 0; i < this._projects.length; i++) {
            this.codes.push({ label: this._projects[i].ProjectName, value: this._projects[i].Key });
          }
          this._codeCount = 'Select from ' + this._projects.length + ' matching Projects';
          this.showBillingCodeList = true;
          this.showSpinner = false;
          this._codeType = 'Projects';
        }
      );
    }
  }

  generateReport() {
    this.showSpinner = true;
    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    let start = '';
    let end = '';
    this._totalhours = 0.00;
    if (this.startDate !== undefined && this.startDate !== null && this.startDate.toString() !== '') {
      start = this.datePipe.transform(this.startDate.toString(), 'MM-dd-yyyy');
    }
    if (this.endDate !== undefined && this.endDate !== null && this.endDate.toString() !== '') {
      end = this.datePipe.transform(this.endDate.toString(), 'MM-dd-yyyy');
    }
    this.timesysSvc.getBillableHours(
      this.selectedBillingType.toString(),
      this.selectedCode.toString(),
      this.selectedType.toString(),
      this.selectedassignStatus.toString(),
      start,
      end)
      .subscribe(
        (data) => {
          this.showReport = false;
          this._reports = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            for (let i = 0; i < this._reports.length; i++) {
              this._totalhours += +this._reports[i].Hours;
            }
            this._recData = this._reports.length;
            this.showReport = true;
          }
          this.showBillingCodeList = false;
          this.changeCodeList = true;
          this.showSpinner = false;
          this._totalhours = parseFloat(this._totalhours);
        });
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this.selectedassignStatus = 0;
    this.showSpinner = false;
  }
  changeCodes() {
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
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
