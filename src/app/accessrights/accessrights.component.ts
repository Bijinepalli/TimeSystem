import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { SelectItem } from 'primeng/api';
import { MasterPages } from '../model/objects';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CommonService } from '../service/common.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-accessrights',
  templateUrl: './accessrights.component.html',
  styleUrls: ['./accessrights.component.css']
})
export class AccessrightsComponent implements OnInit {

  _recData: any;
  cols: any;
  _pages: MasterPages[] = [];
  _pagesbyroles: MasterPages[] = [];
  _selectedPage: MasterPages;
  _roles: SelectItem[];
  selectedRole: SelectItem[];
  _disableEdit = true;
  pageFormgroup: FormGroup;
  _showGrid = false;
  showSpinner = false;

  ParamSubscribe: any;
  IsSecure = false;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private commonSvc: CommonService,
    private route: ActivatedRoute,
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

  // @Input() set disableControl( condition : boolean ) {
  //   const action = condition ? 'disable' : 'enable';
  //   this.ngControl.control[action]();
  // }


  Initialisations() {
    this.pageFormgroup = this.fb.group({
      roleDrp: [''],
    });
    this._roles = [
      { label: 'Admin', value: 'A' },
      { label: 'Employee', value: 'E' },
      { label: 'Program Manager', value: 'P' },
    ];
    this.cols = [
      { field: 'ModuleName', header: 'Module' },
      { field: 'PageName', header: 'Page Name' },
      { field: 'HasEdit', header: 'Edit' },
    ];
    this.getPages();
  }

  ClearAllProperties() {
    this._recData = '';
    this.cols = {};
    this._pages = [];
    this._pagesbyroles = [];
    this._selectedPage = new MasterPages();
    this._roles = [];
    this.selectedRole = [];
    this._disableEdit = true;
    this.pageFormgroup = new FormGroup({});
    this._showGrid = false;
    this.showSpinner = false;
  }

  getPages() {
    this.timesysSvc.getMasterPages()
      .subscribe(
        (data) => {
          this._pages = data;
          this._recData = data.length + ' matching pages';
          for (let i = 0; i < this._pages.length; i++) {
            this.pageFormgroup.addControl('chkPage_' + this._pages[i].ID, new FormControl({ value: null, disabled: true }, null));
            this.pageFormgroup.addControl('editSwitch_' + this._pages[i].ID, new FormControl({ value: null, disabled: true }, null));
          }
        }
      );
  }

  toggleControls(id: string) {
    let chk: boolean;
    chk = this.pageFormgroup.get('chkPage_' + id).value;
    if (chk === true) {
      this.pageFormgroup.controls['chkPage_' + id].setValue(true);
      this.pageFormgroup.controls['editSwitch_' + id].enable();
    } else {
      this.pageFormgroup.controls['chkPage_' + id].setValue(false);
      this.pageFormgroup.controls['editSwitch_' + id].setValue(false);
      this.pageFormgroup.controls['editSwitch_' + id].disable();
    }

  }

  onRoleChange(e) {
    this._showGrid = true;
    this.resetControls();
    this.getPagesbyRole(e.value);
  }

  savePages() {
    const allSelections: MasterPages[] = [];
    for (let i = 0; i < this._pages.length; i++) {
      this._selectedPage = new MasterPages;
      const chk = this.pageFormgroup.get('chkPage_' + this._pages[i].ID).value;
      if (chk === true) {
        this._selectedPage.Role = this.pageFormgroup.get('roleDrp').value;
        this._selectedPage.PageId = this._pages[i].ID;
        this._selectedPage.HasView = 1;
        if (this.pageFormgroup.controls['editSwitch_' + this._pages[i].ID].value === true) {
          this._selectedPage.HasEdit = 1;
        } else {
          this._selectedPage.HasEdit = 0;
        }
        allSelections.push(this._selectedPage);
      }
    }
    this.timesysSvc.InsertAccessRights(allSelections)
      .subscribe(
        (data) => {
          if (data != null && data[0].Role.toString() === this.pageFormgroup.get('roleDrp').value.toString()) {
            this.getPages();
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Saved Successfully' });

            this.confSvc.confirm({
              message: 'Do you want to see the changes in action right away by logging in again?',
              header: 'Confirmation',
              icon: 'pi pi-exclamation-triangle',
              accept: () => {
                /* do nothing */
                this.router.navigate(['']);
              },
              reject: () => {
                /* do nothing */
              }
            });

          } else {
            this.msgSvc.add({ key: 'saveSuccess', severity: 'warn', summary: 'Info Message', detail: 'An Error Occurred' });
          }
        });
  }

  resetControls() {
    for (let i = 0; i < this._pages.length; i++) {
      this.pageFormgroup.controls['chkPage_' + this._pages[i].ID].enable();
      this.pageFormgroup.controls['chkPage_' + this._pages[i].ID].setValue(false);
      this.pageFormgroup.controls['editSwitch_' + this._pages[i].ID].disable();
      this.pageFormgroup.controls['editSwitch_' + this._pages[i].ID].setValue(false);
    }
  }

  getPagesbyRole(role: string) {
    this.timesysSvc.getPagesbyRoles(role, '0')
      .subscribe((data) => {
        if (data != null) {
          this._pagesbyroles = data;
          for (let i = 0; i < this._pagesbyroles.length; i++) {
            const id = this._pagesbyroles[i].PageId;
            if (this._pagesbyroles[i].HasView) {
              this.pageFormgroup.controls['chkPage_' + id].setValue(true);
              this.pageFormgroup.controls['editSwitch_' + id].enable();
              if (this._pagesbyroles[i].HasEdit) {
                this.pageFormgroup.controls['editSwitch_' + id].setValue(true);
              }
            }
          }
        }
      });
  }

  cancelPages() {
    this.resetControls();
    this.getPagesbyRole(this.pageFormgroup.get('roleDrp').value);
  }

}
