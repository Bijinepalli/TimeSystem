import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Companies, CompanyHolidays } from '../model/objects';
import { YearEndCodes, BillingCode } from '../model/constants';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Footer } from 'primeng/primeng';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  selectedYear: number;
  visibleHelp: boolean;
  helpText: string;

  constructor(private timesysSvc: TimesystemService, private router: Router,
    private msgSvc: MessageService, private confSvc: ConfirmationService) { }

  _companies: Companies[] = [];
  _companyHours: Companies[] = [];
  _yec: YearEndCodes = new YearEndCodes();
  _bc: BillingCode = new BillingCode();
  cols: any;
  _recData: any;

  companyDialog = false;
  companyHdr = 'Add Company';
  companyHolidayDialog = false;
  companyHolidayHdr = 'Assign Holidays';
  _slctedCompanyId: any;

  _frm = new FormGroup({});

  _slctHolidays: CompanyHolidays[] = [];
  _availableHolidays: CompanyHolidays[] = [];
  _years: any;

  ngOnInit() {

    this._years = [
      { label: '2010', value: '2010' },
      { label: '2011', value: '2011' },
      { label: '2012', value: '2012' },
      { label: '2013', value: '2013' },
      { label: '2014', value: '2014' },
      { label: '2015', value: '2015' },
      { label: '2016', value: '2016' },
      { label: '2017', value: '2017' },
      { label: '2018', value: '2018' },
      { label: '2019', value: '2019' },
      { label: '2020', value: '2020' },
    ];
    const _date: Date = new Date();
    this.selectedYear = _date.getFullYear();

    this.cols = [
      { field: 'CompanyName', header: 'Company Name' },
      { field: 'DefaultCompany', header: 'Default' },
    ];

    this.getCompanyUsedHours();

    this._frm.addControl('companyName', new FormControl(null, Validators.required));
    this._frm.addControl('companyDefault', new FormControl(null, null));

  }

  getComapanies() {
    this.timesysSvc.getCompanies()
      .subscribe(
        (data) => {
          this._companies = data;
          this._recData = data.length + ' companies found';

          for (let r = 0; r < this._companies.length; r++) {
            const exist = this._companyHours.filter((p) => p.Id === this._companies[r].Id).length;
            if (exist > 0) {
              this._companies[r].HolidaysInUse = 1;
            }
          }

        }
      );
  }

  getCompanyUsedHours() {
    this.timesysSvc.getCompaniesWithUseHours(this._bc.NonBillable, this._yec.HolidayCode)
      .subscribe(
        (data) => {
          this._companyHours = data;
          this.getComapanies();

        }
      );
  }

  deleteCompany(data: Companies) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.CompanyName + '?',
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

  addCompany() {
    this.companyDialog = true;
    this.companyHdr = 'Add New Company';
    this.resetForm();
    this.addControls(undefined);
  }

  editCompany(data: Companies) {
    this.companyDialog = true;
    this.companyHdr = 'Edit Company';
    this.resetForm();
    this.addControls(data);
  }

  changeHolidayYear() {
    this.getCompanyHolidays();
  }

  assignCompanyHolidays(Companydata: Companies) {
    this._slctedCompanyId = Companydata.Id;
    this.companyHolidayHdr = 'Assign Holidays to ' + Companydata.CompanyName;
    this.companyHolidayDialog = true;
    this.selectedYear = new Date().getFullYear();
    this.getCompanyHolidays();
  }

  getCompanyHolidays() {
    console.log(this.selectedYear);
    this._slctHolidays = [];
    this._availableHolidays = [];
    this.timesysSvc.getCompanyHolidays(this.selectedYear.toString(), this._slctedCompanyId)
      .subscribe((data) => {
        this._slctHolidays = data[0];
        this._availableHolidays = data[1];
        console.log(data[0].length + '-' + data[1].length);
      });
  }

  addControls(data: Companies) {
    if (data !== undefined) {
      this._frm.controls['companyName'].setValue(data.CompanyName);
      this._frm.controls['companyDefault'].setValue(data.DefaultCompany);
    }
  }

  cancelCompany() {
    this.companyDialog = false;
    this.companyHolidayDialog = false;
  }

  saveCompanyHolidays() {
    console.log(this._slctedCompanyId);
    console.log(this._slctHolidays.length);
    this.companyHolidayDialog = false;
  }

  saveCompany() {
    this.companyDialog = false;
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

  sortTarget() {
    /**** Very very important code */
    this._slctHolidays = this._slctHolidays.sort(
      function (a, b) {
        if (a.DisplayName < b.DisplayName) {
          return -1;
        } else if (a.DisplayName > b.DisplayName) {
          return 1;
        } else {
          return 0;
        }
      }
    );
  }

}
