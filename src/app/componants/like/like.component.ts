import { Component, Input, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';
import { LikeServicesService } from '../../services/like/like.service';

addIcons({ heart, heartOutline });

@Component({
  selector: 'app-like-button',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './like.component.html',
  styleUrls: ['./like.component.scss']
})
export class LikeComponent implements OnInit {
  @Input() initialCount = 0;
  @Input() cardData!: any;

  liked = false;
  likeCount = 0;

  constructor(private likeService: LikeServicesService) {}

  ngOnInit() {
    this.likeCount = this.initialCount;
    this.liked = this.likeService.isCardLiked(this.cardData.objectID);
  }

  toggleLike() {
    this.liked = !this.liked;
    this.likeCount += this.liked ? 1 : -1;
    if (this.liked) {
      this.likeService.addCard(this.cardData);
    } else {
      this.likeService.removeCard(this.cardData.objectID);
    }
  }
}
