import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';

import { Rol }       from '../../roles/rol';


@Component({
  selector: 'panel-control-usuarios-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  constructor() { }

  @Input() roles: Rol[];
  @Input() unidadesMedicas: any[];
  @Input() medicos: any[];
  @Input() proveedores: any[];
  @Input() usuario:FormGroup;

  @Input()  respuestaRequerida:boolean;
  @Input()  usuarioRepetido:boolean;
  @Input()  usuarioInvalido:boolean;
  @Input()  cargando: boolean;
  @Input()  cargandoRoles: boolean;
  @Input()  cargandoMedicos: boolean;
  @Input()  mostrarCambiarPassword:boolean;

  @Output() onEnviar = new EventEmitter<void>();
  @Output() onRegresar = new EventEmitter<void>();
  @Output() onToggleCambiarPassword = new EventEmitter<void>();
  @Output() onCargarRoles = new EventEmitter<void>();
  @Output() onCargarMedicos = new EventEmitter<void>();
  @Output() onCargarProveedores = new EventEmitter<void>();

  // # Esto es solo para listar las unidades medicas que ya estan relacionadas
  // al usuario, en el modulo de edicion
  @Input() unidadesMedicasEdicion = null;

  tab:number = 1;
  unidadesMedicasAgregadas: any[] = [];
  cluesAgregadas: string[] = [];
  unidadMedicaSeleccionada = null;

  idRolesSeleccionados: any = {};

  servidor = {id:''};

  idsAlmacenesSeleccionados: string[] = [];

  /**
   * Método que inicializa y obtiene valores para el funcionamiento del componente.
   */
  ngOnInit() {
    var ums:FormArray = this.usuario.get('unidades_medicas') as FormArray;
    var almacenes:FormArray = this.usuario.get('almacenes') as FormArray;
    console.log(this.usuario.get('medico_id'));

    let rolesUsuario = this.usuario.get('roles').value;

    for (let i in rolesUsuario) {
      this.idRolesSeleccionados[rolesUsuario[i]] = true;
    }

    let usuario = JSON.parse(localStorage.getItem('usuario'));
		this.servidor = usuario.servidor;
    
    this.cluesAgregadas = ums.value;

    this.idsAlmacenesSeleccionados = almacenes.value;

    if(this.unidadesMedicasEdicion != null){

      this.unidadesMedicasAgregadas = this.unidadesMedicasEdicion;

      for(var i in this.unidadesMedicasAgregadas){
        for(var j in this.unidadesMedicasAgregadas[i].almacenes){
          for(var z in this.idsAlmacenesSeleccionados){
            if(this.idsAlmacenesSeleccionados[z] == this.unidadesMedicasAgregadas[i].almacenes[j].id){
              this.unidadesMedicasAgregadas[i].almacenes[j].seleccionado = true;
              break;
            }
          }
        }
      }
    }
  }

  checkRol(id){
    if(!this.idRolesSeleccionados[id]){
      this.idRolesSeleccionados[id] = true;
    }else{
      this.idRolesSeleccionados[id] = false;
    }

    let nuevosRoles = [];
    for(let i in this.idRolesSeleccionados){
      if(this.idRolesSeleccionados[i]){
        nuevosRoles.push(i);
      }
    }
    this.usuario.controls['roles'].setValue(nuevosRoles);
  }

  enviar() {
    this.onEnviar.emit();
  }
  cargarRoles(){
     this.onCargarRoles.emit();
  }
  cargarMedicos(){
    this.onCargarMedicos.emit();
 }

 cargarProveedores(){
  this.onCargarProveedores.emit();
}

  regresar() {
    this.onRegresar.emit();
  }

  toggleCambiarPassword() {
    this.onToggleCambiarPassword.emit();
  }



  agregarUnidadMedica(clues){


    for(var i in this.unidadesMedicas){
      if(this.unidadesMedicas[i].clues == clues){
        this.unidadesMedicasAgregadas.push(this.unidadesMedicas[i]);
        this.cluesAgregadas.push(clues);
        this.usuario.controls['unidades_medicas'].setValue(this.cluesAgregadas);
      }
    }
  }

  eliminarClues(event,item,index){
    event.preventDefault();
    event.stopPropagation();
  }

  toggleAlmacen(item){
    var bandera = false;
    for(var i = 0; i < this.idsAlmacenesSeleccionados.length; i++){
      if(this.idsAlmacenesSeleccionados[i]== item.id){
        this.idsAlmacenesSeleccionados.splice(i,1);
        item.seleccionado = false;
        bandera = true;
        break;
      }
    }
    if(!bandera) {
      this.idsAlmacenesSeleccionados.push(item.id)
      item.seleccionado = true;
    }

    this.usuario.controls['almacenes'].setValue(this.idsAlmacenesSeleccionados);
  }
}
