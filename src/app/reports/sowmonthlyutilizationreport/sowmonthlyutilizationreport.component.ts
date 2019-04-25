import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';
import { Table } from 'primeng/table';
import { SOWUtilizationReport, SOWDetails, SOW, SOWMonthlyUtilizationReport, SOWMonthlyHours } from 'src/app/model/objects';
import { TableExport } from 'tableexport';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-sowmonthlyutilizationreport',
  templateUrl: './sowmonthlyutilizationreport.component.html',
  styleUrls: ['./sowmonthlyutilizationreport.component.css']
})
export class SowmonthlyutilizationreportComponent implements OnInit {
  // _reports: SOWUtilizationReport;
  cols: any;

  _recData = 0;
  showReport = false;
  showSpinner = false;
  ParamSubscribe: any;
  IsSecure = false;
  _monthlyHours: SOWMonthlyHours[] = [];
  _DateFormat: any;
  _DisplayDateFormat: any;
  _sortArray = [];
  @ViewChild('dt') dt: Table;
  @ViewChild('dtUtilizationReport') dtUtilizationReport: ElementRef;

  @Input() _somId: string;
  @Input() _month: string;
  @Input() _year: string;
  @Input() _empid: string;

  _DisplayDateTimeFormat: any;
  _SOWs: SelectItem[] = [];
  _selectedSOW: string;

  lstSOW?: SOW[] = [];
  lstMonths?: SOWDetails[] = [];
  lstClients?: SOWDetails[] = [];
  lstEmployees?: SOWDetails[] = [];
  lstDetails?: SOWDetails[] = [];

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    public commonSvc: CommonService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private activatedRoute: ActivatedRoute
  ) {
    this.CheckActiveSession();
    this.commonSvc.setAppSettings();
  }
  ngOnInit() {
    console.log('robooo');
    console.log(this._somId, this._month, this._year, this._empid);
    this._somId = this._somId === undefined ? '' : this._somId;
    this._month = this._month === undefined ? '' : this._month;
    this._year = this._year === undefined ? '' : this._year;
    this._empid = this._empid === undefined ? '' : this._empid;
    this.showSpinner = true;
    this.IsSecure = false;
    this.Initialisations();
    this.generateReport();
    // this.ParamSubscribe = this.route.queryParams.subscribe(params => {
    //   if (params['somid'] !== undefined && params['somid'] !== null && params['somid'].toString() !== '') {
    //     this._somId = params['somid'].toString();
    //     this._month = params['month'].toString();
    //     this._year = params['year'].toString();
    //     this._empid = params['empId'].toString();
    //     // this.CheckSecurity(SplitVals[SplitVals.length - 1]);
    //   } else {
    //     this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
    //   }
    // });
    // this.activatedRoute.params.subscribe((params) => {
    //   this._somId = params['somid'] === undefined ? '' : params['somid'];
    //   this._month = params['month'] === undefined ? '' : params['month'];
    //   this._year = params['year'] === undefined ? '' : params['year'];
    //   this._empid = params['empId'] === undefined ? '' : params['empId'];
    //   this.Initialisations();
    //   this.generateReport();
    // });
    this.showSpinner = false;
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
  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          this.IsSecure = true;
          this.Initialisations();
          this.generateReport();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }
  ClearAllProperties() {
    this._SOWs = [];
    this._selectedSOW = null;
    this.lstSOW = [];
    this.lstMonths = [];
    this.lstClients = [];
    this.lstEmployees = [];
    this.lstDetails = [];
    this.cols = {};
    this._recData = 0;
    this.showReport = false;
    this.resetSort();
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }

  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this._DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat').toString();
    this.showReport = false;
    this._recData = 0;
    this.lstSOW = [];
    this.lstMonths = [];
    this.lstClients = [];
    this.lstEmployees = [];
    this.lstDetails = [];
    this.cols = [];
    this.cols = [{ field: 'EmployeeName', header: 'Employee Name', width: '200px', align: 'left' },
    { field: 'ClientName', header: 'Client Name', width: '200px', align: 'left' }];
    // const days = this.getDaysInMonth(this.selectedMonth, this.selectedyear);
    const days = this.getDaysInMonth(this._month, this._year);
    for (let i = 1; i <= +days; i++) {
      this.cols.push({ field: 'Day' + i, header: i, width: '60px', align: 'right' });
    }
  }
  getDaysInMonth(month: any, year: any) {
    let days: any;
    const dateVAl = new Date(year, month, 0);
    days = (dateVAl).getDate();
    return days;
  }
  generateReport() {
    this.showSpinner = true;
    this.showReport = false;
    this._recData = 0;
    this.lstSOW = [];
    this.lstMonths = [];
    this.lstClients = [];
    this.lstEmployees = [];
    this.lstDetails = [];
    console.log(this._somId.toString(), this._month, this._year, this._empid);
    this.timesysSvc.GetSOWMonthlyUtilizationReport(this._somId.toString(), this._month, this._year, this._empid).subscribe((data) => {
      console.log(data);
      this.showTable(data);
    });
  }

  showTable(data: SOWMonthlyUtilizationReport) {
    this.lstSOW = [];
    this.lstMonths = [];
    this.lstClients = [];
    this.lstEmployees = [];
    this.lstDetails = [];
    if (data !== undefined && data !== null) {
      this.lstClients = data.lstClients;
      this.lstEmployees = data.lstEmployees;
      this.lstDetails = data.lstDetails;
      this._monthlyHours = data.monthlyHours;
      this.showReport = true;
    }
    this._recData = this.lstDetails.length;
    this.showSpinner = false;
    this.resetSort();
  }
}
