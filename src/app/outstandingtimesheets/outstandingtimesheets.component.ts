import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService, SortEvent } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { TimeSheet } from '../model/objects';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-outstandingtimesheets',
  templateUrl: './outstandingtimesheets.component.html',
  styleUrls: ['./outstandingtimesheets.component.css'],
  providers: [DatePipe, DecimalPipe],
})
export class OutstandingtimesheetsComponent implements OnInit {
  _outStandings: TimeSheet[];
  cols: any;
  DisplayDateFormat = '';
  DisplayDateTimeFormat = '';
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private datePipe: DatePipe, private decimal: DecimalPipe, private commonSvc: CommonService) {


  }

  ngOnInit() {
    this.DisplayDateFormat = this.commonSvc.getAppSettingsValue('DisplayDateFormat');
    this.DisplayDateTimeFormat = this.commonSvc.getAppSettingsValue('DisplayTimeStampFormat');
    const numbers = this.commonSvc.getAppSettingsValue('UnsubmittedTimePeriods2');
    this.timesysSvc.getOutStandingTimesheets(sessionStorage.getItem(environment.buildType.toString() + '_' + 'UserId'),
      numbers).subscribe(
        (data) => {
          this._outStandings = data;
          this.cols = [
            { field: 'PeriodEnd', header: 'Period Ending', align: 'center', width: 'auto' },
            { field: 'ApprovalStatus', header: 'Status', align: 'left', width: 'auto' },
            { field: 'TimeStamp', header: 'Created On', align: 'center', width: 'auto' },
          ];
        });
  }
  editTimeSheet(timeSheet: TimeSheet) {
    this.confSvc.confirm({
      message: 'Do you want to edit the timesheet?',
      accept: () => {
        if (timeSheet.Id < 0) {
          // sessionStorage.setItem(environment.buildType.toString() + '_' + 'PeriodEndDate', timeSheet.PeriodEnd);
          this.router.navigate(['/menu/maintaintimesheet/' + timeSheet.Id + '/' + timeSheet.PeriodEndDate], { skipLocationChange: true });
        } else {
          this.router.navigate(['/menu/maintaintimesheet/' + timeSheet.Id], { skipLocationChange: true });
        }
      }
    });
  }
  customSort(event: SortEvent) {
    this.commonSvc.customSortByCols(event, ['PeriodEnd', 'CreatedOn'], []);
  }
}
