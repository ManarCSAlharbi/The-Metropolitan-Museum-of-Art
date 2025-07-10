import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
  IonTitle, IonContent, IonButtons, IonInput, IonTextarea, IonList
} from '@ionic/angular/standalone';
import { LikeComponent } from '../like/like.component';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [
    IonList, IonTextarea, IonInput, IonButtons,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonButton, IonIcon, IonModal, IonHeader, IonToolbar,
    IonTitle, IonContent, LikeComponent
  ],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  
  @Input() artwork!: any; // objet representing the artwork 
  @Input() likeCount = 0;
  @ViewChild(IonModal) modal?: IonModal;
  presentingElement: HTMLElement | null = null;

  constructor() {
    addIcons({ close });
  }

  ngOnInit() {
    this.presentingElement = document.querySelector('ion-router-outlet');
    console.log('CardComponent initialized with artwork:', this.artwork);
  }


  // Close modals dispatched by the button triggers
  dismissModal(event: Event) {
    const modal = (event.target as HTMLElement).closest('ion-modal') as HTMLIonModalElement;
    modal.dismiss();
  }
}