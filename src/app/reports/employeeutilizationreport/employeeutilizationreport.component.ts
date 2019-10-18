import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { Departments, EmployeeUtilityReport, EmployeeUtilityDetails, PageNames, Utilization } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

import { TableExport } from 'tableexport';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';
import { ActivitylogService } from 'src/app/service/activitylog.service';

@Component({
  selector: 'app-employeeutilizationreport',
  templateUrl: './employeeutilizationreport.component.html',
  styleUrls: ['./employeeutilizationreport.component.css']
})
export class EmployeeutilizationreportComponent implements OnInit {

  ParamSubscribe: any;
  _HasEdit = true;

  showSpinner = false;

  _Departments: Departments[] = [];
  _selectedDepartment: Departments = null;

  types: SelectItem[];
  selectedType: string;

  _selectString = '';

  showFilters = false;
  showSelectList = false;
  showReport = false;
  showDepartmentName = false;
  showDateRangeValues = false;

  allcheckbox = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _startDate = '';
  _endDate = '';
  _UtilizationReportDetails: EmployeeUtilityReport = null;
  _DistinctEmployee: EmployeeUtilityDetails[] = [];
  _utilization: Utilization = null;

  _startDateVal: string;
  _endDateVal: string;

  _todayDate: Date = new Date();

  ExportFilePath = '';

  @ViewChild('dtUtilizationReport') dtUtilizationReport: ElementRef;
  IsSecure: boolean;
  _tsStatus: { label: string; value: number; }[];
  _Frequency: { label: string; value: number; }[];
  _selectedStatus: any;
  _selectedFrequency: any;

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
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
    this.logSvc.ActionLog(PageNames.EmployeeUtilizationReport, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this.showSpinner = true;
    this._HasEdit = true;

    this.showFilters = true;
    this.showSelectList = false;
    this.showDateRangeValues = false;
    this.showDepartmentName = false;

    this._Departments = [];
    this._selectedDepartment = null;

    this.types = [
      { label: 'Active', value: '0' },
      { label: 'Inactive', value: '1' },
      { label: 'Both', value: '' }
    ];
    this.selectedType = '0';

    this._displayCheckBoxes = [];
    this.allcheckbox = false;
    this._selectcheckbox = [];
    this._selectString = '';
    this._todayDate = new Date();
    this._startDate = '';
    this._endDate = '';
    this._startDateVal = '';
    this._endDateVal = '';
    this._UtilizationReportDetails = null;
    this._DistinctEmployee = null;
    this.showSpinner = false;

  }

  Initialisations() {
    this.showSpinner = true;
    this._HasEdit = true;
    this.showFilters = true;
    this.showSelectList = false;
    this.showDateRangeValues = false;
    this.showDepartmentName = false;
    this._Departments = [];
    this._selectedDepartment = {};

    this.types = [
      { label: 'Active', value: '0' },
      { label: 'Inactive', value: '1' },
      { label: 'Both', value: '' }
    ];
    this.selectedType = '0';

    this._displayCheckBoxes = [];
    this.allcheckbox = false;
    this._selectcheckbox = [];
    this._selectString = '';
    this._todayDate = new Date();
    this._startDate = '';
    this._endDate = '';
    this._startDateVal = '';
    this._endDateVal = '';
    this.showSpinner = false;
    this.GetMethods();
  }

  GetMethods() {
    this.getDepartments();
    this.getStatusAndFrequency();
  }

  getStatusAndFrequency() {
    this._tsStatus = [
      { label: 'Submitted', value: 1 },
      { label: 'Saved', value: 2 },
      { label: 'Submitted & Saved', value: 3 },
    ];

    this._Frequency = [
      { label: 'Weekly', value: 1 },
      { label: 'Bi-Weekly', value: 2 },
      { label: 'Monthly', value: 3 },
      { label: 'Quarterly', value: 4 },
      { label: 'Halfyearly', value: 5 },
      { label: 'Yearly', value: 6 },
    ];

    this._selectedStatus = 1;
    this._selectedFrequency = 1;
  }

  getDepartments() {
    this.showSpinner = true;
    this.showDepartmentName = false;
    this.showDateRangeValues = false;
    this._startDateVal = '';
    this._endDateVal = '';
    this.timesysSvc.getDepartments('').subscribe(
      (data) => {
        if (data !== undefined && data !== null && data.length > 0) {
          this._Departments = data;
          this._Departments.unshift({ Id: 0, Name: 'All' });
          this._selectedDepartment = data[0];
        }
        this.showSpinner = false;
      });
  }

