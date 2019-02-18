import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial } from 'src/app/model/objects';

@Component({
  selector: 'app-nonbillablehours-addgroup',
  templateUrl: './nonbillablehours-addgroup.component.html',
  styleUrls: ['./nonbillablehours-addgroup.component.css']
})
export class NonbillablehoursAddgroupComponent implements OnInit {

  _header: string;
  _recData = 0;
  cols: any;
  _groups: any[] = [];
  groupName = '';
  _selectString = '';
  _selectcheckbox: string[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  allcheckbox = false;
  secondarygroup = false;
  edit = false;
  mode = '';
  _Id: number;
  selectedType: number;
  _nonBillables: NonBillables[] = [];
  _selectednonBillables: NonBillables[] = [];

  list1: any[];
  list2: any[];
  _popUpHeader = '';


  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute) {
    this.cols = [
      { field: 'Group1', header: 'Primary Report Group' },
      { field: 'ID1', header: 'Delete' },
      { field: 'ID1', header: 'Add Sub Group' },
      { field: 'Group2', header: 'Secondary Report Group' },
      { field: 'ID2', header: 'Delete' },
    ];
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      this._Id = params['id'] === undefined ? -1 : params['id'];
      this.setheader(this._Id);
      this.timesysSvc.getNonBillableHourGroups((+this._Id + 1).toString())
        .subscribe(
          (data) => {
            this._groups = data;
            this._recData = this._groups.length;
          }
        );
    });
  }

  addPrimaryGroup() {
    this.edit = true;
    this.mode = 'add';
  }

  addSubGroup() {
    this.secondarygroup = true;
    this.edit = true;
    this.mode = 'add';
    this.populateCheckboxlist();
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

  editGroup(Name: string, Id: string, type: string) {
    this.edit = true;
    this._nonBillables = [];
    this._selectednonBillables = [];
    this._selectcheckbox = [];
    this.list2 = [];

    this.groupName = Name;
    if (type === 'sub') {
      this.secondarygroup = true;
      this.timesysSvc.getNonBillableCodesforGroup(+Id, 1)
        .subscribe(
          (data) => {
            this._selectednonBillables = data;
            for (let i = 0; i < this._selectednonBillables.length; i++) {
              this._selectcheckbox.push(this._selectednonBillables[i].Key);
              this.list2.push({ label: this._selectednonBillables[i].ProjectName, value: this._selectednonBillables[i].ProjectName });
            }
          }
        );
      this.populateCheckboxlist();

    }
  }

  deleteGroup(Id: string, type: string) {
    if (type === 'main') {

    } else if (type === 'sub') {

    }
  }

  populateCheckboxlist() {
    this.list1 = [];
    this._popUpHeader = 'Report Group';
    this.timesysSvc.getNonBillables('1')
      .subscribe(
        (data) => {
          if (this.selectedType < 2) {
            this._nonBillables = data[0].filter(P => P.Inactive === (this.selectedType === 0 ? false : true));
          } else {
            this._nonBillables = data[0];
          }
          for (let i = 0; i < this._nonBillables.length; i++) {
            let count = 0;
            this._displayCheckBoxes.push({ label: this._nonBillables[i].ProjectName, value: this._nonBillables[i].Key });
            for (let j = 0; j < this._selectednonBillables.length; j++) {
              if ((this._selectednonBillables[j].ProjectName === this._nonBillables[i].ProjectName)) {
                count++;
                break;
              }
            }
            if (count === 0) {
              this.list1.push({ label: this._nonBillables[i].ProjectName, value: this._nonBillables[i].ProjectName });
            }
          }
          this._selectString = 'Non Billables (' + this._nonBillables.length + ') matching codes found';
        }
      );
  }

  cancelClick() {
    this.groupName = '';
    this.edit = false;
    this.secondarygroup = false;
  }

  saveGroup() {
    if (this.edit === true) {
      if (this.mode === 'add' && this.secondarygroup === false) {         // For adding New Group


      } else if (this.mode === 'add' && this.secondarygroup === true) {   // For adding New SubGroup


      } else if (this.mode === '' && this.secondarygroup === false) {     // For editing Group


      } else if (this.mode === '' && this.secondarygroup === true) {      // For editing SubGroup


      }
    }
    this.groupName = '';
    this.edit = false;
    this.mode = '';
    this.secondarygroup = false;
  }

  returnReports() {
    this.navigateTo('/menu/nonbillablehours');
  }

  navigateTo(url: any) {
    this.router.navigate([url], { skipLocationChange: true });
  }

  //#region Sort Listboxes
  sortTarget() {
    /**** Very very important code */
    if (this.list2 != null && this.list2.length > 0) {
      this.list2 = this.list2.sort(
        function (a, b) {
          if (a.value < b.value) {
            return -1;
          } else if (a.value > b.value) {
            return 1;
          } else {
            return 0;
          }
        }
      );
    }
  }
  sortSource() {
    /**** Very very important code */
    if (this.list1 != null && this.list1.length > 0) {
      this.list1 = this.list1.sort(
        function (a, b) {
          if (a.value < b.value) {
            return -1;
          } else if (a.value > b.value) {
            return 1;
          } else {
            return 0;
          }
        }
      );
    }
  }
  //#endregion

  //#region Set the Headers based on Type
  setheader(Id: number) {
    switch (Id.toString()) {
      case '0':
        this._header = 'Update Non-Billable VERTEX Software Report Groups';
        break;
      case '1':
        this._header = 'Update Report Groups for Billing Codes Other Than VERTEX Software ';
        break;
      case '2':
        this._header = 'Update Custom Non-Billable Hours Report Groups';
        break;
      case '3':
        this._header = 'Update Custom Non-Billable Hours Report Groups';
        break;
      default:
        break;
    }
  }
  //#endregion

}
