import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
@Component({
  selector: 'formulario-configuracion-general',
  templateUrl: './formulario.component.html'
})

export class FormularioComponent {
  dato: FormGroup;
  tab = 1;
  tamano = document.body.clientHeight;

  CkeditorConfig = {
    height: document.body.clientHeight - 460
  };
  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(private fb: FormBuilder) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.dato = this.fb.group({
      id: [1],
      configuracion: this.fb.group({
        iva: ['', Validators.required],
        fio: ['', Validators.required],
        personal_medico: ['', Validators.required],
      })
    });

    //Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById("catalogos").click();
  }
}