  showEmployees() {
    this.showSpinner = true;
    this._displayCheckBoxes = [];
    this._selectcheckbox = [];
    this._selectString = '';
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      selectedType: this.selectedType,
      _selectedDepartment: this._selectedDepartment,
    }
    this.logSvc.ActionLog(PageNames.EmployeeUtilizationReport, '', 'Reports/Event', 'showEmployees', 'showEmployees',
      '', '', JSON.stringify(ActivityParams)); // ActivityLog
    this.timesysSvc.departmentEmployee_Get(this._selectedDepartment.Id.toString()).subscribe(
      (data) => {
        this.showFilters = false;
        this.showDepartmentName = true;
        if (data !== undefined && data !== null && data.length > 0) {
          if (this.selectedType === '0' || this.selectedType === '1') {
            data = data.filter(P => P.Inactive.toString() === (this.selectedType === '0' ? 'false' : 'true'));
          }
        }
        if (data !== undefined && data !== null && data.length > 0) {
          for (let i = 0; i < data.length; i++) {
            this._displayCheckBoxes.push({ label: data[i].Name, value: data[i].ID });
          }
          this._selectString = 'Employees (' + data.length + ' matching codes found)';
        } else {
          this._selectString = 'No employees found';
        }
        this.showSelectList = true;
        this.showSpinner = false;
      });
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

  generateReport() {
    this.showSpinner = true;
    this._startDateVal = '';
    this._endDateVal = '';
    this._UtilizationReportDetails = null;
    this._DistinctEmployee = null;
    this.ExportFilePath = '';
    if (this._selectcheckbox.length > 0) {
      let _start = '';
      let _end = '';
      let _status = '';
      let _frequency = '';

      if (this._startDate !== null && this._startDate !== '') {
        _start = this.datePipe.transform(this._startDate, 'yyyy-MM-dd');
        // this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
        this._startDateVal = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
      }
      if (this._endDate !== null && this._endDate !== '') {
        _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
        // this._endDate = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
        this._endDateVal = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
      }
      _status = this._selectedStatus;
      _frequency = this._selectedFrequency;
      let ActivityParams: any; // ActivityLog
      ActivityParams = {
        _selectcheckbox: this._selectcheckbox,
        _selectedDepartment: this._selectedDepartment,
        _start: _start,
        _end: _end,
        _status: _status,
        _frequency: _frequency,
      };
      this.logSvc.ActionLog(PageNames.EmployeeUtilizationReport, '', 'Reports/Event', 'generateReport', 'Generate Report',
        '', '', JSON.stringify(ActivityParams)); // ActivityLog
      if (this._startDate > this._endDate) {
        this.showSpinner = false;
      } else {
        this._utilization = new Utilization();
        this._utilization.EmployeeID = this._selectcheckbox.join();
        this._utilization.DepartmentID = this._selectedDepartment.Id.toString();
        this._utilization.FromDate = _start;
        this._utilization.ToDate = _end;
        this._utilization.WorkingHours = '8';
        this._utilization.Status = _status;
        this._utilization.Frequency = _frequency;
        this.timesysSvc.GetEmployeeUtilitizationReport(this._utilization).subscribe(
          (data) => {
            if (data !== undefined && data !== null) {
              this._UtilizationReportDetails = data;
              this._DistinctEmployee =
                data.EmployeeLevelDetails.filter((value, index, self) => self.map(x => x.Name).indexOf(value.Name) === index);

              this.ExportFilePath = 'http://172.16.16.217/TimeSystemHelpFiles/Help/EmployeeSelect.htm';
            }
            this.showSelectList = false;
            this.showDateRangeValues = true;
            this.showSpinner = false;
          });
      }
    }
  }

  getDisplayColors(i: number, border: number) {
    const displayColors = ['lightcyan', '#d0fbd0', 'lightgray', '#b4e2ff', 'lightyellow'];
    return {
      'border': '0px',
      // 'border-bottom': (border === 1) ? '1px solid #b3b3b3' : '0px',
      'background-color': displayColors[(i % displayColors.length)]
    };
  }

  startOver() {
    this.ClearAllProperties();
    this.Initialisations();
    this.GetMethods();
  }

  changeEmployees() {

  }

  exportClick() {
    const sheetName = 'EmployeeUtilizationReport';
    let exHeader = '';
    exHeader += '"Employee Utilization Report"' + '\n';
    exHeader += '"Department",' + '"' + this._selectedDepartment.Name + '",' + '\n';
    exHeader += '"Date Range From",' + '"' + this._startDateVal + ' to ' + this._endDateVal + '"' + '\n';
    this.ExportCSV(sheetName, exHeader, this.dtUtilizationReport.nativeElement);

    // let csv = this.dtUtilizationReport.nativeElement.innerText;
    // const blob = new Blob([csv], {
    //   type: 'text/csv;charset=utf-8;'
    // });
    // if (window.navigator.msSaveOrOpenBlob) {
    //   navigator.msSaveOrOpenBlob(blob, 'EmployeeUtilizationReport' + '.csv');
    // } else {
    //   const link = document.createElement('a');
    //   link.style.display = 'none';
    //   document.body.appendChild(link);
    //   if (link.download !== undefined) {
    //     link.setAttribute('href', URL.createObjectURL(blob));
    //     link.setAttribute('download', 'EmployeeUtilizationReport' + '.csv');
    //     link.click();
    //   } else {
    //     csv = 'data:text/csv;charset=utf-8,' + csv;
    //     window.open(encodeURI(csv));
    //   }
    //   document.body.removeChild(link);
    // }
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
      sheetname: 'EmployeeUtilizationReport',
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
}
