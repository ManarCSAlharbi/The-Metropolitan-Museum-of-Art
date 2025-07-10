import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardSubtitle, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { LikeServicesService } from '../services/like/like.service';
@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonCardTitle, IonCardHeader, IonCardSubtitle, IonCard, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent],
})
export class Tab3Page {
   //likedCards: any[] = [];

   //constructor(private likeService: LikeServicesService) {}

  ionViewWillEnter() {
    //this.likedCards = this.likeService.getLikedCards();
  }
}
