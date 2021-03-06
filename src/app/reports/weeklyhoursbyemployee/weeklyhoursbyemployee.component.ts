import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, BillingCodes, PageNames } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
import { ActivitylogService } from 'src/app/service/activitylog.service';
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
  _startDate: Date;
  _endDate: Date;
  _startDateSelect = '';
  _endDateSelect = '';

  errMsg: string;
  ParamSubscribe: any;
  IsSecure = false;
  _DisplayDateFormat: any;
  _sortArray: string[];
  @ViewChild('dt') dt: Table;

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    public commonSvc: CommonService,
  ) {
    this.CheckActiveSession();
    this.commonSvc.setAppSettings();
  }
  CheckActiveSession() {
    let sessionActive = false;
    if (sessionStorage !== undefined && sessionStorage !== null && sessionStorage.length > 0) {
      if (sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== undefined &&
        sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId') !== null) {
        sessionActive = true;
      }
    }

    if (!sessionActive) {
      this.router.navigate(['/access'], { queryParams: { Message: 'Session Expired' } }); // Session Expired
    }
  }
  /* #endregion*/

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.WeeklyHoursbyEmployee, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
    this.IsSecure = false;
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
    this.showSpinner = false;
  }

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }

  ClearAllProperties() {
    this.types = [];
    this.selectedType = 0;
    this.assignStatus = [];
    this.selectedassignStatus = 0;
    this.breakOut = [];
    this.selectedbreakOut = 0;
    this._selectcheckbox = [];
    this._displayCheckBoxes = [];
    this._clients = [];
    this._selectString = '';
    this.showBillingCodeList = false;
    this.allcheckbox = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._reports = [];
    this._billingCodesSpecial = new BillingCodesSpecial;
    this._recData = 0;
    this.cols = {};
    this._startDate = null;
    this._endDate = null;
    this._startDateSelect = '';
    this._endDateSelect = '';
    this.errMsg = '';
    this.showSpinner = false;
    this.resetSort();
  }

  Initialisations() {
    this.showSpinner = true;
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
      { field: 'Name', header: 'Name', align: 'left', width: '25em' },
      { field: 'LastName', header: 'Last Name', align: 'left', width: '15em'  },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '15em'  },
      { field: 'Hours', header: 'Hours', align: 'right', width: '15em' },
      { field: 'WeekEnd', header: 'Week Ending', align: 'center', width: '15em'  },
    ];
    this._sortArray = ['Name', 'LastName', 'FirstName', 'Hours', 'WeekEndSearch'];
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1);
    this.showSpinner = false;
    this._startDateSelect = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
  }
  showBillingCodes() {
    this.showSpinner = true;
    this._displayCheckBoxes = [];
    this.logSvc.ActionLog(PageNames.WeeklyHoursbyEmployee,
      '', 'Reports/Event', 'showBillingCodes', 'Show Billing Codes', '', '', ''); // ActivityLog


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
        this._selectString = 'Billing Codes (' + this._clients.length + ' matching codes found)';
        this.showBillingCodeList = true;
        this.showSpinner = false;
      }
    );
  }
  selectAll() {
    this.showSpinner = true;
    this._selectcheckbox = [];
    for (let i = 0; i < this._displayCheckBoxes.length; i++) {
      this._selectcheckbox.push(this._displayCheckBoxes[i].value);
    }
    if (this.allcheckbox === false) {
      this._selectcheckbox = [];
    }
    this.showSpinner = false;
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
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1);
    this._startDateSelect = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    this._endDateSelect = '';
    this._endDate = null;
    this.showSpinner = false;
    this.resetSort();
  }
  changeCodes() {
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
    this.resetSort();
  }

  generateReport() {
    this.showSpinner = true;
    this.errMsg = '';
    this._startDateSelect = '';
    this._endDateSelect = '';

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

      if (this._startDate !== undefined && this._startDate !== null && this._startDate.toString() !== '') {
        _start = this.datePipe.transform(this._startDate, 'yyyy-MM-dd');
        this._startDateSelect = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
      }
      if (this._startDate !== undefined && this._endDate !== null && this._endDate.toString() !== '') {
        _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
        this._endDateSelect = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
      }
      this._billingCodesSpecial.startDate = _start;
      this._billingCodesSpecial.endDate = _end;
      this.logSvc.ActionLog(PageNames.WeeklyHoursbyEmployee,
        '', 'Reports/Event', 'generateReport', 'Generate Report', '', '', JSON.stringify(this._billingCodesSpecial)); // ActivityLog

      this.timesysSvc.ListWeekEndClientHoursByClientByEmployee(this._billingCodesSpecial).subscribe(
        (data) => {
          this.showTable(data);
        }
      );
    }
    // else {
    //   this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No matching data for the selected criteria' });
    // }
  }
  showTable(data: BillingCodes[]) {
    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    if (data !== undefined && data !== null && data.length > 0) {
      this._reports = data;
      this._recData = this._reports.length;
      this.showReport = true;
    }
    this.showBillingCodeList = false;
    this.changeCodeList = true;
    this.showSpinner = false;
    this.resetSort();
  }
  buildCols() {
    if (this.selectedbreakOut.toString() === '0') {
      this.cols = [
        { field: 'Name', header: 'Name', align: 'left', width: '25em' },
        { field: 'LastName', header: 'Last Name', align: 'left', width: '12em' },
        { field: 'FirstName', header: 'First Name', align: 'left', width: '12em' },
        { field: 'Hours', header: 'Hours', align: 'right', width: '10em' },
        { field: 'WeekEnd', header: 'Week Ending', align: 'center', width: '10em' },
      ];
    } else {
      this.cols = [
        { field: 'LastName', header: 'Last Name', align: 'left', width: '12em' },
        { field: 'FirstName', header: 'First Name', align: 'left', width: '12em' },
        { field: 'Name', header: 'Name', align: 'left', width: '25em' },
        { field: 'Hours', header: 'Hours', align: 'right', width: '10em' },
        { field: 'WeekEnd', header: 'Week Ending', align: 'center', width: '10em' },
      ];
    }
    this._sortArray = ['Name', 'LastName', 'FirstName', 'Hours', 'WeekEndSearch'];
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
}
