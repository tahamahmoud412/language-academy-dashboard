import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsList } from './about-us-list';

describe('AboutUsList', () => {
  let component: AboutUsList;
  let fixture: ComponentFixture<AboutUsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutUsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutUsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
