import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, BillingCodes } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employeehoursbybillingcode',
  templateUrl: './employeehoursbybillingcode.component.html',
  styleUrls: ['./employeehoursbybillingcode.component.css'],
  providers: [DatePipe]
})
export class EmployeehoursbybillingcodeComponent implements OnInit {
  billingCycle: SelectItem[];
  selectedbillingCycle: number;
  _startDate = '';
  _endDate = '';
  showSpinner = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _clients: Clients[];
  _selectString = '';
  showBillingCodeList = false;
  allcheckbox = false;
  changeCodeList = false;
  showReport = false;
  _recData = 0;
  cols: any;
  _reports: any[] = [];
  _billingCodesSpecial: BillingCodesSpecial;
  helpText: any;
  visibleHelp = false;
  showTotals = false;
  nowrap = 'nowrap';

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.billingCycle = [
      { label: 'Weekly', value: 0 },
      { label: 'Bi-Weekly', value: 1 },
      { label: 'Monthly', value: 2 },
      { label: 'All (Show T&M, Projects, Non-Billables)', value: 3 }
    ];
    this.selectedbillingCycle = 3;
  }

  ngOnInit() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    console.log(this._startDate);
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
  showBillingCodes() {
    this.showSpinner = true;
    this._displayCheckBoxes = [];
    const selectedType = 0;
    if (this.selectedbillingCycle < 3) {
      this.timesysSvc.getClients().subscribe(
        (data) => {
          if (selectedType < 2) {
            this._clients = data.filter(P => P.Inactive === (selectedType === 0 ? false : true));
          } else {
            this._clients = data;
          }
          for (let i = 0; i < this._clients.length; i++) {
            this._displayCheckBoxes.push({ label: this._clients[i].ClientName, value: this._clients[i].Key });
          }
          this._selectString = 'Clients (' + this._clients.length + ' matching codes found)';
          this.showBillingCodeList = true;
          this.showSpinner = false;
        }
      );
    } else if (this.selectedbillingCycle === 3) {
      this.generateReport();
    }
  }
  generateReport() {
    this.showSpinner = true;
    if (this.selectedbillingCycle < 3) {
      if (this._selectcheckbox.length > 0) {
        this.buildCols();
        this._billingCodesSpecial = new BillingCodesSpecial();
        if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
          this._billingCodesSpecial.value = '';
        } else {
          this._billingCodesSpecial.value = this._selectcheckbox.join();
        }
        let _selectedBillingCycle = '';
        if (this.selectedbillingCycle === 0) {
          _selectedBillingCycle = 'W';
        } else if (this.selectedbillingCycle === 1) {
          _selectedBillingCycle = 'B';
        } else if (this.selectedbillingCycle === 2) {
          _selectedBillingCycle = 'M';
        } else if (this.selectedbillingCycle === 3) {
          _selectedBillingCycle = 'A';
        }
        this._billingCodesSpecial.billingCycle = _selectedBillingCycle;
        let _start = '';
        let _end = '';
        if (this._startDate !== null && this._startDate !== '') {
          _start = this.datePipe.transform(this._startDate, 'yyyy-MM-dd');
          this._startDate = _start;
        }
        console.log('Pola');
        if (this._endDate !== null && this._endDate !== '') {
          _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
          this._endDate = _end;
        }
        this._billingCodesSpecial.startDate = _start;
        this._billingCodesSpecial.endDate = _end;
        this._billingCodesSpecial.includeTotals = this.showTotals === true ? 1 : 0;
        console.log(this._billingCodesSpecial);
        this.timesysSvc.ListEmployeeHoursByBillingCodeClientOnly(this._billingCodesSpecial).subscribe(
          (data) => {
            this.showTable(data);
            console.log(data.length);
          }
        );
      }
    } else {
      this.buildCols();
      this._billingCodesSpecial = new BillingCodesSpecial();
      let _start = '';
      let _end = '';

      if (this._startDate !== null && this._startDate !== '') {
        _start = this.datePipe.transform(this._startDate, 'yyyy-MM-dd');
        this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
      }
      if (this._endDate !== null && this._endDate !== '') {
        _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
        this._endDate = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
      }
      this._billingCodesSpecial.startDate = _start;
      this._billingCodesSpecial.endDate = _end;
      this._billingCodesSpecial.includeTotals = this.showTotals === true ? 1 : 0;
      console.log(this._billingCodesSpecial);
      this.timesysSvc.ListEmployeeHoursByBillingCode(this._billingCodesSpecial).subscribe(
        (data) => {
          this.showTable(data);
          console.log(JSON.stringify(data));
        }
      );
    }
    // else {
    //   this.msgSvc.add({ severity: 'error', summary: 'Error in report generation', detail: 'No Billing Codes Selected' });
    // }
  }
  showTable(data: BillingCodes[]) {
    if (data !== undefined && data !== null) {
      this._reports = data;
      this._recData = this._reports.length;
      if (this._reports.length === 0) {
        this.msgSvc.add({ severity: 'error', summary: 'Info Message', detail: 'No Matching Data for the Selection Criteria' });
      }
    } else {
      this._reports = [];
      this._recData = 0;
      this.msgSvc.add({ severity: 'error', summary: 'Info Message', detail: 'No Matching Data for the Selection Criteria' });
    }
    this.showBillingCodeList = false;
    this.showReport = true;
    this.changeCodeList = true;
    this.showSpinner = false;
  }
  buildCols() {
    this.cols = [
      { field: 'BillingName', header: 'Billing Code', align: 'left' },
      { field: 'LastName', header: 'Last Name', align: 'left' },
      { field: 'TANDM', header: 'T & M', align: 'right' },
      { field: 'Project', header: 'Project', align: 'right' },
      { field: 'NonBill', header: 'NonBillable', align: 'right' },
    ];
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
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._selectcheckbox = [];
    this.allcheckbox = false;
    this.selectedbillingCycle = 3;
    this.showSpinner = false;
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    this._endDate = '';
  }
}
