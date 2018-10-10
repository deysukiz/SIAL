import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'panel-control-menu-aside',
  templateUrl: './menu-aside.component.html',
  styleUrls: ['./menu-aside.component.css']
})
export class MenuAsideComponent implements OnInit {
  /**
   * Calcula el tamaño de la altura de la pantalla.
   * @type {number}
   */
  tamano = document.body.clientHeight;
  /**
   * Contiene los datos de sesión del usuario.
   * @type {any}
   */
  usuario: any = {};
  /**
   * Contiene las opciones de menú agregados al array.
   * @type {array}
   */
  menu: any[] = [];
  /**
   * Contiene las opciones de menú agregados al array, pero que el usuario tiene permiso para verlos.
   * @type {array}
   */
  menuAutorizado: any[] = [];
  constructor() { }

  /**
   * Método que se ejecuta de manera inicial cuando se utiliza el componente.
   */
  ngOnInit() {
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    var permisos =  usuario.permisos.split('|');

    this.menu = [
      {
        titulo: 'Catalogos',
        modulos: [
          { permiso: 'GVnLtL6maGUSPmaiLlCgAT4FzlzHKkN0', icono: 'assets/catalogo-almacenes.svg', titulo: 'Almacenes', url: '/catalogos-parametros/almacenes' },
          { permiso: '1ulsQmM7Abnw2V74dD2is5NEeCQq54YE', icono: 'assets/catalogo-parametros.svg', titulo: 'Parámetros globales', url: '/catalogos-parametros/configuracion-general'}, 
          { permiso: 'Npmc6C155PMjnkPKWUFXcIF3NcegAzIE', icono: 'assets/catalogo-forma-farm.svg', titulo: 'Forma Farmaceutica', url: '/catalogos-parametros/forma-farmaceutica'},
          { permiso: 'l9PXPHg1MMJYMKTlzXeEHNIsgw9d5oty', icono: 'assets/catalogo-grupo-insumos.svg', titulo: 'Grupos de insumos', url: '/catalogos-parametros/grupos-insumos'}, 
          { permiso: 'KbzwkJtDcLGcaNhbuYd24bhdDMGaKXod', icono: 'assets/catalogo-marcas.svg', titulo: 'Marcas', url: '/catalogos-parametros/marcas'}, 
          { permiso: 'JDAc3VaD3TbCIu0cUIYxZ6gG6QG32I3y', icono: 'assets/catalogo-mc.svg', titulo: 'Material de curación', url: '/catalogos-parametros/material-curacion'}, //
          { permiso: 'xSSmZGx6xgw4Qd4MQKlcDwxE1iD4QvxZ', icono: 'assets/catalogo-medicamento.svg', titulo: 'Medicamentos', url: '/catalogos-parametros/medicamentos'}, //      
          { permiso: 'PtTJ9g7WGYcyuPjTxe5iaJILVzQedccG', icono: 'assets/catalogo-presentacion.svg', titulo: 'Presentaciones de medicamentos', url: '/catalogos-parametros/presentaciones-medicamentos'}, 
          { permiso: 'ygwsEwz3cUw4yVMCeaQ9hVMCFXUHri5q', icono: 'assets/catalogo-programas.svg', titulo: 'Programas', url: '/catalogos-parametros/programas'}, 
          { permiso: 'h9IhilMjvBtC7X64A0poFV26EL5xWAyM', icono: 'assets/catalogo-proveedores.svg', titulo: 'Proveedores', url: '/catalogos-parametros/proveedores'}, 
          { permiso: 'OhAoehuuORlLObNSrzy4qpRYE89VfUdt', icono: 'assets/catalogo-servicios.svg', titulo: 'Servicios', url: '/catalogos-parametros/servicios'},
          { permiso: 'DbpT0VqR0DcNcqmCnwRbK7XvgWqDY2yc', icono: 'assets/catalogo-servidor.svg', titulo: 'Servidores', url: '/catalogos-parametros/servidores' },
          { permiso: '2CGoJAwDzH2JGpaPVUz3Vakcge5ReO9F', icono: 'assets/catalogo-pedido.svg', titulo: 'Tipos de pedidos', url: '/catalogos-parametros/tipo-pedido'},
          { permiso: 'd1V2FX6TNxO6cCSXaAZQfLiAnDoL6rnO', icono: 'assets/catalogo-tipo-insumos.svg', titulo: 'Tipos de insumos', url: '/catalogos-parametros/tipos-insumos'},
          { permiso: 'S1Yv83vAhv2o7xzq5ur37bmbfHvsomJf', icono: 'assets/catalogo-tipo-movimiento.svg', titulo: 'Tipos de movimientos', url: '/catalogos-parametros/tipos-movimientos' },
          { permiso: 'JHUfLL82Cp1pUI7tTKaWuCfVIaeKZk5z', icono: 'assets/catalogo-tipo-insumos.svg', titulo: 'Tipos de personal', url: '/catalogos-parametros/tipos-personal'},
          { permiso: '56R2ES2GDbpovdiLAwFEjj75Rl975MsR', icono: 'assets/catalogo-um.svg', titulo: 'Unidades Médicas', url: '/catalogos-parametros/unidades-medicas'},
          { permiso: 'ouIq0jdKpmTNYG1f2MRjMmlKvXmSviPd', icono: 'assets/catalogo-unid-medida.svg', titulo: 'Unidades de medida', url: '/catalogos-parametros/unidades-medida' },
          { permiso: 'EBQdToSqWCpu1TJTDWBibcuGOpO97ucT', icono: 'assets/catalogo-administracion.svg', titulo: 'Vias de administración', url: '/catalogos-parametros/vias-administracion' },
        ]
      },
    ];
    
    
    if (permisos.length > 0){    
      for (var i in this.menu){
       
        for (var j in this.menu[i].modulos){
          siguienteItemProtegido: 
          for (var k in permisos){
            if (permisos[k] == this.menu[i].modulos[j].permiso){
              var item = this.initMenuAutorizadoPorItem(this.menu[i].titulo)
              item.modulos.push(this.menu[i].modulos[j]);
              break siguienteItemProtegido;
            }           
          }
        }

      }
    } 
  }

  /**
   * Método que agrega los ítems autoorizados a la lista del menuAutorizado que se muestra al usuario.
   * @param titulo Variable que contiene el nombre del item del menú que va agregarse al menú autorizado.
   */
  initMenuAutorizadoPorItem(titulo: string){
     for (var i in this.menuAutorizado){
       if (titulo == this.menuAutorizado[i].titulo){
        return this.menuAutorizado[i];
       }
     }
     this.menuAutorizado.push({ titulo: titulo, modulos: []});
     return this.menuAutorizado[this.menuAutorizado.length - 1];
  }

}
