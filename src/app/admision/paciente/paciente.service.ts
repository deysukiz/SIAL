import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { Paciente } from './paciente';

@Injectable()
export class PacienteService {

	static readonly URL: string = "admision/paciente";
  
  	constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  	buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    	return this.jwtRequest.get(PacienteService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  	}

  	lista(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    	return this.jwtRequest.get(PacienteService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  	}

  	crear(paciente: Paciente): Observable<Paciente> {
    	return this.jwtRequest.post(PacienteService.URL,paciente).map( (response: Response) => response.json().data) as Observable<Paciente>;
  	}

  	listaMunicipios( ): Observable<any>{
	    return this.jwtRequest.get("admision/municipio",null,null).map( (response: Response) => response.json().data);
	  }

  	listaLocalidades(municipio: number): Observable<any>{
  	    return this.jwtRequest.get("admision/localidad",null,{municipio_id: municipio}).map( (response: Response) => response.json().data);
  	}

    ver(id:any): Observable<Paciente>{
    return this.jwtRequest.get(PacienteService.URL,id,{}).map( (response: Response) => {
     
       let jsonData = response.json().data;
       
        var paciente = jsonData as Paciente;
      
        return paciente;
      }) as Observable<Paciente>;
  }

   editar(id:any, paciente: Paciente): Observable<Paciente> {
     return this.jwtRequest.put(PacienteService.URL,id, paciente).map( (response: Response) => response.json().data) as Observable<Paciente>;
   }

   historial(id:any, paciente: Paciente): Observable<Paciente> {
     return this.jwtRequest.get("admision/historial",id, null).map( (response: Response) => response.json().data) as Observable<Paciente>;
   }

}
