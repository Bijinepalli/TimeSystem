import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';
import { Table } from 'primeng/table';
import { SOWUtilizationReport, SOWDetails, SOW, SOWAnalysis } from 'src/app/model/objects';
import { TableExport } from 'tableexport';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-sowutilizationreport',
  templateUrl: './sowutilizationreport.component.html',
  styleUrls: ['./sowutilizationreport.component.css']
})

export class SowutilizationreportComponent implements OnInit {
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
  @ViewChild('dtSOW') dtSOW: ElementRef;

  @ViewChild('barChart') barChart;
  DEFAULT_COLORS = ['#36A2EB', '#22AA99', '#AAAA11', '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
    '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E',
    '#316395', '#994499', '#6633CC',
    '#E67300', '#8B0707', '#329262', '#5574A6', '#3B3EAC'];

  _month: string;
  _year: string;
  _empId: string;

  _DisplayDateTimeFormat: any;
  _SOWs: SelectItem[] = [];
  _selectedSOW: string;

  _Types: SelectItem[] = [];
  _selectedType: string;


  lstSOW?: SOW[] = [];
  lstMonths?: SOWDetails[] = [];
  lstClients?: SOWDetails[] = [];
  lstEmployees?: SOWDetails[] = [];
  lstDetails?: SOWDetails[] = [];
  lstSOWAnalysis?: SOWAnalysis[];

  _SOWFilesPath: string;

  graphDialog = false;

  ShowGraph = false;
  hoursByTeamChartData = {
    labels: [],
    datasets: [
      {
        label: '',
        backgroundColor: '',
        borderColor: '',
        data: [],
      },
    ]
  };

  chartplugins: any;
  chartoptions: any;

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
    this.lstSOWAnalysis = [];
    this.cols = {};
    this._recData = 0;
    this.showReport = false;

    this._Types = [];
    this._selectedType = null;

    this.hoursByTeamChartData = { labels: [], datasets: [] };
    this.ShowGraph = false;
    this.chartoptions = [];
    this.chartplugins = [];

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
    this.lstSOWAnalysis = [];
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

    this._Types = [
      { label: 'Mothly Totals', value: '0' },
      { label: 'Employee Totals', value: '1' },
      { label: 'Mothly Employee Totals', value: '2' },
      // { label: 'Employee Mothly Totals', value: '3' }
    ];
    this._selectedType = '0';

