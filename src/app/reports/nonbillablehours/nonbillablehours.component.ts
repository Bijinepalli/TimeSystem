import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { NonBillables, BillingCodesSpecial, NonBillablesTotalHours, PageNames } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { DateFormats } from 'src/app/model/constants';
import { CommonService } from '../../service/common.service';
import { environment } from 'src/environments/environment';
import { ActivitylogService } from 'src/app/service/activitylog.service';

@Component({
  selector: 'app-nonbillablehours',
  templateUrl: './nonbillablehours.component.html',
  styleUrls: ['./nonbillablehours.component.css'],
  providers: [DatePipe]
})
export class NonbillablehoursComponent implements OnInit {

  reportType: SelectItem[];
  _reports: NonBillablesTotalHours[] = [];
  cols: any;
  selectedReportType: number;
  _headerType: string;
  startDate: string;
  endDate: string;
  _storeStartDate = '';
  _storeEndDate = '';
  totalChecked = false;
  showReport = false;
  _recData = 0;
  rowdata: any;
  selectedCode: any;
  showSpinner = false;
  dateFormat = this.commonSvc.getAppSettingsValue('DateFormat');
  errMsg: string;
  ParamSubscribe: any;
  IsSecure = false;

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    public commonSvc: CommonService
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
    this.logSvc.ActionLog(PageNames.NonBillableHoursAcrossMonths, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this.reportType = [];
    this._reports = [];
    this.cols = {};
    this.selectedReportType = 1;
    this._headerType = '';
    this.startDate = '';
    this.endDate = '';
    this.totalChecked = false;
    this.showReport = false;
    this._recData = 0;
    this.rowdata = {};
    this.errMsg = '';
  }

  Initialisations() {
    this.showSpinner = true;
    this.reportType = [
      { label: 'VTX Suite', value: 1 },
      { label: 'Internal Functions', value: 2 },
      { label: 'Employee Time Off', value: 3 },
      { label: 'Custom', value: 4 },
    ];
    this.cols = [
      { field: 'ReportGroup', header: 'Report Group', align: 'left', width: '200px' },
      { field: 'EmployeeName', header: 'Employee Name', align: 'left', width: '200px' },
      { field: 'Jan', header: 'JAN', align: 'right', width: '75px' },
      { field: 'Feb', header: 'FEB', align: 'right', width: '75px' },
      { field: 'Mar', header: 'MAR', align: 'right', width: '75px' },
      { field: 'Apr', header: 'APR', align: 'right', width: '75px' },
      { field: 'May', header: 'MAY', align: 'right', width: '75px' },
      { field: 'Jun', header: 'JUN', align: 'right', width: '75px' },
      { field: 'Jul', header: 'JUL', align: 'right', width: '75px' },
      { field: 'Aug', header: 'AUG', align: 'right', width: '75px' },
      { field: 'Sep', header: 'SEP', align: 'right', width: '75px' },
      { field: 'Oct', header: 'OCT', align: 'right', width: '75px' },
      { field: 'Nov', header: 'NOV', align: 'right', width: '75px' },
      { field: 'Dec', header: 'DEC', align: 'right', width: '75px' },
      { field: 'Total', header: 'TOTAL', align: 'right', width: '75px' },
    ];
    this.selectedReportType = 1;
    const dateNow = new Date();
    const end = new Date(dateNow.getFullYear(), 12, 0);
    const start = new Date(dateNow.getFullYear(), (dateNow.getMonth() - 1), 1);
    this.startDate = this.datePipe.transform(start, 'MM-dd-yyyy');
    this.endDate = this.datePipe.transform(end, 'MM-dd-yyyy');
    this.totalChecked = true;
    this.showReport = false;
    this._recData = 0;
    this.showSpinner = false;
  }

  changeReportgroup() {
    const id = this.selectedReportType;
    this.navigateTo('/menu/nonbillableaddgroup/' + id);
  }

  navigateTo(url: any) {
    this.router.navigate([url], { skipLocationChange: true });
  }

  generateReport() {
    this.errMsg = '';
    this.showSpinner = true;
    this.setHeader();
    this.rowdata = {};
    const _dateS = Date.parse(this.startDate);
    if (Number.isNaN(_dateS)) {
      const today = new Date();
      const month = today.getMonth();
      const year = today.getFullYear();
      this._storeStartDate = new Date(year, month - 1, 1).toString();
    } else {
      this._storeStartDate = this.startDate;
    }
    const _dateE = Date.parse(this.endDate);
    if (Number.isNaN(_dateE)) {
      const today = new Date();
      const month = today.getMonth();
      const year = today.getFullYear();
      this._storeEndDate = new Date(year, month - 1, 1).toString();
    } else {
      this._storeEndDate = this.endDate;
    }
    const start = this.datePipe.transform(this._storeStartDate, this.dateFormat);
    const end = this.datePipe.transform(this._storeEndDate, this.dateFormat);
    if (new Date(this._storeStartDate).getFullYear().toString() !== new Date(this._storeEndDate).getFullYear().toString()) {
      this.errMsg += 'Date cannot span over years';
      this.showSpinner = false;
    } else {
      let ActivityParams: any; // ActivityLog
      ActivityParams = {
        startDate: start.toString(),
        endDate: end.toString(),
        selectedReportType: this.selectedReportType.toString(),
        totalChecked: this.totalChecked.toString()
      };
      this.logSvc.ActionLog(PageNames.NonBillableHoursAcrossMonths,
        '', 'Reports/Event', 'generateReport', 'Generate Report', '', '', JSON.stringify(ActivityParams)); // ActivityLog

      this.timesysSvc.getNonBillableHours(start, end, this.selectedReportType.toString(), this.totalChecked.toString()).subscribe(
        (data) => {
          this.showReport = false;
          this._reports = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._reports = data;
            this._recData = +this._reports[1].RowCount;
          }
          this.showReport = true;
          this.showSpinner = false;
        }
      );
    }
  }

  setHeader() {
    this._headerType = '';
    switch (this.selectedReportType) {
      case 1:
        this._headerType = 'VTX Suite';
        break;
      case 2:
        this._headerType = 'Interal Functions';
        break;
      case 3:
        this._headerType = 'Employee Time Off';
        break;
      case 4:
        this._headerType = 'Custom';
        break;
    }
  }
}
