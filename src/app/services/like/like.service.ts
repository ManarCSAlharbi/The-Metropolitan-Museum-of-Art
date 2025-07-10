import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LikeServicesService {
  private likedCards: any[] = [];

  addCard(card: any) {
    this.likedCards.push(card);
  }

  removeCard(cardId: any) {
    this.likedCards = this.likedCards.filter(c => c.objectID !== cardId);
  }

  isCardLiked(cardId: any): boolean {
    return this.likedCards.some(c => c.objectID === cardId);
  }
}
