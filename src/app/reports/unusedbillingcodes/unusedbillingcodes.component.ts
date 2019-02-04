import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { NonBillables } from '../../model/objects';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-unusedbillingcodes',
  templateUrl: './unusedbillingcodes.component.html',
  styleUrls: ['./unusedbillingcodes.component.css'],
  providers: [DatePipe]
})
export class UnusedbillingcodesComponent implements OnInit {

  _codeList: NonBillables[] = [];
  _selectedCode: NonBillables[] = [];

  _recData: any;
  cols: any;
  _codeHeader: string;
  codeType: SelectItem[];
  selectedCodeType: number;
  usageTypes: SelectItem[];
  selectedUsageType: number;
  dates: SelectItem[];
  selectedDate: string;
  dateFormat: string;
  periodEnd: any;
  admin = false;
  helpText: any;
  visibleHelp = false;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.codeType = [
      { label: 'Client', value: 0 },
      { label: 'Project', value: 1 },
      { label: 'Non-Billable', value: 2 }
    ];
    this.usageTypes = [
      { label: 'Inactive For All Employees', value: 0 },
      { label: 'Not Used', value: 1 },
      { label: 'Not Used Since', value: 2 }
    ];
    this.selectedCodeType = 0;
    this.selectedUsageType = 1;
  }

  ngOnInit() {
    this.cols = [
      { field: 'Key', header: 'Code', align: 'left', width: 'auto' },
      { field: 'CompanyName', header: 'Name', align: 'left', width: 'auto' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '75px' },
      { field: 'CreatedOn', header: 'Created On', align: 'center', width: '150px' },
    ];
    this.populateDateDrop();
    this.getReports();
  }

  populateDateDrop() {
    this.dates = [];
    this.dateFormat = 'MM-dd-yyyy';  // Get the date format from appsettings
    this.periodEnd = this.getNextPeriodDate();
    for (let i = 0; i <= 24; i++) {
      this.periodEnd = new Date(this.periodEnd.getFullYear(), this.periodEnd.getMonth(), this.periodEnd.getDate() - 7);
      const val = this.datePipe.transform(this.periodEnd, 'MM-dd-yyyy');
      if (i === 0) {
        this.selectedDate = val;
      }
      this.dates.push({ label: val, value: val });
    }
  }

  getNextPeriodDate() {
    let returnValue = null;
    const currentDate = new Date();
    let days = 0;
    const useSemiMonthly = true;  // Get the value 'SemiMonthly' from appsettings
    if (useSemiMonthly) {
      const startDate = new Date('2011-12-16');  // Get the value 'SemiMonthlyStartDate' from appsettings
      if (currentDate > startDate) {
        // tslint:disable-next-line:max-line-length
        returnValue = currentDate.getDate() > 15 ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 0) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
      } else {
        days = this.getDaysTillFriday(currentDate);
        console.log(days);
        // tslint:disable-next-line:max-line-length
        if (new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + parseInt(days.toString(), 10)) > startDate) {
          returnValue = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
        } else {
          returnValue = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + parseInt(days.toString(), 10));
        }
      }
    } else {
      days = this.getDaysTillFriday(currentDate);
      returnValue = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + parseInt(days.toString(), 10));
    }
    return returnValue;
  }

  getDaysTillFriday(currentDate: Date) {
    let daysTillFriday = 0;
    switch (currentDate.getDay()) {
      case 0:
        daysTillFriday = 5;
        break;
      case 1:
        daysTillFriday = 4;
        break;
      case 2:
        daysTillFriday = 3;
        break;
      case 3:
        daysTillFriday = 2;
        break;
      case 4:
        daysTillFriday = 1;
        break;
      case 5:
        daysTillFriday = 0;
        break;
      case 6:
        daysTillFriday = 6;
        break;
      default:
        break;
    }
    return daysTillFriday;
  }

  getReports() {
    this.timesysSvc.getUnusedBillingCodes(this.selectedCodeType.toString(), this.selectedUsageType.toString(), this.selectedDate.toString())
      .subscribe(
        (data) => {
          this._codeList = data;
          this._recData = data.length + ' matching rows';
          this.setHeader();
        }
      );
    // Check for role and activate buttons only if role is admin
    this.admin = true;
  }
  deleteCodes() {
    console.log(this._codeList.length);
    this.confSvc.confirm({
      message: 'Are you sure you want to delete the selected item(s) ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this._selectedCode.length === this._codeList.length) {
          switch (this.selectedCodeType.toString()) {
            case '0':
              break;
            case '1':
              break;
            case '2':
              break;
          }
        } else {
          for (let i = 0; i < this._selectedCode.length; i++) {

          }
        }
      },
      reject: () => {
        this.populateDateDrop();
        this.getReports();
      }
    });
  }
  setHeader() {
    if (this.selectedCodeType === 0) {
      switch (this.selectedUsageType.toString()) {
        case '0':
          this._codeHeader = 'Active Clients Codes that are Inactive for All Employees';
          break;
        case '1':
          this._codeHeader = 'Never Used Clients Codes';
          break;
        case '2':
          this._codeHeader = 'Unused Clients Codes';
          break;
      }
    } else if (this.selectedCodeType === 1) {
      switch (this.selectedUsageType.toString()) {
        case '0':
          this._codeHeader = 'Active Project Codes that are Inactive for All Employees';
          break;
        case '1':
          this._codeHeader = 'Never Used Project Codes';
          break;
          case '2':
            this._codeHeader = 'Unused Project Codes';
            break;
      }
    } else {
      switch (this.selectedUsageType.toString()) {
        case '0':
          this._codeHeader = 'Active Non-Billable Items that are Inactive for All Employees';
          break;
        case '1':
          this._codeHeader = 'Never Used Non-Billable Items';
          break;
          case '2':
            this._codeHeader = 'Unused Non-Billable Codes';
            break;
      }
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
