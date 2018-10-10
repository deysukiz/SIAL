import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

@Injectable()
export class InicializacionInventarioService {

  static readonly URL: string = "inventario/inicializacion-inventario";
  static readonly URL_INSUMOS: string = "catalogo-insumos";
  
  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  buscar(status:string, term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(InicializacionInventarioService.URL,null,{status: status, q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(status:string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(InicializacionInventarioService.URL,null,{status:status, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  ver(id:any): Observable<any>{
    return this.jwtRequest.get(InicializacionInventarioService.URL,id,{}).map( (response: Response) => {
        let jsonData = response.json().data;
        var data = jsonData as any;
        return data;
      }) as Observable<any>;
  }

  inicializar(inventario:any): Observable<any> {
    return this.jwtRequest.post(InicializacionInventarioService.URL,inventario).map( (response: Response) => response.json().data) as Observable<any>;
  }
  
  insumos(): Observable<any>{
    return this.jwtRequest.get(InicializacionInventarioService.URL_INSUMOS,null,{con_precios: true}).map( (response: Response) => response.json().data);
  }
}
