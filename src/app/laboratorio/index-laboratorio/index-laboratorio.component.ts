import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';

@Component({
  selector: 'app-index-laboratorio',
  templateUrl: './index-laboratorio.component.html',
  styleUrls: ['./index-laboratorio.component.css']
})
export class IndexLaboratorioComponent implements OnInit {
  /**
   * Contiene los datos de inicio de sesión de usuario
   * @type {any}
   */
  usuario: any = {}
  busqueda: string = '';

  modulos:any[] = [];
  modulosAutorizados:any[] = [];
  accesosDirectos:any[] = [];
  accesosDirectosAutorizados:any[] = [];

  constructor(private title: Title) { }

  ngOnInit() {
    this.title.setTitle('Laboratorio');
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    this.modulos = [
      {
        permiso: 'PzmTtCd1MbMWVBPwVmttQQWdNfqwzp7p',
        icono: 'assets/icono-entradas-laboratorio.svg', titulo: 'Entrada de laboratorio',
        url: '/laboratorio/entradas-laboratorio'
      },
      {
        permiso: 'PzmTtCd1MbMWVBPwVmttQQWdNfqwzp7p',
        icono: 'assets/icono-entradas-laboratorio.svg', titulo: 'Entradas de laboratorio (Actualización)',
        url: '/laboratorio-estandar/entradas'
      },
      {
        permiso: '7GkcqRllVy4Z371KMLPsX0d04dqv3vBE', icono: 'assets/icono-salidas-laboratorio.svg',
        titulo: 'Salidas de laboratorio (Actualización)',
        url: '/laboratorio-estandar/salidas'
      },
      {
        permiso: '7GkcqRllVy4Z371KMLPsX0d04dqv3vBE', icono: 'assets/icono-salidas-laboratorio.svg',
        titulo: 'Salida de laboratorio', url: '/laboratorio/salidas-laboratorio'
      },
      {
        permiso: 'mJ2E55G7moiDdV3VpY2u7g5obUzeop7p', icono: 'assets/icono-stock-lab.svg',
        titulo: 'Existencias de laboratorio', url: '/laboratorio/existencias'
      },
    ];
    this.accesosDirectos = [
     // { permiso: 'z9MQHY1YAIlYWsPLPF9OZYN94HKjOuDk', icono: 'assets/icono-catalogos.svg', titulo:"Catálogos", url:"/almacen-articulos/catalogos" },
    ];

    let usuario = JSON.parse(localStorage.getItem('usuario'));
    let permisos =  usuario.permisos.split('|');

    if (permisos.length > 0) {
      for(let i in this.modulos){
        siguienteItemProtegido:
        for(let j in permisos){
          
          if(permisos[j] == this.modulos[i].permiso){
            
            this.modulosAutorizados.push(this.modulos[i]);
            break siguienteItemProtegido;
          }           
        }
      }

      for(let i in this.accesosDirectos){
        siguienteItemProtegido:             
        for(let j in permisos){
          if(permisos[j] == this.accesosDirectos[i].permiso){
            this.accesosDirectosAutorizados.push(this.accesosDirectos[i]);
            break siguienteItemProtegido;
          }           
        }        
      }
      
    }

  }

}
