import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../../jwt-request.service';

@Injectable()
export class ActasService {
	static readonly URL: string = "actas";

	constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

	lista(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
		return this.jwtRequest.get(ActasService.URL,null,{ page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
	}
	
	buscar( term: string, pagina:number = 1, resultados_por_pagina:number =20): Observable<any>{
		return this.jwtRequest.get(ActasService.URL,null,{ q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
	}

	ver(id:any): Observable<any>{
		return this.jwtRequest.get(ActasService.URL,id,{}).map( (response: Response) => {
		 
			let jsonData = response.json().data;	
			var acta = jsonData as any;
			return acta;
		}) as Observable<any>;
	}

}
