import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { Departments, EmployeeUtilityReport, EmployeeUtilityDetails } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { WeeklyhoursbyemployeeComponent } from '../reports/weeklyhoursbyemployee/weeklyhoursbyemployee.component';

@Component({
  selector: 'app-utilizationchart',
  templateUrl: './utilizationchart.component.html',
  styleUrls: ['./utilizationchart.component.css']
})


export class UtilizationchartComponent implements OnInit {

  @ViewChild('barChart') barChart;


  DEFAULT_COLORS = ['#36A2EB', '#22AA99', '#AAAA11', '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
    '#3B3EAC', '#0099C6', '#DD4477', '#66AA00', '#B82E2E',
    '#316395', '#994499', '#6633CC',
    '#E67300', '#8B0707', '#329262', '#5574A6', '#3B3EAC'];

  ParamSubscribe: any;
  _HasEdit = true;

  showSpinner = false;
  ShowGraph = false;


  months: any;
  years: any;
  utilizationtypes: any;
  charttypes: any;
  selectedMonth: string;
  selectedyear: string;
  selectedUtilizationType: string;
  selectedChartType: string;
  employees: any;
  selectedEmp: string;

  _startDate = '';
  _endDate = '';
  _UtilizationReportDetails: EmployeeUtilityReport = null;
  _DistinctEmployee: EmployeeUtilityDetails[] = [];

  _startDateVal: string;
  _endDateVal: string;

