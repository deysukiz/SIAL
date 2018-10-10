import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';

import { JwtRequestService } from '../../jwt-request.service';

@Injectable()
export class InsumosMedicosService {

  static readonly URL: string = "administrador-central";
    constructor(private jwtRequest: JwtRequestService) { }

    lista(): Observable<any[]> {
        return this.jwtRequest.get(InsumosMedicosService.URL+"/insumos-medicos").map((response: Response) => response.json().data) as Observable<any[]>;
    }

    buscar(payload:any = { q: '', tipo: '',   causes: -1, unidosis: -1, descontinuado: -1, atencion_medica: -1, salud_publica: -1, page: 1, per_page: 20 }): Observable<any> {
        return this.jwtRequest.get(InsumosMedicosService.URL+"/insumos-medicos", null, payload).map((response: Response) => response.json().data);
    }

    listaPaginada(pagina: number = 1, resultados_por_pagina: number = 20): Observable<any> {
        return this.jwtRequest.get(InsumosMedicosService.URL+"/insumos-medicos", null, { page: pagina, per_page: resultados_por_pagina }).map((response: Response) => response.json().data);
    }

    ver(id: any): Observable<any> {
        return this.jwtRequest.get(InsumosMedicosService.URL+"/insumos-medicos", id, {}).map((response: Response) => {

            let jsonData = response.json().data;
            return jsonData;
        }) as Observable<any>;
    }

    crear(item: any): Observable<any> {
        return this.jwtRequest.post(InsumosMedicosService.URL+"/insumos-medicos", item).map((response: Response) => response.json().data) as Observable<any>;
    }

    editar(id: any, item: any): Observable<any> {
        return this.jwtRequest.put(InsumosMedicosService.URL+"/insumos-medicos", id, item).map((response: Response) => response.json().data) as Observable<any>;
    }

    eliminar(id: any): Observable<any> {
        return this.jwtRequest.delete(InsumosMedicosService.URL+"/insumos-medicos", id).map((response: Response) => response.json().data) as Observable<any>;
    }

    presentaciones(): Observable<any[]> {
        return this.jwtRequest.get(InsumosMedicosService.URL+"/presentaciones").map((response: Response) => response.json().data) as Observable<any[]>;
    }

    unidadesMedida(): Observable<any[]> {
        return this.jwtRequest.get(InsumosMedicosService.URL+"/unidades-medida").map((response: Response) => response.json().data) as Observable<any[]>;
    }

    viasAdministracion(): Observable<any[]> {
        return this.jwtRequest.get(InsumosMedicosService.URL+"/vias-administracion").map((response: Response) => response.json().data) as Observable<any[]>;
    }


    confirmarCargaMasivaDatos(item: any): Observable<any> {
        return this.jwtRequest.post(InsumosMedicosService.URL+"/confirmar-carga-masiva-insumos", item).map((response: Response) => response.json().data) as Observable<any>;
    }
   
}
