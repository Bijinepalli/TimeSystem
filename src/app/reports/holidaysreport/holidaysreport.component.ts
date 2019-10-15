import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { SelectItem, SortEvent } from 'primeng/api';
import { Holidays, PageNames } from '../../model/objects';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
import { ActivitylogService } from 'src/app/service/activitylog.service';

@Component({
  selector: 'app-holidaysreport',
  templateUrl: './holidaysreport.component.html',
  styleUrls: ['./holidaysreport.component.css']
})
export class HolidaysreportComponent implements OnInit {

  _years; any;
  selectedYear: any;
  _holidayList: Holidays[] = [];
  _selectedHolidays: Holidays;
  _recData: any;
  cols: any;
  showReport = false;
  showSpinner = false;
  ParamSubscribe: any;
  _DateFormat: any;
  _DisplayDateFormat: any;
  IsSecure = false;
  _sortArray: string[];
  @ViewChild('dt') dt: Table;

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
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
    this.logSvc.ActionLog(PageNames.BillingCode_Holidays, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this._years = [];
    this.selectedYear = '';
    this._holidayList = [];
    // this._selectedHolidays = new Holidays();
    this._recData = '';
    this.cols = {};
    this.showReport = false;
    this.showSpinner = false;
    this.resetSort();
  }

  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.cols = [
      { field: 'CalendarYear', header: 'Year', align: 'center', width: '4em' },
      { field: 'CompanyName', header: 'Company Name', align: 'left', width: '20em' },
      { field: 'HolidayName', header: 'Holiday Name', align: 'left', width: '20em' },
      { field: 'HolidayDate', header: 'Holiday Date', align: 'center', width: '6em' },
      { field: 'HolidayDateSearch', header: 'Holiday Date Search', align: 'center', width: '6em' },
    ];
    this._sortArray = ['CalendarYear', 'CompanyName', 'HolidayName', 'HolidayDateSearch'];
    this.showSpinner = false;
    this.getHolidayYears();
  }
  getHolidayYears() {
    this.showSpinner = true;
    this._years = [];
    this._years.push({ label: 'All Years', value: '0' });
    this.timesysSvc.getHolidayYears()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              this._years.push({ label: data[i].CalendarYear.toString(), value: data[i].CalendarYear.toString() });
            }
            const _date: Date = new Date();
            this.selectedYear = _date.getFullYear();
            this.generateReport();
          } else {
            this.showSpinner = false;
          }
        });
  }

  generateReport() {
    this.showSpinner = true;
    let year = '';
    if (this.selectedYear.toString() !== '0') {
      year = this.selectedYear.toString();
    }
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      selectedYear: this.selectedYear.toString(),
    }
    this.logSvc.ActionLog(PageNames.BillingCode_Holidays, '', 'Reports/Event', 'generateReport', 'Generate Report', '', '', JSON.stringify(ActivityParams)); // ActivityLog
    this.showReport = false;
    this._holidayList = [];
    this._recData = 0;
    this.timesysSvc.getHolidayList(year)
      .subscribe(
        (data) => {
          this.showReport = false;
          this._holidayList = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._holidayList = [];
            this._recData = 0;
            if (data !== undefined && data !== null && data.length > 0) {
              this._holidayList = data;
              this._recData = this._holidayList.length;
            }
            this.showReport = true;
          }
          this.showSpinner = false;
        }
      );
    this.resetSort();
  }

  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['HolidayDate'], ['CalendarYear']);
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
}
