import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { Subscription }   from 'rxjs/Subscription';

import { BuscarModuloPipe } from '../../pipes/buscar-modulo.pipe';

import { CambiarEntornoService } from '../../perfil/cambiar-entorno.service';
/**
 * Componente que muestra los módulos disponibles para esta sección.
 */
@Component({
  selector: 'app-index-farmacia',
  templateUrl: './index-farmacia.component.html',
  styleUrls: ['./index-farmacia.component.css']
})
/**
 * Clase que muestra los módulos autorizados y disponibles del almacén.
 */
export class IndexFarmaciaComponent implements OnInit {
  /**
   * Contiene los datos de inicio de sesión del usuario.
   */
  usuario: any = {};
  /**
   * Contiene el término de búsqueda que ingresa el usuario.
   * @type {string}
   */
  busqueda = '';

  /**
   * Contiene la lista de los módulos en general que se agregan en este archivo.
   * @type {array}
   */
  modulos: any[] = [];
  /**
   * Contiene los módulos que van a mostrarse en la vista de acuerdo a los permisos.
   * @type {array}
   */
  modulosAutorizados: any[] = [];
  /**
   * Contiene la lista de los módulos que se agregan a la lista de accesos directos.
   * @type {array}
   */
  accesosDirectos: any[] = [];
  /**
   * Contiene la lista de los módulos con acceso directo que se mostrarán en la vista
   * de acuerdo al rol del usuario.
   * @type {array}
   */
  accesosDirectosAutorizados: any[] = [];

  cambiarEntornoSuscription: Subscription;

  /**
   * Este método inicializa la carga de las dependencias
   * que se necesitan para el funcionamiento del modulo
   */
  constructor(private title: Title, private cambiarEntornoService:CambiarEntornoService) { }

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    this.title.setTitle('Almacén medicamentos');
    this.usuario = JSON.parse(localStorage.getItem('usuario'));

    this.cambiarEntornoSuscription = this.cambiarEntornoService.entornoCambiado$.subscribe(evento => {
      this.modulosAutorizados = [];
      this.accesosDirectosAutorizados = [];
      this.generarIndex();
    });

    this.generarIndex();
  }

  generarIndex(){
    this.modulos = [
      { permiso: 'z9MQHY1YAIlYWsPLPF9OZYN94HKjOuDk', icono: 'assets/icono-pagina-lista.svg', titulo: 'Pedidos', url: '/almacen/pedidos' },
      { permiso: 'GPSDLmXckXcdfdj7lD4rdacwMivsTp9g', icono: 'assets/icono-recetas.svg', titulo: 'Recetas', url: '/almacen/salidas-recetas' },
      { permiso: 'qQvNeb1UFPOfVMKQnNkvxyqjCIUgFuEG', icono: 'assets/icono-salidas.svg', titulo: 'Salida de medicamentos', url:'/almacen/salidas-estandar' },
      { permiso: 'a1OMZVn7dveOf5aUK8V0VsvvSCxz8EMw', icono: 'assets/icono-entradas.svg', titulo: 'Entrada de medicamentos', url:'/almacen/entradas-estandar' },

      { permiso: 'tTxAiFKSsx4xSvJjIv5jodZpliDxFe1y', icono: 'assets/icono-transferencias.svg', titulo: 'Transferencias Almacen', url:'/almacen/transferencia-almacen' },

      // { permiso: 'z9MQHY1YAIlYWsPLPF9OZYN94HKjOuDk--', icono: 'assets/icono-pedidos-jurisdiccionales.svg', titulo: 'Pedidos jurisdiccionales', url: "/almacen/pedidos-jurisdiccionales" },
      // { permiso: 'iSxK0TpoYpnzf8KIQTWOq9Web7WnSKhz', icono: 'assets/icono-pedidos-alt.svg', titulo:'Entregas de pedidos', url:"/almacen/entregas" },
      // { permiso: '7KbTARF2kpnO4Lfqv8hmYP8QGMcgJBwU', icono: 'assets/icono-ajustes-inventario.svg', titulo: 'Inicialización Inventario', url: '/almacen/inicializacion-inventario' },
      // { permiso: '', icono: 'assets/icono-colectivo.svg', titulo:"Colectivos", url:"/farmacia/colectivos" },
      // { permiso: '', icono: 'assets/icono-camion.svg', titulo:"Reabastecimiento", url:"/farmacia/pedidos-reabastecimiento" },
      // { permiso: '', icono: 'assets/icono-pagina-lista.svg', titulo:"Actas por desabasto", url:"/farmacia/actas" },
      // { permiso: '', icono: 'assets/icono-pagina-lista.svg', titulo:"Actas colectivas por desabasto", url:"/farmacia/actas-colectivas" },
    ];

    this.accesosDirectos = [];

    //Harima: hay que checar si se pueden crear o recibir pedidos por parte del usuario
    let usuario = JSON.parse(localStorage.getItem('usuario'));
    var permisos =  usuario.permisos.split('|')

    if(!usuario.solo_lectura && usuario.almacen_activo.tipo_almacen == 'ALMPAL'){
      this.accesosDirectos.push({ permiso: '2nC6GUf6E737QwZSxuLORT6rZUDy5YUO', icono: 'assets/icono-pagina-lista.svg', titulo:'Nuevo pedido', url:'/almacen/pedidos/nuevo' });
    }

    if(!usuario.solo_lectura){
      if(usuario.almacen_activo.tipo_almacen == 'FARSBR'){
        this.accesosDirectos.push({ permiso: 'q9ppCvhWdeCJI85YtCrKvtHLaoPipeaT', icono: 'assets/icono-pedidos-alt.svg', titulo:'Recibir pedido', url:'/almacen/pedidos/farmacia-subrogada' });
      }else{
        this.accesosDirectos.push({ permiso: 'q9ppCvhWdeCJI85YtCrKvtHLaoPipeaT', icono: 'assets/icono-pedidos-alt.svg', titulo:'Recibir pedido', url:'/almacen/pedidos/por-surtir' });
      }
    }

    if (permisos.length > 0) {

      for (var i in this.modulos) {
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
