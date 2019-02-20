import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial, NonBillablesTotalHours } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { DateFormats } from 'src/app/model/constants';
import { CommonService } from '../../service/common.service';

@Component({
  selector: 'app-nonbillablehours',
  templateUrl: './nonbillablehours.component.html',
  styleUrls: ['./nonbillablehours.component.css'],
  providers: [DatePipe]
})
export class NonbillablehoursComponent implements OnInit {

  reportType: SelectItem[];
  _reports: NonBillablesTotalHours[] = [];
  cols: any;
  selectedReportType: number;
  _headerType: string;
  startDate: string;
  endDate: string;
  totalChecked = false;
  showReport = false;
  _recData = 0;
  rowdata: any;
  helpText: any;
  visibleHelp = false;
  selectedCode: any;
  showSpinner = false;
  dateFormat = this.commonSvc.getAppSettingsValue('DateFormat');
  errMsg: string;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe, private commonSvc: CommonService) {
  }

  ngOnInit() {
    this.reportType = [
      { label: 'VTX Suite', value: 1 },
      { label: 'Internal Functions', value: 2 },
      { label: 'Employee Time Off', value: 3 },
      { label: 'Custom', value: 4 },
    ];
    this.cols = [
      { field: 'ReportGroup', header: 'Report Group', align: 'left', width: 'auto' },
      { field: 'EmployeeName', header: 'Employee Name', align: 'left', width: 'auto' },
      { field: 'Jan', header: 'JAN', align: 'right', width: '75px' },
      { field: 'Feb', header: 'FEB', align: 'right', width: '75px' },
      { field: 'Mar', header: 'MAR', align: 'right', width: '75px' },
      { field: 'Apr', header: 'APR', align: 'right', width: '75px' },
      { field: 'May', header: 'MAY', align: 'right', width: '75px' },
      { field: 'Jun', header: 'JUN', align: 'right', width: '75px' },
      { field: 'Jul', header: 'JUL', align: 'right', width: '75px' },
      { field: 'Aug', header: 'AUG', align: 'right', width: '75px' },
      { field: 'Sep', header: 'SEP', align: 'right', width: '75px' },
      { field: 'Oct', header: 'OCT', align: 'right', width: '75px' },
      { field: 'Nov', header: 'NOV', align: 'right', width: '75px' },
      { field: 'Dec', header: 'DEC', align: 'right', width: '75px' },
      { field: 'Total', header: 'TOTAL', align: 'right', width: '75px' },
    ];
    this.selectedReportType = 1;
    const dateNow = new Date();
    const end = new Date(dateNow.getFullYear(), 12, 0);
    const start = new Date(dateNow.getFullYear(), (dateNow.getMonth() - 1), 1);
    this.startDate = this.datePipe.transform(start, 'MM-dd-yyyy');
    this.endDate = this.datePipe.transform(end, 'MM-dd-yyyy');
    this.totalChecked = true;
    this.showReport = false;
    this._recData = 0;
  }

  changeReportgroup() {
    const id = this.selectedReportType;
    this.navigateTo('/menu/nonbillableaddgroup/' + id);
  }

  navigateTo(url: any) {
    this.router.navigate([url], { skipLocationChange: true });
  }

  generateReport() {
    this.errMsg = '';
    this.showSpinner = true;
    this.setHeader();
    this.rowdata = {};
    const start = this.datePipe.transform(this.startDate, this.dateFormat);
    const end = this.datePipe.transform(this.endDate, this.dateFormat);
    if (new Date(this.startDate).getFullYear().toString() !== new Date(this.endDate).getFullYear().toString()) {
      this.errMsg += 'Date cannot span over years';
      this.showSpinner = false;
    } else {
      this.timesysSvc.getNonBillableHours(start, end, this.selectedReportType.toString(), this.totalChecked.toString()).subscribe(
        (data) => {
          this.showReport = false;
          this._reports = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this._recData = +this._reports[1].RowCount;
          }
          this.showReport = true;
          this.showSpinner = false;
        }
      );
    }
  }

  setHeader() {
    this._headerType = '';
    switch (this.selectedReportType) {
      case 1:
        this._headerType = 'VTX Suite';
        break;
      case 2:
        this._headerType = 'Interal Functions';
        break;
      case 3:
        this._headerType = 'Employee Time Off';
        break;
      case 4:
        this._headerType = 'Custom';
        break;
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
