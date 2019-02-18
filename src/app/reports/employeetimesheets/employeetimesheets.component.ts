import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { TimeSheetForEmplyoee, TimeSheetBinding, TimeSheet, TimeSheetForApproval, Employee } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employeetimesheets',
  templateUrl: './employeetimesheets.component.html',
  styleUrls: ['./employeetimesheets.component.css'],
  providers: [DatePipe]
})
export class EmployeetimesheetsComponent implements OnInit {
  types: SelectItem[];
  hoursType: SelectItem[];
  selectedType: string;
  selectedhoursType: string;
  showSpinner = false;
  codes: SelectItem[];
  _employee: Employee[];
  _codeCount: string;
  showBillingCodeList = false;
  changeCodeList = false;
  showReport = false;
  cols: any[];
  _recData: string;
  _timeSheets: TimeSheetForEmplyoee[];
  _timePeriods: TimeSheetBinding[];
  selectedValues: Boolean;
  selectedCode: string;
  visibleHelp: boolean;
  helpText: string;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.hoursType = [
      { label: 'Salary', value: '1' },
      { label: 'Hourly', value: '0' },
      { label: 'Both', value: '' }
    ];
    this.selectedhoursType = '';
    this.types = [
      { label: 'Active', value: '0' },
      { label: 'Inactive', value: '1' },
      { label: 'Both', value: '' }
    ];
    this.selectedType = '0';
  }

  ngOnInit() {
    this.cols = [
      { field: 'PeriodEnd', header: 'PeriodEnd', align: 'center', width: 'auto' },
      { field: 'Submitted', header: 'Submitted', align: 'center', width: 'auto' },
      { field: 'SubmitDate', header: 'Date Submitted', align: 'center', width: 'auto' },
      { field: 'Resubmitted', header: 'Resubmitted', align: 'center', width: 'auto' },
      { field: 'SemiMonthly', header: 'Semi-Monthly', align: 'center', width: 'auto' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '75px' },
    ];
  }
  getEmployees() {
    this.showSpinner = true;
    this.codes = [];
    this.selectedCode = '';
    this.timesysSvc.getAllEmployee(this.selectedType.toString(), this.selectedhoursType.toString()).subscribe(
      (data) => {
        // if (this.selectedType === '0' || this.selectedType === '1') {
        //   this._employee = data.filter(P => P.Inactive === (this.selectedType === '0' ? false : true));
        // } else {
        this._employee = data;
        // }
        for (let i = 0; i < this._employee.length; i++) {
          this.codes.push({
            label: this._employee[i].LastName + ', ' + this._employee[i].FirstName,
            value: this._employee[i].ID
          });
        }
        this._codeCount = 'Select from ' + this._employee.length + ' matching Employees';
        this.showBillingCodeList = true;
        this.showSpinner = false;
      }
    );
  }
  generateReport() {
    const Mode = '0';
    this.timesysSvc.getEmployeeTimeSheetList(this.selectedCode.toString(), Mode)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._timeSheets = data;
            let count = 0;
            for (let i = 0; i < this._timeSheets.length; i++) {
              if (this._timeSheets[i]['Submitted'].toUpperCase() === 'NO') {
                count++;
              }
            }
            this._recData = this._timeSheets.length + ' timesheets found ( ' + count + ' pending )';
          } else {
            this._timeSheets = [];
            this._recData = 'No records found';
          }
          this.showReport = true;
          this.showSpinner = false;
          this.changeCodeList = true;
          this.showBillingCodeList = false;
        }
      );
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this.showSpinner = false;
  }
  viewTimeSheet(rowData: TimeSheetForEmplyoee) {
    this.navigateToTimesheet(rowData.Id, '');
  }
  navigateToTimesheet(TimesheetId, TimesheetDate) {
    // this.timesheetDialog = false;
    let routerLinkTimesheet = '/menu/maintaintimesheet/' + TimesheetId;
    if (TimesheetDate !== '') {
      routerLinkTimesheet += '/' + TimesheetDate;
    }
    this.router.navigate([routerLinkTimesheet], { skipLocationChange: true });
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
