import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';

@Component({
  selector: 'app-index-receta',
  templateUrl: './index-receta.component.html',
  styleUrls: ['./index-receta.component.css']
})
export class IndexRecetaComponent implements OnInit {

  usuario: any = {};
  busqueda = '';

  modulos: any[] = [];
  modulosAutorizados: any[] = [];
  accesosDirectos: any[] = [];
  accesosDirectosAutorizados: any[] = [];

  constructor(private title: Title) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.title.setTitle('Receta Electrónica');
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    this.modulos = [
      {
        permiso: 'rEAgr2wrYx2AKLhIS7uLh7QIPJkmv4Jo', icono: 'assets/icono-receta.svg',
        titulo: 'Crear Receta Electrónica', url: '/receta-electronica/nuevo'
      },
      {
        permiso: 'rEAgr2wrYx2AKLhIS7uLh7QIPJkmv4Jo', icono: 'assets/icono-recetas.svg',
        titulo: 'Lista Recetas Electrónicas', url: '/receta-electronica/lista'
      },
      {
        permiso: '7pFIrhuM3trSzo9nnIgeU7cMUArsukS8', icono: 'assets/icono-dispensacion.svg',
        titulo: 'Dispensación de Recetas', url: '/receta-electronica/dispensacion'
      }

      // Para que tienen todas estas pruebas? R=Porque los permisos no están en la BD aún, entonces uso el permiso de pedidos
      // Harima: voy a borrar las pruebas, si necesitas los permisos en la base de datos porfa dile a Joram que los agregue, asi como me mandan por correo la lista, Jomran puede hacer el insert manual en su base de datos
    ];
    this.accesosDirectos = [
    ];

    let usuario = JSON.parse(localStorage.getItem('usuario'));
    let permisos =  usuario.permisos.split('|');

    if (permisos.length > 0) {

      for (let i in this.modulos) {
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
          if(permisos[j] == this.accesosDirectos[i].permiso) {
            this.accesosDirectosAutorizados.push(this.accesosDirectos[i]);
            break siguienteItemProtegido;
          }
        }
      }

    }
  }

}
