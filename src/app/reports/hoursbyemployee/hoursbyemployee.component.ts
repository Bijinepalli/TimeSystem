import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, BillingCodes } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { BillingCode } from 'src/app/model/constants';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-hoursbyemployee',
  templateUrl: './hoursbyemployee.component.html',
  styleUrls: ['./hoursbyemployee.component.css'],
  providers: [DatePipe]
})
export class HoursbyemployeeComponent implements OnInit {
  types: SelectItem[];
  assignStatus: SelectItem[];
  selectedassignStatus: number;
  billingType: SelectItem[];
  selectedType: number;
  selectedBillingType: number;
  showBillingCodeList = false;
  showSpinner = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _clients: Clients[];
  _projects: Projects[];
  _nonBillables: NonBillables[];
  _selectString = '';
  _recData = 0;
  cols: any;
  breakOut: SelectItem[];
  selectedbreakOut: number;
  allcheckbox = false;
  changeCodeList = false;
  showReport = false;
  _startDate = '';
  _startDateSelect = '';
  _endDate = '';
  _billingCodesSpecial: BillingCodesSpecial;
  _reports: any[] = [];
  showPeriodEndDetail = false;
  showTotals = false;
  helpText: any;
  visibleHelp = false;
  ParamSubscribe: any;
  _DateFormat: any;
  _DisplayDateFormat: any;
  IsSecure = false;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private commonSvc: CommonService,
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
    this.IsSecure = false;
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
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
        this.showSpinner = false;
      });
  }

  ClearAllProperties() {
    this._nonBillables = [];
    this._projects = [];
    this._clients = [];
    this._billingCodesSpecial = new BillingCodesSpecial();
    this.types = [];
    this.assignStatus = [];
    this.billingType = [];
    this.breakOut = [];
    this.selectedbreakOut = 0;
    this.selectedassignStatus = 0;
    this.selectedType = 0;
    this.selectedBillingType = 0;
    this.showBillingCodeList = false;

    this._selectcheckbox = [];
    this._displayCheckBoxes = [];

    this._clients = [];
    this._selectString = '';
    this.showBillingCodeList = false;
    this.allcheckbox = false;
    this.changeCodeList = false;

    this._reports = [];
    this.cols = {};
    this._startDate = '';
    this._startDateSelect = '';
    this._endDate = '';
    this.showPeriodEndDetail = false;
    this.showTotals = false;
    this._recData = 0;
    this.showReport = false;
    this.visibleHelp = false;
    this.helpText = '';
  }

  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.billingType = [
      { label: 'Client', value: 0 },
      { label: 'Project', value: 1 },
      { label: 'Non-Billable', value: 2 }
    ];
    this.selectedBillingType = 0;
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
      { field: 'LastName', header: 'Last Name', align: 'left', width: '175px' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '175px' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '100px' },
      { field: 'PeriodEnd', header: 'Period Ending', align: 'center', width: '220px' },
    ];
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDateSelect = this.datePipe.transform(this._startDate, this._DisplayDateFormat);
    this.showSpinner = false;
  }
  showBillingCodes() {
    this.showSpinner = true;
    this._displayCheckBoxes = [];
    if (this.selectedBillingType === 0) {
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
          this.showPeriodEndDetail = true;
          this.showTotals = true;
          this.showSpinner = false;
        }
      );
    } else if (this.selectedBillingType === 1) {
      this.timesysSvc.getProjects('').subscribe(
        (data) => {
          if (this.selectedType < 2) {
            this._projects = data[0].filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
          } else {
            this._projects = data[0];
          }
          for (let i = 0; i < this._projects.length; i++) {
            this._displayCheckBoxes.push({ label: this._projects[i].ProjectName, value: this._projects[i].Key });
          }
          this._selectString = 'Projects (' + this._projects.length + ' matching codes found)';
          this.showBillingCodeList = true;
          this.showSpinner = false;
        }
      );
    } else {
      this.timesysSvc.getNonBillables('').subscribe(
        (data) => {
          if (this.selectedType < 2) {
            this._nonBillables = data[0].filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
          } else {
            this._nonBillables = data[0];
          }
          for (let i = 0; i < this._nonBillables.length; i++) {
            this._displayCheckBoxes.push({ label: this._nonBillables[i].ProjectName, value: this._nonBillables[i].Key });
          }
          this._selectString = 'Non Billables (' + this._nonBillables.length + ') matching codes found';
          this.showBillingCodeList = true;
          this.showSpinner = false;
        }
      );
    }
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

  // generateReportClick() {
  //   this.generateReport();
  // }
  generateReport() {
    this.showSpinner = true;
    let dateValid: any;
    const dateCheck = new Date(this._startDateSelect);
    if (dateCheck.toString() === 'Invalid Date') {
      dateValid = this._startDate;
    } else {
      dateValid = dateCheck;
    }
    if (this._selectcheckbox.length > 0) {
      this.buildCols();
      this._billingCodesSpecial = new BillingCodesSpecial();
      this._billingCodesSpecial.value = this._selectcheckbox.join();
      this._billingCodesSpecial.codeStatus = this.selectedType.toString();
      this._billingCodesSpecial.relStatus = this.selectedassignStatus.toString();
      this._billingCodesSpecial.periodEnd = this.showPeriodEndDetail;
      let _start = '';
      let _end = '';

      if (this._startDate !== null && this._startDate !== '') {
        _start = this.datePipe.transform(dateValid, this._DateFormat);
        this._startDate = this.datePipe.transform(dateValid, this._DisplayDateFormat);
      }
      if (this._endDate !== null && this._endDate !== '') {
        _end = this.datePipe.transform(this._endDate, this._DateFormat);
        this._endDate = this.datePipe.transform(this._endDate, this._DisplayDateFormat);
      }
      this._billingCodesSpecial.startDate = _start;
      this._billingCodesSpecial.endDate = _end;
      this._billingCodesSpecial.includeTotals = this.showTotals === true ? 1 : 0;
      this._billingCodesSpecial.includePeriodEnd = this.showPeriodEndDetail === true ? 1 : 0;
      if (this.selectedbreakOut.toString() === '0') {
        switch (this.selectedBillingType) {
          case 0:
            this.timesysSvc.ListClientHoursByEmployee(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
          case 1:
            this.timesysSvc.ListProjectHoursByEmployee(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
          case 2:
            this.timesysSvc.ListNonBillableHoursByEmployee(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
        }
      } else if (this.selectedbreakOut.toString() === '1') {
        switch (this.selectedBillingType) {
          case 0:
            this.timesysSvc.ListEmployeeHoursByClient(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
          case 1:
            this.timesysSvc.ListEmployeeHoursByProject(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
          case 2:
            this.timesysSvc.ListEmployeeHoursByNonBillable(this._billingCodesSpecial).subscribe(
              (data) => {
                this.showTable(data);
              }
            );
            break;
        }
      }
    }
    // else {
    //   this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No matching data for the selected criteria' });
    // }
  }

  showTable(data: BillingCodes[]) {
    this._reports = [];
    this._recData = 0;
    this.showReport = false;
    if (data !== undefined && data !== null && data.length > 0) {
      this._reports = data;
      this._recData = this._reports[0].RowCount;
      this.showReport = true;
    }
    this.showBillingCodeList = false;
    this.changeCodeList = true;
    this.showSpinner = false;
  }
  buildCols() {
    if (this.selectedbreakOut.toString() === '0') {
      this.cols = [
        { field: 'Name', header: 'Name', align: 'left', width: 'auto' },
        { field: 'LastName', header: 'Last Name', align: 'left', width: '150px' },
        { field: 'FirstName', header: 'First Name', align: 'left', width: '150px' },
        { field: 'Hours', header: 'Hours', align: 'right', width: '100px' },
      ];
    } else {
      this.cols = [
        { field: 'LastName', header: 'Last Name', align: 'left', width: '150px' },
        { field: 'FirstName', header: 'First Name', align: 'left', width: '150px' },
        { field: 'Name', header: 'Name', align: 'left', width: 'auto' },
        { field: 'Hours', header: 'Hours', align: 'right', width: '100px' },
      ];
    }
    if (this.showPeriodEndDetail) {
      this.cols.push({ field: 'PeriodEnd', header: 'Period Ending', align: 'center', width: '150px' });
    }
  }

  startOver() {
    this.showSpinner = true;
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._selectcheckbox = [];
    this.allcheckbox = false;
    this.selectedassignStatus = 0;
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, this._DisplayDateFormat);
    this._endDate = '';
    this.showSpinner = false;
  }
  changeCodes() {
    this.showSpinner = true;
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
    this.showSpinner = false;
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

  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['PeriodEnd'], ['Hours']);
  }

}
