import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs';


import { JwtRequestService } from '../jwt-request.service';

@Injectable()
export class AdministradorCentralService {

  constructor(private http: Http,  private jwtRequest:JwtRequestService) { }
  
  jurisdicciones(): Observable<any[]>{
    return this.jwtRequest.get("jurisdicciones").map( (response: Response) => response.json().data) as Observable<any[]>;
  }
  proveedores(): Observable<any[]>{
    return this.jwtRequest.get("proveedores").map( (response: Response) => response.json().data) as Observable<any[]>;
  }
  mes(): Observable<any[]>{
    return this.jwtRequest.get("administrador-central/mes-disponible").map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  // Penas convencionales
  periodos(): Observable<any[]>{
    return this.jwtRequest.get("administrador-central/periodos").map( (response: Response) => response.json().data) as Observable<any[]>;
  }
  meses(payload: any = {}): Observable<any[]>{
    return this.jwtRequest.get("administrador-central/meses",null,payload).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  resumenPenasConvencionales(payload:any = {}): Observable<any[]>{
    return this.jwtRequest.get("administrador-central/penas-convencionales-resumen",null,payload).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  detallePenasConvencionales(payload:any = {}): Observable<any>{
    return this.jwtRequest.get("administrador-central/penas-convencionales-detalle",null,payload).map( (response: Response) => response.json().data) as Observable<any>;
  }

  abasto(parametros:any = {}): Observable<any>{
    return this.jwtRequest.get("administrador-central/abasto",null,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  reporteFinanciero(parametros:any = {}): Observable<any>{
    return this.jwtRequest.get("administrador-central/reporte-financiero",null,parametros).map( (response: Response) => response.json()) as Observable<any[]>;
  }

  pedidos(parametros:any = {}): Observable<any>{
    return this.jwtRequest.get("administrador-central/pedidos",null,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  verArchivosPedidoProveedor(id:any): Observable<any>{
    return this.jwtRequest.get("administrador-central/pedidos-archivos-proveedor/"+id,null,{}).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  descargarArchivosPedidoProveedor(id:any): Observable<any>{
    return this.jwtRequest.get('repository-download',id,{}).map( (response: Response) => {
        return 0;
      }) as Observable<any>;
  }

  presupuesto(parametros): Observable<any>{    
    return this.jwtRequest.get("administrador-central/presupuesto-pedidos",null,parametros).map( (response: Response) => response.json());
  }

  unidadesMedicasConPresupuesto(parametros:any = {}): Observable<any>{    
    return this.jwtRequest.get("administrador-central/unidades-medicas-con-presupuesto",null,parametros).map( (response: Response) => response.json().data);
  }
  mesesPresupuestoActual(): Observable<any>{    
    return this.jwtRequest.get("administrador-central/meses-presupuesto-actual",null,null).map( (response: Response) => response.json().data);
  }
  aniosPresupuestoActual(): Observable<any>{    
    return this.jwtRequest.get("administrador-central/anios-presupuesto-actual",null,null).map( (response: Response) => response.json().data);
  }

  presupuestoUnidadMedica(parametros:any = {}): Observable<any>{
    return this.jwtRequest.get("administrador-central/presupuesto-unidad-medica",null,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }


  transferenciasLista(parametros:any = {}): Observable<any>{
    return this.jwtRequest.get("administrador-central/transferencias-presupuestos",null,parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  transferirPresupuesto(parametros:any = {}): Observable<any>{
    return this.jwtRequest.post("administrador-central/transferencias-presupuestos",parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }

  mesesAniosAnteriorFechaActual(): Observable<any>{    
    return this.jwtRequest.get("administrador-central/meses-anios-presupuesto-actual-anterior-fecha-actual",null,null).map( (response: Response) => response.json().data);
  }

  transferirSaldosAlMesActual(parametros:any = {}): Observable<any>{
    return this.jwtRequest.post("administrador-central/transferencias-saldos-mes-actual",parametros).map( (response: Response) => response.json().data) as Observable<any[]>;
  }


  mesesAniosPedidos(): Observable<any>{    
    return this.jwtRequest.get("administrador-central/meses-anios-pedidos",null,null).map( (response: Response) => response.json().data);
  }
  
  entregasPedidosStatsMesesAnios(payload:any = {}): Observable<any>{    
    return this.jwtRequest.get("administrador-central/entregas-pedidos-stats-mes-anio",null,payload).map( (response: Response) => response.json().data);
  }

  entregasPedidosStatsDiarias(payload:any = {}): Observable<any>{    
    return this.jwtRequest.get("administrador-central/entregas-pedidos-stats-diarias",null,payload).map( (response: Response) => response.json().data);
  }

  pedidosCluesMesAnio(payload:any = {}): Observable<any>{    
    return this.jwtRequest.get("administrador-central/pedidos-clues-mes-anio",null,payload).map( (response: Response) => response.json().data);
  }

  pedidosEntregasCluesMesAnio(payload:any = {}): Observable<any>{    
    return this.jwtRequest.get("administrador-central/pedidos-recepciones-clues-mes-anio",null,payload).map( (response: Response) => response.json().data);
  }

  cumplimientoStatsGlobales(): Observable<any> {
    return this.jwtRequest.get("administrador-central/cumplimiento-stats-globales",null,null).map( (response: Response) => response.json().data);
  }

  cumplimientoStatsProveedor(id:any): Observable<any> {
    return this.jwtRequest.get("administrador-central/cumplimiento-stats-proveedor",id,null).map( (response: Response) => response.json().data);
  }


  verRecepciones(id:any): Observable<any>{    
    return this.jwtRequest.get("administrador-central/pedidos-recepcion",id,null).map( (response: Response) => response.json().data);
  }

  pedidoBorrador(id:any): Observable<any>{    
    return this.jwtRequest.get("administrador-central/pedidos-borrador",id,null).map( (response: Response) => response.json().data);
  }

  cambiarPermisoRecepcion(id:any,permitir:boolean): Observable<any>{    
    return this.jwtRequest.put("administrador-central/pedidos-permitir-recepcion",id,{recepcion:permitir}).map( (response: Response) => response.json().data);
  }
  
  recepcionBorrador(id:any, type:any): Observable<any>{    
    return this.jwtRequest.get("administrador-central/recepcion-borrador",id,{type}).map( (response: Response) => response.json().data);
  }
  
  pedidoBorradorCancelado(id:any): Observable<any>{    
    return this.jwtRequest.get("administrador-central/pedidos-borrador-cancelado",id,null).map( (response: Response) => response.json().data);
  }
}
