import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentObjectsPage } from './department-objects.page';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('DepartmentObjectsPage', () => {
  let component: DepartmentObjectsPage;
  let fixture: ComponentFixture<DepartmentObjectsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentObjectsPage],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentObjectsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
