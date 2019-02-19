import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-invoicedata',
  templateUrl: './invoicedata.component.html',
  styleUrls: ['./invoicedata.component.css'],
  providers: [DatePipe]
})
export class InvoicedataComponent implements OnInit {

  _billingCycle: SelectItem[];
  _selectedBillingCycle: string;
  _invoiceDate: any;
  _startDate: any;
  _endDate: any;
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
    private datePipe: DatePipe,
    private commonSvc: CommonService) { }

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
      { field: 'PONumber', header: 'PO #', align: 'right', width: '100px' },
    ];
    this._selectedBillingCycle = 'A';
    const dateNow = new Date();
    const end = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0);
    const start = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1);
    this._invoiceDate = dateNow;
    this._startDate = start;
    this._endDate = end;
  }

  generateReport() {
    this.showSpinner = true;
    let selectedValue = '';
    let start = '';
    let end = '';
    let formattedStart = '';
    let formattedEnd = '';
    let invoicedate = '';

    const divisionId = this.commonSvc.getAppSettingsValue('EbixDivision');
    const productCode = this.commonSvc.getAppSettingsValue('EbixProductCode');
    const DateFormat = this.commonSvc.getAppSettingsValue('DateFormat');
    const DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    if (this._invoiceDate !== undefined && this._invoiceDate !== null && this._invoiceDate.toString() !== '') {
      invoicedate = this.datePipe.transform(this._invoiceDate.toString(), DisplayDateFormat);
    }
    if (this._startDate !== undefined && this._startDate !== null && this._startDate.toString() !== '') {
      start = this.datePipe.transform(this._startDate.toString(), DisplayDateFormat);
      formattedStart = this.datePipe.transform(this._startDate.toString(), DateFormat);
    }
    if (this._endDate !== undefined && this._endDate !== null && this._endDate.toString() !== '') {
      end = this.datePipe.transform(this._endDate.toString(), DisplayDateFormat);
      formattedEnd = this.datePipe.transform(this._endDate.toString(), DateFormat);
    }
    if (!(this._selectedBillingCycle === 'A')) {
      selectedValue = this._selectedBillingCycle;
    }
    this.timesysSvc
      .getInvoiceData(invoicedate, start, end, divisionId, productCode, selectedValue, formattedStart, formattedEnd)
      .subscribe(
        (data) => {
          this._reports = [];
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this.showInvoiceList = true;
            this.showReport = true;
          }
          this._recData = this._reports.length;
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
