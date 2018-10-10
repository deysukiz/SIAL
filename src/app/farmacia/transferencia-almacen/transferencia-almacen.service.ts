import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

@Injectable()
export class TransferenciaAlmacenService {

  static readonly URL: string = "almacen/transferencias";
  static readonly URL_SURTIR: string = "almacen/surtir-transferencia";
  static readonly URL_ACTUALIZAR: string = "almacen/actualizar-transferencia";
  static readonly URL_STATS: string = "almacen/transferencias-stats";
  static readonly URL_CANCELAR: string = "cancelar-pedido-transferir";
  static readonly URL_GENERAR_ALTERNO: string = "generar-pedido-alterno";
  static readonly URL_CANCELAR_TRANSFERENCIA: string = "cancelar-transferencia";

  //AKIRA:

  static readonly URL_UNIDADES_MEDICAS: string = "unidades-medicas";
  static readonly URL_ALMACENES: string = "almacenes";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  stats(): Observable<any>{
    return this.jwtRequest.get(TransferenciaAlmacenService.URL_STATS,null,null).map( (response: Response) => response.json());
  }

  buscar(status:string, term: string, pagina:number = 1, resultados_por_pagina:number =20, tipo:string = '' ): Observable<any>{
    return this.jwtRequest.get(TransferenciaAlmacenService.URL,null,{tipo:tipo, status: status, q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(status:string, pagina:number = 1, resultados_por_pagina:number =20,tipo:string = '' ): Observable<any>{
    return this.jwtRequest.get(TransferenciaAlmacenService.URL,null,{tipo:tipo, status:status, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  surtir(id:any, pedido:any): Observable<any> {
    return this.jwtRequest.put(TransferenciaAlmacenService.URL_SURTIR,id, pedido).map( (response: Response) => response.json().data) as Observable<any>;
  } 

  actualizarTransferencia(id:any, stock:any): Observable<any> {
    return this.jwtRequest.put(TransferenciaAlmacenService.URL_ACTUALIZAR,id, stock).map( (response: Response) => response.json().data) as Observable<any>;
  } 

  ver(id:any): Observable<any>{
    return this.jwtRequest.get(TransferenciaAlmacenService.URL,id,{}).map( (response: Response) => {
      let jsonData = response.json().data;
      var pedido = jsonData as any;
      return pedido;
    }) as Observable<any>;
  }

  crear(pedido: any[]): Observable<any> {
    return this.jwtRequest.post(TransferenciaAlmacenService.URL,pedido).map( (response: Response) => response.json().data) as Observable<any>;
  }

  editar(id:any, pedido: any[]): Observable<any> {
    return this.jwtRequest.put(TransferenciaAlmacenService.URL,id, pedido).map( (response: Response) => response.json().data) as Observable<any>;
  } 

  eliminar(id:any): Observable<any> {
    return this.jwtRequest.delete('pedido-alteno',id).map( (response: Response) => response.json().data) as Observable<any>;
  }

  cancelarPedidoTransferir(id:any, parametros:any = {}): Observable<any>{
    return this.jwtRequest.put(TransferenciaAlmacenService.URL_CANCELAR,id,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  generarPedidoAlterno(id:any, parametros:any = {}): Observable<any>{
    return this.jwtRequest.put(TransferenciaAlmacenService.URL_GENERAR_ALTERNO,id,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  //AKIRA:
  unidadesMedicas(): Observable<any>{
    return this.jwtRequest.get(TransferenciaAlmacenService.URL_UNIDADES_MEDICAS,null,{ lista:true, activa: true}).map( (response: Response) => response.json().data);
  }

  almacenes(clues:string): Observable<any>{
    return this.jwtRequest.get(TransferenciaAlmacenService.URL_ALMACENES,null,{q: clues, tipo: 'ALMPAL'}).map( (response: Response) => response.json().data);
  }
  
  guardarTransferencia(id:any = null, parametros: any = {}):Observable<any> {
    if(id == null){
      return this.jwtRequest.post(TransferenciaAlmacenService.URL,parametros).map( (response: Response) => response.json().data) as Observable<any>;
    } else {
      return this.jwtRequest.put(TransferenciaAlmacenService.URL,id, parametros).map( (response: Response) => response.json().data) as Observable<any>;
    }
  }

  cancelarTransferencia(id:any, parametros:any = {}): Observable<any>{
    return this.jwtRequest.put(TransferenciaAlmacenService.URL_CANCELAR_TRANSFERENCIA,id,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

}
