import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { TimesystemService } from '../../service/timesystem.service';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Employee, NonBillables, Projects, Clients } from '../../model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-listemployeesreports',
  templateUrl: './listemployeesreports.component.html',
  styleUrls: ['./listemployeesreports.component.css'],
  providers: [DatePipe]
})
export class ListemployeesreportsComponent implements OnInit {
  _status: SelectItem[];
  _paid: SelectItem[];
  _Ipay: SelectItem[];
  _timesheets: SelectItem[];
  _holidays: SelectItem[];
  _statusselected: string;
  _paidselected: string;
  _Ipayselected: string;
  _timesheetsselected: string;
  _holidaysselected: string;
  _headerLabels: any[];
  _defaultselected: any[];
  selectedColumns: any[];
  _listEmployeesForReport: Employee[];
  cols: any;
  _recData: any;
  _endDate: string;
  _startDate: string;
  visibleHelp = false;
  helpText: any;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService, private fb: FormBuilder,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this._startDate = '';
    this._endDate = '';
    this._status = [
      { label: 'Active', value: '1' },
      { label: 'InActive', value: '0' },
      { label: 'Both', value: '' }
    ];
    this._statusselected = '1';
    this._paid = [
      { label: 'Salary', value: '1' },
      { label: 'Hourly', value: '0' },
      { label: 'Both', value: '' }
    ];
    this._paidselected = '';
    this._Ipay = [
      { label: 'Eligible', value: '1' },
      { label: 'Ineligible', value: '0' },
      { label: 'Both', value: '' }
    ];
    this._Ipayselected = '';
    this._timesheets = [
      { label: 'Submits', value: '1' },
      { label: 'Exempt', value: '0' },
      { label: 'Both', value: '' }
    ];
    this._timesheetsselected = '';
    this._holidays = [
      { label: 'Vertex', value: '1' },
      { label: 'Client', value: '0' },
      { label: 'Both', value: '' }
    ];
    this._holidaysselected = '';

    this._headerLabels = [
      { field: 'LastName', header: 'Last Name' },
      { field: 'FirstName', header: 'First Name' },
      { field: 'NickName', header: 'Nick Name' },
      { field: 'PayRoleID', header: 'Payroll ID' },
      { field: 'EmailAddress', header: 'Email Address' },
      { field: 'LoginID', header: 'Login ID' },
      { field: 'HireDate', header: 'Hire Date' },
      { field: 'UserLevel', header: 'Security' },
      { field: 'Inactive', header: 'Inactive' },
      { field: 'Salaried', header: 'Salaried' },
      { field: 'IPayEligible', header: 'IPay' },
      { field: 'SubmitsTime', header: 'Submits Time' },
      { field: 'CompanyHolidays', header: 'Vertex Holidays' }
    ];
    this._defaultselected = [
      { field: 'LastName', header: 'Last Name' },
      { field: 'FirstName', header: 'First Name' },
      { field: 'PayRoleID', header: 'Payroll ID' },
      { field: 'LoginID', header: 'Login ID' },
      { field: 'HireDate', header: 'Hire Date' },
      { field: 'Inactive', header: 'Inactive' },
      { field: 'Salaried', header: 'Salaried' },
    ];
    this.selectedColumns = this._defaultselected;
    this.getEmployeesForReport();
  }
  getEmployeesForReport() {
    let _start = '';
    let _end = '';
    if (this._startDate !== '' && this._startDate !== null) {
      _start = this.datePipe.transform(this._startDate, 'yyyy-MM-dd');
    }
    if (this._endDate !== '' && this._endDate !== null) {
      _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
    }
    console.log(this._startDate, this._endDate);
    console.log(_start, _end);
    this.timesysSvc.getEmployeesForReport(this._statusselected, this._Ipayselected, this._paidselected,
      this._timesheetsselected, this._holidaysselected, _start, _end)
      .subscribe(
        (data) => {
          this._listEmployeesForReport = data;
          this._recData = data.length + ' matching employees';
        }
      );
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