  _todayDate: Date = new Date();

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
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private timesysSvc: TimesystemService,
    private datePipe: DatePipe,
  ) { }



  ngOnInit() {
    this.ClearAllProperties();
    this.Initialisations();
    this.GetMethods();
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this._HasEdit = true;

    this._todayDate = new Date();

    this.months = [];
    this.years = [];
    this.selectedMonth = '';
    this.selectedyear = '';

    this._startDate = '';
    this._endDate = '';

    this.employees = [];
    this.selectedEmp = null;
    this._UtilizationReportDetails = null;
    this._DistinctEmployee = null;

    this.hoursByTeamChartData = { labels: [], datasets: [] };
    this.ShowGraph = false;
    this.chartoptions = [];
    this.chartplugins = [];
    this.showSpinner = false;

  }

  Initialisations() {
    this.showSpinner = true;
    this._HasEdit = true;
    this.employees = [];
    this.selectedEmp = null;
    this._todayDate = new Date();
    this._startDate = '';
    this._endDate = '';

    this.months = [
      { label: 'Jan', value: '1' },
      { label: 'Feb', value: '2' },
      { label: 'Mar', value: '3' },
      { label: 'Apr', value: '4' },
      { label: 'May', value: '5' },
      { label: 'Jun', value: '6' },
      { label: 'Jul', value: '7' },
      { label: 'Aug', value: '8' },
      { label: 'Sep', value: '9' },
      { label: 'Oct', value: '10' },
      { label: 'Nov', value: '11' },
      { label: 'Dec', value: '12' }
    ];

    this.years = [
      { label: '2017', value: '2017' },
      { label: '2018', value: '2018' },
      { label: '2019', value: '2019' },
    ];
    this.selectedMonth = this._todayDate.getMonth().toString();
    this.selectedyear = this._todayDate.getFullYear().toString();

    this.utilizationtypes = [
      { label: 'Utilization Hours', value: 'Detail' },
      { label: 'Utilization %', value: 'Percentage' },
    ];

    this.charttypes = [
      { label: 'Bar', value: 'Bar' },
      { label: 'Pie', value: 'Pie' },
    ];

    this.selectedUtilizationType = 'Percentage';
    this.selectedChartType = 'Bar';

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

    // this.ShowGraph = true;
    this.showSpinner = false;

  }

  GetMethods() {
    // this.getEmployees();
    this.selectedEmp = localStorage.getItem('UserId').toString();
    this.generateReport();
  }

  getEmployees() {
    this.showSpinner = true;

    this.employees = [];
    if (localStorage.getItem('UserRole').toString() === 'E') {
      this.employees.push({
        label: localStorage.getItem('currentUser').toString(),
        value: localStorage.getItem('UserId').toString()
      });
      // this.selectedEmp = this.employees[0];
      this.selectedEmp = localStorage.getItem('UserId').toString();
      this.showSpinner = false;
      this.generateReport();
    } else {
      const _InActive = '0';
      const _Salaried = '';
      this.timesysSvc.getAllEmployee(_InActive, _Salaried)
        .subscribe(
          (data) => {
            if (data !== undefined && data !== null && data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                this.employees.push({ label: data[i].LastName + ', ' + data[i].FirstName, value: data[i].ID });
              }
              // this.selectedEmp = this.employees.find(m => m.value.toString() === localStorage.getItem('UserId').toString());
              this.selectedEmp = localStorage.getItem('UserId').toString();
              this.generateReport();
            }
            this.showSpinner = false;
          });
    }
  }



  generateReport() {
    this.showSpinner = true;
    this._startDateVal = '';
    this._endDateVal = '';
    this._UtilizationReportDetails = null;
    this._DistinctEmployee = null;

    if (this.selectedEmp !== '') {
      this._startDate = this.datePipe.transform(new Date(+this.selectedyear, (+this.selectedMonth - 1), 1), 'yyyy-MM-dd');
      this._endDate = this.datePipe.transform(new Date(+this.selectedyear, +this.selectedMonth, 0), 'yyyy-MM-dd');

      if (this._startDate > this._endDate) {
        this.showSpinner = false;
      } else {
        this.timesysSvc.GetEmployeeUtilitizationReport(
          this.selectedEmp,
          '',
          this._startDate,
          this._endDate,
          '8').subscribe(
            (data) => {
              if (data !== undefined && data !== null) {
                this._UtilizationReportDetails = data;

                if (this._UtilizationReportDetails.WeekNumDetails !== undefined &&
                  this._UtilizationReportDetails.WeekNumDetails !== null &&
                  this._UtilizationReportDetails.WeekNumDetails.length > 0) {
                  const labels = [];
                  for (let weekCnt = 0; weekCnt < this._UtilizationReportDetails.WeekNumDetails.length; weekCnt++) {
                    labels.push([this._UtilizationReportDetails.WeekNumDetails[weekCnt].Startdate,
                    this._UtilizationReportDetails.WeekNumDetails[weekCnt].Enddate]);
                  }
                  this.hoursByTeamChartData.labels = labels;

                  this.hoursByTeamChartData.datasets = [];
                  let UtilizationDataLabels = [];
                  // UtilizationDataLabels = ['Weekday', 'Holiday', 'PTO', 'Billable', 'Utilization'];

                  if (this.selectedUtilizationType === 'Detail') {
                    UtilizationDataLabels = ['Weekday', 'Holiday', 'PTO', 'Billable'];
                  } else {
                    UtilizationDataLabels = ['Utilization'];
                  }
                  for (let i = 0; i < UtilizationDataLabels.length; i++) {
                    this.hoursByTeamChartData.datasets.push({
                      label: UtilizationDataLabels[i],
                      backgroundColor: '',
                      borderColor: '',
                      data: []
                    });
                    this.hoursByTeamChartData.datasets[i].backgroundColor = this.configureDefaultColours(i);
                  }

                  this.ShowGraph = true;
                  if (this.barChart !== undefined && this.barChart !== null) {
                    this.barChart.refresh();
                  }

                  for (let i = 0; i < UtilizationDataLabels.length; i++) {
                    this.hoursByTeamChartData.datasets[i].data = [];
                    for (let weekCnt = 0; weekCnt < this._UtilizationReportDetails.WeekNumDetails.length; weekCnt++) {
                      const WeekLevelEmpData = this._UtilizationReportDetails.EmployeeLevelDetails.filter(m =>
                        (m.WeekNum === this._UtilizationReportDetails.WeekNumDetails[weekCnt].WeekNum));
                      if (WeekLevelEmpData !== undefined && WeekLevelEmpData !== null && WeekLevelEmpData.length > 0) {
                        switch (UtilizationDataLabels[i]) {
                          case 'Weekday':
                            this.hoursByTeamChartData.datasets[i].data.push(WeekLevelEmpData[0].Weekday);
                            break;
                          case 'Holiday':
                            this.hoursByTeamChartData.datasets[i].data.push(WeekLevelEmpData[0].Holiday);
                            break;
                          case 'PTO':
                            this.hoursByTeamChartData.datasets[i].data.push(WeekLevelEmpData[0].PTO);
                            break;
                          case 'Billable':
                            this.hoursByTeamChartData.datasets[i].data.push(WeekLevelEmpData[0].Billable);
                            break;
                          case 'Utilization':
                            this.hoursByTeamChartData.datasets[i].data.push(WeekLevelEmpData[0].Utilization);
                            break;
                          default:
                            break;
                        }
                      }
                    }
                  }
                  if (this.barChart !== undefined && this.barChart !== null) {
                    this.barChart.refresh();
                  }
                }
              }
              this.showSpinner = false;
            });
      }
    }
  }

  configureDefaultColours(dataV: number): string {
    const customColours = [];
    if (1 === 1) {
      return this.DEFAULT_COLORS[dataV];
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

}

