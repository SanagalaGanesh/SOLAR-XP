import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormGroup
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quote-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="page">

    <h2>Request Solar Quote</h2>

    <form [formGroup]="form" (ngSubmit)="submit()">

      <!-- CUSTOMER DETAILS -->
      <div class="card">
        <h3>Customer Details</h3>

        <input placeholder="Customer Name" formControlName="customerName" />
        <input placeholder="Mobile Number" formControlName="mobileNumber" />
        <textarea placeholder="Address" formControlName="address"></textarea>
      </div>

      <!-- SOLAR MODEL SELECTION -->
      <div class="card">
        <h3>Select Solar Models</h3>

        <div class="models">
          @for (model of solarModels; track model.id) {
            <label class="checkbox">
              <input
                type="checkbox"
                [value]="model"
                (change)="onModelChange($event, model)"
              />
              {{ model.name }} – {{ model.capacity }} KW
            </label>
          }
        </div>
      </div>

      <button type="submit">Submit Quote Request</button>

    </form>

  </div>
  `,
  styleUrls: ['./quote-request.component.scss']
})
export class QuoteRequestComponent {

  form!: FormGroup;

  solarModels = [
    { id: 1, name: 'SolarMax Pro', capacity: 5 },
    { id: 2, name: 'EcoSolar', capacity: 3 },
    { id: 3, name: 'SunPower X', capacity: 10 },
    { id: 4, name: 'HelioPlus', capacity: 7 },
    { id: 5, name: 'BrightSun', capacity: 4 },
    { id: 6, name: 'PowerGrid', capacity: 6 },
    { id: 7, name: 'SolarOne', capacity: 2 },
    { id: 8, name: 'UltraSolar', capacity: 8 },
    { id: 9, name: 'GreenRay', capacity: 9 },
    { id: 10, name: 'EcoVolt', capacity: 1 }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      customerName: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', Validators.required],
      selectedModels: this.fb.array([])
    });
  }

  get selectedModels(): FormArray {
    return this.form.get('selectedModels') as FormArray;
  }

  onModelChange(event: any, model: any) {
    if (event.target.checked) {
      this.selectedModels.push(this.fb.control(model));
    } else {
      const index = this.selectedModels.controls.findIndex(
        x => x.value.id === model.id
      );
      this.selectedModels.removeAt(index);
    }
  }

  submit() {
    if (this.form.invalid || this.selectedModels.length === 0) {
      alert('Please fill all fields and select at least one model');
      return;
    }

    console.log('Quote Request:', this.form.value);

    // Static flow for now
    alert('Quote request submitted! Status: Pending');

    // Later → redirect to live status page
    this.router.navigate(['/dashboard']);
  }
}
