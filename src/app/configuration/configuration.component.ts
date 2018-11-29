import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppSettings } from '../model/objects';
import { TS } from 'typescript-linq';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  helpText: any;
  visibleHelp = false;

  constructor(private timesysSvc: TimesystemService, private router: Router,
    private msgSvc: MessageService, private confSvc: ConfirmationService) { }

  ngOnInit() {
  }

  onTabChange(event) {
    // this.msgSvc.add({ severity: 'info', summary: 'Tab Expanded', detail: 'Index: ' + event.index });
  }

  showHelp(file: string) {
    this.timesysSvc.getHelp(file)
      .subscribe(
        (data) => {
          this.helpText = data;
          this.visibleHelp = true;
        }
      );
  }
}
