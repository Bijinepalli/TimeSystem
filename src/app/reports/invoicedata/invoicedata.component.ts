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

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this._billingCycle = [
      { label: 'Weekly', value: 'W' },
      { label: 'Bi-Weekly', value: 'B' },
      { label: 'Monthly', value: 'M' },
      { label: 'All', value: 'A' }
    ];
    this.cols = [
      { field: 'InvoiceDate', header: 'Invoice Date', align: 'center', width: '120px' },
      { field: 'DivisionNumber', header: 'Division #', align: 'right', width: '100px' },
      { field: 'CustomerNumber', header: 'Customer #', align: 'right', width: '100px' },
      { field: 'ProductCode', header: 'Product Code', align: 'left', width: '150px' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '75px' },
      { field: 'Rate', header: 'Rate', align: 'right', width: '75px' },
      { field: 'Amount', header: 'Amount', align: 'right', width: '80px' },
      { field: 'StartDate', header: 'Start Date', align: 'center', width: '100px' },
      { field: 'EndDate', header: 'End Date', align: 'center', width: '100px' },
      { field: 'ClientName', header: 'Description', align: 'left', width: 'auto' },
      { field: 'PONumber', header: 'PO #', align: 'right', width: '75px' },
    ];
    this._selectedBillingCycle = 'A';
    const dateNow = new Date();
    const end = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0);

    // To convert single digit to double digit
    this._invoiceDate = ('0' + (dateNow.getMonth() + 1)).slice(-2).toString()
      + '-' + ('0' + (dateNow.getDate() + 1)).slice(-2).toString() + '-' + dateNow.getFullYear().toString();
    this._startDate = ('0' + (dateNow.getMonth() + 1)).slice(-2).toString() + '-01-'
      + (dateNow.getFullYear()).toString();
    this._endDate = ('0' + (end.getMonth() + 1)).slice(-2).toString() + '-'
      + ('0' + end.getDate()).slice(-2).toString() + '-' + end.getFullYear().toString();
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
      // invoicedate = this.datePipe.transform(this._invoiceDate.toString(), 'MM-dd-yyyy');
      invoicedate = this._invoiceDate.toString();
    }
    if (this._startDate !== undefined && this._startDate !== null && this._startDate.toString() !== '') {
      start = this._startDate.toString();
      // formattedStart = this.datePipe.transform(this._startDate.toString(), dateFormat);
      const dateNow = new Date();
      formattedStart = ((dateNow.getFullYear() + 1).toString() + '-' + ('0' + (dateNow.getMonth() + 1)).slice(-2).toString() + '-01');
    }
    if (this._endDate !== undefined && this._endDate !== null && this._endDate.toString() !== '') {
      end = this._endDate.toString();
      // formattedEnd = this.datePipe.transform(this._endDate.toString(), dateFormat);
      const dateNow = new Date();
      const endFor = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0);
      formattedEnd = (endFor.getFullYear().toString() + '-' + ('0' + (endFor.getMonth() + 1)).slice(-2)).toString()
        + '-' + ('0' + endFor.getDate()).slice(-2).toString();
    }
    if (!(this._selectedBillingCycle === 'A')) {
      selectedValue = this._selectedBillingCycle;
    }
    this.timesysSvc
      .getInvoiceData(invoicedate, start, end, divisionId, productCode, selectedValue, formattedStart, formattedEnd)
      .subscribe(
        (data) => {
          const reportData = data;
          // for (let i = 0; i < reportData.length; i++) {
          //   if (reportData[i].InvoiceDate !== '') {
          //     reportData[i].InvoiceDate = this.datePipe.transform(reportData[i].InvoiceDate.toString(), 'MM-dd-yyyy');
          //   }
          //   if (reportData[i].StartDate !== '') {
          //     reportData[i].StartDate = this.datePipe.transform(reportData[i].StartDate.toString(), 'MM-dd-yyyy');
          //   }
          //   if (reportData[i].EndDate !== '') {
          //     reportData[i].EndDate = this.datePipe.transform(reportData[i].EndDate.toString(), 'MM-dd-yyyy');
          //   }
          // }
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
