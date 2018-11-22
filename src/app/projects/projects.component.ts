import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Projects, DrpList } from '../model/objects';
import { BillingCode } from '../model/constants';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
  _createdOn: string;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService) { }

  cols: any;
  _projects: Projects[] = [];
  _frm = new FormGroup({});

  _recData: string;
  _bc: BillingCode = new BillingCode();
  _projectId: any;
  _companies: DrpList[] = [];


  ngOnInit() {

    this._status = [
      { label: 'Active', value: '1' },
      { label: 'Inactive', value: '0' },
      { label: 'Both', value: '2' }
    ];
    this._selectedStatus = '1';

    this.cols = [
      { field: 'ProjectName', header: 'Project Name' },
      { field: 'Key', header: 'Code' },
      { field: 'CreatedOn', header: 'CreatedOn' },
    ];

    this.getCompanies();
    this.getProjects();

    this._frm.addControl('projectName', new FormControl(null, Validators.required));
    this._frm.addControl('projectCode', new FormControl(null, Validators.required));
    this._frm.addControl('parentCompany', new FormControl(null, null));
    this._frm.addControl('projectStatus', new FormControl(null, null));
  }

  changeStatus() {
    if (this._selectedStatus === '2') {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name' },
        { field: 'Key', header: 'Code' },
        { field: 'Inactive', header: 'Inactive' },
        { field: 'CreatedOn', header: 'CreatedOn' },
      ];
    } else {
      this.cols = [
        { field: 'ProjectName', header: 'Project Name' },
        { field: 'Key', header: 'Code' },
        { field: 'CreatedOn', header: 'CreatedOn' },
      ];
    }
    this.getProjects();
  }

  getCompanies() {
    this.timesysSvc.getCompanies()
      .subscribe(
        (data) => {
          this._companies.push({ label: '', value: '' });
          for (let r = 0; r < data.length; r++) {
            this._companies.push({ label: data[r].CompanyName, value: data[r].Id.toString() });
          }
        }
      );
  }

  getProjects() {
    this.timesysSvc.getProjects(this._bc.Project)
      .subscribe(
        (data) => {
          console.log(this._selectedStatus);
          console.log(JSON.stringify(data[0]));
          if (this._selectedStatus === '1') {
            this._projects = data[0].filter((s) => s.Inactive === false);
          } else if (this._selectedStatus === '0') {
            this._projects = data[0].filter((s) => s.Inactive === true);
          } else {
            this._projects = data[0];
          }
          this._recData = this._projects.length + ' matching projects';

          let _tmpCharge: Projects[] = [];
          _tmpCharge = data[1];

          for (let r = 0; r < this._projects.length; r++) {
            const exists = _tmpCharge.filter((f) => f.Id === this._projects[r].Id).length;
            if (exists > 0) {
              this._projects[r].CanBeDeleted = 1;
            }
          }

        }
      );
  }

  deleteProject(data: Projects) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.ProjectName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
      },
      reject: () => {
        /* do nothing */
      }

    });
  }

  addProject() {
    this.projectDialog = true;
    this.projectHdr = 'Add New Project';
    this._projectId = '';
    this._createdOn = '';
    this.resetForm();
    this.addControls(undefined);
  }

  addControls(data: Projects) {
    this._frm.controls['projectName'].setValue(data.ProjectName);
    this._frm.controls['projectCode'].setValue(data.Key);
    this._frm.controls['parentCompany'].setValue(data.CompanyId.toString());
    this._frm.controls['projectStatus'].setValue(data.Inactive === true ? 'true' : 'false');

  }

  editProject(data: Projects) {
    this.projectDialog = true;
    this.projectHdr = 'Edit Project';
    this._projectId = data.Id;
    this._createdOn = data.CreatedOn;
    this.resetForm();
    this.addControls(data);
  }

  cancelProject() {
    this.projectDialog = false;
  }

  saveProject() {
    this.projectDialog = false;
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


}
