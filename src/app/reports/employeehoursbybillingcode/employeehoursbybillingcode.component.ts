import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, BillingCodes } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-employeehoursbybillingcode',
  templateUrl: './employeehoursbybillingcode.component.html',
  styleUrls: ['./employeehoursbybillingcode.component.css'],
  providers: [DatePipe]
})
export class EmployeehoursbybillingcodeComponent implements OnInit {
  billingCycle: SelectItem[];
  selectedbillingCycle: number;
  _startDate: any;
  _startDateSelect = '';
  _endDateSelect = '';
  _endDate: any;
  showSpinner = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _clients: Clients[];
  _selectString = '';
  showBillingCodeList = false;
  allcheckbox = false;

  changeCodeList = false;
  showReport = false;
  _recData = 0;
  cols: any;
  _reports: any[] = [];

  _billingCodesSpecial: BillingCodesSpecial;
  helpText: any;
  visibleHelp = false;
  showTotals = false;
  nowrap = 'nowrap';
  ParamSubscribe: any;
  IsSecure = false;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private commonSvc: CommonService,
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
    this.billingCycle = [];
    this._billingCodesSpecial = new BillingCodesSpecial();

    this._selectcheckbox = [];
    this._displayCheckBoxes = [];
    this.selectedbillingCycle = 3;
    this._startDate = '';
    this._startDateSelect = '';
    this._endDateSelect = '';
    this._endDate = '';

    this._clients = [];
    this._selectString = '';
    this.showBillingCodeList = false;
    this.allcheckbox = false;

    this.changeCodeList = false;

    this._reports = [];
    this.cols = {};

    this._recData = 0;
    this.showReport = false;
    this.visibleHelp = false;
    this.helpText = '';
    this.showTotals = false;
  }

  Initialisations() {
    this.billingCycle = [
      { label: 'Weekly', value: 0 },
      { label: 'Bi-Weekly', value: 1 },
      { label: 'Monthly', value: 2 },
      { label: 'All (Show T&M, Projects, Non-Billables)', value: 3 }
    ];
    this.selectedbillingCycle = 3;
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1);
    this._startDateSelect = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
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
  showBillingCodes() {
    this.showSpinner = true;
    this._displayCheckBoxes = [];
    const selectedType = 0;
    if (this.selectedbillingCycle < 3) {
      this.timesysSvc.getClients().subscribe(
        (data) => {
          this._clients = [];
          if (data !== undefined && data !== null && data.length > 0) {
            if (selectedType < 2) {
              data = data.filter(P => P.Inactive === (selectedType === 0 ? false : true));
              if (data !== undefined && data !== null && data.length > 0) {
                this._clients = data;
              }
            } else {
              this._clients = data;
            }
          }
          for (let i = 0; i < this._clients.length; i++) {
            this._displayCheckBoxes.push({ label: this._clients[i].ClientName, value: this._clients[i].Key });
          }
          this._selectString = 'Clients (' + this._clients.length + ' matching codes found)';
          this.showBillingCodeList = true;
          this.showSpinner = false;
        }
      );
    } else if (this.selectedbillingCycle === 3) {
      this.generateReport();
    }
  }
  generateReport() {
    this.showSpinner = true;

    this._billingCodesSpecial = new BillingCodesSpecial();
    let _start = '';
    let _end = '';
    this._startDateSelect = '';
    this._endDateSelect = '';
    let dateValid: any;
    const dateCheck = new Date(this._startDate);
    if (dateCheck.toString() === 'Invalid Date') {
      dateValid = this._startDate;
    } else {
      dateValid = dateCheck;
    }

    if (this._startDate !== undefined && this._startDate !== null && this._startDate !== '') {
      _start = this.datePipe.transform(dateValid, 'yyyy-MM-dd');
      this._startDateSelect = this.datePipe.transform(dateValid, 'MM-dd-yyyy');
    }
    if (this._endDate !== undefined && this._endDate !== null && this._endDate !== '') {
      _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
      this._endDateSelect = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
    }
    this._billingCodesSpecial.startDate = _start;
    this._billingCodesSpecial.endDate = _end;
    this._billingCodesSpecial.includeTotals = this.showTotals === true ? 1 : 0;
    this.buildCols();
    if (this.selectedbillingCycle < 3) {
      if (this._selectcheckbox.length > 0) {
        if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
          this._billingCodesSpecial.value = '';
        } else {
          this._billingCodesSpecial.value = this._selectcheckbox.join();
        }
        let _selectedBillingCycle = '';
        if (this.selectedbillingCycle === 0) {
          _selectedBillingCycle = 'W';
        } else if (this.selectedbillingCycle === 1) {
          _selectedBillingCycle = 'B';
        } else if (this.selectedbillingCycle === 2) {
          _selectedBillingCycle = 'M';
        } else if (this.selectedbillingCycle === 3) {
          _selectedBillingCycle = 'A';
        }
        this._billingCodesSpecial.billingCycle = _selectedBillingCycle;

        this.timesysSvc.ListEmployeeHoursByBillingCodeClientOnly(this._billingCodesSpecial).subscribe(
          (data) => {
            this.showTable(data);
          }
        );
      }
    } else {
      this.timesysSvc.ListEmployeeHoursByBillingCode(this._billingCodesSpecial).subscribe(
        (data) => {
          this.showTable(data);
        }
      );
    }
  }
  showTable(data: BillingCodes[]) {
    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    if (data !== undefined && data !== null && data.length > 0) {
      this._reports = data;
      this._recData = this._reports[0].RowCount;
      this.showReport = true;
    }
    this.showBillingCodeList = false;
    this.changeCodeList = true;
    this.showSpinner = false;
  }
  buildCols() {
    this.cols = [
      { field: 'BillingName', header: 'Billing Code', align: 'left', width: 'auto' },
      { field: 'LastName', header: 'Last Name', align: 'left', width: 'auto' },
      { field: 'TANDM', header: 'T & M', align: 'right', width: '100px' },
      { field: 'Project', header: 'Project', align: 'right', width: '125px' },
      { field: 'NonBill', header: 'NonBillable', align: 'right', width: '150px' },
    ];
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
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._selectcheckbox = [];
    this.allcheckbox = false;
    this.showSpinner = false;
    this._startDateSelect = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    this._endDateSelect = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
  }

  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, [], ['TANDM', 'Project', 'NonBill']);
  }
}
