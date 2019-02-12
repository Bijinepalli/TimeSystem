import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';
import { Departments, EmployeeUtilityReport, EmployeeUtilityDetails } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employeeutilizationreport',
  templateUrl: './employeeutilizationreport.component.html',
  styleUrls: ['./employeeutilizationreport.component.css']
})
export class EmployeeutilizationreportComponent implements OnInit {

  ParamSubscribe: any;
  _HasEdit = true;

  showSpinner = false;
  helpText: any;
  visibleHelp = false;

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

  _startDateVal: string;
  _endDateVal: string;

  _todayDate: Date = new Date();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private timesysSvc: TimesystemService,
    private datePipe: DatePipe,
  ) { }



  ngOnInit() {
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      this.ClearAllProperties();
      this.Initialisations();
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        this.CheckSecurity(params['Id'].toString());
        this.GetMethods();
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
  }

  CheckSecurity(PageId: string) {
    this._HasEdit = true;

    this.timesysSvc.getPagesbyRoles(localStorage.getItem('UserRole').toString(), PageId)
      .subscribe((data) => {
        if (data != null && data.length > 0) {
          if (data[0].HasEdit) {
            this._HasEdit = false;
          }
        }
      });
  }

  GetMethods() {
    this.getDepartments();
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
    if (this._selectcheckbox.length > 0) {
      let _start = '';
      let _end = '';

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

      if (this._startDate > this._endDate) {
        this.showSpinner = false;
      } else {
        this.timesysSvc.GetEmployeeUtilitizationReport(
          this._selectcheckbox.join(),
          this._selectedDepartment.Id.toString(),
          _start,
          _end,
          '8').subscribe(
            (data) => {
              this._UtilizationReportDetails = data;
              this._DistinctEmployee =
                data.EmployeeLevelDetails.filter((value, index, self) => self.map(x => x.Name).indexOf(value.Name) === index);
              this.showSelectList = false;
              this.showDateRangeValues = true;
              this.showSpinner = false;
            });
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

}
