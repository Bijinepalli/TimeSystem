import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { SelectItem } from 'primeng/api';
import { MasterPages } from '../model/objects';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

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

  constructor(private timesysSvc: TimesystemService, private fb: FormBuilder, ) { }

  // @Input() set disableControl( condition : boolean ) {
  //   const action = condition ? 'disable' : 'enable';
  //   this.ngControl.control[action]();
  // }


  ngOnInit() {
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

  getPages() {
    this.timesysSvc.getMasterPages()
      .subscribe(
        (data) => {
          this._pages = data;
          this._recData = data.length + ' pages found';
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
        this._selectedPage.PageId = i + 1;
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
          this.getPages();
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
    this.timesysSvc.getPagesbyRoles(role)
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
