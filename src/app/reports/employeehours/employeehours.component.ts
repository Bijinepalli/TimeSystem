import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, BillingCodes, Employee } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-employeehours',
  templateUrl: './employeehours.component.html',
  styleUrls: ['./employeehours.component.css'],
  providers: [DatePipe]
})
export class EmployeehoursComponent implements OnInit {
  types: SelectItem[];
  hoursType: SelectItem[];
  selectedType: string;
  selectedhoursType: string;
  _startDate = '';
  _endDate = '';
  _storeDate = '';
  showSpinner = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _employee: Employee[];
  _selectString = '';
  showBillingCodeList = false;
  allcheckbox = false;
  changeCodeList = false;
  showReport = false;
  _billingCodesSpecial: BillingCodesSpecial;
  _reports: any[] = [];
  _recData: string;
  cols: any;
  helpText: any;
  visibleHelp = false;
  showTotals = false;

  ParamSubscribe: any;
  IsSecure = false;
  _HasEdit = true;

  constructor(private timesysSvc: TimesystemService,
    private router: Router,
    private route: ActivatedRoute,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    private commonSvc: CommonService) {
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
    this.Initialisations();
    this.showSpinner = false;
  }
  /* #endregion */

  CheckSecurity(PageId: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(), PageId)
      .subscribe((data) => {
        this.showSpinner = false;
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          if (data[0].HasEdit) {
            this._HasEdit = false;
          }
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
      });
  }

  Initialisations() {
    this.showSpinner = true;
    this.hoursType = [
      { label: 'Salary', value: '1' },
      { label: 'Hourly', value: '0' },
      { label: 'Both', value: '' }
    ];
    this.types = [
      { label: 'Active', value: '0' },
      { label: 'Inactive', value: '1' },
      { label: 'Both', value: '' }
    ];
    this.selectedType = '0';
    this.selectedhoursType = '';
    const today = new Date();
    this._startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    this.showSpinner = false;
  }

  ClearAllProperties() {
    this.types = [];
    this.hoursType = [];
    this.selectedType = '0';
    this.selectedhoursType = '';
    this._startDate = '';
    this._endDate = '';
    this.showSpinner = false;
    this._selectcheckbox = [];
    this._displayCheckBoxes = [];
    this._employee = [];
    this._selectString = '';
    this.showBillingCodeList = false;
    this.allcheckbox = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._billingCodesSpecial = new BillingCodesSpecial();
    this._reports = [];
    this._recData = '';
    this.cols = {};
    this.helpText = '';
    this.visibleHelp = false;
    this.showTotals = false;
  }

  showBillingCodes() {
    this.showSpinner = true;
    this._displayCheckBoxes = [];
    // if (this.selectedhoursType === '' && this.selectedType === '') {
    this.timesysSvc.getAllEmployee(this.selectedType.toString(), this.selectedhoursType.toString()).subscribe(
      (data) => {
        if (data !== undefined && data !== null && data.length > 0) {
          // if (this.selectedType === '0' || this.selectedType === '1') {
          //   this._employee = data.filter(P => P.Inactive === (this.selectedType === '0' ? false : true));
          // } else {
          this._employee = data;
          // }
          for (let i = 0; i < this._employee.length; i++) {
            this._displayCheckBoxes.push({
              label: this._employee[i].LastName + ' ' + this._employee[i].FirstName,
              value: this._employee[i].ID
            });
          }
          this._selectString = 'Employees (' + this._employee.length + ' matching codes found)';
          this.showBillingCodeList = true;
        }
        this.showSpinner = false;
      }
    );
    // } else {
    //   this.timesysSvc.getAllEmployee(this.selectedType.toString(), this.selectedhoursType.toString()).subscribe(
    //     (data) => {
    //       // if (this.selectedType === '0' || this.selectedType === '1') {
    //       //   this._employee = data.filter(P => P.Inactive === (this.selectedType === '0' ? false : true));
    //       // } else {
    //       this._employee = data;
    //       // }
    //       for (let i = 0; i < this._employee.length; i++) {
    //         this._displayCheckBoxes.push({
    //           label: this._employee[i].LastName + ' ' + this._employee[i].FirstName,
    //           value: this._employee[i].ID
    //         });
    //       }
    //       this._selectString = 'Employees (' + this._employee.length + ' matching codes found)';
    //       this.showBillingCodeList = true;
    //       this.showSpinner = false;
    //     }
    //   );
    // }
  }
  selectAll() {
    this.showSpinner = true;
    this._selectcheckbox = [];
    for (let i = 0; i < this._displayCheckBoxes.length; i++) {
      this._selectcheckbox.push(this._displayCheckBoxes[i].value);
    }
    if (this.allcheckbox === false) {
      this._selectcheckbox = [];
    }
    this.showSpinner = false;
  }
  selectcheck() {
    this.showSpinner = true;
    if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
      this.allcheckbox = true;
    } else {
      this.allcheckbox = false;
    }
    this.showSpinner = false;
  }
  generateReport() {
    this.showSpinner = true;
    if (this._selectcheckbox.length > 0) {
      this.buildCols();
      this._billingCodesSpecial = new BillingCodesSpecial();
      if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
        this._billingCodesSpecial.value = '';
      } else {
        this._billingCodesSpecial.value = this._selectcheckbox.join();
      }
      let _start = '';
      let _end = '';
      const date = Date.parse(this._startDate);
      if (Number.isNaN(date)) {
        const today = new Date();
        const month = today.getMonth();
        const year = today.getFullYear();
        this._storeDate = new Date(year, month - 1, 1).toString();
        console.log(this._storeDate);
      } else {
        this._storeDate = this._startDate;
      }
      if (this._storeDate !== null && this._storeDate !== undefined) {
        _start = this.datePipe.transform(this._storeDate, 'yyyy-MM-dd');
        this._startDate = this.datePipe.transform(this._storeDate, 'MM-dd-yyyy');

      }
      if (this._endDate !== null && this._endDate !== '') {
        _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
        this._endDate = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
      }
      this._billingCodesSpecial.startDate = _start;
      this._billingCodesSpecial.endDate = _end;
      this._billingCodesSpecial.includeTotals = this.showTotals === true ? 1 : 0;
      this.timesysSvc.GetEmployeeHours(this._billingCodesSpecial).subscribe(
        (data) => {
          this.showTable(data);
        }
      );
    }
  }
  showTable(data: BillingCodes[]) {
    if (data !== undefined && data !== null && data.length > 0) {
      this._reports = data;
      this._recData = this._reports[0].RowCount.toString();
    } else {
      this._reports = [];
      this._recData = '0';
      this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No matching data for the selected criteria' });
    }
    this.showBillingCodeList = false;
    this.showReport = true;
    this.changeCodeList = true;
    this.showSpinner = false;
  }

  buildCols() {
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '250px' },
      { field: 'BillingName', header: 'Billing Code', align: 'left', width: 'auto' },
      { field: 'TANDM', header: 'T & M', align: 'right', width: '100px' },
      { field: 'Project', header: 'Project', align: 'right', width: '101px' },
      { field: 'NonBill', header: 'NonBillable', align: 'right', width: '133px' },
    ];
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._selectcheckbox = [];
    this.allcheckbox = false;
    this.showSpinner = false;
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    this._endDate = '';
  }
  changeCodes() {
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
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
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, [], ['TANDM', 'Project', 'NonBill']);
  }
}
