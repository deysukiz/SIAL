import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';

@Component({
  selector: 'app-index-equipamiento',
  templateUrl: './index-equipamiento.component.html',
  styleUrls: ['./index-equipamiento.component.css']
})
export class IndexEquipamientoComponent implements OnInit {

  usuario: any = {}
  busqueda: string = "";

  modulos:any[] = [];
  modulosAutorizados:any[] = [];
  accesosDirectos:any[] = [];
  accesosDirectosAutorizados:any[] = [];

  constructor(private title: Title) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.title.setTitle("Almacén / Equipamiento");
    this.usuario = JSON.parse(localStorage.getItem("usuario"));

    this.modulos = [
      
    ]
    this.accesosDirectos = [          
     // { permiso: 'z9MQHY1YAIlYWsPLPF9OZYN94HKjOuDk', icono: 'assets/icono-catalogos.svg', titulo:"Catálogos", url:"/almacen-articulos/catalogos" },
    ]

    let usuario = JSON.parse(localStorage.getItem("usuario"));
    var permisos =  usuario.permisos.split("|")

    if(permisos.length > 0){      
        
      for(var i in this.modulos){
        siguienteItemProtegido:             
        for(var j in permisos){
          
          if(permisos[j] == this.modulos[i].permiso){
            
            this.modulosAutorizados.push(this.modulos[i]);              
            break siguienteItemProtegido;
          }           
        }
      }

      for(var i in this.accesosDirectos){
        siguienteItemProtegido:             
        for(var j in permisos){
          if(permisos[j] == this.accesosDirectos[i].permiso){
            this.accesosDirectosAutorizados.push(this.accesosDirectos[i]);              
            break siguienteItemProtegido;
          }           
        }        
      }
      
    }

  }

}
