import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LikedArtworksPage } from './liked-artworks.page';

describe('LikedArtworksPage', () => {
  let component: LikedArtworksPage;
  let fixture: ComponentFixture<LikedArtworksPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LikedArtworksPage]
    }).compileComponents();

    fixture = TestBed.createComponent(LikedArtworksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
