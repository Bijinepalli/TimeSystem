import { Component, OnInit } from '@angular/core';
import { TimesystemService } from '../../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { Clients, Projects, NonBillables, BillingCodesSpecial, BillingCodes, Employee } from 'src/app/model/objects';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employeehours',
  templateUrl: './employeehours.component.html',
  styleUrls: ['./employeehours.component.css'],
  providers: [DatePipe]
})
export class EmployeehoursComponent implements OnInit {
  types: SelectItem[];
  hoursType: SelectItem[];
  selectedType: string;
  selectedhoursType: string;
  _startDate = '';
  _endDate = '';
  showSpinner = false;
  _selectcheckbox: SelectItem[] = [];
  _displayCheckBoxes: SelectItem[] = [];
  _employee: Employee[];
  _selectString = '';
  showBillingCodeList = false;
  allcheckbox = false;
  changeCodeList = false;
  showReport = false;
  _billingCodesSpecial: BillingCodesSpecial;
  _reports: any[] = [];
  _recData = 0;
  cols: any;
  helpText: any;
  visibleHelp = false;
  showTotals = false;

  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private datePipe: DatePipe) {
    this.hoursType = [
      { label: 'Salary', value: '1' },
      { label: 'Hourly', value: '0' },
      { label: 'Both', value: '' }
    ];
    this.selectedhoursType = '';
    this.types = [
      { label: 'Active', value: '0' },
      { label: 'Inactive', value: '1' },
      { label: 'Both', value: '' }
    ];
    this.selectedType = '0';

  }

  ngOnInit() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
  }
  showBillingCodes() {
    this.showSpinner = true;
    this._displayCheckBoxes = [];
    // if (this.selectedhoursType === '' && this.selectedType === '') {
    this.timesysSvc.getAllEmployee(this.selectedType.toString(), this.selectedhoursType.toString()).subscribe(
      (data) => {
        console.log(data);
        // if (this.selectedType === '0' || this.selectedType === '1') {
        //   this._employee = data.filter(P => P.Inactive === (this.selectedType === '0' ? false : true));
        // } else {
        this._employee = data;
        // }
        for (let i = 0; i < this._employee.length; i++) {
          this._displayCheckBoxes.push({
            label: this._employee[i].LastName + ' ' + this._employee[i].FirstName,
            value: this._employee[i].ID
          });
        }
        this._selectString = 'Employees (' + this._employee.length + ' matching codes found)';
        this.showBillingCodeList = true;
        this.showSpinner = false;
      }
    );
    // } else {
    //   this.timesysSvc.getAllEmployee(this.selectedType.toString(), this.selectedhoursType.toString()).subscribe(
    //     (data) => {
    //       // if (this.selectedType === '0' || this.selectedType === '1') {
    //       //   this._employee = data.filter(P => P.Inactive === (this.selectedType === '0' ? false : true));
    //       // } else {
    //       this._employee = data;
    //       // }
    //       for (let i = 0; i < this._employee.length; i++) {
    //         this._displayCheckBoxes.push({
    //           label: this._employee[i].LastName + ' ' + this._employee[i].FirstName,
    //           value: this._employee[i].ID
    //         });
    //       }
    //       this._selectString = 'Employees (' + this._employee.length + ' matching codes found)';
    //       this.showBillingCodeList = true;
    //       this.showSpinner = false;
    //     }
    //   );
    // }
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
  generateReport() {
    this.showSpinner = true;
    if (this._selectcheckbox.length > 0) {
      this.buildCols();
      this._billingCodesSpecial = new BillingCodesSpecial();
      if (this._selectcheckbox.length === this._displayCheckBoxes.length) {
        this._billingCodesSpecial.value = '';
      } else {
        this._billingCodesSpecial.value = this._selectcheckbox.join();
      }
      let _start = '';
      let _end = '';

      if (this._startDate !== null && this._startDate !== '') {
        _start = this.datePipe.transform(this._startDate, 'yyyy-MM-dd');
        this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');

      }
      if (this._endDate !== null && this._endDate !== '') {
        _end = this.datePipe.transform(this._endDate, 'yyyy-MM-dd');
        this._endDate = this.datePipe.transform(this._endDate, 'MM-dd-yyyy');
      }
      this._billingCodesSpecial.startDate = _start;
      this._billingCodesSpecial.endDate = _end;
      this._billingCodesSpecial.includeTotals = this.showTotals === true ? 1 : 0;
      console.log(this._billingCodesSpecial);
      this.timesysSvc.GetEmployeeHours(this._billingCodesSpecial).subscribe(
        (data) => {
          console.log(data);
          this.showTable(data);
        }
      );
    }
  }
  showTable(data: BillingCodes[]) {
    if (data !== undefined && data !== null) {
      this._reports = data;
      this._recData = this._reports.length;
    } else {
      this._reports = [];
      this._recData = 0;
      this.msgSvc.add({ severity: 'info', summary: 'Info Message', detail: 'No Matching Data for the Selection Criteria' });
    }
    this.showBillingCodeList = false;
    this.showReport = true;
    this.changeCodeList = true;
    this.showSpinner = false;
  }
  buildCols() {
    this.cols = [
      { field: 'LastName', header: 'Last Name', align: 'left', width: '250px' },
      { field: 'BillingName', header: 'Billing Code', align: 'left', width: 'auto' },
      { field: 'TANDM', header: 'T & M', align: 'right', width: '100px' },
      { field: 'Project', header: 'Project', align: 'right', width: '100px' },
      { field: 'NonBill', header: 'NonBillable', align: 'right', width: '100px' },
    ];
  }
  startOver() {
    this.showBillingCodeList = false;
    this.changeCodeList = false;
    this.showReport = false;
    this._selectcheckbox = [];
    this.allcheckbox = false;
    this.showSpinner = false;
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    this._startDate = new Date(year, month - 1, 1).toString();
    this._startDate = this.datePipe.transform(this._startDate, 'MM-dd-yyyy');
    this._endDate = '';
  }
  changeCodes() {
    this.changeCodeList = false;
    this.showReport = false;
    this.showBillingCodeList = true;
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
}
