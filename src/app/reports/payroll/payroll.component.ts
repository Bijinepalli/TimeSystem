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
  showBillingCodeList = false;
  changeCodeList = false;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.populateDateDrop();
  }

  ngOnInit() {
    // this.dates.push({ label: 'Select Period End', value: '' });
    // this.selectedDate = '0';
  }
  populateDateDrop() {
    this.dates = [];
    this.selectedDate = '';
    const PeriodEndReportPeriods = 48;
    this.timesysSvc.getDatebyPeriod()
      .subscribe(
        (data) => {
          this.timesheet = data;
          for (let i = 0; i < PeriodEndReportPeriods; i++) {
            this.dates.push({ label: this.timesheet[i].PeriodEndDate, value: this.timesheet[i].PeriodEnd });
          }
        }
      );
  }
  getPeriodEndDetails(e) {
    this.showSpinner = true;
    this.showReport = false;
    this.buildCols();
    this._timesheet = new TimeSheet();
    let _date = '';

    if (this.selectedDate !== null && this.selectedDate !== '') {
      _date = this.datePipe.transform(this.selectedDate, 'yyyy/MM/dd');
      // this.selectedDate = _date;
    }
    if (_date !== null && _date !== '') {
      this.showSpinner = true;
      this.timesysSvc.GetTimeSheetsPerEmployeePeriodStart(_date).subscribe(
        (data) => {
          this.showTable(data);
        }
      );
    } else {
      this.showTable(null);
    }
  }
  showTable(data: TimeSheet[]) {
    if (data !== undefined && data !== null) {
      this._reports = data;
      this._recData = ((this._reports.length) - 4);
    } else {
      this._reports = [];
      this._recData = 0;
      this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No Matching Data for the Selection Criteria' });
    }
    this.showReport = true;
    this.showSpinner = false;
    this.showBillingCodeList = false;
    this.changeCodeList = true;
  }
  buildCols() {
    this.cols = [
      { field: 'Salaried', header: 'Salaried', align: 'center', width: '80px' },
      { field: 'EmployeeNumber', header: 'Employee Number', align: 'left', width: '155px' },
      { field: 'EmployeeName', header: 'Employee Name', align: 'left', width: 'auto' },
      { field: 'Worked', header: 'Worked', align: 'right', width: '80px' },
      { field: 'HolidayHours', header: 'Holiday Hours', align: 'right', width: '124px' },
      { field: 'PTOHours', header: 'PTO Hours', align: 'right', width: '100px' },
      { field: 'IPayHours', header: 'IPay Hours', align: 'right', width: '105px' },
      { field: 'HoursPaid', header: 'Hours Paid', align: 'right', width: '105px' },
      { field: 'NonBillableHours', header: 'Non-Billable Hours', align: 'right', width: '160px' },
      { field: 'TotalHours', header: 'Total Hours', align: 'right', width: '110px' },
      { field: 'HasOutstandingTimesheets', header: 'Has Outstanding Timesheets', align: 'center', width: '200px' }
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
    this.showSpinner = false;
  }
  viewTimeSheet(rowData: TimeSheet) {
    this.navigateToTimesheet(rowData.TimesheetID, '');
  }
  navigateToTimesheet(TimesheetId, TimesheetDate) {
    // this.timesheetDialog = false;
    let routerLinkTimesheet = '/menu/maintaintimesheet/' + TimesheetId;
    if (TimesheetDate !== '') {
      routerLinkTimesheet += '/' + TimesheetDate;
    }
    this.router.navigate([routerLinkTimesheet], { skipLocationChange: true });
  }
}
