import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Pedido } from '../pedidos/pedido';

@Injectable()
export class PedidosJurisdiccionalesService {

  static readonly URL: string = "pedidos-jurisdiccionales";
  static readonly URL_STATS: string = "pedidos-jurisdiccionales-stats";
  static readonly URL_PRESUPUESTO: string = "pedidos-jurisdiccionales-presupuesto";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  stats(): Observable<any>{
    return this.jwtRequest.get(PedidosJurisdiccionalesService.URL_STATS,null,null).map( (response: Response) => response.json());
  }

  presupuesto(mes:number = 0,almacen:string = ''): Observable<any>{
    let parametros:any = {};
    if(mes){
      parametros.mes = mes;
    }
    if(almacen){
      parametros.almacen = almacen;
    }
    return this.jwtRequest.get(PedidosJurisdiccionalesService.URL_PRESUPUESTO,null,parametros).map( (response: Response) => response.json());
  }

  buscar(status:string, term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(PedidosJurisdiccionalesService.URL,null,{status: status, q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(status:string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(PedidosJurisdiccionalesService.URL,null,{status:status, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  ver(id:any): Observable<any>{
    return this.jwtRequest.get(PedidosJurisdiccionalesService.URL,id,{}).map( (response: Response) => {
     
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
    return this.jwtRequest.post(PedidosJurisdiccionalesService.URL,pedido).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  editar(id:any, pedido: Pedido[]): Observable<Pedido> {
    return this.jwtRequest.put(PedidosJurisdiccionalesService.URL,id, pedido).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }

  eliminar(id:any): Observable<Pedido> {
    return this.jwtRequest.delete(PedidosJurisdiccionalesService.URL,id).map( (response: Response) => response.json().data) as Observable<Pedido>;
  }
  
}
