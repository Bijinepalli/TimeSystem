import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { BillingCodes, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-hoursbytimesheetcategory',
  templateUrl: './hoursbytimesheetcategory.component.html',
  styleUrls: ['./hoursbytimesheetcategory.component.css'],
  providers: [DatePipe]
})
export class HoursbytimesheetcategoryComponent implements OnInit {
_startDate = '';
  _endDate = '';
  showReport = false;
  showSpinner = false;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
   _billingCodesSpecial: BillingCodesSpecial;
   helpText: any;
   visibleHelp = false;
   showTotals = false;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) { }

  ngOnInit() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    this._endDate = '';
  }
generateReport() {
    this.showSpinner = true;
    this.buildCols();
    // if (this.showAll === false) {
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
    // }
    // else {
    //   this._billingCodesSpecial.startDate = '';
    //   this._billingCodesSpecial.endDate = '';
    // }
    this.timesysSvc.ListEmployeeHoursByTimeSheetCategory(this._billingCodesSpecial).subscribe(
      (data) => {
        this.showTable(data);
      }
    );
  }
  showTable(data: BillingCodes[]) {
    if (data !== undefined && data !== null) {
      this._reports = data;
      this._recData = this._reports.length;
    } else {
      this._reports = [];
      this._recData = 0;
      this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No matching data for the selected criteria' });
    }
    this.showReport = true;
    this.showSpinner = false;
  }
  buildCols() {
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '200px' },
      { field: 'BillingName', header: 'Billing Code', align: 'left', width: 'auto' },
      { field: 'TANDM', header: 'T & M', align: 'right', width: '100px' },
      { field: 'Project', header: 'Project', align: 'right', width: '101px' },
      { field: 'NonBill', header: 'NonBillable', align: 'right', width: '133px' },
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
