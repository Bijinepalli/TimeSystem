import { Component, OnInit, ViewChild } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Companies, CompanyHolidays, PageNames } from '../model/objects';
import { YearEndCodes, BillingCode } from '../model/constants';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { PickList } from 'primeng/primeng';
import { ActivitylogService } from '../service/activitylog.service';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  selectedYear: number;
  _companies: Companies[] = [];
  _companyHours: Companies[] = [];
  _yec: YearEndCodes = new YearEndCodes();
  _bc: BillingCode = new BillingCode();
  cols: any;
  _recData = 0;

  companyDialog = false;
  companyHdr = 'Add Company';
  companyHolidayDialog = false;
  companyHolidayHdr = 'Assign Holidays';
  _slctedCompanyId: any;

  _frm = new FormGroup({});
  chkDefaultCompany = false;
  _selectedCompany: Companies;
  _IsEdit = false;

  _slctHolidays: CompanyHolidays[] = [];
  _slctHolidaysSaved: CompanyHolidays[] = [];
  _availableHolidays: CompanyHolidays[] = [];
  _years: any;

  _HasEdit = true;
  showSpinner = false;

  ParamSubscribe: any;
  IsSecure = false;
  showReport: boolean;

  @ViewChild('pcklHolidays') pcklHolidays: PickList;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService,
    public commonSvc: CommonService,
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
    this.logSvc.ActionLog(PageNames.Companies, '', 'Pages', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    // this.selectedYear = null;
    this._companies = [];
    this._companyHours = [];
    this._yec = new YearEndCodes();
    this._bc = new BillingCode();
    this.cols = {};
    this._recData = 0;
    this.showReport = false;

    this.companyDialog = false;
    this.companyHolidayDialog = false;
    this._slctedCompanyId = null;

    this._frm = new FormGroup({});
    this.chkDefaultCompany = false;
    this._selectedCompany = {};
    this._IsEdit = false;

    this._slctHolidays = [];
    this._slctHolidaysSaved = [];
    this._availableHolidays = [];
    this._years = {};

    this._HasEdit = true;
  }
  Initialisations() {
    // this.CheckSecurity();
    this.showSpinner = true;
    this.cols = [
      { field: 'CompanyName', header: 'Company Name', align: 'left', width: '20em' },
      { field: 'DefaultCompany', header: 'Default', align: 'center', width: '10em' },
    ];

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

    this.getCompanyUsedHours();
    this.addControls();
  }

  // CheckSecurity() {
  //   this._HasEdit = true;
  //   this.route.queryParams.subscribe(params => {
  //     if (params['Id'] !== undefined && params['Id'] !== null && params['Id'].toString() !== '') {
  //       this.timesysSvc.getPagesbyRoles(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserRole').toString(),
  //         params['Id'].toString())
  //         .subscribe((data) => {
  //           if (data != null && data.length > 0) {
  //             if (data[0].HasEdit) {
  //               this._HasEdit = false;
  //             }
  //           }
  //         });
  //     }
  //   });
  // }

  getCompanyUsedHours() {
    this.timesysSvc.getCompaniesWithUseHours(this._bc.NonBillable, this._yec.HolidayCode)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null) {
            this._companyHours = data;
          } else {
            this._companyHours = [];
          }
          this.getCompanies();
        },
        (error) => {
          console.log(error);
        });
  }
  getCompanies() {
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.Companies, '', 'Pages/Events', 'getCompanies', 'Get Companies', '', '', ''); // ActivityLog
    this.showReport = false;
    this._recData = 0;
    this.timesysSvc.getCompanies()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._companies = data;
            this._recData = data.length;
            if (this._companyHours !== undefined && this._companyHours !== null && this._companyHours.length > 0) {
              for (let r = 0; r < this._companies.length; r++) {
                const exist = this._companyHours.filter((p) => p.Id === this._companies[r].Id).length;
                if (exist > 0) {
                  this._companies[r].HolidaysInUse = 1;
                }
              }
            }
          }
          this.showReport = true;
          this.showSpinner = false;
        },
        (error) => {
          console.log(error);
          this.showSpinner = false;
        });
  }

  addCompany() {
    this.logSvc.ActionLog(PageNames.Companies, '', 'Pages/Events', 'addCompany', 'Add Company', '', '', ''); // ActivityLog
    this._IsEdit = false;
    this._selectedCompany = {};
    this.resetForm();
    this.setDataToControls(this._selectedCompany);
    this.companyHdr = 'Add New Company';
    this.companyDialog = true;
  }

  editCompany(data: Companies) {
    this.logSvc.ActionLog(PageNames.Companies, '', 'Pages/Events', 'editCompany', 'Edit Company', '', '', JSON.stringify(data)); // ActivityLog
    this._IsEdit = true;
    this._selectedCompany = new Companies();
    this._selectedCompany.Id = data.Id;
    this._selectedCompany.CompanyName = data.CompanyName;
    this._selectedCompany.DefaultCompany = data.DefaultCompany;
    this._selectedCompany.HolidaysInUse = data.HolidaysInUse;
    this.resetForm();
    this.setDataToControls(this._selectedCompany);
    this.companyHdr = 'Edit Company';
    this.companyDialog = true;
  }

  addControls() {
    this._frm.addControl('companyName', new FormControl(null, Validators.required));
    this.chkDefaultCompany = false;
  }

  setDataToControls(data: Companies) {
    this._frm.controls['companyName'].setValue(data.CompanyName);
    if (data.DefaultCompany !== undefined) {
      this.chkDefaultCompany = data.DefaultCompany;
    } else {
      this.chkDefaultCompany = false;
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
    this._selectedCompany = null;
    this.resetForm();
    if (this.pcklHolidays !== undefined && this.pcklHolidays !== null) {
      this.pcklHolidays.resetFilter();
    }
    this.companyHdr = 'Add New Company';
    this.companyDialog = false;
  }
  sortTarget() {
    /**** Very very important code */
    this._slctHolidays = this._slctHolidays.sort(
      function (a, b) {
        if (a.HolidayDateSearch < b.HolidayDateSearch) {
          return -1;
        } else if (a.HolidayDateSearch > b.HolidayDateSearch) {
          return 1;
        } else {
          return 0;
        }
      }
    );

    this._availableHolidays = this._availableHolidays.sort(
      function (a, b) {
        if (a.HolidayDateSearch < b.HolidayDateSearch) {
          return -1;
        } else if (a.HolidayDateSearch > b.HolidayDateSearch) {
          return 1;
        } else {
          return 0;
        }
      }
    );

  }

  cancelCompany() {
    this.clearControls();
  }

  saveCompany() {
    if (this._IsEdit === false) {
      if (this._selectedCompany === undefined || this._selectedCompany === null) {
        this._selectedCompany = {};
      }
      this._selectedCompany.Id = -1;
    }
    this._selectedCompany.CompanyName = this._frm.controls['companyName'].value.toString().trim();
    this._selectedCompany.DefaultCompany = this.chkDefaultCompany;
    this.logSvc.ActionLog(PageNames.Companies, '', 'Pages/Events', 'saveCompany', 'Save Company', '', '', JSON.stringify(this._selectedCompany)); // ActivityLog
    this.SaveCompanySPCall();
  }

  SaveCompanySPCall() {
    if (this._slctHolidays !== null && this._slctHolidays.length === 0) {
      this._slctHolidays.push({ CompanyId: this._slctedCompanyId });
    }
    this.timesysSvc.Company_InsertOrUpdate(this._selectedCompany)
      .subscribe(
        (outputData) => {
          if (outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: outputData.ErrorType,
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage,
              data: outputData.ExceptionDetails,
            });
          } else {
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Company saved successfully' });
            this.clearControls();
            this.getCompanyUsedHours();
          }
        },
        (error) => {
          console.log(error);
        });
  }

  deleteCompany(data: Companies) {
    this.logSvc.ActionLog(PageNames.Companies, '', 'Pages/Events', 'deleteCompany', 'Delete Company', '', '', JSON.stringify(data)); // ActivityLog
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + data.CompanyName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Company_Delete(data)
          .subscribe(
            (outputData) => {
              if (outputData !== null && outputData.ErrorMessage !== '') {
                this.msgSvc.add({
                  key: outputData.ErrorType,
                  sticky: true,
                  severity: 'error',
                  summary: 'Error!',
                  detail: outputData.ErrorMessage,
                  data: outputData.ExceptionDetails,
                });
              } else {
                this.msgSvc.add({
                  key: 'saveSuccess',
                  severity: 'success',
                  summary: 'Info Message',
                  detail: 'Company deleted successfully'
                });
                this.getCompanyUsedHours();
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

  changeHolidayYear() {
    // this.clearControls();
    this.getCompanyHolidays();
  }

  getCompanyHolidays() {
    if (this.pcklHolidays !== undefined && this.pcklHolidays !== null) {
      this.pcklHolidays.resetFilter();
    }
    this._slctHolidays = [];
    this._slctHolidaysSaved = [];
    this._availableHolidays = [];
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      _slctedCompanyId: this._slctedCompanyId.toString(),
      selectedYear: this.selectedYear.toString(),
    }
    this.logSvc.ActionLog(PageNames.Companies, '', 'Pages/Events', 'getCompanyHolidays', 'Get Company Holidays', '', '', JSON.stringify(ActivityParams)); // ActivityLog
    this.timesysSvc.getCompanyHolidays(this.selectedYear.toString(), this._slctedCompanyId)
      .subscribe(
        (data) => {
          this._slctHolidays = [];
          this._slctHolidaysSaved = [];
          this._availableHolidays = [];
          if (data !== undefined && data !== null && data.length > 0) {
            if (data[0] !== undefined && data[0] !== null && data[0].length > 0) {
              this._slctHolidays = this._slctHolidays.concat(data[0]);
              this._slctHolidaysSaved = this._slctHolidaysSaved.concat(data[0]);
            }
            if (data[1] !== undefined && data[1] !== null && data[1].length > 0) {
              this._availableHolidays = data[1];
            }
          }
          this.companyHolidayDialog = true;
        },
        (error) => {
          console.log(error);
        });
  }

  assignCompanyHolidays(companyData: Companies) {
    this._slctedCompanyId = companyData.Id;
    this.selectedYear = new Date().getFullYear();
    this.companyHolidayHdr = 'Assign Holidays to ' + companyData.CompanyName;
    this.getCompanyHolidays();
  }

  saveCompanyHoliday() {
    this.SaveCompanyHolidaySPCall();
  }
  cancelCompanyHoliday() {
    if (this.commonSvc.isArrayEqual(this._slctHolidays, this._slctHolidaysSaved)) {
      this.clearCompanyHolidaysControls();
    } else {
      this.confSvc.confirm({
        message: 'You have some unsaved changes. Are you sure you want to close ?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          /* do nothing */
          this.clearCompanyHolidaysControls();
        },
        reject: () => {
          /* do nothing */
        }
      });
    }
  }

  clearCompanyHolidaysControls() {
    this.companyHolidayDialog = false;
    this._slctedCompanyId = null;
    if (this.pcklHolidays !== undefined && this.pcklHolidays !== null) {
      this.pcklHolidays.resetFilter();
    }
    this._slctHolidays = [];
    this._slctHolidaysSaved = [];
    this._availableHolidays = [];
    this.getCompanies();
  }

  SaveCompanyHolidaySPCall() {
    if (this._slctHolidays !== undefined && this._slctHolidays !== null && this._slctHolidays.length > 0) {

    } else {
      let companyHolidays: CompanyHolidays;
      companyHolidays = {};
      companyHolidays.CompanyId = this._slctedCompanyId;
      this._slctHolidays.push(companyHolidays);
    }
    this.logSvc.ActionLog(PageNames.Companies, '', 'Pages/Events', 'SaveCompanyHolidaySPCall', 'Save Company Holiday', '', '', JSON.stringify(this._slctHolidays)); // ActivityLog
    this.timesysSvc.CompanyHolidays_DeleteAndInsert(this._slctHolidays)
      .subscribe(
        (outputData) => {
          if (outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: outputData.ErrorType,
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage,
              data: outputData.ExceptionDetails,
            });
          } else {
            this.msgSvc.add({
              key: 'saveSuccess', severity: 'success', summary: 'Info Message',
              detail: 'Company Holidays saved successfully'
            }
            );
            this.clearCompanyHolidaysControls();
            this.getCompanyUsedHours();
          }
        },
        (error) => {
          console.log(error);
        });
  }
}
