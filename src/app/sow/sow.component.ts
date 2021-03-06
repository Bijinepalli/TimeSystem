import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectItem, SortEvent } from 'primeng/api';
import { SOW, PageNames } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators, MaxLengthValidator } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { DatePipe, JsonPipe } from '@angular/common';
import { Table } from 'primeng/table';
import { CurrencyConverterPipe } from '../sharedpipes/currencycoverter.pipe';
import { FileUpload } from 'primeng/primeng';
import { ActivitylogService } from '../service/activitylog.service';

@Component({
  selector: 'app-sow',
  templateUrl: './sow.component.html',
  styleUrls: ['./sow.component.css'],
  providers: [CurrencyConverterPipe],
})

export class SowComponent implements OnInit {

  ParamSubscribe: any;
  IsSecure = false;
  _HasEdit = true;

  showSpinner = false;
  showReport: boolean;

  _SOWs: SOW[] = [];
  cols: any;
  _recData = 0;

  sowDialog = false;
  sowHdr = 'Add SOW';
  _frm = new FormGroup({});
  _IsEdit = false;
  _selectedSOW: SOW;

  _Customers: SelectItem[];
  _CurrencyTypes: SelectItem[];
  _Originates: SelectItem[];
  _OpportunityTypes: SelectItem[];
  _Status: SelectItem[];
  _SOWTypes: SelectItem[];
  _InvoiceFrequencyTypes: SelectItem[];
  _SOWFileNames: SelectItem[];
  _sortArray: string[];

  @ViewChild('dt') dt: Table;
  @ViewChild('fupSOWFile') fupSOWFile: FileUpload;

  _DisplayDateFormat: any;
  _DisplayDateTimeFormat: any;
  _previousSOWStatus = '';
  _selectedSOWStatus = '';
  _isFilesRequired = false;
  _SOWFilesPath = '';
  _LeadBAName = '';

  selectedFile: File[] = [];
  isIEOrEdge = false;

  // tslint:disable-next-line:max-line-length
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
    private logSvc: ActivitylogService,
    public commonSvc: CommonService,
    private datepipe: DatePipe,
    private currencyConverter: CurrencyConverterPipe,
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
    this.logSvc.ActionLog(PageNames.SOW, '', 'Pages', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
    this.showSpinner = true;
    this.IsSecure = false;
    this.isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);
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
    this._SOWs = null;
    this.cols = {};
    this._recData = 0;

    this.sowDialog = false;
    this._frm = new FormGroup({});
    this._IsEdit = false;
    this._selectedSOW = new SOW();
    this._HasEdit = true;

