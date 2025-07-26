import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LikeComponent } from './like.component';
import { LikedArtworksService } from '../../services/liked-artworks/liked-artworks.service';
import { ApiService } from '../../services/api/api.service';
import { of } from 'rxjs';

describe('LikeComponent', () => {
  let component: LikeComponent;
  let fixture: ComponentFixture<LikeComponent>;
  let mockLikedArtworksService: jasmine.SpyObj<LikedArtworksService>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(waitForAsync(() => {
    const likedArtworksSpy = jasmine.createSpyObj('LikedArtworksService', ['isArtworkLiked', 'addLikedArtwork', 'removeLikedArtwork']);
    const apiSpy = jasmine.createSpyObj('ApiService', ['getLikes', 'postLike']);

    TestBed.configureTestingModule({
      imports: [LikeComponent],
      providers: [
        { provide: LikedArtworksService, useValue: likedArtworksSpy },
        { provide: ApiService, useValue: apiSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LikeComponent);
    component = fixture.componentInstance;
    mockLikedArtworksService = TestBed.inject(LikedArtworksService) as jasmine.SpyObj<LikedArtworksService>;
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    
    // Setup default return values
    mockLikedArtworksService.isArtworkLiked.and.returnValue(false);
    mockApiService.getLikes.and.returnValue(of({ item_id: '123', likes: 0 }));
    mockApiService.postLike.and.returnValue(of({ item_id: '123', likes: 1 }));
    
    // Set required input
    component.cardData = { objectID: '123' };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
