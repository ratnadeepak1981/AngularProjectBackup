import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer-component.component.html',
  styleUrl: './footer-component.component.css',
})
export class FooterComponentComponent {
  public readonly currentYear = new Date().getFullYear();
}
