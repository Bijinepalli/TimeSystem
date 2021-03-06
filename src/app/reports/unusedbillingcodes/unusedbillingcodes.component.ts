import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { CommonService } from '../../service/common.service';
import { SelectItem, SortEvent } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { NonBillables, TimePeriods, PageNames } from '../../model/objects';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
import { ActivitylogService } from 'src/app/service/activitylog.service';

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
  _DateFormat: string;
  _DisplayDateFormat: string;
  periodEnd: any;
  IsAdmin = false;
  showSpinner = false;
  showReport = false;
  ParamSubscribe: any;
  IsSecure = false;
  _sortArray: string[];
  @ViewChild('dt') dt: Table;
  _DisplayDateTimeFormat: any;

  _searchedCodeType = '';
  _searchedUsageType = '';
  _searchedDate = '';

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    public commonSvc: CommonService,
    private route: ActivatedRoute,
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
    this.logSvc.ActionLog(PageNames.UnusedBillingCodes, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this._codeList = [];
    this._selectedCode = [];
    this._recData = '';
    this.cols = {};
    this._codeHeader = '';
    this.codeType = [];
    this.selectedCodeType = 0;
    this.usageTypes = [];
    this.selectedUsageType = 1;
    this.dates = [];
    this.selectedDate = '';
    this._DateFormat = '';
    this._DisplayDateFormat = '';
    this.periodEnd = '';
    this.IsAdmin = false;
    this.showSpinner = false;
    this.showReport = false;
    this.resetSort();
  }

  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this._DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat').toString();
    this.codeType = [
      { label: 'Billing Code', value: 0 },
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
    this.cols = [
      { field: 'Key', header: 'Code', align: 'left', width: '25em' },
      { field: 'ProjectName', header: 'Name', align: 'left', width: '25em' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '15em' },
      { field: 'CreatedOn', header: 'Created On', align: 'center', width: '15em' },
    ];
    this._sortArray = ['Key', 'ProjectName', 'Inactive', 'CreatedOnSearch'];
    this.showSpinner = false;
    this.populateDateDrop();
  }
  populateDateDrop() {
    this.showSpinner = true;
    this.dates = [];
    this.selectedDate = '';
    this.timesysSvc.getPeriodEndDate()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            const dbData = data;
            const periodEnd = new Date(dbData[0].FuturePeriodEnd.toString());
            for (let i = 0; i <= 24; i++) {
              const dropdownValue = periodEnd.setDate(periodEnd.getDate() - 7);
              if (i === 0) {
                this.selectedDate = this.datePipe.transform(dropdownValue, this._DisplayDateFormat);
              }
              this.dates.push({
                label: this.datePipe.transform(dropdownValue, this._DisplayDateFormat),
                value: this.datePipe.transform(dropdownValue, this._DisplayDateFormat)
              });
            }
            this._searchedDate = this.selectedDate;
            this.getReports();
          }
          this.showSpinner = false;
        });
  }
  generateReports() {
    this._searchedCodeType = '';
    this._searchedUsageType = '';
    this.getReports();
  }
  getReports() {
    this.showSpinner = true;
    this.setHeader();
    this.showReport = false;
    if (this._searchedCodeType === '') {
      this._searchedCodeType = this.selectedCodeType.toString();
    } else {
      this.selectedCodeType = +this._searchedCodeType;
    }
    if (this._searchedUsageType === '') {
      this._searchedUsageType = this.selectedUsageType.toString();
    } else {
      this.selectedUsageType = +this._searchedUsageType;
    }
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      searchedCodeType: this._searchedCodeType.toString(),
      searchedUsageType: this._searchedUsageType.toString(),
      selectedDate: this.selectedDate.toString()
    };
    this.logSvc.ActionLog(PageNames.UnusedBillingCodes,
      '', 'Reports/Event', 'getReports', 'Get Reports', '', '', JSON.stringify(ActivityParams)); // ActivityLog

    this.timesysSvc.getUnusedBillingCodes(this._searchedCodeType, this._searchedUsageType, this.selectedDate.toString())
      .subscribe(
        (data) => {
          this.showReport = false;
          this._codeList = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._codeList = data;
            this.showReport = true;
          }
          this._recData = this._codeList.length;
          this.showSpinner = false;
        }
      );
    // Check for role and activate buttons only if role is admin
    this.IsAdmin = true;
    this.resetSort();
  }
  deleteCodes() {
    let _keys = '';
    this.showSpinner = true;
    const deleteCodesList = new NonBillables();
    switch (this._searchedCodeType.toString()) {
      case '0':
        deleteCodesList.ChargeType = 'Billing Codes';
        break;
      case '1':
        deleteCodesList.ChargeType = 'Projects';
        break;
      case '2':
        deleteCodesList.ChargeType = 'NonBill';
        break;
    }
    this.confSvc.confirm({
      message: 'Are you sure you want to delete the selected ' + deleteCodesList.ChargeType + ' Code(s) ?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this._selectedCode.length === this._codeList.length) {
          _keys = null;
        } else {
          for (let i = 0; i < this._selectedCode.length; i++) {
            _keys += ',' + this._selectedCode[i].Key;
          }
        }
        deleteCodesList.Key = _keys;
        this.logSvc.ActionLog(PageNames.UnusedBillingCodes,
          '', 'Reports/Event', 'deleteCodes', 'Delete Codes', '', '', JSON.stringify(deleteCodesList)); // ActivityLog

        this.timesysSvc.deleteUnusedBillingCodes(deleteCodesList)
          .subscribe(
            (data) => {
              if (data !== null && data.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: data.ErrorMessage
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: deleteCodesList.ChargeType + ' Code(s) deleted successfully'
                });
                this.getReports();
              }
            });
      },
      reject: () => {
        this.populateDateDrop();
      }
    });
    this.showSpinner = false;
    this.resetSort();
  }
  setHeader() {
    this.showSpinner = true;
    if (this.selectedCodeType === 0) {
      switch (this.selectedUsageType.toString()) {
        case '0':
          this._codeHeader = 'Active Billing Codes that are Inactive for All Employees';
          break;
        case '1':
          this._codeHeader = 'Never Used Billing Codes';
          break;
        case '2':
          this._codeHeader = 'Unused Billing Codes';
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
    this.showSpinner = false;
  }

  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['CreatedOn'], []);
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
}
