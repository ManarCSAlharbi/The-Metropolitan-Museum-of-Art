import { TestBed } from '@angular/core/testing';

import { LikedArtworksService } from './liked-artworks.service';

describe('LikedArtworksService', () => {
  let service: LikedArtworksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LikedArtworksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
