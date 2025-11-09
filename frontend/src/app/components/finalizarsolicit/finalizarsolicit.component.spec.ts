import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizarsolicitComponent } from './finalizarsolicit.component';

describe('FinalizarsolicitComponent', () => {
  let component: FinalizarsolicitComponent;
  let fixture: ComponentFixture<FinalizarsolicitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinalizarsolicitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinalizarsolicitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
