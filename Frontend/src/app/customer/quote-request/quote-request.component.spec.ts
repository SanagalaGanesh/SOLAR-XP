import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteRequestComponent } from './quote-request.component';

describe('QuoteRequestComponent', () => {
  let component: QuoteRequestComponent;
  let fixture: ComponentFixture<QuoteRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
