import { Injectable, signal, computed } from '@angular/core';
import { SolarService } from '../../services/solar.service';
import { Quote, QuoteStatus, QuoteItem } from './dashboard.models';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable()
export class DashboardFacade {
  // Private state signals
  private quotesSignal = signal<Quote[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public computed signals
  myQuotes = computed(() => this.quotesSignal());
  isLoading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  
  // Derived computed values
  totalQuotes = computed(() => 
    this.quotesSignal().reduce((total, quote) => total + quote.items.length, 0)
  );
  
  processingQuotes = computed(() => 
    this.quotesSignal().reduce((total, quote) => 
      total + quote.items.filter(item => item.status === QuoteStatus.PENDING).length, 0
    )
  );
  
  readyQuotes = computed(() => 
    this.quotesSignal().reduce((total, quote) => 
      total + quote.items.filter(item => item.status === QuoteStatus.APPROVED).length, 0
    )
  );
  
  ordersCount = computed(() => 
    this.quotesSignal().reduce((total, quote) => 
      total + quote.items.filter(item => item.status === QuoteStatus.ORDERED).length, 0
    )
  );
  
  hasPendingQuote = computed(() => 
    this.quotesSignal().some(quote => 
      quote.items.some(item => item.status === QuoteStatus.PENDING)
    )
  );

  constructor(private solarService: SolarService) {}

  loadQuotes(userId: number): Observable<Quote[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.solarService.getMyQuotes(userId).pipe(
      tap(response => {
        const quotes: Quote[] = Array.isArray(response?.result) ? response.result : [];
        this.quotesSignal.set(quotes);
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set('Failed to load quotes');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  submitQuote(request: any): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.solarService.submitQuote(request).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set('Failed to submit quote');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  placeOrder(itemId: number): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.solarService.placeOrder({ itemId }).pipe(
      tap(() => {
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set('Failed to place order');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}