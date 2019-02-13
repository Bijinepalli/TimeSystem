import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, BillingCodes } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-weeklyhoursbyemployee',
  templateUrl: './weeklyhoursbyemployee.component.html',
  styleUrls: ['./weeklyhoursbyemployee.component.css'],
  providers: [DatePipe]
})
export class WeeklyhoursbyemployeeComponent implements OnInit {
  types: SelectItem[];
  selectedType: number;
  assignStatus: SelectItem[];
  selectedassignStatus: number;
  breakOut: SelectItem[];
  selectedbreakOut: number;
  showSpinner = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _clients: Clients[];
  _selectString = '';
  showBillingCodeList = false;
  allcheckbox = false;
  changeCodeList = false;
  showReport = false;
  _reports: any[] = [];
  _billingCodesSpecial: BillingCodesSpecial;
  _recData = 0;
  cols: any;
  _startDate = '';
  _endDate = '';
  helpText: any;
  visibleHelp = false;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.types = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.selectedType = 0;
    this.assignStatus = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.selectedassignStatus = 0;
    this.breakOut = [
      { label: 'Billing Code', value: 0 },
      { label: 'Employee', value: 1 }
    ];
    this.selectedbreakOut = 0;
    this.cols = [
      { field: 'Name', header: 'Name', align: 'left', width: 'auto' },
      { field: 'LastName', header: 'Last Name', align: 'left', width: '120px' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '120px' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '75px' },
      { field: 'WeekEnding', header: 'Week Ending', align: 'center', width: '100px' },
    ];
  }

  ngOnInit() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
  }
  showBillingCodes() {
    this.showSpinner = true;
    this._displayCheckBoxes = [];

    this.timesysSvc.getClients().subscribe(
      (data) => {
        if (this.selectedType < 2) {
          this._clients = data.filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
        } else {
          this._clients = data;
        }
        for (let i = 0; i < this._clients.length; i++) {
          this._displayCheckBoxes.push({ label: this._clients[i].ClientName, value: this._clients[i].Key });
        }
        this._selectString = 'Clients (' + this._clients.length + ' matching codes found)';
        this.showBillingCodeList = true;
        this.showSpinner = false;
      }
    );
  }
  selectAll() {
    this._selectcheckbox = [];
    for (let i = 0; i < this._displayCheckBoxes.length; i++) {
      this._selectcheckbox.push(this._displayCheckBoxes[i].value);
    }
    if (this.allcheckbox === false) {
      this._selectcheckbox = [];
    }
  }
  selectcheck() {
    if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
      this.allcheckbox = true;
    } else {
      this.allcheckbox = false;
    }
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._selectcheckbox = [];
    this.allcheckbox = false;
    this.selectedassignStatus = 0;
    this.showSpinner = false;
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    this._endDate = '';
  }
  changeCodes() {
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
  }

  generateReport() {
    this.showSpinner = true;
    if (this._selectcheckbox.length > 0) {
      this.buildCols();
      this._billingCodesSpecial = new BillingCodesSpecial();
      this._billingCodesSpecial.value = this._selectcheckbox.join();
      this._billingCodesSpecial.codeStatus = this.selectedType.toString();
      this._billingCodesSpecial.relStatus = this.selectedassignStatus.toString();
      let _breakOut = '';
      if (this.selectedbreakOut === 0) {
        _breakOut = 'Client';
      } else {
        _breakOut = 'Employee';
      }
      this._billingCodesSpecial.sortOrder = _breakOut;
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
      this.timesysSvc.ListWeekEndClientHoursByClientByEmployee(this._billingCodesSpecial).subscribe(
        (data) => {
          this.showTable(data);
        }
      );
    }
    // else {
    //   this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No Matching Data for the Selection Criteria' });
    // }
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
    this.showBillingCodeList = false;
    this.showReport = true;
    this.changeCodeList = true;
    this.showSpinner = false;
  }
  buildCols() {
    if (this.selectedbreakOut.toString() === '0') {
      this.cols = [
        { field: 'Name', header: 'Name', align: 'left', width: 'auto' },
        { field: 'LastName', header: 'Last Name', align: 'left', width: '120px' },
        { field: 'FirstName', header: 'First Name', align: 'left', width: '120px' },
        { field: 'Hours', header: 'Hours', align: 'right', width: '75px' },
        { field: 'WeekEnd', header: 'Week Ending', align: 'center', width: '100px' },
      ];
    } else {
      this.cols = [
        { field: 'LastName', header: 'Last Name', align: 'left', width: '120px' },
        { field: 'FirstName', header: 'First Name', align: 'left', width: '120px' },
        { field: 'Name', header: 'Name', align: 'left', width: 'auto' },
        { field: 'Hours', header: 'Hours', align: 'right', width: '75px' },
        { field: 'WeekEnd', header: 'Week Ending', align: 'center', width: '100px' },
      ];
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
