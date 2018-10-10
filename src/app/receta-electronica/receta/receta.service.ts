import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

@Injectable()
export class RecetaService {

  static readonly URL: string = "personal";  
  static readonly URL_PACIENTE: string = "admision/paciente";  
  static readonly URL_INSUMO: string = "catalogo-insumos";	

  constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  buscar_personal(term: string, pagina:number = 1, resultados_por_pagina:number =10): Observable<any>{
		return this.jwtRequest.get(RecetaService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista(pagina:number = 1, resultados_por_pagina:number =10 ): Observable<any>{
		return this.jwtRequest.get(RecetaService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista_insumos(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(RecetaService.URL_INSUMO,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
		return this.jwtRequest.get(RecetaService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  buscar_pacientes(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(RecetaService.URL_PACIENTE,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  buscar_detalle_paciente(id:string, type:number, term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(RecetaService.URL_PACIENTE,null,{identificador: id, tipo:type,q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  lista_paciente(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(RecetaService.URL_PACIENTE,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }

  crear(obj:any): Observable<any> {
    return this.jwtRequest.post(RecetaService.URL_PACIENTE, obj).map( (response: Response) => response.json().data) as Observable<any>;
  }

  buscar_insumo(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    return this.jwtRequest.get(RecetaService.URL_INSUMO,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  }


}
