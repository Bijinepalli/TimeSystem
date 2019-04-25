import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';
import { Table } from 'primeng/table';
import { SOWUtilizationReport, SOWDetails, SOW } from 'src/app/model/objects';
import { TableExport } from 'tableexport';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-sowutilizationreport',
  templateUrl: './sowutilizationreport.component.html',
  styleUrls: ['./sowutilizationreport.component.css']
})
export class SowutilizationreportComponent implements OnInit {

  // _reports: SOWUtilizationReport;
  cols: any;
  _title = '';
  _recData = 0;
  showReport = false;
  showSpinner = false;
  ParamSubscribe: any;
  IsSecure = false;
  hoursDialog = false;
  _DateFormat: any;
  _DisplayDateFormat: any;
  _sortArray = [];
  @ViewChild('dt') dt: Table;
  @ViewChild('dtUtilizationReport') dtUtilizationReport: ElementRef;

  _month: string;
  _year: string;
  _empId: string;

  _DisplayDateTimeFormat: any;
  _SOWs: SelectItem[] = [];
  _selectedSOW: string;


  lstSOW?: SOW[] = [];
  lstMonths?: SOWDetails[] = [];
  lstClients?: SOWDetails[] = [];
  lstEmployees?: SOWDetails[] = [];
  lstDetails?: SOWDetails[] = [];
  _SOWFilesPath: string;
  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    public commonSvc: CommonService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
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
    this.cols = [
      { field: 'Name', header: 'Name', align: 'left', width: 'auto' },
      { field: 'CustomerName', header: 'Customer', align: 'left', width: 'auto' },
      { field: 'EffectiveDate', header: 'Effective Date', align: 'center', width: '100px' },
      { field: 'ExpirationDate', header: 'Expiration Date', align: 'center', width: '100px' },
      { field: 'CurrencyType', header: 'Currency Type', align: 'center', width: '100px' },
      { field: 'TotalContractValue', header: 'Total Contract Value', align: 'right', width: '180px' },
      { field: 'InvoiceFrequency', header: 'Invoice Frequency', align: 'left', width: 'auto' },
      { field: 'Hours', header: 'Hours', align: 'right', width: 'auto' },
      { field: 'Originate', header: 'Originate', align: 'left', width: '100px' },
      { field: 'OpportunityType', header: 'Opportunity Type', align: 'left', width: '120px' },
      { field: 'Status', header: 'Status', align: 'left', width: '150px' },
      { field: 'SOWType', header: 'SOW Type', align: 'left', width: '60px' },
      { field: 'Notes', header: 'Notes', align: 'left', width: 'auto' },
      { field: 'SOWFileName', header: 'SOW File', align: 'center', width: 'auto' },
    ];

