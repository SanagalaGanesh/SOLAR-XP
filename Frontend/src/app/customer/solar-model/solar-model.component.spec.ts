import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarModelComponent } from './solar-model.component';

describe('SolarModelComponent', () => {
  let component: SolarModelComponent;
  let fixture: ComponentFixture<SolarModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolarModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolarModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
