import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentsPage } from './departments.page';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

describe('DepartmentsPage', () => {
  let component: DepartmentsPage;
  let fixture: ComponentFixture<DepartmentsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentsPage],
      providers: [
        provideRouter([]),
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
