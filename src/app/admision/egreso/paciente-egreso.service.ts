import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

import { PacienteEgreso } from './paciente-egreso';

@Injectable()
export class PacienteEgresoService {

  static readonly URL: string = "admision/admision";
  
  	constructor(private http: Http,   private jwtRequest:JwtRequestService) { }

  	buscar(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    	return this.jwtRequest.get(PacienteEgresoService.URL,null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  	}

  	lista(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
    	return this.jwtRequest.get(PacienteEgresoService.URL,null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
  	}

    listaCompleta(pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
      return this.jwtRequest.get("admision/paciente",null,{page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
    }

    buscarCompleta(term: string, pagina:number = 1, resultados_por_pagina:number =20 ): Observable<any>{
      return this.jwtRequest.get("admision/paciente",null,{q: term, page: pagina, per_page: resultados_por_pagina}).map( (response: Response) => response.json().data);
    }

  	
  	listaMunicipios(municipio: number=null): Observable<any>{
	    return this.jwtRequest.get("admision/municipio",municipio,null).map( (response: Response) => response.json().data);
	  }

  	listaLocalidades(municipio: number=null, localidad:number=null): Observable<any>{
  	    return this.jwtRequest.get("admision/localidad",localidad,{municipio_id: municipio}).map( (response: Response) => response.json().data);
  	}

    listaMotivoEgreso(): Observable<any>{
      return this.jwtRequest.get("admision/motivo-egreso",null,null).map( (response: Response) => response.json().data);
    }

    listaTriage(id:number): Observable<any>{
      return this.jwtRequest.get("admision/triage",null,{triage_id: id}).map( (response: Response) => response.json().data);
    }

    listaGradoLesion(id:number): Observable<any>{
      return this.jwtRequest.get("admision/grado-lesion",null,{grado_lesion_id: id}).map( (response: Response) => response.json().data);
    }

    listaUnidades(lista:number, id:number): Observable<any>{
      return this.jwtRequest.get("unidades-medicas",null,{lista:lista, clues: id}).map( (response: Response) => response.json().data);
    }

    ver(id:any): Observable<PacienteEgreso>{
    return this.jwtRequest.get(PacienteEgresoService.URL,id,{}).map( (response: Response) => {
     
     console.log(response.json().data);
       let jsonData = response.json().data;
       
        var pacienteEgreso = jsonData as PacienteEgreso;
      
        return pacienteEgreso;
      }) as Observable<PacienteEgreso>;
  	}

   editar(id:any, pacienteEgreso: PacienteEgreso): Observable<PacienteEgreso> {
     return this.jwtRequest.put("admision/paciente-egreso",id, pacienteEgreso).map( (response: Response) => response.json().data) as Observable<PacienteEgreso>;
   }

   ingreso(id:any, pacienteEgreso: PacienteEgreso): Observable<PacienteEgreso> {
     return this.jwtRequest.put("admision/admision",id, pacienteEgreso).map( (response: Response) => response.json().data) as Observable<PacienteEgreso>;
   }

   crear(pacienteEgreso: PacienteEgreso): Observable<PacienteEgreso> {
      return this.jwtRequest.post("admision/paciente",pacienteEgreso).map( (response: Response) => response.json().data) as Observable<PacienteEgreso>;
    }

}
