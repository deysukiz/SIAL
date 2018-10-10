import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Pedido } from '../pedidos-estandar/pedido';

@Injectable()
export class PedidosEstandarService {

  static readonly URL: string = "pedidos";
  static readonly URL_STATS: string = "pedidos-stats";
  static readonly URL_PRESUPUESTO: string = "pedidos-presupuesto";
  static readonly URL_CANCELAR: string = "cancelar-pedido-transferir";
  static readonly URL_CANCELAR_TRANSFERENCIA: string = "cancelar-transferencia";
  static readonly URL_GENERAR_ALTERNO: string = "generar-pedido-alterno";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  stats(): Observable<any>{
    return this.jwtRequest.get(PedidosEstandarService.URL_STATS,null,null).map( (response: Response) => response.json());
  }

  presupuesto(mes:number = 0,almacen:string = ''): Observable<any>{
    let parametros:any = {};
    if(mes){
      parametros.mes = mes;
    }
    if(almacen){
      parametros.almacen = almacen;
    }
    return this.jwtRequest.get(PedidosEstandarService.URL_PRESUPUESTO,null,parametros).map( (response: Response) => response.json());
  }

  buscar(status:string, term: string, pagina:number = 1, resultados_por_pagina:number =20, tipo:string = '' ): Observable<any>{
    return this.jwtRequest.get(PedidosEstandarService.URL,null,{tipo:tipo, status: status, q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(status:string, pagina:number = 1, resultados_por_pagina:number =20,tipo:string = '' ): Observable<any>{
    return this.jwtRequest.get(PedidosEstandarService.URL,null,{tipo:tipo, status:status, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  ver(id:any): Observable<any>{
    return this.jwtRequest.get(PedidosEstandarService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
       /* var roles:string[] = []
        jsonData.roles.map(item => {
          roles.push(""+item.id)
        })*/

        var pedido = jsonData as any;
        //usuario.roles = roles;
        return pedido;
      }) as Observable<Pedido>;
  }

  crear(pedido: Pedido[]): Observable<Pedido> {
    return this.jwtRequest.post(PedidosEstandarService.URL,pedido).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  editar(id:any, pedido: Pedido[]): Observable<Pedido> {
    return this.jwtRequest.put(PedidosEstandarService.URL,id, pedido).map( (response: Response) => response.json().data) as Observable<Pedido>;
  } 

  eliminar(id:any): Observable<Pedido> {
    return this.jwtRequest.delete('pedido-alteno',id).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  cancelarPedidoTransferir(id:any, parametros:any = {}): Observable<any>{
    return this.jwtRequest.put(PedidosEstandarService.URL_CANCELAR,id,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  cancelarTransferencia(id:any, parametros:any = {}): Observable<any>{
    return this.jwtRequest.put(PedidosEstandarService.URL_CANCELAR_TRANSFERENCIA,id,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  generarPedidoAlterno(id:any, parametros:any = {}): Observable<any>{
    return this.jwtRequest.put(PedidosEstandarService.URL_GENERAR_ALTERNO,id,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }
  
}
