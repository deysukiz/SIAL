/*export class Medicamento {
    id: number;
    insumo_medico_clave: string;
    presentacion_id: number;
    presentacion_nombre: string;
    concentracion: string;
    contenido:string;
    es_controlado: number;
    es_surfactante: number;

    //descripcion: string;
    
    cantidad_x_envase: number;
    unidad_medida_id: number;
    unidad_medida_nombre: string;
    indicaciones: string;
    via_administracion_id: number;
    via_administracion_nombre: string;
    dosis: string;

    informacion_importante:any;
}*/

export class InsumoMedico {
    clave: string;
    tipo: string;
    generico_id: number;
    generico_nombre: string;
    es_cuadro_basico: number;
    grupo_insumo_nombre: string;
    es_causes: number;
    descripcion: string;
    stockExistencia: any;
    generico: any; //contendra informacion del objeto, ademas de una lista de grupos asignada al generico
    informacion: any; // Puede ser de un medicamento, material de curacion o auxiliares o lo que sea
    informacionAmpliada: any; // Puede ser de un medicamento, material de curacion o auxiliares o lo que sea
    cantidad: number;
    lotes: Lote[];
    lote_entrada: string;
    fecha_caducidad: Date;
    codigo_barras: string;
    cargando:boolean = false;
}

export interface InsumoMedico {
    clave: string;
    tipo: string;
    generico_id: number;
    generico_nombre: string;
    es_cuadro_basico: number;
    grupo_insumo_nombre: string;
    es_causes: number;
    descripcion: string;
    medicamento?: {};
    cantidad: number;
    lotes: Lote[];
    lote_entrada: string;
    fecha_caducidad: Date;
    codigo_barras: string;
}
export class Lote {
    cantidad: number;
    id: string;
}
export interface Lote {
    cantidad: number;
    id: string;
}
export class InsumoStock {
  almacen_id: string;
  clave: string;
  existencia: number;
  existencia_unidosis: number;
}

export interface InsumoStock {
  almacen_id: string;
  clave: string;
  existencia: number;
  existencia_unidosis: number;
}