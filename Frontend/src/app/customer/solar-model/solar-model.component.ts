import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-solar-model',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="model-page">

  <!-- FIXED NAVBAR -->
  <nav class="navbar">
    <div class="navbar-left" routerLink="/landing">
      ☀️ <strong>Esolar</strong>
    </div>
    <div class="navbar-right">
      <a routerLink="/landing">Home</a>
    </div>
  </nav>

  <!-- HERO -->
  <section class="model-hero fade-in">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </section>

  <!-- OVERVIEW CARD -->
  <section class="overview fade-in delay-1">
    <div class="card">
      <h2>Overview</h2>
      <p>{{ overview }}</p>
    </div>
  </section>

  <!-- CONTENT -->
  <section class="model-content">

    <!-- TEXT CARDS -->
    <div class="text">

      <div class="card fade-in delay-2">
        <h2>Key Benefits</h2>
        <ul>
          <li *ngFor="let benefit of benefits">✔ {{ benefit }}</li>
        </ul>
      </div>

      <div class="card fade-in delay-3">
        <h2>Best Applications</h2>
        <ul>
          <li *ngFor="let use of uses">⚡ {{ use }}</li>
        </ul>
      </div>

      <div class="card fade-in delay-4">
        <h2>Considerations</h2>
        <ul>
          <li *ngFor="let con of considerations">• {{ con }}</li>
        </ul>
      </div>

      <!-- STATS -->
      <div class="stats fade-in delay-5">
        <div class="stat-card">
          <span>{{ efficiency }}</span>
          <small>Efficiency</small>
        </div>
        <div class="stat-card">
          <span>{{ lifespan }}</span>
          <small>Lifespan</small>
        </div>
      </div>

      <!-- <button class="back-btn" routerLink="/landing">
        ← Back to Home
      </button> -->
    </div>

    <!-- IMAGES -->
    <div class="images fade-in delay-3">
      <img
        *ngFor="let img of images"
        [src]="img + '&auto=format&fit=crop&w=900&q=60'"
        alt="Solar Panel"
      />
    </div>

  </section>

</div>
`,

  styleUrls: ['./solar-model.component.scss']
})
export class SolarModelComponent {

  title = '';
  subtitle = '';
  overview = '';
  benefits: string[] = [];
  uses: string[] = [];
  considerations: string[] = [];
  images: string[] = [];
  efficiency = '';
  lifespan = '';

  constructor(private route: ActivatedRoute) {
    const type = this.route.snapshot.paramMap.get('type');
    this.loadData(type);
  }

  loadData(type: string | null) {

    if (type === 'mono') {
      this.title = 'Monocrystalline Solar Panels';
      this.subtitle = 'Premium efficiency with long-term reliability';
      this.overview =
        'Monocrystalline solar panels are made from a single crystal structure, offering superior efficiency and a sleek appearance. They are ideal for customers seeking maximum output from limited space.Monocrystalline solar panels are a type of photovoltaic (PV) panel made from single-crystal silicon, derived from a single continuous crystal structure. They are one of the most common and efficient solar panel technologies, widely used in residential, commercial, and utility-scale solar installations. The term "monocrystalline" refers to the uniform crystal lattice, which allows for higher electron mobility and better performance compared to other panel types.'
        ;

      this.benefits = [
        'Highest power efficiency',
        'Space-efficient design',
        'Long operational lifespan',
        'Strong performance in low-light'
      ];

      this.uses = [
        'Residential rooftops',
        'Urban homes',
        'High-end solar installations'
      ];

      this.considerations = [
        'Higher initial cost',
        'Professional installation recommended'
      ];

      this.efficiency = '20–23%';
      this.lifespan = '25+ years';

      this.images = [
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=900&q=60'
      ];
    }

    if (type === 'poly') {
      this.title = 'Polycrystalline Solar Panels';
      this.subtitle = 'Cost-effective and dependable solar solution';
      this.overview =
        'Polycrystalline panels are manufactured using multiple silicon fragments. They offer a balanced combination of affordability and durability, making them suitable for large-scale projects, Polycrystalline solar panels, often recognized by their distinctive blue, speckled appearance, are manufactured from multiple silicon crystals melted together to form photovoltaic cells. This manufacturing process creates panels with slightly lower efficiency than monocrystalline but offers excellent value for money and reliable performance across diverse environmental conditions. Polycrystalline technology strikes an optimal balance between affordability, durability, and efficiency, making it one of the most popular choices for residential and commercial solar installations worldwide.';

      this.benefits = [
        'Lower installation cost',
        'Good durability',
        'Stable performance',
        'Environment-friendly manufacturing'
      ];

      this.uses = [
        'Solar farms',
        'Commercial buildings',
        'Open land installations'
      ];

      this.considerations = [
        'Lower efficiency than monocrystalline',
        'Requires more space'
      ];

      this.efficiency = '15–17%';
      this.lifespan = '20–25 years';

      this.images = [
        'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1592833159058-0f0c1b1a0f8f?auto=format&fit=crop&w=900&q=60'
      ];
    }

    if (type === 'thin') {
      this.title = 'Thin Film Solar Panels';
      this.subtitle = 'Flexible, lightweight, and versatile technology';
      this.overview =
        'Thin film solar panels are made by layering photovoltaic materials onto surfaces. They are lightweight, flexible, and perform well in high temperatures, making them ideal for commercial use, Thin film solar panels represent the next generation of photovoltaic technology, manufactured by depositing one or more thin layers of photovoltaic material onto various substrates. Unlike traditional crystalline silicon panels, thin film panels offer remarkable flexibility, ultra-lightweight construction, and exceptional performance in challenging lighting conditions. These panels are manufactured using materials such as amorphous silicon (a-Si), cadmium telluride (CdTe), or copper indium gallium selenide (CIGS), creating ultra-thin, flexible solar modules that can be applied to virtually any surface. ';

      this.benefits = [
        'Lightweight construction',
        'Flexible installation',
        'Performs well in hot climates',
        'Lower manufacturing cost'
      ];

      this.uses = [
        'Commercial rooftops',
        'Industrial buildings',
        'Portable solar systems'
      ];

      this.considerations = [
        'Lower efficiency',
        'Shorter lifespan'
      ];

      this.efficiency = '10–13%';
      this.lifespan = '15–20 years';

      this.images = [
        'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=900&q=60',
        'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=60'
      ];
    }
  }
}
