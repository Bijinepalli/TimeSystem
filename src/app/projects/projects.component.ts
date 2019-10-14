import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, ViewChild } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Projects, DrpList, PageNames } from '../model/objects';
import { BillingCode } from '../model/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { Table } from 'primeng/table';
import { ActivitylogService } from '../service/activitylog.service'; // ActivityLog - Default

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  _selectedStatus: string;
  _status: { label: string; value: string; }[];
  projectDialog: boolean;
  projectHdr: string;
  _DisplayDateTimeFormat = '';
  cols: any;
  _bc: BillingCode = new BillingCode();
  _projects: Projects[] = [];
  _companies: DrpList[] = [];
  _recData = 0;

  _frm = new FormGroup({});
  _IsEdit = false;
  _selectedProject: Projects;
  chkInactive = false;
  showSpinner = false;

  _HasEdit = true;

  ParamSubscribe: any;
  IsSecure: boolean;
  showReport: boolean;
  _sortArray: string[];
  _DisplayDateFormat: any;
  _OldCompanyID = '';

  @ViewChild('dt') dt: Table;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    public commonSvc: CommonService,
    private route: ActivatedRoute,
    private logSvc: ActivitylogService, // ActivityLog - Default
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
    this.logSvc.ActionLog(PageNames.Projects, '', 'Pages', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this._DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat');
    this._status = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
      { label: 'Both', value: '2' }
    ];
    this._selectedStatus = '1';

    this.cols = [
      { field: 'ProjectName', header: 'Project Name', align: 'left', width: '60em' },
      { field: 'Key', header: 'Code', align: 'left', width: '18em' },
      { field: 'CreatedOn', header: 'Created On', align: 'center', width: '11em' },
    ];
    this._sortArray = ['ProjectName', 'Key', 'CreatedOnSearch'];
    this.addControls();
    this.showSpinner = false;
    this.getProjects();
    this.getCompanies();
  }
  ClearAllProperties() {
    this.showSpinner = true;
    this._selectedStatus = '';
    this._status = [];
    this.projectDialog = false;
    this.projectHdr = '';
    this.cols = {};
    this._bc = new BillingCode();
    this.resetSort();
    this._projects = [];
    this._companies = [];
    this._recData = 0;
    this._frm = new FormGroup({});
    this._IsEdit = false;
    this._selectedProject = new Projects();
    this.chkInactive = false;
    this.showSpinner = false;
    this._HasEdit = true;
  }
  changeStatus() {
    this.showSpinner = true;
    if (this._selectedStatus === '2') {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name', align: 'left', width: '60em' },
        { field: 'Key', header: 'Code', align: 'left', width: '18em' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '11em' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '11em' },
      ];
    } else {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name', align: 'left', width: '60em' },
        { field: 'Key', header: 'Code', align: 'left', width: '18em' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '11em' },
      ];
    }
    this._sortArray = ['ProjectName', 'Key', 'Inactive', 'CreatedOnSearch'];
    this.showSpinner = false;
    this.getProjects();
  }

  getCompanies() {
    this.showSpinner = true;
    this.timesysSvc.getCompanies()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            for (let r = 0; r < data.length; r++) {
              this._companies.push({ label: data[r].CompanyName, value: data[r].Id.toString() });
            }
          } else {
            this._companies = [];
          }
          this.showSpinner = false;
        }
      );
  }

  getProjects() {
    this.showSpinner = true;
    this.showReport = false;
    this.resetSort();
    this._recData = 0;
    this.timesysSvc.getProjects(this._bc.Project)
      .subscribe(
        (data) => {
          this._projects = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            if (data[0] !== undefined && data[0] !== null && data[0].length > 0) {
              if (this._selectedStatus === '1') {
                this._projects = data[0].filter((s) => s.Inactive === false);
              } else if (this._selectedStatus === '0') {
                this._projects = data[0].filter((s) => s.Inactive === true);
              } else {
                this._projects = data[0];
              }
              if (data[1] !== undefined && data[1] !== null && data[1].length > 0
                && this._projects !== null && this._projects.length > 0) {
                let _tmpCharge: Projects[] = [];
                _tmpCharge = data[1];

                for (let r = 0; r < this._projects.length; r++) {
                  const exists = _tmpCharge.filter((f) => f.Id === this._projects[r].Id).length;
                  if (exists > 0) {
                    this._projects[r].CanBeDeleted = 1;
                  }
                }
              }
            }
          }

          this._recData = this._projects.length;

          this.showReport = true;
          this.showSpinner = false;
        }
      );
  }

  addProject() {
    this._IsEdit = false;
    this.chkInactive = false;
    this._selectedProject = {};
    this.resetForm();
    this.logSvc.ActionLog(PageNames.Projects,
      '', 'Pages/Event', 'addProject', 'Add Project', '', '', JSON.stringify(this._selectedProject)); // ActivityLog
    this.setDataToControls(this._selectedProject);
    this.projectHdr = 'Add New Project';
    this.projectDialog = true;
  }

  editProject(data: Projects) {
    this._IsEdit = true;
    this.chkInactive = false;
    this._selectedProject = new Projects();
    this._selectedProject.Id = data.Id;
    this._selectedProject.ProjectName = data.ProjectName;
    this._selectedProject.Key = data.Key;
    this._selectedProject.CompanyId = data.CompanyId;
    this._selectedProject.Inactive = data.Inactive;
    this._selectedProject.CreatedOn = data.CreatedOn;
    this.resetForm();
    this.logSvc.ActionLog(PageNames.Projects,
      '', 'Pages/Event', 'editProject', 'Edit Project', '', '', JSON.stringify(this._selectedProject)); // ActivityLog
    this.setDataToControls(this._selectedProject);
    this.projectHdr = 'Edit Project';
    this.projectDialog = true;
  }

  addControls() {
    this._frm = new FormGroup({});
    this._frm.addControl('projectName', new FormControl(null, Validators.required));
    this._frm.addControl('projectCode', new FormControl(null,
      [Validators.required,
      Validators.pattern('^[a-zA-Z0-9\\040\\047\\046\\055\\056\\057]*$'),
      ]
    ));
    this._frm.addControl('parentCompany', new FormControl(null, null));
    this.chkInactive = false;
  }

  setDataToControls(data: Projects) {
    if (!this.IsControlUndefined('projectName')) {
      if (data.ProjectName !== undefined && data.ProjectName !== null && data.ProjectName.toString() !== '') {
        this._frm.controls['projectName'].setValue(data.ProjectName.toString());
      }
    }
    if (!this.IsControlUndefined('projectCode')) {
      if (data.ProjectName !== undefined && data.ProjectName !== null && data.ProjectName.toString() !== '') {
        this._frm.controls['projectCode'].setValue(data.Key.toString());
      }
    }
    this._OldCompanyID = '';
    if (data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId.toString() !== '-1') {
      this._frm.controls['parentCompany'].setValue(data.CompanyId.toString());
      this._OldCompanyID = data.CompanyId.toString();
    }
    if (!this.IsControlUndefined('parentCompany')) {
      if (data.ProjectName !== undefined && data.ProjectName !== null && data.ProjectName.toString() !== '') {
        this._frm.controls['parentCompany'].setValue(data.CompanyId.toString());
      }
    }
    if (data.Inactive !== undefined && data.Inactive !== null) {
      this.chkInactive = data.Inactive;
    } else {
      this.chkInactive = false;
    }
  }

  hasFormErrors() {
    return !this._frm.valid;
  }

  resetForm() {
    this._frm.markAsPristine();
    this._frm.markAsUntouched();
    this._frm.updateValueAndValidity();
    this._frm.reset();
  }

  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }

  clearControls() {
    this._IsEdit = false;
    this._selectedProject = null;
    this.chkInactive = false;
    this.resetForm();
    this.projectHdr = 'Add New Project';
    this.projectDialog = false;
  }

  cancelProject() {
    this.clearControls();
  }

  saveProject() {
    this.showSpinner = true;
    if (this._IsEdit === false) {
      if (this._selectedProject === undefined || this._selectedProject === null) {
        this._selectedProject = {};
      }
      this._selectedProject.Id = -1;
    }
    if (!this.IsControlUndefinedAndHasValue('projectName')) {
      this._selectedProject.ProjectName = this._frm.controls['projectName'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('projectCode')) {
      this._selectedProject.Key = this._frm.controls['projectCode'].value.toString().toUpperCase().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('parentCompany')) {
      this._selectedProject.CompanyId = this._frm.controls['parentCompany'].value.toString().trim();
    }
    this._selectedProject.Inactive = this.chkInactive;
    this._selectedProject.ChargeType = this._bc.Project;
    this.showSpinner = false;
    this.checkWarnings();
  }
  checkWarnings() {
    let errorMsg = '';
    if (this.chkInactive) {
      if (this._IsEdit) {
        this.timesysSvc.IsBillingCodeUsedOnAnyPendingTimesheets(this._selectedProject.Id.toString(), this._bc.Project)
          .subscribe(
            (outputData) => {
              if (outputData !== undefined && outputData !== null && outputData.length > 0) {
                errorMsg += 'Inactivating this project will remove it and associated hours from all unsubmitted timesheets.<br>';
              } else {
                errorMsg += 'Project is marked as inactive. It will not appear on new timesheets.<br>';
              }
              if (errorMsg.trim() !== '') {
                this.showConfirmation(errorMsg, 0);
              } else {
                this.CheckDBWarnings();
              }
            });
      } else {
        this.CheckDBWarnings();
      }
    } else {
      if (this.IsControlUndefinedAndHasValue('parentCompany')) {
        errorMsg += 'No company was selected. No holiday schedule will be assigned to this client.<br>';
      }
      if (errorMsg.trim() !== '') {
        this.showConfirmation(errorMsg, 0);
      } else {
        this.CheckDBWarnings();
      }
    }
  }

  showConfirmation(errorMsg: string, mode: number) {
    this.confSvc.confirm({
      message: errorMsg + 'Do you want to continue?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (mode === 0) {
          this.CheckDBWarnings();
        } else {
          this.SaveProjectSPCall();
        }
      },
      reject: () => {
      }
    });
  }


  CheckDBWarnings() {
    let errorMsg = '';
    if (this._IsEdit) {
      if (this._OldCompanyID !== '' && !this.IsControlUndefinedAndHasValue('parentCompany')) {
        this.timesysSvc.CompaniesHaveSameHolidays(this._OldCompanyID.toString(),
          this._frm.controls['parentCompany'].value.toString().trim())
          .subscribe(
            (outputData) => {
              this.timesysSvc.HolidayHoursChargedToCompany(this._OldCompanyID.toString())
                .subscribe(
                  (outputData1) => {
                    if (outputData !== undefined && outputData !== null && outputData.length > 0) {
                      errorMsg += 'The new company has different holidays which effects submitted timesheets. The company was reset.<br>';
                      this._frm.controls['parentCompany'].setValue(this._OldCompanyID.toString());
                    }
                    // if (errorMsg.trim() === '' && outputData1 !== undefined && outputData1 !== null && outputData1.length > 0) {
                    //   if (+outputData1[0].TotalHours > 0) {
                    //     errorMsg += 'The old company have hours assigned to its holidays.<br>';
                    //   }
                    // }
                    if (errorMsg.trim() !== '') {
                      this.msgSvc.add({
                        key: 'alert',
                        sticky: true,
                        severity: 'warn',
                        summary: 'Info Message',
                        detail: errorMsg
                      });
                    } else {
                      this.SaveProjectSPCall();
                    }
                  });
            });
      } else {
        this.SaveProjectSPCall();
      }
    } else {
      this.SaveProjectSPCall();
    }
  }
  IsControlUndefined(ctrlName: string): boolean {
    let IsUndefined = true;
    if (this._frm.controls[ctrlName] !== undefined &&
      this._frm.controls[ctrlName] !== null
    ) {
      IsUndefined = false;
    }
    return IsUndefined;
  }

  IsControlUndefinedAndHasValue(ctrlName: string): boolean {
    let IsUndefined = true;
    if (this._frm.controls[ctrlName] !== undefined &&
      this._frm.controls[ctrlName] !== null &&
      this._frm.controls[ctrlName].value !== undefined &&
      this._frm.controls[ctrlName].value !== null &&
      this._frm.controls[ctrlName].value.toString().trim() !== ''
    ) {
      IsUndefined = false;
    }
    return IsUndefined;
  }


  SaveProjectSPCall() {
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.Projects,
      '', 'Pages/Event', 'SaveProjectSPCall', 'Save Project', '', '', JSON.stringify(this._selectedProject)); // ActivityLog
    this.timesysSvc.Project_InsertOrUpdate(this._selectedProject)
      .subscribe(
        (outputData) => {
          this.showSpinner = false;
          if (outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: outputData.ErrorType,
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage,
              data: outputData.ExceptionDetails,
            });
          } else {
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Project saved successfully' });
            this.clearControls();
            this.getProjects();
          }
        },
        (error) => {
          console.log(error);
        });
  }
  deleteProject(data: Projects) {

    data.ChargeType = this._bc.Project;
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.ProjectName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.showSpinner = true;
        this.logSvc.ActionLog(PageNames.Projects,
          '', 'Pages/Event', 'deleteProject', 'Delete Project', '', '', JSON.stringify(data)); // ActivityLog
        this.timesysSvc.Project_Delete(data)
          .subscribe(
            (outputData) => {
              this.showSpinner = false;
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: outputData.ErrorType,
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage,
                  data: outputData.ExceptionDetails,
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: 'Project deleted successfully'
                });
                this.getProjects();
              }
            },
            (error) => {
              console.log(error);
            });
      },
      reject: () => {
        /* do nothing */
      }
    });
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['CreatedOn'], []);
  }
}
