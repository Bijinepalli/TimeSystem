import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Clients, Customers, Companies, PageNames } from '../model/objects';
import { BillingCode } from '../model/constants';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';
import { DataTable } from 'primeng/primeng';
import { ActivitylogService } from '../service/activitylog.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {

  types: SelectItem[] = [];
  selectedType = '';

  _billingCodes: BillingCode;

  _clients: Clients[] = [];
  _clientsUsed: Clients[] = [];
  cols: any;
  _recData = 0;

  clientDialog = false;
  clientHdr = 'Add New Billing Code';

  _frm = new FormGroup({});

  _IsEdit = false;
  _selectedClient: Clients;
  chkInactive = false;

  _billingCycle: SelectItem[] = [];
  _customerNames: SelectItem[] = [];
  _companyNames: SelectItem[] = [];
  _SOWs: SelectItem[] = [];

  _customers: Customers[] = [];
  _companies: Companies[] = [];

  showSpinner = false;

  ParamSubscribe: any;
  IsSecure = false;
  _HasEdit = true;
  showReport: boolean;
  _OldCompanyID = '';
  _DisplayDateFormat: any;

  _UsedSOWs: Clients[] = [];

  // tslint:disable-next-line:max-line-length
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
    this.logSvc.ActionLog(PageNames.NonBillables, '', 'Pages', 'OnInit', 'Initialisation', '', '', ''); // ActivityLog
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
    this.types = [];
    this.selectedType = '';
    this._billingCodes = new BillingCode();
    this._clients = [];
    this._clientsUsed = [];
    this.cols = {};
    this._recData = 0;
    this.clientDialog = false;
    this._frm = new FormGroup({});
    this._IsEdit = false;
    this._selectedClient = new Clients();
    this.chkInactive = false;
    this._billingCycle = [];
    this._customerNames = [];
    this._companyNames = [];
    this._customers = [];
    this._companies = [];
    this._UsedSOWs = [];
    this._HasEdit = true;
    this.showSpinner = false;
  }

  Initialisations() {
    this.showSpinner = true;
    this._DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this.types = [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Both', value: 'Both' }
    ];
    this.selectedType = 'Active';

    // Drop down loading Section - BEGIN
    this._billingCycle = [
      { label: 'Bi-Weekly', value: 'B' },
      { label: 'Monthly', value: 'M' },
      { label: 'Weekly', value: 'W' }
    ];

    this.cols = [
      { field: 'ClientName', header: 'Billing Code Name', align: 'left', width: '30em' },
      { field: 'Key', header: 'Code', align: 'left', width: '15em' },
      { field: 'CustomerName', header: 'Customer Name', align: 'left', width: '27em' },
      { field: 'SOWName', header: 'SOW Name', width: '15em' },
      { field: 'PONumber', header: 'PO#', align: 'left', width: '8em' },
    ];

    this._billingCodes = new BillingCode();
    this.addControls();
    this.showSpinner = false;
    this.GetMethods();
  }

  GetMethods() {
    this.getCompanies();
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





  getCompanies() {
    this.showSpinner = true;
    this.timesysSvc.getCompanies()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._companies = data;
            for (let i = 0; i < this._companies.length; i++) {
              this._companyNames.push({ label: this._companies[i].CompanyName, value: this._companies[i].Id });
            }
          } else {
            this._companies = [];
            this._companyNames = [];
          }
          this.showSpinner = false;
          this.getCustomers();
        }
      );
  }

  getCustomers() {
    this.showSpinner = true;
    this.timesysSvc.getCustomers()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._customers = data;
            for (let i = 0; i < this._customers.length; i++) {
              this._customerNames.push({ label: this._customers[i].CustomerName, value: this._customers[i].Id });
            }
          } else {
            this._customers = [];
            this._customerNames = [];
          }
          this.showSpinner = false;
          this.getClients();
        }
      );
  }

  getClients() {
    this.showSpinner = true;
    this.showReport = false;
    this._recData = 0;
    this._clients = [];
    this._UsedSOWs = [];
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      selectedType: this.selectedType.toString(),
    }
    this.logSvc.ActionLog(PageNames.NonBillables, '', 'Pages/Events', 'getClients', 'Get Clients', '', '', JSON.stringify(ActivityParams)); // ActivityLog
    this.timesysSvc.getClients()
      .subscribe(
        (data) => {
          this.showSpinner = false;
          if (data !== undefined && data !== null && data.length > 0) {
            if (this.selectedType === 'Active') {
              this._clients = data.filter(P => P.Inactive === false);
            } else if (this.selectedType === 'Inactive') {
              this._clients = data.filter(P => P.Inactive === true);
            } else {
              this._clients = data;
            }

            this._UsedSOWs = data.filter(P => P.Inactive === false && P.SOWID.toString() !== '' && P.SOWID > 0);
          } else {
            this._clients = [];
          }
          if (this._clients !== undefined && this._clients !== null && this._clients.length > 0) {
            this._recData = this._clients.length;
            this.getUsedClients();
          }
          // this.showReport = true;

          // else {
          //   this._recData = 'No clients found';
          // }
        }
      );
  }
  getUsedClients() {
    this.showSpinner = true;
    this.timesysSvc.getUsedBillingCodes(this._billingCodes.Client)
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            this._clientsUsed = data;
            for (let i = 0; i < this._clients.length; i++) {
              const cust = this._clientsUsed.filter(P => P.Id === this._clients[i].Id);
              if (cust.length > 0) {
                this._clients[i].InUse = true;
              } else {
                this._clients[i].InUse = false;
              }
            }
          }
          this.showSpinner = false;
          this.showReport = true;
        }
      );
  }

  getSOWByCustomerID(SOWID: string) {
    this.showSpinner = true;
    this._SOWs = [];
    let ActivityParams: any; // ActivityLog
    ActivityParams = {
      SOWID: SOWID.toString(),
      customerName: this._frm.controls['customerName'].value.toString()
    }
    this.logSvc.ActionLog(PageNames.NonBillables, '', 'Pages/Events', 'getSOWByCustomerID', 'Get SOW By Customer', '', '', JSON.stringify(ActivityParams)); // ActivityLog
    this.timesysSvc.getSOWs(this._frm.controls['customerName'].value.toString())
      .subscribe(
        (data) => {
          this._SOWs = [];
          if (data !== undefined && data !== null && data.length > 0) {
            data = data.filter(m => !(this._UsedSOWs.
              filter(c => (this._IsEdit && c.Id !== this._selectedClient.Id && c.SOWID !== this._selectedClient.SOWID) || !this._IsEdit).
              map(s => s.SOWID).
              includes(m.SOWID)));

            for (let i = 0; i < data.length; i++) {
              this._SOWs.push({ label: data[i].SOWName, value: data[i].SOWID });
            }
            if (SOWID !== undefined && SOWID !== null && SOWID !== '') {
              this._frm.controls['SOW'].setValue(SOWID.toString());
            }
          }
          this.showSpinner = false;
        }
      );
  }

  showClients(event: any) {
    if (this.selectedType === 'Both') {
      this.cols = [
        { field: 'ClientName', header: 'Billing Code Name', width: '400px' },
        { field: 'Key', header: 'Code', width: '200px' },
        { field: 'CustomerName', header: 'Customer Name', width: '200px' },
        { field: 'SOWName', header: 'SOW Name', width: '150px' },
        { field: 'PONumber', header: 'PO#', width: '150px' },
        { field: 'Inactive', header: 'Inactive', width: '100px' },
      ];
    } else {
      this.cols = [
        { field: 'ClientName', header: 'Billing Code Name', width: '400px' },
        { field: 'Key', header: 'Code', width: '200px' },
        { field: 'CustomerName', header: 'Customer Name', width: '200px' },
        { field: 'SOWName', header: 'SOW Name', width: '150px' },
        { field: 'PONumber', header: 'PO#', width: '150px' },
      ];
    }
    this.getClients();
  }

  addClient() {
    this.logSvc.ActionLog(PageNames.NonBillables, '', 'Pages/Events', 'addClient', 'Add Client', '', '', ''); // ActivityLog
    this._IsEdit = false;
    this._selectedClient = {};
    this.chkInactive = false;
    this.resetForm();
    this.setDataToControls(this._selectedClient);
    this.clientHdr = 'Add New Billing Code';
    this.clientDialog = true;
  }

  editClient(data: Clients) {
    this.logSvc.ActionLog(PageNames.NonBillables, '', 'Pages/Events', 'editClient', 'Edit Client', '', '', JSON.stringify(data)); // ActivityLog
    this._IsEdit = true;
    this._selectedClient = new Clients();
    this._selectedClient.Id = data.Id;
    this._selectedClient.Key = data.Key;
    this._selectedClient.ClientName = data.ClientName;
    this._selectedClient.PONumber = data.PONumber;
    this._selectedClient.BillingCycle = data.BillingCycle;
    this._selectedClient.CustomerId = data.CustomerId;
    this._selectedClient.CustomerName = data.CustomerName;
    this._selectedClient.CompanyId = data.CompanyId;
    this._selectedClient.Inactive = data.Inactive;
    this._selectedClient.ChargeType = data.ChargeType;
    this._selectedClient.CreatedOn = data.CreatedOn;
    this.chkInactive = false;
    this.resetForm();
    this.setDataToControls(data);
    this.clientHdr = 'Edit Billing Code';
    this.clientDialog = true;
  }

  addControls() {
    this._frm.addControl('clientCode', new FormControl(null, Validators.required)); // @"^[a-zA-Z0-9\040\047\046\055\056\057]*$"
    this._frm.addControl('clientName', new FormControl(null, Validators.required));
    this._frm.addControl('billingCycle', new FormControl(null));
    this._frm.addControl('poNumber', new FormControl(null));
    this._frm.addControl('customerName', new FormControl(null));
    this._frm.addControl('SOW', new FormControl(null));
    this._frm.addControl('parentCompany', new FormControl(null));
    this.chkInactive = false;
  }

  setDataToControls(data: Clients) {
    if (data.Key !== undefined && data.Key !== null) {
      this._frm.controls['clientCode'].setValue(data.Key);
    }
    if (data.ClientName !== undefined && data.ClientName !== null) {
      this._frm.controls['clientName'].setValue(data.ClientName);
    }
    if (data.PONumber !== undefined && data.PONumber !== null) {
      this._frm.controls['poNumber'].setValue(data.PONumber);
    }
    if (data.BillingCycle !== undefined && data.BillingCycle !== null) {
      this._frm.controls['billingCycle'].setValue(data.BillingCycle);
    } else {
      this._frm.controls['billingCycle'].setValue('M');
    }
    if (data.CustomerId !== undefined && data.CustomerId !== null && data.CustomerId.toString() !== '-1') {
      this._frm.controls['customerName'].setValue(data.CustomerId.toString());
      if (data.SOWID !== undefined && data.SOWID !== null) {
        this.getSOWByCustomerID(data.SOWID.toString());
      } else {
        this.getSOWByCustomerID('');
      }
    }
    this._OldCompanyID = '';
    if (data.CompanyId !== undefined && data.CompanyId !== null && data.CompanyId.toString() !== '-1') {
      this._frm.controls['parentCompany'].setValue(data.CompanyId.toString());
      this._OldCompanyID = data.CompanyId.toString();
    }
    if (data.Inactive !== undefined && data.Inactive !== null) {
      this.chkInactive = data.Inactive;
    } else {
      this.chkInactive = false;
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
    this._selectedClient = null;
    this.chkInactive = false;
    this.resetForm();
    this.clientHdr = 'Add New Billing Code';
    this.clientDialog = false;
  }

  cancelClient() {
    this.clearControls();
  }

  saveClient() {
    if (this._IsEdit === false) {
      if (this._selectedClient === undefined || this._selectedClient === null) {
        this._selectedClient = {};
      }
      this._selectedClient.Id = -1;
    }
    if (!this.IsControlUndefinedAndHasValue('clientName')) {
      this._selectedClient.ClientName = this._frm.controls['clientName'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('clientCode')) {
      this._selectedClient.Key = this._frm.controls['clientCode'].value.toString().toUpperCase().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('parentCompany')) {
      this._selectedClient.CompanyId = this._frm.controls['parentCompany'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('customerName')) {
      this._selectedClient.CustomerId = this._frm.controls['customerName'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('SOW')) {
      this._selectedClient.SOWID = this._frm.controls['SOW'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('billingCycle')) {
      this._selectedClient.BillingCycle = this._frm.controls['billingCycle'].value.toString().trim();
    }
    if (!this.IsControlUndefinedAndHasValue('poNumber')) {
      this._selectedClient.PONumber = this._frm.controls['poNumber'].value.toString().trim();
    }
    this._selectedClient.Inactive = this.chkInactive;
    this._selectedClient.ChargeType = this._billingCodes.Client;
    this.logSvc.ActionLog(PageNames.NonBillables, '', 'Pages/Events', 'saveClient', 'Save Client', '', '', JSON.stringify(this._selectedClient)); // ActivityLog
    this.checkWarnings();
  }



  checkWarnings() {
    let errorMsg = '';
    if (this.chkInactive) {
      if (this._IsEdit) {
        this.timesysSvc.IsBillingCodeUsedOnAnyPendingTimesheets(this._selectedClient.Id.toString(), this._billingCodes.Client)
          .subscribe(
            (outputData) => {
              if (outputData !== undefined && outputData !== null && outputData.length > 0) {
                errorMsg += 'Inactivating this billing code will remove it and associated hours from all unsubmitted timesheets.<br>';
              } else {
                errorMsg += 'Billing Code is marked as inactive. It will not appear on new timesheets.<br>';
              }
              if (errorMsg.trim() !== '') {
                this.showConfirmation(errorMsg, 0);
              } else {
                this.CheckDBWarnings();
              }
            });
      } else {
        this.CheckDBWarnings();
      }
    } else {
      if (this.IsControlUndefinedAndHasValue('parentCompany')) {
        errorMsg += 'No company was selected. No holiday schedule will be assigned to this billing code.<br>';
      }
      if (this.IsControlUndefinedAndHasValue('customerName')) {
        errorMsg += 'No customer to invoice was selected.<br>';
      }
      if (this.IsControlUndefinedAndHasValue('poNumber')) {
        errorMsg += 'No purchase order number was entered.<br>';
      }
      if (errorMsg.trim() !== '') {
        this.showConfirmation(errorMsg, 0);
      } else {
        this.CheckDBWarnings();
      }
    }
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


  showConfirmation(errorMsg: string, mode: number) {
    this.confSvc.confirm({
      message: errorMsg + 'Do you want to continue?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (mode === 0) {
          this.CheckDBWarnings();
        } else {
          this.SaveClientSPCall();
        }
      },
      reject: () => {
      }
    });
  }


  CheckDBWarnings() {
    let errorMsg = '';
    if (this._IsEdit) {
      if (this._OldCompanyID !== '' && !this.IsControlUndefinedAndHasValue('parentCompany')) {
        this.timesysSvc.CompaniesHaveSameHolidays(this._OldCompanyID.toString(),
          this._frm.controls['parentCompany'].value.toString().trim())
          .subscribe(
            (outputData) => {
              this.timesysSvc.HolidayHoursChargedToCompany(this._OldCompanyID.toString())
                .subscribe(
                  (outputData1) => {
                    if (outputData !== undefined && outputData !== null && outputData.length > 0) {
                      errorMsg += 'The new company has different holidays which effects submitted timesheets. The company was reset.<br>';
                      this._frm.controls['parentCompany'].setValue(this._OldCompanyID.toString());
                    }
                    // if (errorMsg.trim() === '' && outputData1 !== undefined && outputData1 !== null && outputData1.length > 0) {
                    //   if (+outputData1[0].TotalHours > 0) {
                    //     errorMsg += 'The old company have hours assigned to its holidays.<br>';
                    //   }
                    // }
                    if (errorMsg.trim() !== '') {
                      this.msgSvc.add({
                        key: 'alert',
                        sticky: true,
                        severity: 'warn',
                        summary: 'Info Message',
                        detail: errorMsg
                      });
                    } else {
                      this.SaveClientSPCall();
                    }
                  });
            });
      } else {
        this.SaveClientSPCall();
      }
    } else {
      this.SaveClientSPCall();
    }
  }

  SaveClientSPCall() {
    this.timesysSvc.Client_InsertOrUpdate(this._selectedClient)
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
              detail: 'Billing Code saved successfully'
            });
            this.clearControls();
            this.getClients();
          }
        },
        (error) => {
          console.log(error);
        });
  }

  deleteClient(dataRow: any) {
    this.logSvc.ActionLog(PageNames.NonBillables, '', 'Pages/Events', 'deleteClient', 'Delete Client', '', '', JSON.stringify(dataRow)); // ActivityLog
    dataRow.ChargeType = this._billingCodes.Client;
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.ClientName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Client_Delete(dataRow)
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
                  detail: 'Billing Code deleted successfully'
                });
                this.getClients();
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
