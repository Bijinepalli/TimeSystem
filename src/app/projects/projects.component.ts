import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Projects, DrpList } from '../model/objects';
import { BillingCode } from '../model/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';

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
  visibleHelp: boolean;
  helpText: string;
  DisplayDateTimeFormat = '';

  constructor(
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
    private datePipe: DatePipe,
  ) { }

  cols: any;
  _bc: BillingCode = new BillingCode();
  _projects: Projects[] = [];
  _companies: DrpList[] = [];
  _recData: string;

  _frm = new FormGroup({});
  _IsEdit = false;
  _selectedProject: Projects;
  chkInactive = false;

  _HasEdit = true;

  ngOnInit() {
    this.DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat');

    this.CheckSecurity();

    this._status = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
      { label: 'Both', value: '2' }
    ];
    this._selectedStatus = '1';

    this.cols = [
      { field: 'ProjectName', header: 'Project Name', align: 'left', width: 'auto' },
      { field: 'Key', header: 'Code', align: 'left', width: '250px' },
      { field: 'CreatedOn', header: 'Created On', align: 'center', width: '250px' },
    ];
    this.addControls();
    this.getProjects();
    this.getCompanies();
  }

  CheckSecurity() {
    this._HasEdit = true;
    this.route.queryParams.subscribe(params => {
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(),
          params['Id'].toString())
          .subscribe((data) => {
            if (data != null && data.length > 0) {
              if (data[0].HasEdit) {
                this._HasEdit = false;
              }
            }
          });
      }
    });
  }

  changeStatus() {
    if (this._selectedStatus === '2') {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name', align: 'left', width: 'auto' },
        { field: 'Key', header: 'Code', align: 'left', width: '250px' },
        { field: 'Inactive', header: 'Inactive', align: 'center', width: '120px' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '120px' },
      ];
    } else {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name', align: 'left', width: 'auto' },
        { field: 'Key', header: 'Code', align: 'left', width: '250px' },
        { field: 'CreatedOn', header: 'Created On', align: 'center', width: '120px' },
      ];
    }
    this.getProjects();
  }

  getCompanies() {
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
        }
      );
  }

  getProjects() {
    this.timesysSvc.getProjects(this._bc.Project)
      .subscribe(
        (data) => {
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
            } else {
              this._projects = [];
            }
          } else {
            this._projects = [];
          }

          if (this._projects !== null && this._projects.length > 0) {
            this._recData = this._projects.length + ' matching projects';
          } else {
            this._recData = 'No projects found';
          }
        }
      );
  }

  addProject() {
    this._IsEdit = false;
    this.chkInactive = false;
    this._selectedProject = {};
    this.resetForm();
    this.setDataToControls(this._selectedProject);
    this.projectHdr = 'Add New Project';
    this.projectDialog = true;
  }

  editProject(data: Projects) {
    this._IsEdit = true;
    this.chkInactive = false;
    this._selectedProject = data;
    this.resetForm();
    this.setDataToControls(data);
    this.projectHdr = 'Edit Project';
    this.projectDialog = true;
  }

  addControls() {
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
    this._frm.controls['projectName'].setValue(data.ProjectName);
    this._frm.controls['projectCode'].setValue(data.Key);
    if (data.CompanyId !== undefined) {
      this._frm.controls['parentCompany'].setValue(data.CompanyId.toString());
    }
    if (data.Inactive !== undefined) {
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

  clearControls() {
    this._IsEdit = false;
    this._selectedProject = null;
    this.chkInactive = false;
    this.resetForm();
    this.projectHdr = 'Add New Project';
    this.projectDialog = false;
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

  cancelProject() {
    this.clearControls();
  }

  saveProject() {
    if (this._IsEdit === false) {
      if (this._selectedProject === undefined || this._selectedProject === null) {
        this._selectedProject = {};
      }
      this._selectedProject.Id = -1;
    }
    this._selectedProject.ProjectName = this._frm.controls['projectName'].value.toString().trim();
    this._selectedProject.Key = this._frm.controls['projectCode'].value.toString().toUpperCase().trim();
    if (this._frm.controls['parentCompany'].value !== null && this._frm.controls['parentCompany'].value !== undefined) {
      this._selectedProject.CompanyId = this._frm.controls['parentCompany'].value.toString().trim();
    }
    this._selectedProject.Inactive = this.chkInactive;
    this._selectedProject.ChargeType = this._bc.Project;
    this.SaveProjectSPCall();
  }

  SaveProjectSPCall() {
    this.timesysSvc.Project_InsertOrUpdate(this._selectedProject)
      .subscribe(
        (outputData) => {
          if (outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: 'alert',
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage
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
        this.timesysSvc.Project_Delete(data)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: 'alert',
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage
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
