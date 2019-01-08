import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-invoicedata',
  templateUrl: './invoicedata.component.html',
  styleUrls: ['./invoicedata.component.css'],
  providers: [DatePipe]
})
export class InvoicedataComponent implements OnInit {

  _billingCycle: SelectItem[];
  _selectedBillingCycle: string;
  _invoiceDate: string;
  _startDate: string;
  _endDate: string;
  showInvoiceList = false;
  showSpinner = false;
  showReport = false;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  visibleHelp: boolean;
  helpText: string;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this._billingCycle = [
      { label: 'Weekly', value: 'W' },
      { label: 'Bi-Weekly', value: 'B' },
      { label: 'Monthly', value: 'M' },
      { label: 'All', value: 'A' }
    ];
    this.cols = [
      { field: 'InvoiceDate', header: 'Invoice Date' },
      { field: 'DivisionNumber', header: 'Division #' },
      { field: 'CustomerNumber', header: 'Customer #' },
      { field: 'ProductCode', header: 'Product Code' },
      { field: 'Hours', header: 'Hours' },
      { field: 'Rate', header: 'Rate' },
      { field: 'Amount', header: 'Amount' },
      { field: 'StartDate', header: 'Start Date' },
      { field: 'EndDate', header: 'End Date' },
      { field: 'ClientName', header: 'Description' },
    ];
    this._selectedBillingCycle = 'W';
    const dateNow = new Date();
    const end = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0);
    this._invoiceDate = (dateNow.getMonth() + 1).toString() + '-' + dateNow.getDate().toString() + '-' + dateNow.getFullYear().toString();
    console.log(this._invoiceDate);
    this._startDate = (dateNow.getMonth() + 1).toString() + '-01-' + (dateNow.getFullYear().toString());
    this._endDate = (end.getMonth() + 1).toString() + '-' + end.getDate().toString() + '-' + end.getFullYear().toString();
  }

  ngOnInit() {

  }

  generateReport() {
    this.showSpinner = true;
    let selectedValue = '';
    let start = '';
    let end = '';
    let formattedStart = '';
    let formattedEnd = '';
    let invoicedate = '';

    const divisionId = '81';  // GET VALUE FROM APPSETTINGS
    const productCode = 'VER-PROFSVC';  // GET VALUE FROM APPSETTINGS
    const dateFormat = 'yyyy-MM-dd'; // GET VALUE FROM APPSETTINGS

    if (this._invoiceDate !== undefined && this._invoiceDate !== null && this._invoiceDate.toString() !== '') {
      invoicedate = this.datePipe.transform(this._invoiceDate.toString(), 'MM-dd-yyyy');
    }
    if (this._startDate !== undefined && this._startDate !== null && this._startDate.toString() !== '') {
      start = this.datePipe.transform(this._startDate.toString(), 'MM-dd-yyyy');
      formattedStart = this.datePipe.transform(this._startDate.toString(), dateFormat);
    }
    if (this._endDate !== undefined && this._endDate !== null && this._endDate.toString() !== '') {
      end = this.datePipe.transform(this._endDate.toString(), 'MM-dd-yyyy');
      formattedEnd = this.datePipe.transform(this._endDate.toString(), dateFormat);
    }
    if (!(this._selectedBillingCycle === 'A')) {
      selectedValue = this._selectedBillingCycle;
    }
    this.timesysSvc
      .getInvoiceData(invoicedate, start, end, divisionId, productCode, selectedValue, formattedStart, formattedEnd)
      .subscribe(
        (data) => {
          const reportData = data;
          for (let i = 0; i < reportData.length; i++) {
            if (reportData[i].InvoiceDate) {
              reportData[i].InvoiceDate = this.datePipe.transform(reportData[i].InvoiceDate.toString(), 'MM-dd-yyyy');
            } else if (reportData[i].StartDate) {
              reportData[i].StartDate = this.datePipe.transform(reportData[i].StartDate.toString(), 'MM-dd-yyyy');
            } else if (reportData[i].EndDate) {
              reportData[i].EndDate = this.datePipe.transform(reportData[i].EndDate.toString(), 'MM-dd-yyyy');
            }
          }
          this._reports = reportData;
          this._recData = this._reports.length;
          this.showInvoiceList = true;
          this.showReport = true;
          this.showSpinner = false;
        }
      );
  }


  startOver() {
    this.showInvoiceList = false;
    this.showReport = false;
    this.showSpinner = false;
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
