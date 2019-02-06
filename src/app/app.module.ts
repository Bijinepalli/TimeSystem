

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  InplaceModule, SidebarModule, CarouselModule, MenuModule, PanelModule, ChartModule,
  InputTextModule, ButtonModule, InputMaskModule, InputTextareaModule, EditorModule, CalendarModule,
  RadioButtonModule, FieldsetModule, DropdownModule, MultiSelectModule, ListboxModule, SpinnerModule,
  SliderModule, RatingModule, DataTableModule, ContextMenuModule, TabViewModule, DialogModule, StepsModule,
  ScheduleModule, TreeModule, GMapModule, DataGridModule, TooltipModule, ConfirmDialogModule,
  GrowlModule, DragDropModule, GalleriaModule, SlideMenuModule
} from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProgressBarModule } from 'primeng/progressbar';
import { BlockUIModule } from 'primeng/blockui';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AccordionModule } from 'primeng/accordion';
import { KeyFilterModule } from 'primeng/keyfilter';
import { DataViewModule } from 'primeng/dataview';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PickListModule } from 'primeng/picklist';
import { SelectButtonModule } from 'primeng/selectbutton';

import { PanelMenuModule } from 'primeng/panelmenu';

import { ToastModule } from 'primeng/toast';

import { MessageService, ConfirmationService } from 'primeng/api';

import { SanitizeHtmlPipe } from './sharedpipes/sanitizeHtmlString.pipe';
import { DateTimeFormatPipe } from './sharedpipes/dateformat';

import { TimesystemService } from './service/timesystem.service';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FielderrorsComponent } from './fielderrors/fielderrors.component';
import { MasterComponent } from './master/master.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Master2Component } from './master2/master2.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { CompaniesComponent } from './companies/companies.component';
import { ProjectsComponent } from './projects/projects.component';
import { CustomersComponent } from './customers/customers.component';
import { ClientsComponent } from './clients/clients.component';
import { NonbillablesComponent } from './nonbillables/nonbillables.component';
import { EmployeesComponent } from './employees/employees.component';
import { MasterreportsComponent } from './reports/masterreports/masterreports.component';
import { ReportsdashboardComponent } from './reports/reportsdashboard/reportsdashboard.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { RatesComponent } from './rates/rates.component';
import { AccessrightsComponent } from './accessrights/accessrights.component';
import { AppsettingsComponent } from './appsettings/appsettings.component';
import { BillingcodelistingComponent } from './reports/billingcodelisting/billingcodelisting.component';
import { ListemployeesreportsComponent } from './reports/listemployeesreports/listemployeesreports.component';
import { ForgotpasswordComponent } from './forgotpassword/forgotpassword.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { EmployeesbybillingcodeComponent } from './reports/employeesbybillingcode/employeesbybillingcode.component';
import { EmployeelogindataComponent } from './reports/employeelogindata/employeelogindata.component';
import { HolidaysreportComponent } from './reports/holidaysreport/holidaysreport.component';
import { UnusedbillingcodesComponent } from './reports/unusedbillingcodes/unusedbillingcodes.component';
import { BillablehoursComponent } from './reports/billablehours/billablehours.component';
import { NonbillablehoursComponent } from './reports/nonbillablehours/nonbillablehours.component';
import { InvoicedataComponent } from './reports/invoicedata/invoicedata.component';
import { NonbillablehoursAddgroupComponent } from './reports/nonbillablehours-addgroup/nonbillablehours-addgroup.component';
import { PeriodendhoursComponent } from './reports/periodendhours/periodendhours.component';
import { PendingtimesheetsComponent } from './reports/pendingtimesheets/pendingtimesheets.component';
import { HoursbyemployeeComponent } from './reports/hoursbyemployee/hoursbyemployee.component';
import { WeeklyhoursbyemployeeComponent } from './reports/weeklyhoursbyemployee/weeklyhoursbyemployee.component';
import { EmployeehoursbybillingcodeComponent } from './reports/employeehoursbybillingcode/employeehoursbybillingcode.component';
import { EmployeeclientratesComponent } from './reports/employeeclientrates/employeeclientrates.component';
import { HoursbytimesheetcategoryComponent } from './reports/hoursbytimesheetcategory/hoursbytimesheetcategory.component';
import { PayrollComponent } from './reports/payroll/payroll.component';
import { PaystubsComponent } from './paystubs/paystubs.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { SelecttimesheetperiodComponent } from './selecttimesheetperiod/selecttimesheetperiod.component';
import { MaintaintimesheetComponent } from './maintaintimesheet/maintaintimesheet.component';

