import { Component, OnInit, ElementRef, ViewChild  } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ActivatedRoute, Params } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'sincronizar-recetas-cargar',
  templateUrl: './cargar.component.html',
  styles: ['ngui-auto-complete {z-index: 999999 !important}']
})

export class CargarComponent {
  dato: FormGroup;
  cargando = false;
  tamano:number = 0;
  @ViewChild('mainScreen') elementView: ElementRef;
  constructor(private fb: FormBuilder,  private crudService: CrudService, private route: ActivatedRoute, private _sanitizer: DomSanitizer, private notificacion: NotificationsService) { }
  tieneid: boolean = false;
  ngOnInit() {

    //obtener los datos del usiario logueado almacen y clues
    var usuario = JSON.parse(localStorage.getItem("usuario"));
    this.tamano = this.elementView.nativeElement.offsetHeight/2;
    //inicializar el formulario reactivo
    this.dato = this.fb.group({
      json: [''],
      archivos: ['']
    }); 
  }
  foto = '';
   /**
     * Este método abre una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  abrirModal(id, foto) {
    this.foto = foto;
    document.getElementById(id).classList.add('is-active');
  }

  /**
     * Este método cierra una modal
     * @param id identificador del elemento de la modal
     * @return void
     */
  cancelarModal(id) {
    document.getElementById(id).classList.remove('is-active');
  }  
}