import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SolarService } from '../services/solar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="dashboard-container">

    <!-- HEADER -->
    <header class="main-header">
      <div class="header-left">
        <div class="logo-container">
          <div class="logo-icon">☀️</div>
          <div>
            <h1 class="logo-text">SolarQuote Pro</h1>
            <p class="logo-subtitle">Smart Solar Solutions</p>
          </div>
        </div>
        <div class="welcome-section">
          <p class="welcome-message">Welcome back,</p>
          <h2 class="user-name">{{ userName }} 👋</h2>
        </div>
      </div>
      
      <div class="header-right">
        <div class="user-profile">
          <div class="avatar-circle">
            {{ userName ? userName[0].toUpperCase() : 'U' }}
          </div>
          <div class="user-info">
            <span class="user-email">Solar Customer</span>
            <button class="logout-btn" (click)="logout()">
              <span class="logout-icon">⎋</span> Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- DASHBOARD CONTENT -->
    <main class="dashboard-content">
      
      <!-- STATS CARDS -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon total-icon">📊</div>
            <div class="stat-content">
              <p class="stat-label">Total Quotes</p>
              <h3 class="stat-value">{{ totalQuotes() }}</h3>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon processing-icon">⏳</div>
            <div class="stat-content">
              <p class="stat-label">Processing</p>
              <h3 class="stat-value">{{ processingQuotes() }}</h3>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon ready-icon">✅</div>
            <div class="stat-content">
              <p class="stat-label">Ready Quotes</p>
              <h3 class="stat-value">{{ readyQuotes() }}</h3>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon orders-icon">📦</div>
            <div class="stat-content">
              <p class="stat-label">Orders</p>
              <h3 class="stat-value">{{ ordersCount() }}</h3>
            </div>
          </div>
        </div>
      </section>

      <!-- QUOTE REQUEST SECTION -->
      <section class="quote-request-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="section-icon">✨</span> Request Solar Quote
          </h3>
          <!-- <p class="section-subtitle">Get personalized solar system recommendations</p> -->
        </div>
        
        <div class="request-card">
          <div class="request-info">
            <div class="info-icon">💡</div>
            <div>
              <h4>Ready to Go Solar?</h4>
              <p>Get a customized quote in minutes. No commitment required.</p>
            </div>
          </div>
          
          <button
            class="request-btn"
            [class.disabled]="hasPendingQuote"
            [disabled]="hasPendingQuote"
            (click)="openForm()">
            <span class="btn-icon">➕</span>
            {{ hasPendingQuote
              ? 'Quote Request Pending'
              : 'Request New Quote'
            }}
            <span class="btn-arrow">→</span>
          </button>
          
          <div *ngIf="hasPendingQuote" class="pending-notice">
            <div class="notice-icon">⏱️</div>
            <div>
              <p class="notice-title">Your quote is being processed</p>
              <p class="notice-text">We'll notify you once it's ready. Usually takes 24-48 hours.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- QUOTE HISTORY -->
      <section class="history-section">
        <div class="section-header">
          <h3 class="section-title">
            <span class="section-icon">📋</span> Quote History
          </h3>
          <div class="history-stats">
            <span class="history-stat">
              <strong>{{ myQuotes.length }}</strong> requests
            </span>
            <span class="history-stat">
              <strong>{{ readyQuotes() }}</strong> ready
            </span>
          </div>
        </div>
        
        <div class="history-table-container">
          <div class="table-wrapper">
            <table class="quotes-table">
              <thead>
                <tr>
                  <th class="serial-column">S.No</th>
                  <th class="items-column">Items</th>
                  <th class="price-column">Price</th>
                  <th class="address-column">Address</th>
                  <th class="status-column">Status</th>
                  <th class="action-column">Action</th>
                </tr>
              </thead>
              
              <tbody>
                <tr *ngFor="let q of myQuotes; let i = index" class="quote-row">
                  <td class="serial-cell">
                    <div class="serial-number">{{ i + 1 }}</div>
                    <div class="quote-date">{{ q.date }}</div>
                  </td>
                  
                  <td class="items-cell">
                    <div class="items-list">
                      <div *ngFor="let item of q.items" class="item-tag">
                        {{ item.product }}
                      </div>
                    </div>
                  </td>
                  
                  <td class="price-cell">
                    <div class="prices-list">
                      <div *ngFor="let item of q.items" class="price-item">
                        <span *ngIf="item.status !== 'Pending'" class="price-value">
                          ₹{{ item.price }}
                        </span>
                        <span *ngIf="item.status === 'Pending'" class="price-pending">
                          Calculating...
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td class="address-cell">
                    <div class="address-text">{{ q.address }}</div>
                  </td>
                  
                  <td class="status-cell">
                    <div class="status-list">
                      <div *ngFor="let item of q.items" class="status-item">
                        <span [class]="'status-badge ' + item.status.toLowerCase()">
                          {{ item.status }}
                        </span>
                      </div>
                    </div>
                  </td>
                  
                  <td class="action-cell">
                    <div class="actions-list">
                      <div *ngFor="let item of q.items" class="action-item">
                        <button
                          *ngIf="item.canBuy && item.status === 'Approved'"
                          class="buy-now-btn"
                          (click)="placeOrder(item.itemId)">
                          <span class="buy-icon">🛒</span>
                          Buy Now
                        </button>
                        
                        <button
                          *ngIf="item.status === 'Ordered'"
                          class="ordered-btn"
                          disabled>
                          <span class="ordered-icon">✓</span>
                          Ordered
                        </button>
                        
                        <div *ngIf="item.status === 'Pending'" class="pending-action">
                          <div class="pending-dots">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                          </div>
                          <span class="pending-text">Processing</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                
                <tr *ngIf="myQuotes.length === 0" class="empty-row">
                  <td colspan="6">
                    <div class="empty-state">
                      <div class="empty-icon">📄</div>
                      <h4>No quotes yet</h4>
                      <p>Request your first solar quote to get started!</p>
                      <button class="empty-btn" (click)="openForm()">
                        Request Quote
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>

    <!-- QUOTE REQUEST MODAL -->
    <div class="modal-overlay" *ngIf="showQuoteForm">
      <div class="quote-modal">
        <div class="modal-header">
          <h2 class="modal-title">
            <span class="modal-icon">☀️</span>
            Request Solar Quote
          </h2>
          <p class="modal-subtitle">Fill in the details below for a customized solar solution</p>
          <button class="modal-close" (click)="closeForm()">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">📱</span>
                Mobile Number
              </label>
              <input 
  type="tel"
  class="form-input"
  name="mobile"
  [(ngModel)]="mobile"
  #mobileCtrl="ngModel"
  placeholder="Enter 10-digit mobile number"
  required
  pattern="^[6-9][0-9]{9}$"
  maxlength="10">

            </div>
            
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">🏠</span>
                Address Line 1
              </label>
              <input 
                type="text" 
                class="form-input"
                [(ngModel)]="address1"
                placeholder="Street address, building">
            </div>
            
            <div class="form-group full-width">
              <label class="form-label">
                <span class="label-icon">📍</span>
                Address Line 2
              </label>
              <input 
                type="text" 
                class="form-input"
                [(ngModel)]="address2"
                placeholder="Area, city, PIN code">
            </div>
            
            <div class="form-group full-width">
              <label class="form-label">
                <span class="label-icon">🔧</span>
                Panel Types (Select one or more)
              </label>
              <div class="selection-group">
                <label class="selection-option">
                  <input 
                    type="checkbox" 
                    (change)="toggleType('Solar Poly')"
                    class="option-checkbox">
                  <span class="option-content">
                    <span class="option-icon">🔵</span>
                    <span class="option-text">Solar Poly</span>
                    <span class="option-description">High efficiency in low light</span>
                  </span>
                </label>
                
                <label class="selection-option">
                  <input 
                    type="checkbox" 
                    (change)="toggleType('Solar Mono')"
                    class="option-checkbox">
                  <span class="option-content">
                    <span class="option-icon">⚫</span>
                    <span class="option-text">Solar Mono</span>
                    <span class="option-description">Best for residential use</span>
                  </span>
                </label>
                
                <label class="selection-option">
                  <input 
                    type="checkbox" 
                    (change)="toggleType('Solar Thin')"
                    class="option-checkbox">
                  <span class="option-content">
                    <span class="option-icon">🌫️</span>
                    <span class="option-text">Solar Thin</span>
                    <span class="option-description">Flexible & lightweight</span>
                  </span>
                </label>
              </div>
            </div>
            
            <div class="form-group full-width">
              <label class="form-label">
                <span class="label-icon">⚡</span>
                Wattage Requirements
              </label>
              <div class="wattage-grid">
                <label class="wattage-option">
                  <input 
                    type="checkbox" 
                    (change)="toggleWatt(450)"
                    class="wattage-checkbox">
                  <div class="wattage-card">
                    <div class="wattage-value">450W</div>
                    <div class="wattage-label">Small Home</div>
                    <div class="wattage-desc">2-3 rooms</div>
                  </div>
                </label>
                
                <label class="wattage-option">
                  <input 
                    type="checkbox" 
                    (change)="toggleWatt(850)"
                    class="wattage-checkbox">
                  <div class="wattage-card">
                    <div class="wattage-value">850W</div>
                    <div class="wattage-label">Medium Home</div>
                    <div class="wattage-desc">3-4 rooms</div>
                  </div>
                </label>
                
                <label class="wattage-option">
                  <input 
                    type="checkbox" 
                    (change)="toggleWatt(1000)"
                    class="wattage-checkbox">
                  <div class="wattage-card">
                    <div class="wattage-value">1000W</div>
                    <div class="wattage-label">Large Home</div>
                    <div class="wattage-desc">4+ rooms</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="selected-summary" *ngIf="selectedTypes.length > 0 || selectedWatts.length > 0">
            <span class="summary-label">Selected:</span>
            <span class="summary-tags">
              <span *ngFor="let type of selectedTypes" class="summary-tag">{{ type }}</span>
              <span *ngFor="let watt of selectedWatts" class="summary-tag">{{ watt }}W</span>
            </span>
          </div>
          
          <div class="modal-actions">
            <button class="cancel-btn" (click)="closeForm()">Cancel</button>
            <button class="submit-btn" (click)="submitQuote()">
              <span class="submit-icon">🚀</span>
              Submit Quote Request
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- FLOATING CHATBOT BUTTON -->
    <div class="chatbot-float" *ngIf="!showChatbot" (click)="toggleChat()">
      💬
    </div>

    <!-- CHATBOT HINT -->
    <div class="chatbot-hint" *ngIf="showChatHint">
      👋 Let me help you find the correct solar model!
    </div>

    <!-- ENHANCED CHATBOT WINDOW -->
    <div class="chatbot-window-enhanced" *ngIf="showChatbot" [class.open]="showChatbot">
      <div class="chatbot-header">
        <div class="chatbot-title">
          <div class="chatbot-avatar">
            🤖
          </div>
          <span>Solar Assistant</span>
        </div>
        <button class="chatbot-close" (click)="toggleChat()">×</button>
      </div>

      <div class="chatbot-body" #chatBody>
        <div *ngFor="let msg of chatMessages" class="chat-message" [class.user]="msg.sender === 'user'">
          <div class="message-bubble" [class.user-bubble]="msg.sender === 'user'">
            {{ msg.text }}
          </div>
        </div>

        <div *ngIf="chatOptions.length > 0" class="chat-options">
          <button 
            *ngFor="let option of chatOptions" 
            class="chat-option-btn"
            (click)="selectOption(option)">
            {{ option }}
          </button>
        </div>

        <div *ngIf="isChatThinking" class="chat-thinking">
          <div class="thinking-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <span>Thinking...</span>
        </div>
      </div>

      <div class="chatbot-footer">
        <input
          type="text"
          [(ngModel)]="chatInput"
          placeholder="Type your message..."
          (keydown.enter)="sendMessage()"
          [disabled]="isChatThinking"
        />
        <button class="chat-send-btn" (click)="sendMessage()" [disabled]="isChatThinking">
          <span class="send-icon">→</span>
        </button>
        <button class="chat-restart-btn" (click)="startChat()" *ngIf="chatState.currentStep !== ''">
          🔄
        </button>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  userName = 'User';
  userId!: number;

  totalQuotes = signal(0);
  processingQuotes = signal(0);
  readyQuotes = signal(0);
  ordersCount = signal(0);

  myQuotes: any[] = [];
  hasPendingQuote = false;

  showQuoteForm = false;
  showChatbot = false;
  showChatHint = true;
  chatInput = '';
  isChatThinking = false;

  chatState = {
    currentStep: '',
    savedPurpose: '',
    savedBill: '',
    savedCuts: ''
  };

  chatMessages: { sender: 'user' | 'bot'; text: string }[] = [
    { sender: 'bot', text: 'Hi! 👋 Let me help you find the correct solar model!' }
  ];

  chatOptions: string[] = [
    'Start Solar Recommendation',
    'Ask about Solar Panels',
    'Calculate Savings',
    'Get Quote Help'
  ];

  mobile = '';
  address1 = '';
  address2 = '';
  selectedTypes: string[] = [];
  selectedWatts: number[] = [];

  constructor(
    private solarService: SolarService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      this.router.navigateByUrl('/landing', { replaceUrl: true });
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      this.userId = Number(
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      );

      this.userName =
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
        || 'User';

    } catch {
      this.logout();
      return;
    }

    this.loadMyQuotes();
    
    // Show hint after 1.5 seconds
    setTimeout(() => {
      this.showChatHint = true;
    }, 1500);
  }

  loadMyQuotes(): void {
    this.solarService.getMyQuotes(this.userId).subscribe({
      next: (res: any) => {
        this.myQuotes = Array.isArray(res?.result) ? res.result : [];

        this.hasPendingQuote = this.myQuotes.some(q =>
          q.items?.some((i: any) => i.status === 'Pending')
        );

        const allItems = this.myQuotes.flatMap(q => q.items ?? []);

        this.totalQuotes.set(allItems.length);
        this.processingQuotes.set(allItems.filter(i => i.status === 'Pending').length);
        this.readyQuotes.set(allItems.filter(i => i.status === 'Approved').length);
        this.ordersCount.set(allItems.filter(i => i.status === 'Ordered').length);
      },
      error: (err) => {
        if (err.status === 401) {
          alert('Session expired. Please login again.');
          this.logout();
        }
      }
    });
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    this.router.navigateByUrl('/landing', { replaceUrl: true });
  }

  placeOrder(itemId: number): void {
    if (!confirm('Place order for this item?')) return;

    this.solarService.placeOrder({ itemId }).subscribe({
      next: () => {
        alert('Order placed successfully!');
        this.loadMyQuotes();
      }
    });
  }

  openForm(): void {
    this.showQuoteForm = true;
  }

  closeForm(): void {
    this.showQuoteForm = false;
  }

  toggleChat(): void {
    this.showChatbot = !this.showChatbot;
    if (this.showChatbot) {
      this.showChatHint = false;
    }
  }

  sendMessage(): void {
    if (!this.chatInput.trim() || this.isChatThinking) return;

    const userMessage = this.chatInput;
    this.chatMessages.push({ sender: 'user', text: userMessage });
    this.chatInput = '';
    this.isChatThinking = true;
    this.chatOptions = []; // Clear options when user sends message

    this.solarService.chatWithSolarBot({
      currentStep: this.chatState.currentStep,
      userResponse: userMessage,
      savedPurpose: this.chatState.savedPurpose,
      savedBill: this.chatState.savedBill,
      savedCuts: this.chatState.savedCuts
    }).subscribe({
      next: (res: any) => {
        this.isChatThinking = false;
        
        try {
          // Parse the response
          const botResponse = JSON.parse(res);
          
          // Update chat state
          this.chatState.currentStep = botResponse.nextStep || '';
          this.chatState.savedPurpose = botResponse.savedPurpose || '';
          this.chatState.savedBill = botResponse.savedBill || '';
          this.chatState.savedCuts = botResponse.savedCuts || '';
          
          // Add bot message
          this.chatMessages.push({
            sender: 'bot',
            text: botResponse.message || 'Sorry, I could not understand that.'
          });

          // Update options if available
          if (botResponse.options && Array.isArray(botResponse.options)) {
            this.chatOptions = botResponse.options;
          }
        } catch {
          // If response is not JSON, treat it as plain text
          this.chatMessages.push({
            sender: 'bot',
            text: res || 'Sorry, I could not understand that.'
          });
        }
      },
      error: () => {
        this.isChatThinking = false;
        this.chatMessages.push({
          sender: 'bot',
          text: 'Something went wrong. Please try again.'
        });
      }
    });
  }

  selectOption(option: string): void {
    this.chatInput = option;
    this.sendMessage();
  }

  startChat(): void {
    // Reset chat state
    this.chatState = {
      currentStep: '',
      savedPurpose: '',
      savedBill: '',
      savedCuts: ''
    };
    
    this.chatMessages = [
      { sender: 'bot', text: 'Hi! 👋 Let me help you find the correct solar model!' }
    ];
    
    this.chatOptions = [
      'Start Solar Recommendation',
      'Ask about Solar Panels',
      'Calculate Savings',
      'Get Quote Help'
    ];
    
    this.chatInput = '';
  }

  toggleType(type: string): void {
    this.selectedTypes.includes(type)
      ? this.selectedTypes = this.selectedTypes.filter(t => t !== type)
      : this.selectedTypes.push(type);
  }

  toggleWatt(watt: number): void {
    this.selectedWatts.includes(watt)
      ? this.selectedWatts = this.selectedWatts.filter(w => w !== watt)
      : this.selectedWatts.push(watt);
  }

 submitQuote(): void {
  if (
    !this.mobile ||
    !this.address1 ||
    !this.selectedTypes.length ||
    !this.selectedWatts.length
  ) {
    alert('Please fill all fields');
    return;
  }

  this.solarService.submitQuote({
    userId: this.userId,               // ✅ REQUIRED
    mobile: this.mobile,
    addressLine1: this.address1,
    addressLine2: this.address2,
    selectedTypes: this.selectedTypes,
    selectedWatts: this.selectedWatts
  }).subscribe({
    next: () => {
      alert('Quote submitted successfully!');
      this.closeForm();
      this.resetForm();
      this.loadMyQuotes();
    },
    error: (err) => {
      console.error(err);
      alert('Failed to submit quote. Please try again.');
    }
  });
}


  resetForm(): void {
    this.mobile = '';
    this.address1 = '';
    this.address2 = '';
    this.selectedTypes = [];
    this.selectedWatts = [];
  }
}