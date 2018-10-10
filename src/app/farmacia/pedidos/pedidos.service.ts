import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Pedido } from '../pedidos/pedido';

@Injectable()
export class PedidosService {

  static readonly URL: string = "pedidos";
  static readonly URL_STATS: string = "pedidos-stats";
  static readonly URL_PRESUPUESTOS: string = "presupuestos";
  static readonly URL_PRESUPUESTO: string = "pedidos-presupuesto";
  static readonly URL_CANCELAR: string = "cancelar-pedido-transferir";
  static readonly URL_CANCELAR_TRANSFERENCIA: string = "cancelar-transferencia";
  static readonly URL_GENERAR_ALTERNO: string = "generar-pedido-alterno";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  stats(presupuesto:number = 0): Observable<any>{
    return this.jwtRequest.get(PedidosService.URL_STATS,null,{presupuesto:presupuesto}).map( (response: Response) => response.json());
  }

  presupuestos(): Observable<any>{
    return this.jwtRequest.get(PedidosService.URL_PRESUPUESTOS,null,null).map( (response: Response) => response.json());
  }

  presupuesto(mes:number = 0, anio:number = 0, almacen:string = '', presupuesto:number = 0): Observable<any>{
    let parametros:any = {};
    if(mes){ parametros.mes = mes; }
    if(anio){ parametros.anio = anio; }
    if(almacen){ parametros.almacen = almacen; }
    if(presupuesto){ parametros.presupuesto = presupuesto; }
    return this.jwtRequest.get(PedidosService.URL_PRESUPUESTO,null,parametros).map( (response: Response) => response.json());
  }

  buscar(status:string, term: string, pagina:number = 1, resultados_por_pagina:number =20, tipo:string = '', presupuesto:number = 0 ): Observable<any>{
    return this.jwtRequest.get(PedidosService.URL,null,{tipo:tipo, status: status, q: term, page: pagina, per_page: resultados_por_pagina, presupuesto: presupuesto}).map( (response: Response) => response.json().data);
  }

  lista(status:string, pagina:number = 1, resultados_por_pagina:number =20,tipo:string = '', presupuesto:number = 0 ): Observable<any>{
    return this.jwtRequest.get(PedidosService.URL,null,{tipo:tipo, status:status, page: pagina, per_page: resultados_por_pagina, presupuesto: presupuesto}).map( (response: Response) => response.json().data);
  }

  ver(id:any): Observable<any>{
    return this.jwtRequest.get(PedidosService.URL,id,{}).map( (response: Response) => {
      let jsonData = response.json().data;
      var pedido = jsonData as any;
      return pedido;
    }) as Observable<Pedido>;
  }

  crear(pedido: Pedido[]): Observable<Pedido> {
    return this.jwtRequest.post(PedidosService.URL,pedido).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  editar(id:any, pedido: Pedido[]): Observable<Pedido> {
    return this.jwtRequest.put(PedidosService.URL,id, pedido).map( (response: Response) => response.json().data) as Observable<Pedido>;
  } 

  eliminar(id:any): Observable<Pedido> {
    return this.jwtRequest.delete(PedidosService.URL,id).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  cancelarPedidoTransferir(id:any, parametros:any = {}): Observable<any>{
    return this.jwtRequest.put(PedidosService.URL_CANCELAR,id,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  cancelarTransferencia(id:any, parametros:any = {}): Observable<any>{
    return this.jwtRequest.put(PedidosService.URL_CANCELAR_TRANSFERENCIA,id,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  generarPedidoAlterno(id:any, parametros:any = {}): Observable<any>{
    return this.jwtRequest.put(PedidosService.URL_GENERAR_ALTERNO,id,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }
  
}