import { CommonService } from './service/common.service';
import { MailsComponent } from './mails/mails.component';
import { EmployeehoursComponent } from './reports/employeehours/employeehours.component';
import { OutstandingtimesheetsComponent } from './outstandingtimesheets/outstandingtimesheets.component';
import { ApprovaltimesheetsComponent } from './approvaltimesheets/approvaltimesheets.component';
import { AccesssystemComponent } from './accesssystem/accesssystem.component';
import { TimeFormatPipe } from './sharedpipes/timeformat';
import { DepartmentsComponent } from './departments/departments.component';
import { RevenuereportComponent } from './reports/revenuereport/revenuereport.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'changepassword/:code', component: ForgotpasswordComponent },
  {
    path: 'menu',
    component: Master2Component,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'holidays', component: HolidaysComponent },
      { path: 'companies', component: CompaniesComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'nonbillables', component: NonbillablesComponent },
      { path: 'configuration', component: ConfigurationComponent },
      { path: 'employees', component: EmployeesComponent },
      { path: 'addemployee', component: AddEmployeeComponent },
      { path: 'addemployee/:id', component: AddEmployeeComponent },
      { path: 'accessrights', component: AccessrightsComponent },
      { path: 'appsettings', component: AppsettingsComponent },
      { path: 'billingcodelisting', component: BillingcodelistingComponent },
      { path: 'listemployeesreports', component: ListemployeesreportsComponent },
      { path: 'employeesbillingcode', component: EmployeesbybillingcodeComponent },
      { path: 'employeelogindata', component: EmployeelogindataComponent },
      { path: 'holidayreports', component: HolidaysreportComponent },
      { path: 'unusedbillingcodes', component: UnusedbillingcodesComponent },
      { path: 'billablehours', component: BillablehoursComponent },
      { path: 'nonbillablehours', component: NonbillablehoursComponent },
      { path: 'nonbillableaddgroup/:id', component: NonbillablehoursAddgroupComponent },
      { path: 'invoicedata', component: InvoicedataComponent },
      { path: 'periodendhours', component: PeriodendhoursComponent },
      { path: 'hoursbyemployee', component: HoursbyemployeeComponent },
      { path: 'weeklyhoursbyemployee', component: WeeklyhoursbyemployeeComponent },
      { path: 'employeehoursbybillingcode', component: EmployeehoursbybillingcodeComponent },
      { path: 'employeeclientrates', component: EmployeeclientratesComponent },
      { path: 'hoursbytimesheetcategory', component: HoursbytimesheetcategoryComponent },
      { path: 'pendingtimesheets', component: PendingtimesheetsComponent },
      { path: 'payroll', component: PayrollComponent },
      { path: 'paystubs', component: PaystubsComponent },
      { path: 'employeehours', component: EmployeehoursComponent },
      { path: 'timesheets', component: TimesheetsComponent },
      { path: 'selecttimesheetperiod', component: SelecttimesheetperiodComponent },
      // { path: 'burndown', component: BurndownchartComponent },
      { path: 'maintaintimesheet', component: MaintaintimesheetComponent },
      { path: 'maintaintimesheet/:id', component: MaintaintimesheetComponent },
      { path: 'maintaintimesheet/:id/:periodEnd', component: MaintaintimesheetComponent },
      // { path: 'startnewsprint', component: StartnewsprintComponent },
      // { path: 'viewissue/:id/:sid/:mode', component: ViewissueComponent },
      // { path: 'searchissue/:id', component: SearchissueComponent },
      // { path: 'addissue', component: AddissueComponent },
      // { path: 'addissue/:id', component: AddissueComponent },
      // { path: 'addissue/:id/:sid/:mode', component: AddissueComponent },
      // { path: 'addissue/:id/:sid/:mode/:ts', component: AddissueComponent },
      // { path: 'editsubtask/:id/:sprintid/:subtaskid/:mode', component: EditsubtaskComponent },
      // { path: 'addsprint', component: AddsprintComponent },
      // { path: 'issuetracker', component: IssuetrackerComponent },
      // { path: 'issuetracker/:mode', component: IssuetrackerComponent },
      // { path: 'issuetracker/:mode/:ts', component: IssuetrackerComponent },
      { path: 'mails', component: MailsComponent },
      { path: 'access', component: AccesssystemComponent },
      { path: 'departments', component: DepartmentsComponent },
      { path: 'revenuereport', component: RevenuereportComponent },
    ],
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'menureports',
    component: MasterreportsComponent,
    children: [
      { path: 'dashboard', component: ReportsdashboardComponent },
    ]
  },
  // {
  //   path: 'admin',
  //   component: AdminmasterComponent,
  //   children: [
  //     { path: 'invdashboard', component: AdminmasterComponent },
  //   ]
  // }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FielderrorsComponent,
    SanitizeHtmlPipe,
    DateTimeFormatPipe,
    MasterComponent,
    DashboardComponent,
    Master2Component,
    HolidaysComponent,
    CompaniesComponent,
    ProjectsComponent,
    CustomersComponent,
    ClientsComponent,
    NonbillablesComponent,
    MasterreportsComponent,
    ReportsdashboardComponent,
    ConfigurationComponent,
    EmployeesComponent,
    AddEmployeeComponent,
    RatesComponent,
    AccessrightsComponent,
    AppsettingsComponent,
    BillingcodelistingComponent,
    ListemployeesreportsComponent,
    ForgotpasswordComponent,
    ChangepasswordComponent,
    EmployeelogindataComponent,
    MailsComponent,
    EmployeesbybillingcodeComponent,
    HolidaysreportComponent,
    UnusedbillingcodesComponent,
    BillablehoursComponent,
    NonbillablehoursComponent,
    InvoicedataComponent,
    NonbillablehoursAddgroupComponent,
    PeriodendhoursComponent,
    PendingtimesheetsComponent,
    HoursbyemployeeComponent,
    WeeklyhoursbyemployeeComponent,
    EmployeehoursbybillingcodeComponent,
    EmployeeclientratesComponent,
    HoursbytimesheetcategoryComponent,
    PayrollComponent,
    PaystubsComponent,
    TimesheetsComponent,
    SelecttimesheetperiodComponent,
    MaintaintimesheetComponent,
    EmployeehoursComponent,
    OutstandingtimesheetsComponent,
    ApprovaltimesheetsComponent,
    AccesssystemComponent,
    TimeFormatPipe,
    DepartmentsComponent,
    RevenuereportComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    HttpClientModule,
    CarouselModule,
    MenuModule,
    PanelModule,
    ChartModule,
    InputTextModule,
    ButtonModule,
    InputMaskModule,
    InputTextareaModule,
    EditorModule,
    CalendarModule,
    RadioButtonModule,
    FieldsetModule,
    DropdownModule,
    MultiSelectModule,
    ListboxModule,
    SpinnerModule,
    SliderModule,
    RatingModule,
    DataTableModule,
    ContextMenuModule,
    TabViewModule,
    DialogModule,
    StepsModule,
    ScheduleModule,
    TreeModule,
    GMapModule,
    DataGridModule,
    TooltipModule,
    ConfirmDialogModule,
    GrowlModule,
    DragDropModule,
    GalleriaModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    TableModule,
    SidebarModule,
    CheckboxModule,
    CardModule,
    OverlayPanelModule,
    ProgressSpinnerModule, ProgressBarModule, BlockUIModule, SplitButtonModule,
    FileUploadModule,
    RouterModule.forRoot(appRoutes, { onSameUrlNavigation: 'reload' }), AccordionModule,
    InplaceModule, ScrollPanelModule, TieredMenuModule,
    KeyFilterModule, DataViewModule, InputSwitchModule, SlideMenuModule, PickListModule, SelectButtonModule, PanelMenuModule
  ],
  providers: [TimesystemService, MessageService, ConfirmationService, CommonService,
    { provide: APP_INITIALIZER, useFactory: jokesProviderFactory, deps: [CommonService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function jokesProviderFactory(provider: CommonService) {
  return () => provider.setAppSettings();
}
