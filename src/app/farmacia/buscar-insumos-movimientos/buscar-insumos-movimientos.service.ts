import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';


@Injectable()
export class BuscarInsumosService {

  static readonly URL: string = "catalogo-insumos";
  static readonly stockURL: string = "comprobar-stock";
    

  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  lista(pagina:number = 1, resultados_por_pagina:number = 25 ): Observable<any>{
    return this.jwtRequest.get(BuscarInsumosService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  buscar(term: string, pagina:number = 1, resultados_por_pagina:number = 25 ): Observable<any>{
    return this.jwtRequest.get(BuscarInsumosService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  comprobarStock(almacen: string = "00021",clave: string): Observable<any>{
    return this.jwtRequest.get(BuscarInsumosService.stockURL,null,{almacen: almacen, clave: clave}).map( (response: Response) => response.json());
  }
}
