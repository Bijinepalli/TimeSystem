import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Departments, Employee, PageNames } from '../model/objects';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { DatePipe } from '@angular/common';
import { OverlayPanel, SortEvent } from 'primeng/primeng';
import { environment } from 'src/environments/environment';
import { ActivitylogService } from '../service/activitylog.service';
import { TreeNode } from 'primeng/api';




@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.css'],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None,
})



export class DepartmentsComponent implements OnInit {
  mailBody: string;
  ParamSubscribe: any;

  cols: any;
  _recData = 0;
  _HasEdit = false;

  _departmentList: Departments[] = [];

  _frmDepartment = new FormGroup({});
  _IsEditDepartment = false;
  _departmentsPageNo: number;

  departmentHdr = '';
  departmentDialog = false;
  _selectedDepartment: Departments;

  mailDialog = false;

  empcols: any;
  _recDataEmp: any;
  _deptEmployeesList: Employee[] = [];
  deptEmployeesDialog = false;
  _deptEmployeePageNo: number;
  deptEmployeeHdr = '';
  showSpinner: boolean;
  IsSecure: boolean;
  showReport: boolean;

  previousOPs: any[] = [];

  files: TreeNode[];
  maxDate: Date;
  invalidDate: Date;
  invalidDates: any[];



  /* #region Constructor */
  // tslint:disable-next-line:max-line-length
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService,
    public commonSvc: CommonService,
    public datepipe: DatePipe,

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
    this.maxDate = new Date();

    const invalidDate = new Date();
    invalidDate.setDate(this.maxDate.getDate() - 1);
    this.invalidDates = [this.maxDate, invalidDate];
    console.log(this.invalidDates);

    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.Departments, '', 'Pages', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
    this.IsSecure = false;
    this.ParamSubscribe = this.route.queryParams.subscribe(params => {
      this.IsSecure = false;
      if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
        const SplitVals = params['Id'].toString().split('@');
        this.CheckSecurity(SplitVals[SplitVals.length - 1]);
      } else {
        this.router.navigate(['/access'], { queryParams: { Message: 'Invalid Link/Page Not Found' } }); // Invalid URL
      }
    });

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

  ClearAllProperties() {
    this.showSpinner = true;
    this.cols = {};
    this._recData = 0;

    this._departmentsPageNo = 0;
    this._departmentList = [];
    this._HasEdit = true;
    this.showReport = false;
    this.showSpinner = false;
  }

  Initialisations() {
    this.showSpinner = true;
    this.cols = [
      { field: 'Name', header: 'Department Name', align: 'left', width: '250px' },
      { field: 'Description', header: 'Description', align: 'left', width: 'auto' },
      { field: 'EmployeesCount', header: 'Employees Associated', align: 'right', width: 'auto' },
    ];
    this.empcols = [
      { field: 'Name', header: 'Employee Name', align: 'left', width: '150px' },
      { field: 'EmailAddress', header: 'Email', align: 'left', width: 'auto' },
    ];
    this.AddFormControls();
    this.showSpinner = false;
    this.GetMethods();
  }

  AddFormControls() {
    this.addControlsDepartment();
  }

  GetMethods() {
    this.getDepartments();
  }


  getDepartments() {
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.Departments, '', 'Pages/Event', 'getDepartments', 'Get Departments', '', '', ''); // ActivityLog
    this.showReport = false;
    this._recData = 0;
    this.timesysSvc.getDepartments('')
      .subscribe((data) => {
        if (data !== undefined && data !== null && data.length > 0) {
          this._departmentList = data;
          this._recData = data.length;
        }
        this.showReport = true;
        this.showSpinner = false;
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
    this.logSvc.ActionLog(PageNames.Departments, '', 'Pages/Event', 'addDepartment', 'Add Department', '', '', ''); // ActivityLog
    this._IsEditDepartment = true;
    this._selectedDepartment = {};
    this.resetFormDepartment();
    this.setDataToControlsEmployee({});
    this.departmentHdr = 'Add New Department';
    this.departmentDialog = true;
  }



  editDepartment(data: Departments) {
    this.logSvc.ActionLog(PageNames.Departments, '', 'Pages/Event', 'editDepartment', 'Edit Department', '', 
    '', JSON.stringify(data)); // ActivityLog
    this._IsEditDepartment = true;
    this._selectedDepartment = new Departments();
    this._selectedDepartment.Id = data.Id;
    this._selectedDepartment.Name = data.Name;
    this._selectedDepartment.Status = data.Status;
    this._selectedDepartment.EmployeeId = data.EmployeeId;
    this._selectedDepartment.EmployeesCount = data.EmployeesCount;
    this._selectedDepartment.Description = data.Description;
    this.resetFormDepartment();
    this.setDataToControlsEmployee(data);
    this.departmentHdr = 'Edit Department';
    this.departmentDialog = true;
  }

  showEmployees(event, dataRow: Departments, overlaypanel: OverlayPanel) {
    this.logSvc.ActionLog(PageNames.Departments, '', 'Pages/Event', 'showEmployees', 'Show Employees', '', 
    '', JSON.stringify(dataRow)); // ActivityLog
    this.deptEmployeeHdr = 'Employees associated with department';
    this._deptEmployeePageNo = 0;
    if (this.previousOPs !== undefined && this.previousOPs !== null && this.previousOPs.length > 0) {
      for (let cnt = 0; this.previousOPs.length > 0 && cnt < this.previousOPs.length; cnt++) {
        if (this.previousOPs[cnt].overlaypanel !== undefined && this.previousOPs[cnt].overlaypanel !== null) {
          this.previousOPs[cnt].overlaypanel.hide();
        }
        this.previousOPs.splice(cnt, 1);
        cnt--;
      }
    }
    this.previousOPs.push({ eveny: event, overlaypanel: overlaypanel });
    this.timesysSvc.departmentEmployee_Get(dataRow.Id.toString())
      .subscribe(
        (outputData) => {
          this.deptEmployeesDialog = true;
          if (outputData !== undefined && outputData !== null && outputData.length > 0) {
            this._deptEmployeesList = outputData;
            this._recDataEmp = outputData.length + ' employees found';
            overlaypanel.toggle(event);
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
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.Departments, '', 'Pages/Event', 'SaveDepartment', 'Save Department', 
    '', '', JSON.stringify(this._selectedDepartment)); // ActivityLog
    this.timesysSvc.Department_InsertOrUpdate(this._selectedDepartment)
      .subscribe(
        (outputData) => {
          this.showSpinner = false;
          if (outputData !== undefined && outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: 'alert',
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage,
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
    this.logSvc.ActionLog(PageNames.Departments, '', 'Pages/Event', 'deleteDepartment', 'Delete Department', '', 
    '', JSON.stringify(dataRow)); // ActivityLog
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.Name + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.showSpinner = true;
        this.timesysSvc.Department_Delete(dataRow)
          .subscribe(
            (outputData) => {
              this.showSpinner = false;
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
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, [], ['EmployeesCount']);
  }






}
