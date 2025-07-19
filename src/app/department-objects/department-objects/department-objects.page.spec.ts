import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentObjectsPage } from './department-objects.page';

describe('DepartmentObjectsPage', () => {
  let component: DepartmentObjectsPage;
  let fixture: ComponentFixture<DepartmentObjectsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentObjectsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
