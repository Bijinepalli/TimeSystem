import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { DateFormats } from 'src/app/model/constants';

@Component({
  selector: 'app-nonbillablehours',
  templateUrl: './nonbillablehours.component.html',
  styleUrls: ['./nonbillablehours.component.css'],
  providers: [DatePipe]
})
export class NonbillablehoursComponent implements OnInit {

  reportType: SelectItem[];
  _recData = 0;
  _reports: NonBillables[] = [];
  cols: any;
  selectedReportType: number;
  _headerType: string;
  startDate: string;
  endDate: string;
  totalChecked = false;
  showReport = false;
  rowdata: any;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.reportType = [
      { label: 'VTX Suite', value: 0 },
      { label: 'Internal Functions', value: 1 },
      { label: 'Employee Time Off', value: 2 },
      { label: 'Custom', value: 3 },
    ];
    this.cols = [
      { field: 'Group1', header: 'Group1' },
      { field: 'Group2', header: 'Group2' },
      { field: 'ID', header: 'ID' },
      { field: 'LastName', header: 'Last Name' },
      { field: 'FirstName', header: 'First Name' },
      { field: 'CalendarDate', header: 'Calendar Date' },
      { field: 'Hours', header: 'Hours' },
    ];
    this.selectedReportType = 0;
    const dateNow = new Date();
    const end = new Date(dateNow.getFullYear(), 12, 0);
    if ((dateNow.getMonth() - 1).toString() === '-1') {
      this.startDate = '12-01-' + (dateNow.getFullYear() - 1).toString();
    } else {
      this.startDate = (dateNow.getMonth() + 1).toString() + '-01-' + (dateNow.getFullYear().toString());
    }
    this.endDate = (end.getMonth() + 1).toString() + '-' + end.getDate().toString() + '-' + end.getFullYear().toString();
    this.totalChecked = true;
    console.log(this.startDate);
  }

  ngOnInit() {
  }

  changeReportgroup() {
    const id = this.selectedReportType;
    this.navigateTo('/menu/nonbillableaddgroup/' + id);
  }

  navigateTo(url: any) {
    this.router.navigate([url]);
  }

  generateReport() {
    this.setHeader();
    this.rowdata = {};
    const dateFormat = 'yyyy-MM-dd';
    const start = this.datePipe.transform(this.startDate, dateFormat);
    const end = this.datePipe.transform(this.endDate, dateFormat);
    this.timesysSvc.getNonBillableHours(start, end, (this.selectedReportType + 1).toString()).subscribe(
      (data) => {
        if (data !== null) {
          console.log(data);
          this._reports = data;
          this.showReport = true;
        }
      }
    );
  }

  sortReport() {
    if (this._reports !== null) {
      for (let i = 0; i < this._reports.length; i++) {
        const rowD = this._reports[i];
        const group = rowD.Group1;
        if (i === 0) {
          this.rowdata[group] = { index: 0, size: 1 };
        } else {
          const prevrowD = this._reports[i - 1];
          const prevrowG = prevrowD.Group1;
          if (group === prevrowG) {
            this.rowdata[group].size++;
          } else {
            this.rowdata[group] = { index: i, size: 1 };
          }
        }
      }
    }
  }

  setHeader() {
    this._headerType = '';
    switch (this.selectedReportType) {
      case 0:
        this._headerType = 'VTX Suite';
        break;
      case 1:
        this._headerType = 'Interal Functions';
        break;
      case 2:
        this._headerType = 'Employee Time Off';
        break;
      case 3:
        this._headerType = 'Custom';
        break;
    }
  }
}