    this._SOWFilesPath = environment.SOWFiles;
    this.getSOWs();
  }


  getSOWs() {
    this.showSpinner = true;
    this._SOWs = [];
    this.timesysSvc.getSOWs('')
      .subscribe(
        (data) => {
          this._SOWs = [];
          if (data !== undefined && data !== null && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              this._SOWs.push({ label: data[i].Name, value: data[i].SOWID });
            }
            // this._selectedSOW = this._SOWs[0].value;
          }
          this.showSpinner = false;
        }
      );
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
    this.timesysSvc.GetSOWUtilizationReport(this._selectedSOW.toString()).subscribe((data) => {
      this.showTable(data);
    });
  }
  showTable(data: SOWUtilizationReport) {
    this.lstSOW = [];
    this.lstMonths = [];
    this.lstClients = [];
    this.lstEmployees = [];
    this.lstDetails = [];
    if (data !== undefined && data !== null) {
      this.lstSOW = data.lstSOW;
      this.lstMonths = data.lstMonths;
      this.lstClients = data.lstClients;
      this.lstEmployees = data.lstEmployees;
      this.lstDetails = data.lstDetails;
      this.showReport = true;
    }
    this._recData = this.lstDetails.length;
    this.showSpinner = false;
    this.resetSort();
  }

  getDisplayColors(i: number, border: number) {
    const displayColors = ['lightcyan', '#d0fbd0', 'lightgray', '#b4e2ff', 'lightyellow'];
    return {
      'border': '0px',
      // 'border-bottom': (border === 1) ? '1px solid #b3b3b3' : '0px',
      'background-color': displayColors[(i % displayColors.length)]
    };
  }

  getHours(Year, Month, ClientID, EmployeeID): string {
    let hours = 0.00;
    const hourDetail = this.lstDetails.filter(m =>
      ((+Year) === 0 || m.Year === Year)
      && ((+Month) === 0 || m.Month === Month)
      && ((+ClientID) === 0 || m.ClientID === ClientID)
      && ((+EmployeeID) === 0 || m.EmployeeID === EmployeeID));
    if (hourDetail !== undefined && hourDetail !== null && hourDetail.length > 0) {
      for (let cnt = 0; cnt < hourDetail.length; cnt++) {
        hours += (+(hourDetail[cnt].Hours));
      }
    }
    return hours.toString();
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

  exportClick() {
    const sheetName = 'SOWUtilizationReport';
    let exHeader = '';
    exHeader += '"SOW Utilization Report"' + '\n';
    this.ExportCSV(sheetName, exHeader, this.dtUtilizationReport.nativeElement);
  }


  ExportCSV(sheetName, exHeader, dataElement) {
    const dtNow = new Date();
    const dtFileName = sheetName + '_' + this.datePipe.transform(dtNow, 'yyyy_MM_dd_hh_mm_ss');
    let exFooter = '';
    exFooter += '"Report Generated By",' + '"' +
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser').toString() + '",' + '\n';
    exFooter += '"Report Generated On",' + '"' + this.datePipe.transform(dtNow, 'yyyy-MM-dd hh:mm:ss') + '",' + '\n';
    const tblExport = new TableExport(dataElement, {
      headers: true,
      formats: ['csv'],
      filename: dtFileName,
      bootstrap: false,
      exportButtons: false,
      position: 'bottom',
      ignoreRows: null,
      ignoreCols: null,
      trimWhitespace: true,
      RTL: false,
      sheetname: 'SOWUtilizationReport',
    });
    const key = this.dtUtilizationReport.nativeElement.attributes['tableexport-key'] ?
      this.dtUtilizationReport.nativeElement.attributes['tableexport-key'].value : 'tableexport-1';
    if (tblExport.getExportData()[key] !== undefined && tblExport.getExportData()[key] !== null) {
      const objCSV = tblExport.getExportData()[key].csv;
      tblExport.export2file(
        '\n' +
        exHeader +
        '\n' + '\n' +
        objCSV.data +
        '\n' + '\n' +
        exFooter,
        objCSV.mimeType,
        objCSV.filename,
        objCSV.fileExtension);
    }
  }
  openReport(month: string, year: string) {
    this.hoursDialog = true;
    this._month = month;
    this._year = year;
    this._empId = '';
    const dateNew = this.datePipe.transform(year + '-' + month + '-01', 'MMM, yyyy');
    this._title = 'Working hours for ' + dateNew;
    // tslint:disable-next-line:max-line-length
    // this.router.navigate(['/menu/sowmonthlyutilizationreport/' + this._selectedSOW.toString() + '/' + month + '/' + year + '']); // Session Expired
  }
  openReportForUSer(month: string, year: string, empId: string, empName: string) {
    this.hoursDialog = true;
    this._month = month;
    this._year = year;
    this._empId = empId;
    const dateNew = this.datePipe.transform(year + '-' + month + '-01', 'MMM, yyyy');
    this._title = 'Working hours of ' + empName + ' for ' + dateNew;
    // tslint:disable-next-line:max-line-length
    // this.router.navigate(['/menu/sowmonthlyutilizationreport/' + this._selectedSOW.toString() + '/' + month + '/' + year + '']); // Session Expired
  }
}

