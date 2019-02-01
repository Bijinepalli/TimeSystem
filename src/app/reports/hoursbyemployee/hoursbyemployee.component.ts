import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, BillingCodes } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { BillingCode } from 'src/app/model/constants';

@Component({
  selector: 'app-hoursbyemployee',
  templateUrl: './hoursbyemployee.component.html',
  styleUrls: ['./hoursbyemployee.component.css'],
  providers: [DatePipe]
})
export class HoursbyemployeeComponent implements OnInit {
  types: SelectItem[];
  assignStatus: SelectItem[];
  selectedassignStatus: number;
  billingType: SelectItem[];
  selectedType: number;
  selectedBillingType: number;
  showBillingCodeList = false;
  showSpinner = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _clients: Clients[];
  _projects: Projects[];
  _nonBillables: NonBillables[];
  _selectString = '';
  _recData = 0;
  cols: any;
  breakOut: SelectItem[];
  selectedbreakOut: number;
  allcheckbox = false;
  changeCodeList = false;
  showReport = false;
  _startDate = '';
  _startDateSelect = '';
  _endDate = '';
  _billingCodesSpecial: BillingCodesSpecial;
  _reports: any[] = [];
  showPeriodEndDetail = false;
  showTotals = false;
  helpText: any;
  visibleHelp = false;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.billingType = [
      { label: 'Client', value: 0 },
      { label: 'Project', value: 1 },
      { label: 'Non-Billable', value: 2 }
    ];
    this.selectedBillingType = 0;
    this.types = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.selectedType = 0;
    this.assignStatus = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.selectedassignStatus = 0;
    this.breakOut = [
      { label: 'Billing Code', value: 0 },
      { label: 'Employee', value: 1 }
    ];
    this.selectedbreakOut = 0;
    this.cols = [
      { field: 'Name', header: 'Name', align: 'left' },
      { field: 'LastName', header: 'Last Name', align: 'left' },
      { field: 'FirstName', header: 'First Name', align: 'left' },
      { field: 'Hours', header: 'Hours', align: 'right' },
      { field: 'PeriodEnd', header: 'Period Ending', align: 'left' },
    ];
  }

  ngOnInit() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    console.log(this._startDate);
    this._startDateSelect = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    console.log(this._startDate);

  }
  showBillingCodes() {
    this.showSpinner = true;
    this._displayCheckBoxes = [];
    if (this.selectedBillingType === 0) {
      this.timesysSvc.getClients().subscribe(
        (data) => {
          if (this.selectedType < 2) {
            this._clients = data.filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
          } else {
            this._clients = data;
            console.log('Data:' + data);
          }
          for (let i = 0; i < this._clients.length; i++) {
            this._displayCheckBoxes.push({ label: this._clients[i].ClientName, value: this._clients[i].Key });
          }
          this._selectString = 'Clients (' + this._clients.length + ' matching codes found)';
          this.showBillingCodeList = true;
          this.showSpinner = false;
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
          this.showSpinner = false;
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
          this.showSpinner = false;
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

  // generateReportClick() {
  //   this.generateReport();
  // }
  generateReport() {
    let dateValid: any;
    console.log(this._startDate + '-tehius');
    const dateCheck = new Date(this._startDateSelect);
    console.log(dateCheck);
    if (dateCheck.toString() === 'Invalid Date') {
      dateValid = this._startDate;
    } else {
      dateValid = dateCheck;
    }
    this.showSpinner = true;
    if (this._selectcheckbox.length > 0) {
      this.buildCols();
      this._billingCodesSpecial = new BillingCodesSpecial();
      this._billingCodesSpecial.value = this._selectcheckbox.join();
      this._billingCodesSpecial.codeStatus = this.selectedType.toString();
      this._billingCodesSpecial.relStatus = this.selectedassignStatus.toString();
      this._billingCodesSpecial.periodEnd = this.showPeriodEndDetail;
      let _start = '';
      let _end = '';

      if (this._startDate !== null && this._startDate !== '') {
        _start = this.datePipe.transform(dateValid, 'yyyy-MM-dd');
        this._startDate = this.datePipe.transform(dateValid, 'MM-dd-yyyy');
      }
      if (this._endDate !== null && this._endDate !== '') {
        _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
        this._endDate = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
      }
      this._billingCodesSpecial.startDate = _start;
      this._billingCodesSpecial.endDate = _end;
      console.log(_start, _end, this._endDate);
      if (this.selectedbreakOut.toString() === '0') {
        switch (this.selectedBillingType) {
          case 0:
            this.timesysSvc.ListClientHoursByEmployee(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
          case 1:
            this.timesysSvc.ListProjectHoursByEmployee(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
          case 2:
            this.timesysSvc.ListNonBillableHoursByEmployee(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
        }
      } else if (this.selectedbreakOut.toString() === '1') {
        switch (this.selectedBillingType) {
          case 0:
            this.timesysSvc.ListEmployeeHoursByClient(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
          case 1:
            this.timesysSvc.ListEmployeeHoursByProject(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
          case 2:
            this.timesysSvc.ListEmployeeHoursByNonBillable(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
        }
      }
    }
    // else {
    //   this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No Matching Data for the Selection Criteria' });
    // }
  }

  showTable(data: BillingCodes[]) {
    if (data !== undefined && data !== null) {
      this._reports = data;
      this._recData = this._reports.length;
    } else {
      this._reports = [];
      this._recData = 0;
      this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No Matching Data for the Selection Criteria' });
    }
    this.showBillingCodeList = false;
    this.showReport = true;
    this.changeCodeList = true;
    this.showSpinner = false;
  }
  buildCols() {
    if (this.selectedbreakOut.toString() === '0') {
      this.cols = [
        { field: 'Name', header: 'Name', align: 'left' },
        { field: 'LastName', header: 'Last Name', align: 'left' },
        { field: 'FirstName', header: 'First Name', align: 'left' },
        { field: 'Hours', header: 'Hours', align: 'right' },
      ];
    } else {
      this.cols = [
        { field: 'LastName', header: 'Last Name', align: 'left' },
        { field: 'FirstName', header: 'First Name', align: 'left' },
        { field: 'Name', header: 'Name', align: 'left' },
        { field: 'Hours', header: 'Hours', align: 'right' },
      ];
    }
    if (this.showPeriodEndDetail) {
      this.cols.push({ field: 'PeriodEnd', header: 'Period Ending', align: 'left' });
    }
  }

  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._selectcheckbox = [];
    this.allcheckbox = false;
    this.selectedassignStatus = 0;
    this.showSpinner = false;
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    this._endDate = '';
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
