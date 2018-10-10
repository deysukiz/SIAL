export class PacienteEgreso {
	id: string;
    nombre: string;
    sexo: number;
    fecha_nacimiento: string;
    hora_nacimiento: string;
    domicilio:string;
    colonia: string;
    municipio: string;
    localidad: string;
    telefono: string;
    no_expediente: string;
    no_afiliacion: string;
    cargando:boolean = false;
    fecha_ingreso:string;
}
