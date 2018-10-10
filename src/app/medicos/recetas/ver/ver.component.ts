import { Component, OnInit, NgZone, ViewChildren } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/observable/of';

import { environment } from '../../../../environments/environment';
import { CrudService } from '../../../crud/crud.service';
import { NotificationsService } from 'angular2-notifications';

import  * as FileSaver    from 'file-saver';

@Component({
  selector: 'app-ver',
  templateUrl: './ver.component.html',
  styleUrls: ['./ver.component.css']
})
export class VerComponent implements OnInit {
  cargando = false;
  id:any;
  usuario: any = {};
  receta: any = {};
  
  pdfworker: Worker;
  cargandoPdf = false;

  constructor(
    private crudService: CrudService,
    private route: ActivatedRoute,
    private _sanitizer: DomSanitizer,
    private _ngZone: NgZone,
    public http: Http
  ) { }

  ngOnInit() {
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    this.pdfworker = new Worker('web-workers/farmacia/movimientos/receta.js');
    
    // Este es un hack para poder usar variables del componente dentro de una funcion del worker
    var self = this;
    var $ngZone = this._ngZone;

    this.pdfworker.onmessage = function( evt ) {
      // Esto es un hack porque estamos fuera de contexto dentro del worker
      // Y se usa esto para actualizar alginas variables
      $ngZone.run(() => {
          self.cargandoPdf = false;
      });

      FileSaver.saveAs( self.base64ToBlob( evt.data.base64, 'application/pdf' ), evt.data.fileName );
      // open( 'data:application/pdf;base64,' + evt.data.base64 ); // Popup PDF
    };

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.id = params['id'];
      }
    });
    this.cargando = true;
    this.crudService.ver(this.id,'medicos/recetas').subscribe(
      respuesta => {
        console.log(respuesta)
        this.cargando = false;
        this.receta = respuesta;
        if(this.receta.paciente){
          this.receta.paciente.edad = this.calcularEdad(this.receta.paciente.fecha_nacimiento);
        }
        setTimeout(()=> {     
          this.imprimir();
        }, 300);  
        
      }, error => {
        this.cargando = false;
        console.log(error)
      }
    )
  }
  calcularEdad(fecha_nacimiento) { // birthday is a date
    var birthday = new Date(fecha_nacimiento);
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
  base64ToBlob( base64, type ) {
      var bytes = atob( base64 ), len = bytes.length;
      var buffer = new ArrayBuffer( len ), view = new Uint8Array( buffer );
      for ( var i=0 ; i < len ; i++ )
      view[i] = bytes.charCodeAt(i) & 0xff;
      return new Blob( [ buffer ], { type: type } );
  }
  imprimir(){
    window.print();
  }

}
