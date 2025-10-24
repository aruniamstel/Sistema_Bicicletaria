import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VisualizarservicosComponent } from './visualizarservicos.component';

describe('VisualizarservicosComponent', () => {
  let component: VisualizarservicosComponent;
  let fixture: ComponentFixture<VisualizarservicosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualizarservicosComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VisualizarservicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Detecta mudanças iniciais no componente
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display history entries', () => {
    const compiled = fixture.nativeElement;
    const historyElements = compiled.querySelectorAll('.historico p');
    expect(historyElements.length).toBe(component.historicoPassos.length);
  });
});
