import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Departments, Employee } from '../model/objects';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css'],
  providers: [DatePipe]
})
export class DepartmentsComponent implements OnInit {

  ParamSubscribe: any;

  cols: any;
  _recData: any;
  visibleHelp = false;
  helpText: string;
  _HasEdit = false;

  _departmentList: Departments[] = [];

  _frmDepartment = new FormGroup({});
  _IsEditDepartment = false;
  _departmentsPageNo: number;

  departmentHdr = '';
  departmentDialog = false;
  _selectedDepartment: Departments;

  empcols: any;
  _recDataEmp: any;
  _deptEmployeesList: Employee[] = [];
  deptEmployeesDialog = false;
  _deptEmployeePageNo: number;
  deptEmployeeHdr = '';


  /* #region Constructor */
  // tslint:disable-next-line:max-line-length
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private commonSvc: CommonService,
    public datepipe: DatePipe
  ) { }
  /* #endregion*/

  /* #region Page Life Cycle Methods*/
  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    this.ParamSubscribe.unsubscribe();
  }

  ngOnInit() {
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      this.ClearAllProperties();
      this.Initialisations();
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        this.CheckSecurity(params['Id'].toString());
        this.AddFormControls();
        this.GetMethods();
      }
    });
  }
  /* #endregion */

  ClearAllProperties() {
    this.cols = {};
    this._recData = '';

    this._departmentsPageNo = 0;
    this._departmentList = [];
    this._HasEdit = true;
  }

  Initialisations() {
    this.cols = [
      { field: 'Name', header: 'Department Name' },
      { field: 'Description', header: 'Description' },
      { field: 'EmployeesCount', header: 'Employees Associated' },
    ];
    this.empcols = [
      { field: 'Name', header: 'Employee Name' },
      { field: 'EmailAddress', header: 'Email' },
    ];
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

  AddFormControls() {
    this.addControlsDepartment();
  }

  GetMethods() {
    this.getDepartments();
  }

  getDepartments() {
    this.timesysSvc.getDepartments('')
      .subscribe((data) => {
        if (data !== undefined && data !== null && data.length > 0) {
          this._departmentList = data;
          this._recData = data.length + ' departments found';
        }
      });
  }

  addControlsDepartment() {
    this._frmDepartment.addControl('frmName', new FormControl(null, Validators.required));
    this._frmDepartment.addControl('frmDescription', new FormControl(null, null));
  }

  setDataToControlsEmployee(data: Departments) {
    this._frmDepartment.controls['frmName'].setValue(data.Name);
    if (data.Description !== undefined && data.Description !== null && data.Description.toString() !== '') {
      this._frmDepartment.controls['frmDescription'].setValue(data.Description);
    }
  }

  hasFormErrorsDepartment() {
    return !this._frmDepartment.valid;
  }

  resetFormDepartment() {
    this._frmDepartment.markAsPristine();
    this._frmDepartment.markAsUntouched();
    this._frmDepartment.updateValueAndValidity();
    this._frmDepartment.reset();
  }

  clearControlsDepartment() {
    this._IsEditDepartment = true;
    this._selectedDepartment = null;
    this.resetFormDepartment();
    this.departmentHdr = 'Add New Department';
    this.departmentDialog = false;
    this.deptEmployeesDialog = false;
  }

  addDepartment() {
    this._IsEditDepartment = true;
    this._selectedDepartment = {};
    this.resetFormDepartment();
    this.setDataToControlsEmployee({});
    this.departmentHdr = 'Add New Department';
    this.departmentDialog = true;
  }

  editDepartment(data: Departments) {
    this._IsEditDepartment = true;
    this._selectedDepartment = data;
    this.resetFormDepartment();
    this.setDataToControlsEmployee(data);
    this.departmentHdr = 'Edit Department';
    this.departmentDialog = true;
  }

  showEmployees(dataRow: Departments) {
    this.deptEmployeeHdr = 'Employees associated with department';
    this._deptEmployeePageNo = 0;
    this.timesysSvc.departmentEmployee_Get(dataRow.Id.toString())
      .subscribe(
        (outputData) => {
          this.deptEmployeesDialog = true;
          if (outputData !== undefined && outputData !== null && outputData.length > 0) {
            console.log(outputData);
            this._deptEmployeesList = outputData;
            this._recDataEmp = outputData.length + ' employees found';
          }
        });
  }

  cancelDepartment() {
    this.clearControlsDepartment();
  }

  saveDepartment() {
    if (this._IsEditDepartment === false) {
      if (this._selectedDepartment === undefined || this._selectedDepartment === null) {
        this._selectedDepartment = {};
      }
      this._selectedDepartment.Id = -1;
    }
    if (this.IsControlUndefined('frmName')) {
      this._selectedDepartment.Name = '';
    } else {
      this._selectedDepartment.Name = this._frmDepartment.controls['frmName'].value.toString().trim();
    }
    if (this.IsControlUndefined('frmDescription')) {
      this._selectedDepartment.Description = '';
    } else {
      this._selectedDepartment.Description = this._frmDepartment.controls['frmDescription'].value.toString().trim();
    }
    this.SaveDepartmentSPCall();
  }

  IsControlUndefined(ctrlName: string): boolean {
    let IsUndefined = true;
    if (this._frmDepartment.controls[ctrlName] !== undefined &&
      this._frmDepartment.controls[ctrlName] !== null &&
      this._frmDepartment.controls[ctrlName].value !== undefined &&
      this._frmDepartment.controls[ctrlName].value !== null &&
      this._frmDepartment.controls[ctrlName].value.toString().trim() !== ''
    ) {
      IsUndefined = false;
    }
    return IsUndefined;
  }

  SaveDepartmentSPCall() {
    this.timesysSvc.Department_InsertOrUpdate(this._selectedDepartment)
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
              key: 'saveSuccess', severity: 'success',
              summary: 'Info Message', detail: 'Department saved successfully'
            });
            this.clearControlsDepartment();
            this.getDepartments();
          }
        },
        (error) => {
          console.log(error);
        });
  }

  deleteDepartment(dataRow: Departments) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.Name + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Department_Delete(dataRow)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '' && outputData.ErrorMessage !== '0') {
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
                  detail: 'Department deleted successfully'
                });
                this.getDepartments();
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
}
