import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TimesystemService } from 'src/app/service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { TimeSheet } from 'src/app/model/objects';
import { TableExport } from 'tableexport';

@Component({
  selector: 'app-employeeclienttimesheets',
  templateUrl: './employeeclienttimesheets.component.html',
  styleUrls: ['./employeeclienttimesheets.component.css']
})
export class EmployeeclienttimesheetsComponent implements OnInit {

  ParamSubscribe: any;
  IsSecure = false;
  _DisplayDateFormat = '';
  _DisplayTimeStampFormat = '';
  showSpinner = false;

  _periodEnds: SelectItem[];
  _customers: SelectItem[];
  _clients: SelectItem[];
  _Employees: SelectItem[];

  selectedPeriodEnd: string;
  selectedCustomer: string[];
  selectedClient: string[];
  selectedEmployee: string[];

  showReport = false;
  showBillingCodeList = false;
  changeCodeList = false;

  _recData = 0;

  _timeSheetHTML = '';
  @ViewChild('dtTimesheet') dtTimesheet: ElementRef;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
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
    this._periodEnds = [];
    this.selectedPeriodEnd = '';
    this._customers = [];
    this.selectedCustomer = [];
    this._clients = [];
    this.selectedClient = [];
    this._Employees = [];
    this.selectedEmployee = [];
    this.showReport = false;
    this.showBillingCodeList = false;
    this.changeCodeList = false;

    this._recData = 0;
    this.showReport = false;

    this.showSpinner = false;
  }

  Initialisations() {
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this.getPeriodEnds();
  }

  getPeriodEnds() {
    this.showSpinner = true;
    this._periodEnds = [];
    this.selectedPeriodEnd = '';
    const PeriodEndReportPeriods = 48;    // GET VALUE FROM APPSETTINGS
    this.timesysSvc.getDatebyPeriod()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            for (let i = 0; i < PeriodEndReportPeriods; i++) {
              this._periodEnds.push({
                label: this.datePipe.transform(data[i].PeriodEndDate, this._DisplayDateFormat),
                value: data[i].PeriodEndDate + ' 00:00:00'
              });
            }
          }
          this.showSpinner = false;
        }
      );
  }


  getCustomers() {
    this.showSpinner = true;
    this._customers = [];
    this.selectedCustomer = [];
    this._clients = [];
    this.selectedClient = [];
    this._Employees = [];
    this.selectedEmployee = [];
    if (this.selectedPeriodEnd !== '') {
      this.timesysSvc.getCustomers()
        .subscribe(
          (data) => {
            if (data !== undefined && data !== null && data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                this._customers.push({ label: data[i].CustomerName, value: data[i].Id });
              }
            }
            this.showSpinner = false;
          }
        );
    } else {
      this.showSpinner = false;
    }
  }

  getClients() {
    this.showSpinner = true;
    this._clients = [];
    this.selectedClient = [];
    this._Employees = [];
    this.selectedEmployee = [];

    if (this.selectedCustomer.length > 0) {
      this.timesysSvc.GetClientsForCustomers(this.selectedCustomer.join())
        .subscribe(
          (data) => {
            if (data !== undefined && data !== null && data.length > 0) {
              this._clients = [];
              for (let i = 0; i < data.length; i++) {
                this._clients.push({ label: data[i].ClientName, value: data[i].Id });
              }
            }
            this.showSpinner = false;
          }
        );
    } else {
      this.showSpinner = false;
    }
  }

  getEmployees() {
    this.showSpinner = true;
    this._Employees = [];
    this.selectedEmployee = [];
    if (this.selectedClient.length > 0 && this.selectedPeriodEnd !== '') {
      this.timesysSvc.GetEmployeesForClients(this.selectedClient.join(), this.selectedPeriodEnd).subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              this._Employees.push({ label: data[i].LastName + ' ' + data[i].FirstName, value: data[i].ID });
            }
          }
          this.showSpinner = false;
        }
      );
    } else {
      this.showSpinner = false;
    }
  }

  startOver() {
    this.showSpinner = true;
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this.showSpinner = false;
  }

  changeCodes() {
    this.showSpinner = true;
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
    this.showSpinner = false;
  }

  generateReport() {
    this.showSpinner = true;
    this._timeSheetHTML = '';
    // Get TimesheetID for the selected period end and selected employees
    if (this.selectedEmployee.length > 0 && this.selectedPeriodEnd !== '') {
      this.timesysSvc.GetTimesheetsForEmployees(this.selectedEmployee.join(), this.selectedPeriodEnd).subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._timeSheetHTML = '';
            for (let i = 0; i < data.length; i++) {
              this.showSpinner = true;
              this.timesysSvc.TimesheetHTML(data[i].Id.toString()).subscribe(
                (dataHTML) => {
                  if (dataHTML !== undefined && dataHTML !== null) {
                    this._timeSheetHTML += dataHTML;
                    this.showTable(this._timeSheetHTML);
                  }
                  this.showSpinner = false;
                });
            }
          }
          this.showSpinner = false;
        }
      );
    }
  }

  showTable(data: string) {
    // this._reports = [];
    this._recData = 0;
    this.showReport = false;
    // if (data !== undefined && data !== null && data.length > 0) {
    //   this._reports = data;
    //   this._recData = this._reports[0].RowCount;
    //   this.showReport = true;
    // }
    if (data !== undefined && data !== null && data.toString() !== '') {
      this._recData = 1;
      this.showReport = true;
    }
    this.showBillingCodeList = false;
    this.changeCodeList = true;
    this.showSpinner = false;
  }


  exportClick() {
    this.showSpinner = true;
    const sheetName = 'EmployeeTimesheet';
    let exHeader = '';
    exHeader += '"Employee Timesheet"' + '\n';
    this.ExportCSV(sheetName, exHeader, this.dtTimesheet.nativeElement);
  }

  ExportCSV(sheetName, exHeader, dataElement) {
    const dtNow = new Date();
    const dtFileName = sheetName + '_' + this.datePipe.transform(dtNow, 'yyyy_MM_dd_hh_mm_ss');
    const exFooter = '';
    // exFooter += '"Report Generated By:' +
    //   sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser').toString() + '",' + '\n';
    // exFooter += '"Report Generated On:' + this.datePipe.transform(dtNow, 'yyyy-MM-dd hh:mm:ss') + '",' + '\n';
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
      sheetname: 'EmployeeTimesheet',
    });
    const key = this.dtTimesheet.nativeElement.attributes['tableexport-key'] ?
      this.dtTimesheet.nativeElement.attributes['tableexport-key'].value : 'tableexport-1';
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
    this.showSpinner = false;
  }
}
