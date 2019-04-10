import { Injectable } from '@angular/core';
import { AppSettings } from '../model/objects';
import { TimesystemService } from './timesystem.service';
import { environment } from 'src/environments/environment';
import { SortEvent } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  GlobalAppSettings: AppSettings[] = [];
  ShowHelpFile = false;
  HelpFileName = '';
  HelpPageId = '';
  constructor(
    private timesysSvc: TimesystemService,
  ) { }

  showHelp(fileName: string) {
    this.HelpFileName = fileName;
    // this.HelpPageId = PageId;
    this.ShowHelpFile = true;
  }

  clearHelp() {
    this.HelpFileName = '';
    this.HelpPageId = '';
    this.ShowHelpFile = false;
  }


  setAppSettings() {
    return new Promise((resolve, reject) => {
      this.timesysSvc.getAppSettings().subscribe(response => {
        this.GlobalAppSettings = response;
        resolve(true);
      });
    });
  }

  getAppSettingsValue(DataKey: string): any {
    let AppSettingsValue = '';
    if (this.GlobalAppSettings !== undefined && this.GlobalAppSettings !== null && this.GlobalAppSettings.length > 0) {
      const AppsettingsVal: AppSettings = this.GlobalAppSettings.find(m => m.DataKey === DataKey);
      if (AppsettingsVal !== undefined && AppsettingsVal !== null) {
        AppSettingsValue = AppsettingsVal.Value;
      }
    }
    return AppSettingsValue;
  }


  isArrayEqual(value, other) {

    // Get the value type
    const type = Object.prototype.toString.call(value);

    // If the two objects are not the same type, return false
    if (type !== Object.prototype.toString.call(other)) { return false; }

    // If items are not an object or array, return false
    if (['[object Array]', '[object Object]'].indexOf(type) < 0) { return false; }

    // Compare the length of the length of the two items
    const valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
    const otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
    if (valueLen !== otherLen) { return false; }

    // Compare two items


    // Compare properties
    if (type === '[object Array]') {
      for (let i = 0; i < valueLen; i++) {
        if (this.compare(value[i], other[i]) === false) { return false; }
      }
    } else {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          if (this.compare(value[key], other[key]) === false) { return false; }
        }
      }
    }

    // If nothing failed, return true
    return true;

  }

  compare(item1, item2) {

    // Get the object type
    const itemType = Object.prototype.toString.call(item1);

    // If an object or array, compare recursively
    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!this.isArrayEqual(item1, item2)) { return false; } // Need to check same function calling
    } else {

      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) { return false; }

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) { return false; }
      } else {
        if (item1 !== item2) { return false; }
      }

    }
  }


  customSortByCols(event: SortEvent, DateCols: string[], NumberCols: string[]) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];

      if (DateCols.includes(event.field)) {
        value1 = Date.parse(value1);
        value2 = Date.parse(value2);
      }

      if (NumberCols.includes(event.field)) {
        value1 = (+value1);
        value2 = (+value2);
      }

      let result = null;

      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } else if (typeof value1 === 'string' && typeof value2 === 'string') {
        result = value1.localeCompare(value2);
      } else {
        result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
      }

      return (event.order * result);
    });
  }



}