    this._Customers = [];
    this._CurrencyTypes = [];
    this._Originates = [];
    this._OpportunityTypes = [];
    this._Status = [];
    this._SOWTypes = [];
    this._InvoiceFrequencyTypes = [];
    this._SOWFileNames = [];
    this._previousSOWStatus = '';
    this._selectedSOWStatus = '';
    this._isFilesRequired = false;
    this.resetSort();
  }

  Initialisations() {
    this.showSpinner = true;
    this.cols = [
      { field: 'CustomerName', header: 'Customer', align: 'left', width: '11em' },
      { field: 'LeadBAName', header: 'Lead BA', align: 'left', width: '10em' },
      { field: 'SOWName', header: 'SOW Name', align: 'left', width: '15em' },
      { field: 'SOWNumber', header: 'SOW Number', align: 'left', width: '14em' },
      { field: 'SOWFileName', header: 'SOW File', align: 'center', width: '5em' },
      { field: 'EffectiveDate', header: 'Effective Date', align: 'center', width: '10em' },
      { field: 'ExpirationDate', header: 'Expiration Date', align: 'center', width: '10em' },
      { field: 'CurrencyType', header: 'Currency Type', align: 'center', width: '6em' },
      { field: 'TotalContractValue', header: 'Total Contract', align: 'right', width: '12em' },
      { field: 'InvoiceFrequency', header: 'Invoice Frequency', align: 'left', width: '8em' },
      { field: 'Hours', header: 'Hours', align: 'right', width: '6em' },
      { field: 'Originate', header: 'Originate', align: 'left', width: '7em' },
      { field: 'OpportunityType', header: 'Opportunity Type', align: 'left', width: '8em' },
      { field: 'Status', header: 'Status', align: 'left', width: '7em' },
      { field: 'SOWType', header: 'SOW Type', align: 'left', width: '6em' },
      { field: 'Notes', header: 'Notes', align: 'left', width: '15em' },
    ];
    this._sortArray = [
      'CustomerName', 'LeadBAName', 'SOWName', 'SOWNumber',
      'EffectiveDateSearch', 'ExpirationDateSearch',
      'CurrencyType', 'TotalContractValue',
      'InvoiceFrequency', 'Hours', 'Originate',
      'OpportunityType', 'Status',
      'SOWType', 'Notes', 'SOWFileName'
    ];
    this._CurrencyTypes = [
      { label: 'USD', value: 'USD' },
    ];
    this._Originates = [
      { label: 'Ebix', value: 'Ebix' },
      { label: 'Client', value: 'Client' },
    ];
    this._OpportunityTypes = [
      { label: 'New', value: 'New' },
      { label: 'Renewal', value: 'Renewal' },
    ];
    this._Status = [
      { label: 'Draft', value: 'Draft' },
      { label: 'Partially Executed', value: 'Partially Executed' },
      { label: 'Fully Executed', value: 'Fully Executed' },
    ];
    this._SOWTypes = [
      { label: 'T&M', value: 'T&M' },
      { label: 'Project', value: 'Project' },
    ];

    this._InvoiceFrequencyTypes = [
      { label: 'Monthly', value: 'Monthly' },
    ];
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this._DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat');
    this._SOWFilesPath = environment.SOWFiles;
    this.GetCalls();
    this.addControls();
  }

  GetCalls() {
    this.getSOWs();
  }

  getSOWs() {
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.SOW, '', 'Pages/Events', 'getSOWs', 'Get SOWs', '', '', ''); // ActivityLog
    this.showReport = false;
    this._SOWs = [];
    this._recData = 0;
    this.resetSort();
    this.timesysSvc.getSOWs('')
      .subscribe(
        (data) => {
          this._SOWs = [];
          this._recData = 0;
          if (data !== undefined && data !== null && data.length > 0) {
            this._SOWs = data;
          }
          this._recData = this._SOWs.length;
          this.showReport = true;
          this.showSpinner = false;
        }
      );
  }


  GetCustomersAndFiles(selectedData: SOW) {
    this.showSpinner = true;
    this.timesysSvc.getCustomers()
      .subscribe(
        (data) => {

          this.timesysSvc.getFiles()
            .subscribe(
              (data1) => {
                const SOWID = (selectedData.SOWID !== undefined && selectedData.SOWID !== null && selectedData.SOWID.toString() !== '')
                  ? selectedData.SOWID : 0;
                const dtToday = new Date();
                this._SOWFileNames = [];
                if (data1 !== undefined && data1 !== null && data1.length > 0) {
                  for (let i = 0; i < data1.length; i++) {
                    const Duplicate = this._SOWs.filter(m => m.SOWID !== SOWID
                      && m.SOWFileName === data1[i].FileName.toString());
                    const Duplicate2 = this._SOWs.filter(m => m.SOWID !== SOWID &&
                      ((m.EffectiveDate !== undefined && m.EffectiveDate !== null && m.EffectiveDate.toString() !== '' &&
                        new Date(m.EffectiveDate) <= dtToday) && !(m.ExpirationDate !== undefined && m.ExpirationDate !== null) &&
                        (m.ExpirationDate !== undefined && m.ExpirationDate !== null &&
                          ((m.ExpirationDate.toString() === '') || (m.ExpirationDate.toString() !== ''
                            && new Date(m.ExpirationDate) >= dtToday))))
                      && m.SOWFileName === data1[i].FileName.toString());
                    if (Duplicate !== undefined && Duplicate !== null && Duplicate.length > 0) {
                    } else {
                      this._SOWFileNames.push({ label: data1[i].FileName.toString(), value: data1[i].FileName.toString() });
                    }
                  }
                }

                this._Customers = [];
                if (data !== undefined && data !== null && data.length > 0) {
                  for (let i = 0; i < data.length; i++) {
                    this._Customers.push({ label: data[i].CustomerName.toString(), value: data[i].Id.toString() });
                    // const Duplicate = this._SOWs.filter(m => m.SOWID !== SOWID
                    //   && m.CustomerID.toString() === data[i].Id.toString());
                    // const Duplicate2 = this._SOWs.filter(m => m.SOWID !== SOWID &&
                    //   ((m.EffectiveDate !== undefined && m.EffectiveDate !== null && m.EffectiveDate.toString() !== '' &&
                    //     new Date(m.EffectiveDate) <= dtToday) && !(m.ExpirationDate !== undefined && m.ExpirationDate !== null) &&
                    //     (m.ExpirationDate !== undefined && m.ExpirationDate !== null &&
                    //       ((m.ExpirationDate.toString() === '') || (m.ExpirationDate.toString() !== ''
                    //         && new Date(m.ExpirationDate) >= dtToday))))
                    //   && m.CustomerID.toString() === data[i].Id.toString());
                    // if (Duplicate !== undefined && Duplicate !== null && Duplicate.length > 0) {
                    // } else {
                    //   this._Customers.push({ label: data[i].CustomerName.toString(), value: data[i].Id.toString() });
                    // }
                  }
                }

                this._selectedSOW = selectedData;
                this.resetForm();
                this.setDataToControls(this._selectedSOW);
                this.showSpinner = false;
                this.sowDialog = true;
              }
            );
        }
      );
  }



  addSOW() {
    this.logSvc.ActionLog(PageNames.SOW, '', 'Pages/Events', 'addSOW', 'Add SOW', '', '', ''); // ActivityLog
    this._IsEdit = false;
    this.sowHdr = 'Add New SOW';
    this.GetCustomersAndFiles({});
  }

  editSOW(data: SOW) {
    this.logSvc.ActionLog(PageNames.SOW, '', 'Pages/Events', 'editSOW', 'Edit SOW', '', '', JSON.stringify(data)); // ActivityLog
    this._IsEdit = true;
    this.sowHdr = 'Edit SOW';
    this.GetCustomersAndFiles(data);
    // this._selectedSOW = new SOW();
    // this._selectedSOW.SOWID = data.SOWID;
    // this._selectedSOW.CustomerID = data.CustomerID;
    // this._selectedSOW.Name = data.Name;
    // this._selectedSOW.EffectiveDate = data.EffectiveDate;
    // this._selectedSOW.ExpirationDate = data.ExpirationDate;
    // this._selectedSOW.CurrencyType = data.CurrencyType;
    // this._selectedSOW.TotalContractValue = data.TotalContractValue;
    // this._selectedSOW.InvoiceFrequency = data.InvoiceFrequency;
    // this._selectedSOW.Originate = data.Originate;
    // this._selectedSOW.OpportunityType = data.OpportunityType;
    // this._selectedSOW.Status = data.Status;
    // this._selectedSOW.SOWType = data.SOWType;
    // this._selectedSOW.Notes = data.Notes;
    // this._selectedSOW.SOWFileName = data.SOWFileName;
  }

  isRequiredFiles() {
    if (this._IsEdit) {
      if (this._selectedSOWStatus !== 'Draft' && this._frm.controls['frmStatus'].value === 'Draft') {
        this._frm.controls['frmStatus'].setValue(this._previousSOWStatus);
        this._frm.controls['frmStatus'].updateValueAndValidity();
        this.msgSvc.add({
          key: 'alertWarningPopup', severity: 'warn', summary: 'Info Message',
          detail: 'Status cannot be set to Draft. Please delete this SOW and add new SOW.'
        });
      }
      this._previousSOWStatus = this._frm.controls['frmStatus'].value;
    }

    if (this._frm.controls['frmStatus'].value !== 'Draft') {
      this._isFilesRequired = true;
      this._frm.controls['frmSOWFileName'].setValidators(Validators.required);
    } else {
      this._isFilesRequired = false;
      this._frm.controls['frmSOWFileName'].clearValidators();
    }
    this._frm.controls['frmSOWFileName'].updateValueAndValidity();
  }

  addControls() {
    this._frm.addControl('frmCustomer', new FormControl(null, Validators.required));
    this._frm.addControl('frmName', new FormControl(null, Validators.required));
    this._frm.addControl('frmSOWNumber', new FormControl(null, Validators.required));
    this._frm.addControl('frmEffectiveDate', new FormControl(null, Validators.required));
    this._frm.addControl('frmExpirationDate', new FormControl(null, Validators.required));
    this._frm.addControl('frmCurrencyType', new FormControl('USD', Validators.required));
    this._frm.addControl('frmTotalContractValue', new FormControl(null, Validators.required));
    this._frm.addControl('frmOriginate', new FormControl(null, Validators.required));
    this._frm.addControl('frmOpportunityType', new FormControl(null, Validators.required));
    this._frm.addControl('frmHours', new FormControl(null, Validators.required));
    this._frm.addControl('frmStatus', new FormControl(null, Validators.required));
    this._frm.addControl('frmSOWType', new FormControl(null, Validators.required));
    this._frm.addControl('frmNotes', new FormControl(null, null));
    this._frm.addControl('frmInvoiceFrequency', new FormControl(null, Validators.required));
    this._frm.addControl('frmSOWFileName', new FormControl(null, Validators.required));
    // this._frm.valueChanges.subscribe(frm => {
    //   if (frm.frmTotalContractValue) {
    //     this._frm.patchValue({
    //       amount: this.currencyConverter.transform(frm.frmTotalContractValue)
    //     }, {
    //         emitEvent: false
    //       });
    //   }
    // });
  }

  setDataToControls(data: SOW) {
    this._selectedSOWStatus = '';
    this._previousSOWStatus = '';
    if (!this.IsControlUndefined('frmName')) {
      if (data.SOWName !== undefined && data.SOWName !== null && data.SOWName.toString() !== '') {
        this._frm.controls['frmName'].setValue(data.SOWName);
      }
    }
    if (!this.IsControlUndefined('frmSOWNumber')) {
      if (data.SOWNumber !== undefined && data.SOWNumber !== null && data.SOWNumber.toString() !== '') {
        this._frm.controls['frmSOWNumber'].setValue(data.SOWNumber);
      }
    }
    if (!this.IsControlUndefined('frmCustomer')) {
      if (data.CustomerID !== undefined && data.CustomerID !== null && data.CustomerID.toString() !== '') {
        this._frm.controls['frmCustomer'].setValue(data.CustomerID);
      }
    }

    if (data.LeadBAName !== undefined && data.LeadBAName !== null && data.LeadBAName.toString() !== '') {
      this._LeadBAName = data.LeadBAName;
    } else {
      this._LeadBAName = '';
    }

    // this.getLeadBAName();
    if (!this.IsControlUndefined('frmEffectiveDate')) {
      if (data.EffectiveDate !== undefined && data.EffectiveDate !== null && data.EffectiveDate.toString() !== '') {
        this._frm.controls['frmEffectiveDate'].setValue(new Date(data.EffectiveDate));
      }
    }
    if (!this.IsControlUndefined('frmExpirationDate')) {
      if (data.ExpirationDate !== undefined && data.ExpirationDate !== null && data.ExpirationDate.toString() !== '') {
        this._frm.controls['frmExpirationDate'].setValue(new Date(data.ExpirationDate));
      }
    }
    if (!this.IsControlUndefined('frmCurrencyType')) {
      if (data.CurrencyType !== undefined && data.CurrencyType !== null && data.CurrencyType.toString() !== '') {
        this._frm.controls['frmCurrencyType'].setValue(data.CurrencyType);
      }
    }
    if (!this.IsControlUndefined('frmTotalContractValue')) {
      if (data.TotalContractValue !== undefined && data.TotalContractValue !== null && data.TotalContractValue.toString() !== '') {
        this._frm.controls['frmTotalContractValue'].setValue(data.TotalContractValue);
      }
    }
    if (!this.IsControlUndefined('frmOriginate')) {
      if (data.Originate !== undefined && data.Originate !== null && data.Originate.toString() !== '') {
        this._frm.controls['frmOriginate'].setValue(data.Originate);
      }
    }
    if (!this.IsControlUndefined('frmHours')) {
      if (data.Hours !== undefined && data.Hours !== null && data.Hours.toString() !== '') {
        this._frm.controls['frmHours'].setValue(data.Hours);
      }
    }
    if (!this.IsControlUndefined('frmOpportunityType')) {
      if (data.OpportunityType !== undefined && data.OpportunityType !== null && data.OpportunityType.toString() !== '') {
        this._frm.controls['frmOpportunityType'].setValue(data.OpportunityType);
      }
    }
    if (!this.IsControlUndefined('frmStatus')) {
      if (data.Status !== undefined && data.Status !== null && data.Status.toString() !== '') {
        this._selectedSOWStatus = data.Status.toString();
        this._previousSOWStatus = data.Status.toString();
        this._frm.controls['frmStatus'].setValue(data.Status);
      }
      this.isRequiredFiles();
    }
    if (!this.IsControlUndefined('frmSOWType')) {
      if (data.SOWType !== undefined && data.SOWType !== null && data.SOWType.toString() !== '') {
        this._frm.controls['frmSOWType'].setValue(data.SOWType);
      }
    }
    if (!this.IsControlUndefined('frmNotes')) {
      if (data.Notes !== undefined && data.Notes !== null && data.Notes.toString() !== '') {
        this._frm.controls['frmNotes'].setValue(data.Notes);
      }
    }
    if (!this.IsControlUndefined('frmInvoiceFrequency')) {
      if (data.InvoiceFrequency !== undefined && data.InvoiceFrequency !== null && data.InvoiceFrequency.toString() !== '') {
        this._frm.controls['frmInvoiceFrequency'].setValue(data.InvoiceFrequency);
      }
    }
    if (!this.IsControlUndefined('frmSOWFileName')) {
      if (data.SOWFileName !== undefined && data.SOWFileName !== null && data.SOWFileName.toString() !== '') {
        this._frm.controls['frmSOWFileName'].setValue(data.SOWFileName);
      }
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
  resetSort() {
    if (this.dt !== undefined && this.dt !== null) {
      this.dt.sortOrder = 0;
      this.dt.sortField = '';
      this.dt.reset();
    }
  }

  clearControls() {
    this._IsEdit = false;
    this._selectedSOW = null;
    this.resetForm();
    this.sowHdr = 'Add New SOW';
    this.sowDialog = false;
  }

  clearSelectedFile() {
    this._frm.controls['frmSOWFileName'].setValue(null);
  }

  cancelSOW() {
    this.clearControls();
  }
  saveSOW() {
    let errMsg = '';
    if (this._IsEdit === false) {
      if (this._selectedSOW === undefined || this._selectedSOW === null) {
        this._selectedSOW = {};
      }
      this._selectedSOW.SOWID = -1;
    }
    if (!this.IsControlUndefinedAndHasValue('frmCustomer')) {
      this._selectedSOW.CustomerID = this._frm.controls['frmCustomer'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmName')) {
      this._selectedSOW.SOWName = this._frm.controls['frmName'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmSOWNumber')) {
      this._selectedSOW.SOWNumber = this._frm.controls['frmSOWNumber'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmEffectiveDate')) {
      this._selectedSOW.EffectiveDate = this.datepipe.transform(this._frm.controls['frmEffectiveDate'].value.toString().trim(),
        'yyyy/MM/dd');
    }
    if (!this.IsControlUndefinedAndHasValue('frmExpirationDate')) {
      this._selectedSOW.ExpirationDate = this.datepipe.transform(this._frm.controls['frmExpirationDate'].value.toString().trim(),
        'yyyy/MM/dd');
    }
    if (!this.IsControlUndefinedAndHasValue('frmCurrencyType')) {
      this._selectedSOW.CurrencyType = this._frm.controls['frmCurrencyType'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmTotalContractValue')) {
      this._selectedSOW.TotalContractValue = this._frm.controls['frmTotalContractValue'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmOriginate')) {
      this._selectedSOW.Originate = this._frm.controls['frmOriginate'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmHours')) {
      this._selectedSOW.Hours = this._frm.controls['frmHours'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmOpportunityType')) {
      this._selectedSOW.OpportunityType = this._frm.controls['frmOpportunityType'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmStatus')) {
      this._selectedSOW.Status = this._frm.controls['frmStatus'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmSOWType')) {
      this._selectedSOW.SOWType = this._frm.controls['frmSOWType'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmNotes')) {
      this._selectedSOW.Notes = this._frm.controls['frmNotes'].value.toString().trim();
    } else {
      this._selectedSOW.Notes = '';
    }
    if (!this.IsControlUndefinedAndHasValue('frmInvoiceFrequency')) {
      this._selectedSOW.InvoiceFrequency = this._frm.controls['frmInvoiceFrequency'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('frmSOWFileName')) {
      this._selectedSOW.SOWFileName = this._frm.controls['frmSOWFileName'].value.toString().trim();
    } else {
      this._selectedSOW.SOWFileName = '';
      errMsg = 'No file selected. Do you wish to continue?';
      // if (this.selectedFile.length > 0) {
      //   this._selectedSOW.SOWFileName = this.selectedFile[0].name;
      //   this.uploadFile(null);
      // } else {
      //   this._selectedSOW.SOWFileName = '';
      //   errMsg = 'No file selected. Do you wish to continue?';
      // }
    }
    if (errMsg.trim() !== '') {
      this.confSvc.confirm({
        message: errMsg,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.SaveSOWSPCall();
        },
        reject: () => {
        }
      });
    } else {
      this.SaveSOWSPCall();
    }

  }

  SaveSOWSPCall() {
    this.showSpinner = true;
    this.logSvc.ActionLog(PageNames.SOW, '', 'Pages/Events', 'saveSOW', 'Save SOW', '', '', JSON.stringify(this._selectedSOW)); // ActivityLog
    this.timesysSvc.SOW_InsertOrUpdate(this._selectedSOW)
      .subscribe(
        (outputData) => {
          this.showSpinner = false;
          if (outputData !== undefined && outputData !== null && outputData.ErrorMessage !== '') {
            this.msgSvc.add({
              key: 'alert',
              sticky: true,
              severity: 'error',
              summary: 'Error!',
              detail: outputData.ErrorMessage
            });
          } else {
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'SOW saved successfully' });
            this.clearControls();
            this.GetCalls();
          }
        },
        (error) => {
          console.log(error);
        });
  }
  deleteSOW(dataRow: SOW) {
    this.logSvc.ActionLog(PageNames.SOW, '', 'Pages/Events', 'deleteSOW', 'Delete SOW', '', '', JSON.stringify(dataRow)); // ActivityLog
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.SOWName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.showSpinner = true;
        this.timesysSvc.SOW_Delete(dataRow)
          .subscribe(
            (outputData) => {
              this.showSpinner = false;
              if (outputData !== undefined && outputData !== null && outputData.ErrorMessage !== '') {
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
                  detail: 'SOW deleted successfully'
                });
                this.getSOWs();
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

  IsControlUndefined(ctrlName: string): boolean {
    let IsUndefined = true;
    if (this._frm.controls[ctrlName] !== undefined &&
      this._frm.controls[ctrlName] !== null
    ) {
      IsUndefined = false;
    }
    return IsUndefined;
  }

  IsControlUndefinedAndHasValue(ctrlName: string): boolean {
    let IsUndefined = true;
    if (this._frm.controls[ctrlName] !== undefined &&
      this._frm.controls[ctrlName] !== null &&
      this._frm.controls[ctrlName].value !== undefined &&
      this._frm.controls[ctrlName].value !== null &&
      this._frm.controls[ctrlName].value.toString().trim() !== ''
    ) {
      IsUndefined = false;
    }
    return IsUndefined;
  }

  numberOnly(event, ctrlName): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 46) {
      if (this._frm.controls[ctrlName].value.toString().trim().indexOf('.') === -1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['EffectiveDate', 'ExpirationDate'], ['TotalContractValue', 'Hours']);
  }

  getLeadBAName() {
    this.showSpinner = true;
    this._LeadBAName = '';
    if (!this.IsControlUndefinedAndHasValue('frmCustomer')) {
      this.timesysSvc.getLeadBAs(this._frm.controls['frmCustomer'].value.toString().trim())
        .subscribe(
          (data) => {
            if (data !== undefined && data !== null && data.length > 0) {
              this._LeadBAName = data[0].label;
            }
            this.showSpinner = false;
          }
        );
    } else {
      this.showSpinner = false;
    }
  }

  onRemoveFile(event) {
    const index: number = this.selectedFile.indexOf(event.file);
    if (index !== -1) {
      this.selectedFile.splice(index, 1);
    }
  }

  onSelectFiles(file: any) {
    this.selectedFile = [];
    for (const f of file) {
      const fileIndex = this._SOWFileNames.findIndex(m => m.label === f.name);
      if (fileIndex > -1) {
        this.removeUploadFiles();
        this.msgSvc.add({
          key: 'alert',
          sticky: true,
          severity: 'error',
          summary: 'Error!',
          detail: 'File already exists'
        });
      } else {
        this.selectedFile.push(f);
      }
    }
    if (this.selectedFile.length > 0) {
      this.clearSelectedFile();
    }
  }
  removeUploadFiles() {
    // this.selectedFile.splice(0, 1);
    this.selectedFile = [];
    if (this.fupSOWFile) {
      this.fupSOWFile.clear();
      this.fupSOWFile.clearInputElement();
      this.fupSOWFile.clearIEInput();
    }
    // for (let i = 0; i >= 0 && i < this.selectedFile.length; i++) {
    //   this.selectedFile.splice(i, 1);
    //   i--;
    // }
  }

  uploadFile(event) {
    this.showSpinner = true;
    const uploadData: FormData = new FormData();
    const i = 0;
    // for (let i = 0; i < this.selectedFile.length; i++) {
    uploadData.append('SOWFile' + i, this.selectedFile[i], this.selectedFile[i].name);
    // }
    const SelectedFileName = this.selectedFile[i].name;
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      SelectedFileName: SelectedFileName,
    }
    this.logSvc.ActionLog(PageNames.SOW, '', 'Pages/Events', 'uploadFile', 'Upload File', '', '', JSON.stringify(ActivityParams)); // ActivityLog
    this.timesysSvc.uploadFileToServer(uploadData).subscribe((result) => {
      this.showSpinner = false;
      this._selectedSOW.SOWFileName = SelectedFileName;
      this.GetCustomersAndFiles(this._selectedSOW);
      this.removeUploadFiles();
    },
      error => {
        this.showSpinner = false;
        this.removeUploadFiles();
        console.log(error);
      });
  }

}
