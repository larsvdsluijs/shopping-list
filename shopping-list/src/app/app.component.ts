import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BoodschapItem {
  id: number;
  naam: string;
  afgestreept: boolean;
  wordtVerwijderd: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgFor, NgIf, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  items: BoodschapItem[] = [];
  nieuwItem: string = '';

  ngOnInit(): void {
    // Voorbeelditems toevoegen
    this.voegItemToe('Melk');
    this.voegItemToe('Brood');
    this.voegItemToe('Kaas');
  }

  voegItemToe(naam: string): void {
    if (naam.trim() === '') return;

    const nieuwId = this.items.length > 0 
      ? Math.max(...this.items.map(item => item.id)) + 1 
      : 1;
      
    this.items.push({
      id: nieuwId,
      naam: naam,
      afgestreept: false,
      wordtVerwijderd: false
    });

    this.nieuwItem = '';
  }

  verwerkNieuwItem(): void {
    this.voegItemToe(this.nieuwItem);
  }

  toggleAfgestreept(item: BoodschapItem): void {
    item.afgestreept = !item.afgestreept;
  }

  verwijderItem(id: number): void {
    this.items = this.items.filter(item => item.id !== id);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.verwerkNieuwItem();
    }
  }
}