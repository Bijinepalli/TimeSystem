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
  _roles: SelectItem[];
  selectedRole: SelectItem[];
  _disableEdit = true;
  pageFormgroup: FormGroup;
  _showGrid = false;
  showSpinner = false;

  ParamSubscribe: any;
  IsSecure = false;

  colsSections: any;

  constructor(
    private timesysSvc: TimesystemService,
    private router: Router,
    private msgSvc: MessageService,
    private confSvc: ConfirmationService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    public commonSvc: CommonService,
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
    this.showSpinner = true;
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
    this.colsSections = [
      { field: 'ModuleName', header: 'Action/Section' },
      { field: 'HasEdit', header: 'Edit' },
    ];
    this.showSpinner = false;
    this.getPages();
  }

  ClearAllProperties() {
    this.showSpinner = true;
    this._recData = '';
    this.cols = {};
    this._pages = [];
    this._pagesbyroles = [];
    this._roles = [];
    this.selectedRole = [];
    this._disableEdit = true;
    this.pageFormgroup = new FormGroup({});
    this._showGrid = false;
    this.showSpinner = false;
  }

  getPages() {
    this.showSpinner = true;
    this.timesysSvc.getMasterPages()
      .subscribe(
        (data) => {
          this._pages = [];
          this._recData = '';
          if (data !== undefined && data !== null && data.length > 0) {
            this._pages = data;
            this._recData = data.length + ' pages found';
            for (let i = 0; i < this._pages.length; i++) {
              this.pageFormgroup.addControl('chkPage_' + this._pages[i].ID, new FormControl({ value: null, disabled: true }, null));
              this.pageFormgroup.addControl('editSwitch_' + this._pages[i].ID, new FormControl({ value: null, disabled: true }, null));
              if (this._pages[i].Sections !== undefined && this._pages[i].Sections !== null && this._pages[i].Sections.length > 0) {
                for (let j = 0; j < this._pages[i].Sections.length; j++) {
                  this.pageFormgroup.addControl('chkPageSection_' + this._pages[i].ID + '_' + this._pages[i].Sections[j].ID,
                    new FormControl({ value: null, disabled: true }, null));
                  this.pageFormgroup.addControl('editSwitchSection_' + this._pages[i].ID + '_' + this._pages[i].Sections[j].ID,
                    new FormControl({ value: null, disabled: true }, null));
                }
              }
            }
          }
          this.showSpinner = false;
        }
      );
  }

  toggleControls(id: string) {
    this.showSpinner = true;
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
    this.showSpinner = false;
  }

  toggleControlsSection(id: string, sectionId: string) {
    this.showSpinner = true;
    let chk: boolean;
    chk = this.pageFormgroup.get('chkPageSection_' + id + '_' + sectionId).value;
    if (chk === true) {
      this.pageFormgroup.controls['chkPageSection_' + id + '_' + sectionId].setValue(true);
      this.pageFormgroup.controls['editSwitchSection_' + id + '_' + sectionId].enable();
    } else {
      this.pageFormgroup.controls['chkPageSection_' + id + '_' + sectionId].setValue(false);
      this.pageFormgroup.controls['editSwitchSection_' + id + '_' + sectionId].setValue(false);
      this.pageFormgroup.controls['editSwitchSection_' + id + '_' + sectionId].disable();
    }
    this.showSpinner = false;
  }

  onRoleChange(e) {
    this._showGrid = true;
    this.resetControls();
    this.getPagesbyRole(e.value);
  }

  savePages() {
    this.showSpinner = true;
    let allSelections: MasterPages[];
    allSelections = [];
    for (let i = 0; i < this._pages.length; i++) {
      let _selectedPage: MasterPages;
      _selectedPage = {};
      const chk = this.pageFormgroup.get('chkPage_' + this._pages[i].ID).value;
      if (chk === true) {
        _selectedPage.Role = this.pageFormgroup.get('roleDrp').value;
        _selectedPage.PageId = this._pages[i].ID;
        _selectedPage.HasView = 1;
        if (this.pageFormgroup.controls['editSwitch_' + this._pages[i].ID].value === true) {
          _selectedPage.HasEdit = 1;
        } else {
          _selectedPage.HasEdit = 0;
        }
        let lstSections: MasterPages[];
        lstSections = [];
        if (this._pages[i].Sections !== undefined && this._pages[i].Sections !== null && this._pages[i].Sections.length > 0) {
          for (let j = 0; j < this._pages[i].Sections.length; j++) {
            const chkSection = this.pageFormgroup.get('chkPageSection_' + this._pages[i].ID + '_' + this._pages[i].Sections[j].ID).value;
            if (chkSection === true) {
              let _selectedSection: MasterPages;
              _selectedSection = {};
              _selectedSection.Role = this.pageFormgroup.get('roleDrp').value;
              _selectedSection.PageId = this._pages[i].ID;
              _selectedSection.ID = this._pages[i].Sections[j].ID;
              _selectedSection.HasView = 1;
              if (this.pageFormgroup.controls['editSwitchSection_' + this._pages[i].ID + '_' + this._pages[i].Sections[j].ID].value
                === true) {
                _selectedSection.HasEdit = 1;
              } else {
                _selectedSection.HasEdit = 0;
              }
              lstSections.push(_selectedSection);
            }
          }
        }
        if (lstSections !== undefined && lstSections !== null && lstSections.length > 0) {
          _selectedPage.Sections = lstSections;
        }
        allSelections.push(_selectedPage);
      }
    }

    this.timesysSvc.InsertAccessRights(allSelections)
      .subscribe(
        (data) => {
          this.showSpinner = false;
          if (data !== undefined && data !== null && data.length > 0) {
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Settings saved Successfully' });
            this.getPages();
            if (data[0].Role.toString() ===
              sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString()) {
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
            }
          } else {
            this.msgSvc.add({ key: 'saveSuccess', severity: 'warn', summary: 'Info Message', detail: 'An Error Occurred' });
          }
        });
  }

  resetControls() {
    this.showSpinner = true;
    for (let i = 0; i < this._pages.length; i++) {
      const PageId = this._pages[i].ID;
      this.pageFormgroup.controls['chkPage_' + PageId].enable();
      this.pageFormgroup.controls['chkPage_' + PageId].setValue(false);
      this.pageFormgroup.controls['editSwitch_' + PageId].disable();
      this.pageFormgroup.controls['editSwitch_' + PageId].setValue(false);

      if (this._pages[i].Sections !== undefined && this._pages[i].Sections !== null && this._pages[i].Sections.length > 0) {
        for (let j = 0; j < this._pages[i].Sections.length; j++) {
          const SectionId = this._pages[i].Sections[j].ID;
          this.pageFormgroup.controls['chkPageSection_' + PageId + '_' + SectionId].enable();
          this.pageFormgroup.controls['chkPageSection_' + PageId + '_' + SectionId].setValue(false);
          this.pageFormgroup.controls['editSwitchSection_' + PageId + '_' + SectionId].disable();
          this.pageFormgroup.controls['editSwitchSection_' + PageId + '_' + SectionId].setValue(false);
        }
      }
    }
    this.showSpinner = false;
  }

  getPagesbyRole(role: string) {
    this.showSpinner = true;
    this.timesysSvc.getPagesbyRoles(role, '0')
      .subscribe((data) => {
        this._pagesbyroles = [];
        if (data !== undefined && data !== null && data.length > 0) {

          this._pagesbyroles = data;

          for (let i = 0; i < this._pagesbyroles.length; i++) {

            const PageId = this._pagesbyroles[i].PageId;

            if (this._pagesbyroles[i].HasView) {

              if (this.pageFormgroup.controls['chkPage_' + PageId] !== undefined &&
                this.pageFormgroup.controls['chkPage_' + PageId] !== null) {
                this.pageFormgroup.controls['chkPage_' + PageId].setValue(true);
                this.pageFormgroup.controls['editSwitch_' + PageId].enable();
                if (this._pagesbyroles[i].HasEdit) {
                  this.pageFormgroup.controls['editSwitch_' + PageId].setValue(true);
                }

                if (this._pagesbyroles[i].Sections !== undefined && this._pagesbyroles[i].Sections !== null
                  && this._pagesbyroles[i].Sections.length > 0) {
                  for (let j = 0; j < this._pagesbyroles[i].Sections.length; j++) {
                    const SectionId = this._pagesbyroles[i].Sections[j].ID;
                    if (this._pagesbyroles[i].Sections[j].HasView) {
                      if (this.pageFormgroup.controls['chkPageSection_' + PageId + '_' + SectionId] !== undefined &&
                        this.pageFormgroup.controls['chkPageSection_' + PageId + '_' + SectionId] !== null) {

                        this.pageFormgroup.controls['chkPageSection_' + PageId + '_' + SectionId].setValue(true);
                        this.pageFormgroup.controls['editSwitchSection_' + PageId + '_' + SectionId].enable();
                        if (this._pagesbyroles[i].Sections[j].HasEdit) {
                          this.pageFormgroup.controls['editSwitchSection_' + PageId + '_' + SectionId].setValue(true);
                        }
                      }
                    }
                  }
                }

              }
            }
          }
        }
        this.showSpinner = false;
      });
  }

  cancelPages() {
    this.resetControls();
    this.getPagesbyRole(this.pageFormgroup.get('roleDrp').value);
  }

  getEditStatus(id) {
    return this.pageFormgroup.controls['editSwitch_' + id].value;
  }

}
