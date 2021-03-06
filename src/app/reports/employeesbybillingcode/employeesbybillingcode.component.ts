import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, PageNames } from 'src/app/model/objects';
import { CommonService } from 'src/app/service/common.service';
import { environment } from 'src/environments/environment';
import { Table } from 'primeng/table';
import { ActivitylogService } from 'src/app/service/activitylog.service';

@Component({
  selector: 'app-employeesbybillingcode',
  templateUrl: './employeesbybillingcode.component.html',
  styleUrls: ['./employeesbybillingcode.component.css']
})

export class EmployeesbybillingcodeComponent implements OnInit {
  types: SelectItem[];
  assignStatus: SelectItem[];
  selectedassignStatus: number;
  billingType: SelectItem[];
  selectedType: number;
  selectedBillingType: number;
  showReport = false;
  showBillingCodeList = false;
  changeCodeList = false;
  allcheckbox = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _clients: Clients[];
  _projects: Projects[];
  _nonBillables: NonBillables[];
  _selectString = '';
  _selectedString = '';
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  _billingCodesSpecial: BillingCodesSpecial;
  showSpinner = false;
  ParamSubscribe: any;
  IsSecure = false;
  _DateFormat: any;
  _DisplayDateFormat: any;
  _buttonLabel = '';
  _buttonTooltip = '';

  @ViewChild('dt') dt: Table;

