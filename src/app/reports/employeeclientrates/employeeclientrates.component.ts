import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Invoice, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { InvokeFunctionExpr } from '@angular/compiler';
@Component({
  selector: 'app-employeeclientrates',
  templateUrl: './employeeclientrates.component.html',
  styleUrls: ['./employeeclientrates.component.css'],
  providers: [DatePipe]
})
export class EmployeeclientratesComponent implements OnInit {
  _startDate = '';
  _endDate = '';
  showAll = false;
  showReport = false;
  showSpinner = false;
  _invoice: Invoice;
  _billingCodesSpecial: BillingCodesSpecial;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  visibleHelp: boolean;
  helpText: string;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {


  }

  ngOnInit() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM/dd/yyyy');
  }
  generateReport() {
    this.showSpinner = true;
    this.buildCols();
    console.log(this.showAll);
    if (this.showAll === false) {
      this._billingCodesSpecial = new BillingCodesSpecial();
      let _start = '';
      let _end = '';

      if (this._startDate !== null && this._startDate !== '') {
        _start = this.datePipe.transform(this._startDate, 'yyyy/MM/dd');
        this._startDate = this.datePipe.transform(this._startDate, 'MM/dd/yyyy');
      }
      if (this._endDate !== null && this._endDate !== '') {
        _end = this.datePipe.transform(this._endDate, 'yyyy/MM/dd');
        this._endDate = this.datePipe.transform(this._endDate, 'MM/dd/yyyy');
      }
      this._billingCodesSpecial.startDate = _start;
      this._billingCodesSpecial.endDate = _end;
    } else {
      this._billingCodesSpecial.startDate = '';
      this._billingCodesSpecial.endDate = '';
    }
    this.timesysSvc.ListEmployeeClientRates(this._billingCodesSpecial).subscribe(
      (data) => {
        this.showTable(data);
        console.log(data);
      }
    );
  }
  showTable(data: Invoice[]) {
    if (data !== undefined && data !== null) {
      this._reports = data;
      this._recData = this._reports.length;
    } else {
      this._reports = [];
      this._recData = 0;
      this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No Matching Data for the Selection Criteria' });
    }
    this.showReport = true;
    this.showSpinner = false;
  }
  buildCols() {
    this.cols = [
      { field: 'LastName', header: 'Last Name' },
      { field: 'FirstName', header: 'First Name' },
      { field: 'EmployeeID', header: 'Employee ID' },
      { field: 'ClientName', header: 'Client Name' },
      { field: 'ClientID', header: 'Client ID' },
      { field: 'Rate', header: 'Rate' },
      { field: 'EffectiveDate', header: 'Effective Date' },
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
}
