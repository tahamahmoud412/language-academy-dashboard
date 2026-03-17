import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopMetricCards } from './top-metric-cards';

describe('TopMetricCards', () => {
  let component: TopMetricCards;
  let fixture: ComponentFixture<TopMetricCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopMetricCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopMetricCards);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
