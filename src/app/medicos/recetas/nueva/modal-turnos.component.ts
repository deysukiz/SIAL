import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-modal-turnos',
  templateUrl: './modal-turnos.component.html'
})

export class ModalTurnosComponent {
  /**
   * Formulario reactivo que contiene los datos referente a los turnos que se enviarán a la API
   * y son los mismos datos que podemos ver al consultar los turnos.
   * @type {FormGroup} */
  dato2: FormGroup;
  /**
   * Contiene __true__ cuando el formulario recibe el parámetro clues, lo que significa que ha de mostrar 'Mis turnos'
   * de la CLUES correspondiente y los turnos disponibles.
   * @type {Boolean} */
  tieneid = false;
  /**
   * Contiene __false__ como valor inicial para poder mostrar el botón de cargar turnos.
   * Cuando su valor es __false__ quiere decir que los turnos ya se cargaron.
   * @type {Boolean} */
  mostrar_pantalla= false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {

    let usuario = JSON.parse(localStorage.getItem('usuario'));

    this.dato2 = this.fb.group({
      clues: ['', [Validators.required]],
      jurisdiccion_id: [''],
      nombre: [''],
      activa: [''],
      director_id: [''],
      clues_turnos: this.fb.array([])
    });

    this.route.params.subscribe(params => {
      if (params['clues']) {
        this.tieneid = true;
      }
    });
    // Solo si se va a cargar catalogos poner un <a id="catalogos" (click)="ctl.cargarCatalogo('modelo','ruta')">refresh</a>
    document.getElementById('catalogoTurno').click();
  }

  ngAfterViewInit() {
    document.getElementById('actualizar').click();
  }
}
