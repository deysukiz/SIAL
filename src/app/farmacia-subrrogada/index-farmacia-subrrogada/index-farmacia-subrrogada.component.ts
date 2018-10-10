import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';

@Component({
  selector: 'app-index-farmacia',
  templateUrl: './index-farmacia-subrrogada.component.html',
  styleUrls: ['./index-farmacia-subrrogada.component.css']
})
export class IndexFarmaciaSubrrogadaComponent implements OnInit {

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
    this.title.setTitle("Farmacia Subrogada");
    this.usuario = JSON.parse(localStorage.getItem("usuario"));

    this.modulos = [
      
    ]
    this.accesosDirectos = [          
      { permiso: 'z9MQHY1YAIlYWsPLPF9OZYN94HKjOuDk--', icono: 'assets/icono-dashboard.svg', titulo:"Dashboard Salidas", url:"/almacen/dashboard-salidas" },
      { permiso: '6sTjs3q8rhHslelQgTUI4hdkNSbiwyhf', icono: 'assets/icono-sincronizar-receta.svg', titulo:"Sincronizar recetas", url:"/farmacia-subrrogada/sincronizar-recetas" },
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
