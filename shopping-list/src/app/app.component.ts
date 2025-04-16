import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';

interface BoodschapItem {
  id: string;
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
  isLoading: boolean = true;

  constructor(private firestore: Firestore) {}

  async ngOnInit(): Promise<void> {
    await this.haalItemsOp();
    this.haalAfgestreepteStatusOp();
    this.isLoading = false;
  }

  private haalAfgestreepteStatusOp(): void {
    const opgeslagenStatus = localStorage.getItem('afgestreepteItems');
    if (opgeslagenStatus) {
      const afgestreepteItems = JSON.parse(opgeslagenStatus);
      this.items.forEach(item => {
        if (afgestreepteItems[item.id]) {
          item.afgestreept = true;
        }
      });
    }
  }

  private slaAfgestreepteStatusOp(): void {
    const afgestreepteItems: { [key: string]: boolean } = {};
    this.items.forEach(item => {
      afgestreepteItems[item.id] = item.afgestreept;
    });
    localStorage.setItem('afgestreepteItems', JSON.stringify(afgestreepteItems));
  }

  async haalItemsOp(): Promise<void> {
    const itemsCollection = collection(this.firestore, 'shopping-list');
    const querySnapshot = await getDocs(itemsCollection);
    
    this.items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      naam: doc.data()['itemName'],
      afgestreept: false,
      wordtVerwijderd: false
    }));
  }

  async voegItemToe(naam: string): Promise<void> {
    if (naam.trim() === '') return;

    const itemsCollection = collection(this.firestore, 'shopping-list');
    const docRef = await addDoc(itemsCollection, {
      itemName: naam
    });

    this.items.push({
      id: docRef.id,
      naam: naam,
      afgestreept: false,
      wordtVerwijderd: false
    });

    this.nieuwItem = '';
    this.slaAfgestreepteStatusOp();
  }

  verwerkNieuwItem(): void {
    this.voegItemToe(this.nieuwItem);
  }

  async toggleAfgestreept(item: BoodschapItem): Promise<void> {
    item.afgestreept = !item.afgestreept;
    const itemDoc = doc(this.firestore, 'shopping-list', item.id);
    await updateDoc(itemDoc, {
      afgestreept: item.afgestreept
    });
    this.slaAfgestreepteStatusOp();
  }

  async verwijderItem(id: string): Promise<void> {
    const itemDoc = doc(this.firestore, 'shopping-list', id);
    await deleteDoc(itemDoc);
    this.items = this.items.filter(item => item.id !== id);
    this.slaAfgestreepteStatusOp();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.verwerkNieuwItem();
    }
  }
}