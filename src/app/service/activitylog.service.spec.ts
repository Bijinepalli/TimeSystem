import { TestBed } from '@angular/core/testing';

import { ActivitylogService } from './activitylog.service';

describe('ActivitylogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActivitylogService = TestBed.get(ActivitylogService);
    expect(service).toBeTruthy();
  });
});
