import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

@Injectable()
export class FirmanteService {

  static readonly URL: string = "personal";
  static readonly URL_PEDIDO: string = "pedidos";
  static readonly URL_FIRMANTES: string = "firmantes";
  	
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  buscar_personal(term: string, pagina:number = 1, resultados_por_pagina:number =10 ): Observable<any>{
		return this.jwtRequest.get(FirmanteService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(pagina:number = 1, resultados_por_pagina:number =10 ): Observable<any>{
		return this.jwtRequest.get(FirmanteService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
		return this.jwtRequest.get(FirmanteService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista_pedido(): Observable<any>{
		return this.jwtRequest.get(FirmanteService.URL_PEDIDO,null,{}).map( (response: Response) => response.json().data);
  }

   firmantes(): Observable<any>{
    return this.jwtRequest.get(FirmanteService.URL_FIRMANTES,null,{}).map( (response: Response) => response.json().data);
  }

  actualizar_firmantes(parametros:any): Observable<any>{
    return this.jwtRequest.post(FirmanteService.URL_FIRMANTES,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

}
