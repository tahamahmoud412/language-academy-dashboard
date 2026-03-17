import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomDashboard } from './bottom-dashboard';

describe('BottomDashboard', () => {
  let component: BottomDashboard;
  let fixture: ComponentFixture<BottomDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