  constructor(
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService, // ActivityLog - Default
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
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
    this.logSvc.ActionLog(PageNames.EmployeesbyBillingCode, '', 'Reports', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
        if (data !== undefined && data !== null && data.length > 0) {
          this.ClearAllProperties();
          this.IsSecure = true;
          this.Initialisations();
        } else {
          this.router.navigate(['/access'], { queryParams: { Message: 'Access Denied' } }); // Access Denied
        }
        this.showSpinner = false;
      });
  }
  ClearAllProperties() {
    this._buttonLabel = 'Show Billing Codes';
    this._buttonTooltip = 'Show the billing codes that match your choices';
    this._nonBillables = [];
    this._billingCodesSpecial = new BillingCodesSpecial();
    this.types = [];
    this.assignStatus = [];
    this.billingType = [];
    this.selectedassignStatus = 0;
    this.selectedType = 0;
    this.selectedBillingType = 0;

    this._selectcheckbox = [];
    this._displayCheckBoxes = [];

    this._clients = [];
    this._selectString = '';
    this.showBillingCodeList = false;
    this.allcheckbox = false;

    this.changeCodeList = false;

    this._reports = [];
    this.cols = {};

    this._recData = 0;
    this.showReport = false;
    this.resetSort();
  }

  Initialisations() {
    this.showSpinner = true;
    this._DateFormat = this.commonSvc.getAppSettingsValue('DateFormat').toString();
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat').toString();
    this.types = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.assignStatus = [
      { label: 'Active', value: 0 },
      { label: 'Inactive', value: 1 },
      { label: 'Both', value: 2 }
    ];
    this.billingType = [
      { label: 'Billing Code', value: 0 },
      { label: 'Project', value: 1 },
      { label: 'Non-Billable', value: 2 }
    ];
    this.cols = [
      { field: 'Name', header: 'Name', align: 'left', width: '25em' },
      { field: 'Key', header: 'Code', align: 'left', width: '15em' },
      { field: 'Inactive', header: 'Inactive', align: 'center', width: '10em' },
      { field: 'InactiveRel', header: 'Currently Associated', align: 'center', width: '8em' },
      { field: 'LastName', header: 'Last Name', align: 'left', width: '15em' },
      { field: 'FirstName', header: 'First Name', align: 'left', width: '15em' },
      { field: 'Salaried', header: 'Salaried', align: 'center', width: '10em' },
    ];
    this.selectedType = 0;
    this.selectedBillingType = 0;
    this.selectedassignStatus = 0;
    this.showSpinner = false;
  }
  showBillingCodes() {
    this.showSpinner = true;
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      selectedType: this.selectedType,
      selectedBillingType: this.selectedBillingType,
    }
    this.logSvc.ActionLog(PageNames.EmployeesbyBillingCode, '', 'Reports/Event', 'showBillingCodes',
      'showBillingCodes', '', '', JSON.stringify(ActivityParams)); // ActivityLog
    this._displayCheckBoxes = [];
    if (this.selectedBillingType === 0) {
      this.timesysSvc.getClients().subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            if (this.selectedType < 2) {
              data = data.filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
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
          this._selectString = 'Billing Codes (' + this._clients.length + ' matching codes found)';
          this._selectedString = 'Billing Code';
          this.showBillingCodeList = true;
          this.showSpinner = false;
        }
      );
    } else if (this.selectedBillingType === 1) {
      this.timesysSvc.getProjects('').subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            if (this.selectedType < 2) {
              this._projects = data[0].filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
            } else {
              this._projects = data[0];
            }
          }
          for (let i = 0; i < this._projects.length; i++) {
            this._displayCheckBoxes.push({ label: this._projects[i].ProjectName, value: this._projects[i].Key });
          }
          this._selectString = 'Projects (' + this._projects.length + ' matching codes found)';
          this._selectedString = 'Project';
          this.showBillingCodeList = true;
          this.showSpinner = false;
        }
      );
    } else {
      this.timesysSvc.getNonBillables('').subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            if (this.selectedType < 2) {
              this._nonBillables = data[0].filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
            } else {
              this._nonBillables = data[0];
            }
          }
          for (let i = 0; i < this._nonBillables.length; i++) {
            this._displayCheckBoxes.push({ label: this._nonBillables[i].ProjectName, value: this._nonBillables[i].Key });
          }
          this._selectString = 'Non-Billables (' + this._nonBillables.length + ') matching codes found';
          this._selectedString = 'Non-Billable';
          this.showBillingCodeList = true;
          this.showSpinner = false;
        }
      );
    }
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
    if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
      this.allcheckbox = true;
    } else {
      this.allcheckbox = false;
    }
  }
  generateReport() {
    this.showSpinner = true;
    this.showReport = false;
    if (this._selectcheckbox.length > 0) {
      this._billingCodesSpecial = new BillingCodesSpecial();
      if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
        this._billingCodesSpecial.value = '';
      } else {
        this._billingCodesSpecial.value = this._selectcheckbox.join();
      }
      this._billingCodesSpecial.codeStatus = this.selectedType.toString();
      this._billingCodesSpecial.relStatus = this.selectedassignStatus.toString();
      this.logSvc.ActionLog(PageNames.EmployeesbyBillingCode, '', 'Reports/Event', 'generateReport', 'Generate Report', '', '', JSON.stringify(this._billingCodesSpecial)); // ActivityLog
      if (this.selectedBillingType === 0) {
        // tslint:disable-next-line:max-line-length
        this.timesysSvc.listAllClientItemsForBillingCodesPost(this._billingCodesSpecial).subscribe(
          (data) => {
            this.showTable(data);
          }
        );
      } else if (this.selectedBillingType === 1) {
        this.timesysSvc.listAllProjectDataForBillingCodesPost(this._billingCodesSpecial).subscribe(
          (data) => {
            this.showTable(data);
          }
        );
      } else {
        this.timesysSvc.listAllBillingItemsForBillingCodesPost(this._billingCodesSpecial).subscribe(
          (data) => {
            this.showTable(data);
          }
        );
      }
    }
  }
  showTable(data: any) {
    this.showReport = false;
    this._reports = [];
    this._recData = 0;
    if (data !== undefined && data !== null && data.length > 0) {
      this._reports = data;
      this.showReport = true;
    }
    this._recData = this._reports.length;
    this.showBillingCodeList = false;
    this.changeCodeList = true;
    this.showSpinner = false;
    this.resetSort();
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._selectcheckbox = [];
    this.allcheckbox = false;
    this.selectedassignStatus = 0;
    this.showSpinner = false;
    this.resetSort();
  }
  changeCodes() {
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
    this.resetSort();
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, [], []);
  }
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }
  typeClick(evnt) {
    if (evnt.value === 0) {
      this._buttonLabel = 'Show Billing Codes';
      this._buttonTooltip = 'Show the billing codes that match your choices';
    } else if (evnt.value === 1) {
      this._buttonLabel = 'Show Projects';
      this._buttonTooltip = 'Show the Projects that match your choices';
    } else if (evnt.value === 2) {
      this._buttonLabel = 'Show Non-Billables';
      this._buttonTooltip = 'Show the Non-Billables that match your choices';
    }
  }
}
