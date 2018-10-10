import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'panel-control-menu-aside',
  templateUrl: './menu-aside.component.html',
  styleUrls: ['./menu-aside.component.css']
})
export class MenuAsideComponent implements OnInit {
  /**
   * Contiene los datos de inicio de sesión del usuario.
   * @type {Object}
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

  ngOnInit() {
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    var permisos =  usuario.permisos.split('|');

    this.menu = [
      {
        titulo: 'Configuración',
        modulos: [
          // { permiso: 'mQkBWsqUn00z7jDD66qhiJO7jrnPEaOT', icono: 'fa-cog', titulo:"Configuración general", url:"/configuracion/configuracion-general" },
          {
            permiso: 'zRTSAl0H8YNFMWcn00yeeJPigztCbSdC', icono: 'fa-archive', titulo: 'Mis almacenes', url: '/configuracion/almacenes' },
          { permiso: 'Ki9kBghgqYsY17kqL620GWYl0bpeU6TB', icono: 'fa-hospital-o', titulo: 'Mis servicios', url: '/configuracion/servicios'},
          { permiso: '9dKCEyujSdLQF2CbpjXiWKeap0NlJCzw', icono: 'fa-clock-o', titulo: 'Mis turnos', url: '/configuracion/turnos' },
          { permiso: 'BnB3LhrDbKNBrbQaeB2BPXKGrLEYrEw7', icono: 'fa-medkit', titulo: 'Mis claves', url: '/configuracion/claves' },
          { permiso: 'nLSqnSHHppYWQGGCrlbvCDp1Yyjcvyb3', icono: 'fa-user-md', titulo: 'Personal', url: '/configuracion/personal-clues' },
          { permiso: 'nLSqnSHHppYWQGGCrlbvCDp1Yyjcvyb3', icono: 'fa-edit', titulo: 'Firmas de documentos', url: '/configuracion/documentos' },
          /*{ permiso: 'BnB3LhrDbKNBrbQaeB2BPXKGrLEYrEw7', icono: 'fa-medkit', titulo:"Responsables", url:"/configuracion/claves" },*/
          { permiso: 'BnB3LhrDbKNBrbQaeB2BPXKGrLEYrEw7', icono: 'fa-pencil', titulo: 'Firmantes', url: '/configuracion/firmantes' },
        ]
      },
    ],
    this.menuAutorizado = [];

    
    
    if (permisos.length > 0){    
      for (var i in this.menu){
       
        for (var j in this.menu[i].modulos){
          siguienteItemProtegido: 
          for (var k in permisos){
            if (permisos[k] == this.menu[i].modulos[j].permiso){
              var item = this.initMenuAutorizadoPorItem(this.menu[i].titulo);
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
  initMenuAutorizadoPorItem(titulo: string)  {
     for ( let i in this.menuAutorizado){
       if (titulo === this.menuAutorizado[i].titulo) {
        return this.menuAutorizado[i];
       }
     }
     this.menuAutorizado.push({ titulo: titulo, modulos: []});
     return this.menuAutorizado[this.menuAutorizado.length - 1];
  }

}
