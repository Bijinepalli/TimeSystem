import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { TimesystemService } from '../service/timesystem.service';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
