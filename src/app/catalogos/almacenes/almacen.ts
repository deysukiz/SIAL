export class Almacen {
    id: string;
    tipo_almacen: string;
    clues: string;
    subrogado: number;
    proveedor_id: number;
    unidosis: number;
    nombre: string;
    cargando: boolean = false;
}

export interface Almacen {
    id: string;
    tipo_almacen: string;
    clues: string;
    subrogado: number;
    proveedor_id: number;
    unidosis: number;
    nombre: string;
}