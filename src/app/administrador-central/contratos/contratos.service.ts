import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

@Injectable()
export class ContratosService {

  static readonly URL: string = "administrador-central";
    constructor(private jwtRequest: JwtRequestService) { }

    lista(): Observable<any[]> {
        return this.jwtRequest.get(ContratosService.URL+"/contratos").map((response: Response) => response.json().data) as Observable<any[]>;
    }

    buscar(payload:any = { q: '', tipo: '',   causes: -1, unidosis: -1, descontinuado: -1, atencion_medica: -1, salud_publica: -1, page: 1, per_page: 20 }): Observable<any> {
        return this.jwtRequest.get(ContratosService.URL+"/contratos", null, payload).map((response: Response) => response.json().data);
    }

    listaPaginada(pagina: number = 1, resultados_por_pagina: number = 20): Observable<any> {
        return this.jwtRequest.get(ContratosService.URL+"/contratos", null, { page: pagina, per_page: resultados_por_pagina }).map((response: Response) => response.json().data);
    }

    ver(id: any): Observable<any> {
        return this.jwtRequest.get(ContratosService.URL+"/contratos", id, {}).map((response: Response) => {

            let jsonData = response.json().data;
            return jsonData;
        }) as Observable<any>;
    }

    crear(item: any): Observable<any> {
        return this.jwtRequest.post(ContratosService.URL+"/contratos", item).map((response: Response) => response.json().data) as Observable<any>;
    }

    editar(id: any, item: any): Observable<any> {
        return this.jwtRequest.put(ContratosService.URL+"/contratos", id, item).map((response: Response) => response.json().data) as Observable<any>;
    }

    activar(id: any): Observable<any> {
      return this.jwtRequest.put(ContratosService.URL+"/contratos/activar", id).map((response: Response) => response.json().data) as Observable<any>;
    }

    eliminar(id: any): Observable<any> {
        return this.jwtRequest.delete(ContratosService.URL+"/contratos", id).map((response: Response) => response.json().data) as Observable<any>;
    }

    proveedores(): Observable<any[]> {
        return this.jwtRequest.get(ContratosService.URL+"/proveedores").map((response: Response) => response.json().data) as Observable<any[]>;
    }

   


    confirmarCargaMasivaDatos(item: any): Observable<any> {
        return this.jwtRequest.post(ContratosService.URL+"/confirmar-carga-masiva-insumos", item).map((response: Response) => response.json().data) as Observable<any>;
    }
   

}