    this.chartoptions = {
      // title: {
      //   display: true,
      //   text: 'Hours in Office ',
      //   fontSize: 16
      // },
      legend: {
        position: 'bottom'
      },
      showTooltips: true,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      },
    };

    this.hoursByTeamChartData = { labels: [], datasets: [] };
    this.chartplugins = [{
      beforeInit: function (chart) {
        chart.data.labels.forEach(function (e, i, a) {
          if (/\n/.test(e)) {
            a[i] = e.split(/\n/);
          }
        });
      }
    }];

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
    this.lstSOWAnalysis = [];
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
    this.lstSOWAnalysis = [];
    if (data !== undefined && data !== null) {
      this.lstSOW = data.lstSOW;
      this.lstMonths = data.lstMonths;
      this.lstClients = data.lstClients;
      this.lstEmployees = data.lstEmployees;
      this.lstDetails = data.lstDetails;
      this.lstSOWAnalysis = data.lstSOWAnalysis;

      // let lstAnalysis: SOWAnalysis[];
      // lstAnalysis = [];
      // let analysis: SOWAnalysis;
      // analysis = {};
      // analysis.UtilizedHours = '10';
      // analysis.RemainingHours = '20';
      // analysis.TimeTaken = '2';
      // analysis.TimeRemaining = '-4';
      // analysis.UtilizationPercent = '33.33';
      // analysis.ExpectedDays = '5';
      // analysis.Probability = '-80';
      // lstAnalysis.push(analysis);
      // this.lstSOWAnalysis = lstAnalysis;
      this.showReport = true;
    }
    this._recData = this.lstDetails.length;
    // this.BuildGraph();
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
    // return { 'border': '0px', };
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
    return hours.toFixed(2);
  }

  startOver() {
    this.ClearAllProperties();
    this.Initialisations();
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
    this.ExportCSV(sheetName, exHeader);
  }

  ExportCSV(sheetName, exHeader) {
    const dtNow = new Date();
    const dtFileName = sheetName + '_' + this.datePipe.transform(dtNow, 'yyyy_MM_dd_hh_mm_ss');
    let exFooter = '';
    exFooter += '"Report Generated By",' + '"' +
      sessionStorage.getItem(environment.buildType.toString() + '_' + 'currentUser').toString() + '",' + '\n';
    exFooter += '"Report Generated On",' + '"' + this.datePipe.transform(dtNow, 'yyyy-MM-dd hh:mm:ss') + '",' + '\n';

    let dataElement = this.dtUtilizationReport.nativeElement;
    const exportOptions = {
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
    }
    const tblExport = new TableExport(dataElement, exportOptions);
    const key = dataElement.attributes['tableexport-key'] ?
      dataElement.attributes['tableexport-key'].value : 'tableexport-1';

    // dataElement = this.dtSOW.nativeElement;

    // const tblExport2 = new TableExport(dataElement, exportOptions);
    // const key2 = dataElement.attributes['tableexport-key'] ?
    //   dataElement.attributes['tableexport-key'].value : 'tableexport-1';

    let objSOWAnalysis = '';
    objSOWAnalysis += '"Utilized Hours",';
    objSOWAnalysis += '"Remaining Hours",';
    objSOWAnalysis += '"Utilization %",';
    objSOWAnalysis += '"Time Taken",';
    objSOWAnalysis += '"Time Remaining",';
    objSOWAnalysis += '"Expected Days",';
    objSOWAnalysis += '"Probability",';
    objSOWAnalysis += '\n';
    objSOWAnalysis += '"' + this.lstSOWAnalysis[0].UtilizedHours + ' hrs",';
    objSOWAnalysis += '"' + this.lstSOWAnalysis[0].RemainingHours + ' hrs",';
    objSOWAnalysis += '"' + this.lstSOWAnalysis[0].UtilizationPercent + ' %",';
    objSOWAnalysis += '"' + this.lstSOWAnalysis[0].TimeTaken + ' days",';
    objSOWAnalysis += ((+this.lstSOWAnalysis[0].TimeRemaining > 0) ?
      '"' + this.lstSOWAnalysis[0].TimeRemaining.toString() + ' days",' : '"Expired",');
    objSOWAnalysis += '"' + this.lstSOWAnalysis[0].ExpectedDays + ' days",';
    objSOWAnalysis += '"' + ((+this.lstSOWAnalysis[0].Probability > 0) ?
      ((+this.lstSOWAnalysis[0].Probability < 100) ?
        this.lstSOWAnalysis[0].Probability.toString() : '100')
      : '0') + ' %",';

    let objSOWDetails = '"';
    objSOWDetails += this.cols.map(m => m.header).join('","');
    objSOWDetails += '"\n';
    objSOWDetails += '"' + this.lstSOW[0].Name + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].CustomerName + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].EffectiveDate + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].ExpirationDate + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].CurrencyType + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].TotalContractValue + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].InvoiceFrequency + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].Hours + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].Originate + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].OpportunityType + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].Status + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].SOWType + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].Notes + '"' + ',';
    objSOWDetails += '"' + this.lstSOW[0].SOWFileName + '"';

    if (tblExport.getExportData()[key] !== undefined && tblExport.getExportData()[key] !== null) {
      // && tblExport2.getExportData()[key2] !== undefined && tblExport2.getExportData()[key2] !== null) {
      const objCSV = tblExport.getExportData()[key].csv;
      // const objCSV2 = tblExport2.getExportData()[key2].csv;
      tblExport.export2file(
        '\n' +
        exHeader +
        '\n' +
        objSOWDetails +
        '\n' + '\n' +
        objSOWAnalysis +
        '\n' + '\n' +
        // objCSV2.data +
        // '\n' + '\n' +
        objCSV.data +
        '\n' + '\n' +
        exFooter,
        objCSV.mimeType,
        objCSV.filename,
        objCSV.fileExtension);
    }
  }

  BuildGraph() {

    this.ShowGraph = false;
    this.hoursByTeamChartData = { labels: [], datasets: [] };


    const labels = [];
    if (this._selectedType === '0' || this._selectedType === '2') {
      for (let weekCnt = 0; weekCnt < this.lstMonths.length; weekCnt++) {
        labels.push(this.datePipe.transform(this.lstMonths[weekCnt].Year + '-' + this.lstMonths[weekCnt].Month + '-01', 'MMM, yyyy'));
      }
    } else {
      for (let weekCnt = 0; weekCnt < this.lstEmployees.length; weekCnt++) {
        labels.push(this.lstEmployees[weekCnt].EmployeeName);
      }
    }


    this.hoursByTeamChartData.labels = labels;

    this.hoursByTeamChartData.datasets = [];
    if (this._selectedType === '0' || this._selectedType === '1') {
      this.hoursByTeamChartData.datasets.push({
        label: this.lstSOW[0].Name,
        backgroundColor: '',
        borderColor: '',
        data: []
      });
      this.hoursByTeamChartData.datasets[0].backgroundColor = this.configureDefaultColours(0);
    } else {
      if (this._selectedType === '2') {
        for (let i = 0; i < this.lstEmployees.length; i++) {
          this.hoursByTeamChartData.datasets.push({
            label: this.lstEmployees[i].EmployeeName,
            backgroundColor: '',
            borderColor: '',
            data: []
          });
          this.hoursByTeamChartData.datasets[i].backgroundColor = this.configureDefaultColours(i);
        }
      } else {
        for (let i = 0; i < this.lstMonths.length; i++) {
          this.hoursByTeamChartData.datasets.push({
            label: this.datePipe.transform(this.lstMonths[i].Year + '-' + this.lstMonths[i].Month + '-01', 'MMM, yyyy'),
            backgroundColor: '',
            borderColor: '',
            data: []
          });
          this.hoursByTeamChartData.datasets[i].backgroundColor = this.configureDefaultColours(i);
        }
      }
    }

    this.ShowGraph = true;
    if (this.barChart !== undefined && this.barChart !== null) {
      this.barChart.refresh();
    }

    for (let cnt = 0; cnt < this.hoursByTeamChartData.datasets.length; cnt++) {

      this.hoursByTeamChartData.datasets[cnt].data = [];

      if (this._selectedType === '0' || this._selectedType === '2') {
        for (let weekCnt = 0; weekCnt < this.lstMonths.length; weekCnt++) {
          if (this._selectedType === '0') {
            this.hoursByTeamChartData.datasets[cnt].data.push(
              this.getHours(this.lstMonths[weekCnt].Year, this.lstMonths[weekCnt].Month, 0, 0));
          } else {
            this.hoursByTeamChartData.datasets[cnt].data.push(
              this.getHours(this.lstMonths[weekCnt].Year, this.lstMonths[weekCnt].Month, 0, this.lstEmployees[cnt].EmployeeID));
          }
        }
      } else {
        if (this._selectedType === '1') {
          for (let weekCnt = 0; weekCnt < this.lstEmployees.length; weekCnt++) {
            this.hoursByTeamChartData.datasets[cnt].data.push(
              this.getHours(0, 0, 0, this.lstEmployees[weekCnt].EmployeeID));
          }
        } else {
          for (let weekCnt = 0; weekCnt < this.lstMonths.length; weekCnt++) {
            this.hoursByTeamChartData.datasets[cnt].data.push(
              this.getHours(this.lstMonths[weekCnt].Year, this.lstMonths[weekCnt].Month, 0, 0));
          }
        }
      }
    }


    if (this.barChart !== undefined && this.barChart !== null) {
      this.barChart.refresh();
    }

  }

  configureDefaultColours(dataV: number): string {
    const customColours = [];
    if (1 === 1) {
      return this.DEFAULT_COLORS[dataV];
    }
  }

  changeType() {
    this.BuildGraph();
  }

  ShowGraphDialog() {
    this.graphDialog = true;
    this.BuildGraph();
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
