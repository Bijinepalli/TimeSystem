import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { BillingCodes, BillingCodesSpecial, TimeSheet } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.css'],
  providers: [DatePipe]
})
export class PayrollComponent implements OnInit {
  dates: SelectItem[];
  dateFormat: string;
  periodEnd: any;
  selectedDate: string;
  timesheet: TimeSheet[] = [];
  showReport = false;
  showSpinner = false;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  _timesheet: TimeSheet;
  helpText: any;
  visibleHelp = false;
  selectedPeriod: any;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) { }

  ngOnInit() {
    this.populateDateDrop();
  }
  populateDateDrop() {
    this.dates = [];
    const PeriodEndReportPeriods = 48;
    this.timesysSvc.getDatebyPeriod()
      .subscribe(
        (data) => {
          this.timesheet = data;
          for (let i = 0; i < PeriodEndReportPeriods; i++) {
            this.dates.push({ label: this.timesheet[i].PeriodEndDate, value: this.timesheet[i].PeriodEndDate });
          }
        }
      );
  }
  getPeriodEndDetails() {
    this.showSpinner = true;
    this.buildCols();
    this._timesheet = new TimeSheet();
    let _date = '';

    if (this.selectedDate !== null && this.selectedDate !== '') {
      _date = this.datePipe.transform(this.selectedDate, 'yyyy/MM/dd');
      this.selectedDate = _date;
    }
    this._timesheet.PeriodEndDate = _date;
    this.showSpinner = false;
    this.timesysSvc.GetTimeSheetsPerEmployeePeriodEnd(this._timesheet).subscribe(
      (data) => {
        // this.showTable(data);
        console.log(data);
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
      this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No Matching Data for the Selection Criteria' });
    }
    this.showReport = true;
    this.showSpinner = false;
  }
  buildCols() {
    this.cols = [
      { field: 'Salaried', header: 'Salaried' },
      { field: 'EmployeeNumber', header: 'Employee Number' },
      { field: 'EmployeeName', header: 'Employee Name' },
      { field: 'Worked', header: 'Worked' },
      { field: 'HolidayHours', header: 'Holiday Hours' },
      { field: 'PTOHours', header: 'PTO Hours' },
      { field: 'IPayHours', header: 'IPay Hours' },
      { field: 'HoursPaid', header: 'Hours Paid' },
      { field: 'NonBillableHours', header: 'Non-Billable Hours' },
      { field: 'TotalHours', header: 'Total Hours' },
      { field: 'HasOutstandingTimesheets', header: 'Has Outstanding Timesheets' }
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
