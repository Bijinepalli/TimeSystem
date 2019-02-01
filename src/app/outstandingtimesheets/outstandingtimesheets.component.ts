import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TimesystemService } from '../service/timesystem.service';
import { CommonService } from '../service/common.service';
import { TimeSheet } from '../model/objects';

@Component({
  selector: 'app-outstandingtimesheets',
  templateUrl: './outstandingtimesheets.component.html',
  styleUrls: ['./outstandingtimesheets.component.css'],
  providers: [DatePipe, DecimalPipe],
})
export class OutstandingtimesheetsComponent implements OnInit {
  _outStandings: TimeSheet[];
  cols: any;
  constructor(private timesysSvc: TimesystemService, private router: Router, private msgSvc: MessageService,
    private confSvc: ConfirmationService, private activatedRoute: ActivatedRoute,
    private fb: FormBuilder, private datePipe: DatePipe, private decimal: DecimalPipe, private commonSvc: CommonService) {


  }

  ngOnInit() {
    const numbers = this.commonSvc.getAppSettingsValue('UnsubmittedTimePeriods2');
    this.timesysSvc.getOutStandingTimesheets(localStorage.getItem('UserId'), numbers).subscribe(
      (data) => {
        this._outStandings = data;
        console.log(JSON.stringify(data));
        this.cols = [
          { field: 'PeriodEnd', header: 'Period Ending' },
          { field: 'ApprovalStatus', header: 'Status' },
          { field: 'TimeStamp', header: 'Created On' },
        ];
      });
  }
  editTimeSheet(timeSheet: TimeSheet) {
    this.confSvc.confirm({
      message: 'Do you want to edit the timesheet?',
      accept: () => {
        if (timeSheet.Id === -1) {
          localStorage.setItem('PeriodEndDate', timeSheet.PeriodEnd);
        }
        this.router.navigate(['/menu/maintaintimesheet/' + timeSheet.Id], { skipLocationChange: true });
      }
    });
  }

}
