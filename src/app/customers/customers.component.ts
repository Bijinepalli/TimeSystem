import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Customers } from '../model/objects';
import { TimesystemService } from '../service/timesystem.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonService } from '../service/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {


  types: SelectItem[];
  selectedType: string;

  _customers: Customers[] = null;
  _customersUsed: Customers[] = null;
  cols: any;
  _recData = 0;

  customerDialog = false;
  customerHdr = 'Add Customer';
  _frm = new FormGroup({});
  _IsEdit = false;
  _selectedCustomer: Customers;
  chkInactive = false;
  _HasEdit = true;
  showSpinner = false;

  ParamSubscribe: any;
  IsSecure = false;
  showReport: boolean;

  // tslint:disable-next-line:max-line-length
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confSvc: ConfirmationService,
    private msgSvc: MessageService,
    private timesysSvc: TimesystemService,
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

    this.types = [];
    this.selectedType = 'Active';

    this._customers = null;
    this._customersUsed = null;
    this.cols = {};
    this._recData = 0;

    this.customerDialog = false;
    this._frm = new FormGroup({});
    this._IsEdit = false;
    this._selectedCustomer = new Customers();
    this.chkInactive = false;
    this._HasEdit = true;
  }

  Initialisations() {
    this.showSpinner = true;
    this.types = [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Both', value: 'Both' }
    ];
    this.selectedType = 'Active';
    this.cols = [
      { field: 'CustomerName', header: 'Customer Name', align: 'left', width: 'auto' },
      { field: 'CustomerNumber', header: 'Customer Number', align: 'right', width: '200px' },
    ];
    this.selectedType = 'Active';
    this.getCustomers();
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

  getCustomers() {
    this.showSpinner = true;
    this.showReport = false;
    this._recData = 0;
    this.timesysSvc.getCustomers()
      .subscribe(
        (data) => {
          if (data !== undefined && data !== null && data.length > 0) {
            if (this.selectedType === 'Active') {
              this._customers = data.filter(P => P.Inactive === false);
            } else if (this.selectedType === 'Inactive') {
              this._customers = data.filter(P => P.Inactive === true);
            } else {
              this._customers = data;
            }
          } else {
            this._customers = [];
          }
          if (this._customers !== null && this._customers.length > 0) {
            this._recData = this._customers.length;
          }
          this.showReport = true;
          this.showSpinner = false;
          // else {
          //   this._recData = 'No customers found';
          // }
        }
      );
  }
  clickButton(event: any) {
    if (this.selectedType === 'Both') {
      this.cols = [
        { field: 'CustomerName', header: 'Customer Name' },
        { field: 'CustomerNumber', header: 'Customer Number' },
        { field: 'Inactive', header: 'Inactive' },
      ];
    } else {
      this.cols = [
        { field: 'CustomerName', header: 'Customer Name' },
        { field: 'CustomerNumber', header: 'Customer Number' },
      ];
    }
    this.clearControls();
    this.getCustomers();
  }

  addCustomer() {
    this._IsEdit = false;
    this.chkInactive = false;
    this._selectedCustomer = {};
    this.resetForm();
    this.setDataToControls(this._selectedCustomer);
    this.customerHdr = 'Add New Customer';
    this.customerDialog = true;
  }

  editCustomer(data: Customers) {
    this._IsEdit = true;
    this.chkInactive = false;
    this._selectedCustomer = new Customers();
    this._selectedCustomer.Id = data.Id;
    this._selectedCustomer.CustomerName = data.CustomerName;
    this._selectedCustomer.CustomerNumber = data.CustomerNumber;
    this._selectedCustomer.InUse = data.InUse;
    this._selectedCustomer.Inactive = data.Inactive;
    this.resetForm();
    this.setDataToControls(this._selectedCustomer);
    this.customerHdr = 'Edit Customer';
    this.customerDialog = true;
  }

  addControls() {
    this._frm.addControl('customerName', new FormControl(null,
      [Validators.required,
      Validators.pattern('^[a-zA-Z0-9\\040\\047\\055]*$'),
      ]
    ));
    this._frm.addControl('customerNumber', new FormControl(null,
      [Validators.required,
      Validators.pattern('^[0-9]{7}$'),
      ]
    ));
    this.chkInactive = false;
  }

  setDataToControls(data: Customers) {
    this._frm.controls['customerName'].setValue(data.CustomerName);
    this._frm.controls['customerNumber'].setValue(data.CustomerNumber);
    if (data.Inactive !== undefined) {
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
    this.chkInactive = false;
    this._selectedCustomer = null;
    this.resetForm();
    this.customerHdr = 'Add New Customer';
    this.customerDialog = false;
  }

  cancelCustomer() {
    this.clearControls();
  }

  saveCustomer() {
    if (this._IsEdit === false) {
      if (this._selectedCustomer === undefined || this._selectedCustomer === null) {
        this._selectedCustomer = {};
      }
      this._selectedCustomer.Id = -1;
    }
    this._selectedCustomer.CustomerName = this._frm.controls['customerName'].value.toString().trim();
    this._selectedCustomer.CustomerNumber = this._frm.controls['customerNumber'].value.toString().trim();
    this._selectedCustomer.Inactive = this.chkInactive;
    this.SaveCustomerSPCall();
  }

  SaveCustomerSPCall() {
    this.timesysSvc.Customer_InsertOrUpdate(this._selectedCustomer)
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
            this.msgSvc.add({ key: 'saveSuccess', severity: 'success', summary: 'Info Message', detail: 'Customer saved successfully' });
            this.clearControls();
            this.getCustomers();
          }
        },
        (error) => {
          console.log(error);
        });
  }
  deleteCustomer(dataRow: Customers) {
    this.confSvc.confirm({
      message: 'Are you sure you want to delete ' + dataRow.CustomerName + '?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        /* do nothing */
        this.timesysSvc.Customer_Delete(dataRow)
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
                  detail: 'Customer deleted successfully'
                });
                this.getCustomers();
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
