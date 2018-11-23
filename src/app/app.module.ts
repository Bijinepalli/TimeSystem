

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
import {PickListModule} from 'primeng/picklist';
import {SelectButtonModule} from 'primeng/selectbutton';


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



const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
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



      // { path: 'burndown', component: BurndownchartComponent },
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
    EmployeesComponent,
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
    RouterModule.forRoot(appRoutes), AccordionModule,
    InplaceModule, ScrollPanelModule, TieredMenuModule,
    KeyFilterModule, DataViewModule, InputSwitchModule, SlideMenuModule, PickListModule, SelectButtonModule
  ],
  providers: [TimesystemService, MessageService, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
