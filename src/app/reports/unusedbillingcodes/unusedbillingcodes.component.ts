import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { CommonService } from '../../service/common.service';
import { SelectItem } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { NonBillables, TimePeriods } from '../../model/objects';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';

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
  helpText: any;
  visibleHelp = false;
  showSpinner = false;
  showReport = false;
  ParamSubscribe: any;
  IsSecure: boolean;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    private commonSvc: CommonService,
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
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });
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
    this.helpText = '';
    this.visibleHelp = false;
    this.showSpinner = false;
    this.showReport = false;
  }

  Initialisations() {
    this.showSpinner = true;
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
    this.cols = [
      { field: 'Key', header: 'Code', align: 'left', width: 'auto' },
      { field: 'ProjectName', header: 'Name', align: 'left', width: 'auto' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '108px' },
      { field: 'CreatedOn', header: 'Created On', align: 'center', width: '150px' },
    ];
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.populateDateDrop();
  }
  populateDateDrop() {
    this.dates = [];
    this.selectedDate = '';
    this._DateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();  // Get the date format from appsettings
    this.timesysSvc.getPeriodEndDate()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            const dbData = data;
            const periodEnd = new Date(dbData[0].FuturePeriodEnd.toString());
            for (let i = 0; i <= 24; i++) {
              const dropdownValue = periodEnd.setDate(periodEnd.getDate() - 7);
              if (i === 0) {
                this.selectedDate = this.datePipe.transform(dropdownValue, 'MM-dd-yyyy');
              }
              // tslint:disable-next-line:max-line-length
              this.dates.push({ label: this.datePipe.transform(dropdownValue, 'MM-dd-yyyy'), value: this.datePipe.transform(dropdownValue, 'MM-dd-yyyy') });
            }
            this.getReports();
          }
        });
  }

  getReports() {
    this.showSpinner = true;
    this.setHeader();
    this.showReport = false;
    this.timesysSvc.getUnusedBillingCodes(this.selectedCodeType.toString(), this.selectedUsageType.toString(), this.selectedDate.toString())
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
  }
  deleteCodes() {
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
