import { Component, OnInit } from '@angular/core';
import { Title }     from '@angular/platform-browser';

import { BuscarModuloPipe } from '../../../pipes/buscar-modulo.pipe';

@Component({
  selector: 'app-index-catalogo',
  templateUrl: './index-catalogo.component.html',
  styleUrls: ['./index-catalogo.component.css']
})
export class IndexCatalogoComponent implements OnInit {

  usuario: any = {}
  busqueda: string = "";

  modulos:any[] = [];
  accesosDirectos:any[] = [];

  constructor(private title: Title) { }

  ngOnInit() {
    this.title.setTitle("Artículos / Catálogos");
    this.usuario = JSON.parse(localStorage.getItem("usuario"));

    this.modulos = [
      { permiso: 'l9PXPHg1MMJYMKTlzXeEHNIsgw9d5oty', icono: 'assets/catalogo-grupo-insumos.svg', titulo:"Grupos de insumos", url:"/catalogos/grupos-insumos"}, 
      { permiso: 'KbzwkJtDcLGcaNhbuYd24bhdDMGaKXod', icono: 'assets/catalogo-marcas.svg', titulo:"Marcas", url:"/catalogos/marcas"}, 
      { permiso: 'JDAc3VaD3TbCIu0cUIYxZ6gG6QG32I3y', icono: 'assets/catalogo-mc.svg', titulo:"Material de curación", url:"/catalogos/material-curacion"}, 
      { permiso: 'xSSmZGx6xgw4Qd4MQKlcDwxE1iD4QvxZ', icono: 'assets/catalogo-medicamento.svg', titulo:"Medicamentos", url:"/catalogos/medicamentos"},       
      { permiso: 'ygwsEwz3cUw4yVMCeaQ9hVMCFXUHri5q', icono: 'assets/catalogo-programas.svg', titulo:"Programas", url:"/catalogos/programas"}, 
      { permiso: 'PtTJ9g7WGYcyuPjTxe5iaJILVzQedccG', icono: 'assets/catalogo-presentacion.svg', titulo:"Presentaciones de medicamentos", url:"/catalogos/presentaciones-medicamentos"}, 
      { permiso: 'EBQdToSqWCpu1TJTDWBibcuGOpO97ucT', icono: 'assets/catalogo-administracion.svg', titulo:"Vias de administración", url:"vias-administracion" },
      { permiso: 'ouIq0jdKpmTNYG1f2MRjMmlKvXmSviPd', icono: 'assets/catalogo-unid-medida.svg', titulo:"Unidades de medida", url:"/almacen-articulos/catalogos/unidades-medida" },
      { permiso: 'OhAoehuuORlLObNSrzy4qpRYE89VfUdt', icono: 'assets/catalogo-servicios.svg', titulo:"Servicios", url:"/catalogos/servicios"},
      { permiso: 'Npmc6C155PMjnkPKWUFXcIF3NcegAzIE', icono: 'assets/catalogo-servicios.svg', titulo:"Forma Farmaceutica", url:"/catalogos/forma-farmaceutica"},
      { permiso: '2CGoJAwDzH2JGpaPVUz3Vakcge5ReO9F', icono: 'assets/catalogo-pedido.svg', titulo:"Tipos de pedidos", url:"/catalogos/tipo-pedido" },
      { permiso: 'S1Yv83vAhv2o7xzq5ur37bmbfHvsomJf', icono: 'assets/catalogo-tipo-movimiento.svg', titulo:"Tipos de movimientos", url:"/catalogos/tipos-movimientos" },
      { permiso: 'd1V2FX6TNxO6cCSXaAZQfLiAnDoL6rnO', icono: 'assets/catalogo-tipo-insumos.svg', titulo:"Tipos de insumos", url:"/catalogos/tipos-insumos"},
      { permiso: 'JHUfLL82Cp1pUI7tTKaWuCfVIaeKZk5z', icono: 'assets/catalogo-tipo-insumos.svg', titulo:"Tipos de personal", url:"/catalogos/tipos-insumos"},
      
    ]
    this.accesosDirectos = [
      { permiso: '', icono: 'assets/catalogo-servidor.svg', titulo:"Servidores", url:"/catalogos/servidores" },
      { permiso: '', icono: 'assets/catalogo-almacenes.svg', titulo:"Almacenes", url:"/catalogos/almacenes" },
      { permiso: '', icono: 'assets/catalogo-proveedores.svg', titulo:"Proveedores", url:"/catalogos/proveedores"}, 
      { permiso: '', icono: 'assets/catalogo-um.svg', titulo:"Unidades Médicas", url:"unidades-medicas"}, 
    ]

  }

}
