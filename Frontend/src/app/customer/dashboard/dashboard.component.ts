import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SolarService } from '../../services/solar.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
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

  // Modal states
  showQuoteForm = false;
  showOrderConfirmation = false;
  showChatbot = false;
  showChatHint = true;
  
  // Order confirmation variables
  selectedItem: any = null;
  selectedQuote: any = null;
  acceptTerms = false;
  installationFee = 0; // Fixed installation fee

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

  // Open order confirmation modal
  openOrderConfirmation(item: any): void {
    // Find the parent quote for this item
    this.selectedQuote = this.myQuotes.find(q => 
      q.items?.some((i: any) => i.itemId === item.itemId)
    );
    
    this.selectedItem = item;
    this.showOrderConfirmation = true;
    this.acceptTerms = false; // Reset terms checkbox
  }

  // Close order confirmation modal
  closeOrderConfirmation(): void {
    this.showOrderConfirmation = false;
    this.selectedItem = null;
    this.selectedQuote = null;
    this.acceptTerms = false;
  }

  // Calculate tax (18% GST)
  calculateTax(): number {
    if (!this.selectedItem?.price) return 0;
    const productPrice = parseFloat(this.selectedItem.price);
    const totalBeforeTax = productPrice + this.installationFee;
    return Math.round(totalBeforeTax * 0);
  }
calculateTotal(): number {
  if (!this.selectedItem?.price) return 0;

  const productPrice = Number(
    this.selectedItem.price.replace(/,/g, '')
  );

  const totalBeforeTax = productPrice + this.installationFee;
  const tax = totalBeforeTax * 0; // 18% if needed later

  return Math.round(totalBeforeTax + tax);
}


  // Confirm and place order
  confirmOrder(): void {
    if (!this.acceptTerms) {
      alert('Please accept the terms and conditions to proceed.');
      return;
    }

    // Call the placeOrder method
    this.placeOrder(this.selectedItem.itemId);
  }

  // Original placeOrder method (now called from confirmOrder)
  placeOrder(itemId: number): void {
    this.solarService.placeOrder({ itemId }).subscribe({
      next: () => {
        alert('Order placed successfully!');
        this.closeOrderConfirmation();
        this.loadMyQuotes();
      },
      error: (err) => {
        console.error('Error placing order:', err);
        alert('Failed to place order. Please try again.');
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