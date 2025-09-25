import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPaperComponent } from './custom-paper.component';

describe('CustomPaperComponent', () => {
  let component: CustomPaperComponent;
  let fixture: ComponentFixture<CustomPaperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomPaperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomPaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
