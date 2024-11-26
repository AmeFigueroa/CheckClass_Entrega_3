import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AlertController } from '@ionic/angular';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-comienzo',
  templateUrl: './comienzo.page.html',
  styleUrls: ['./comienzo.page.scss'],
})
export class ComienzoPage implements OnInit {

  userdata: any;

  usuario = {
    id: 0,
    correo: "",
    contrasena: "",
    nombre: "",
    apellido: "",
    rut: "",
    fotoPerfil: ""
  }

  loginForm: FormGroup;

  passwordType: string = 'password';
  passwordIcon: string = 'eye-off-outline';

  constructor(
    private authservice: AuthService,
    private router: Router,
    private toast: ToastController,
    private alertcontroller: AlertController,
    private builder: FormBuilder
  )
  {
    this.loginForm = this.builder.group({
      'correo': new FormControl("", [Validators.required, Validators.minLength(3)]),
      'contrasena': new FormControl("", [Validators.required, Validators.minLength(8)])
    })
  }

  ngOnInit() {
    if (sessionStorage.getItem('correo') != null) {
      this.Advertencia();
      this.router.navigate(['/tabs/tab3']);
    }
  }

  passwordVisibility(): void {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';  
      this.passwordIcon = 'eye-outline';  
    } else {
      this.passwordType = 'password';  
      this.passwordIcon = 'eye-off-outline';  
    }
  }
  

  login() {
    if (!this.loginForm.valid){
      return;
    }

    const correo = this.loginForm.value.correo;
    const contrasena = this.loginForm.value.contrasena;

    this.authservice.getUserByEmail(correo).subscribe(resp =>{
      this.userdata = resp;
      console.log(this.userdata);
      if (this.userdata.length === 0){
        this.loginForm.reset();
        this.usuarioNoExiste();
        return;
      }

      this.usuario = {
        id: this.userdata[0].id,
        correo: this.userdata[0].correo,
        contrasena: this.userdata[0].contrasena,
        nombre: this.userdata[0].nombre,
        apellido: this.userdata[0].apellido,
        rut: this.userdata[0].rut,
        fotoPerfil: this.userdata[0].fotoPerfil
      }
      
      if (this.usuario.contrasena !== contrasena){
        this.loginForm.reset();
        this.errorUsuario();
        return;
      }

      this.iniciarSesion(this.usuario);
    })
  }

  iniciarSesion(usuario:any){
    sessionStorage.setItem('correo', usuario.correo);
    sessionStorage.setItem('contrasena', usuario.contrasena);
    sessionStorage.setItem('ingresado', 'true');
    this.showToast('Sesión Iniciada');
    this.router.navigate(['/tabs/tab1']);
    
  }

  async showToast(msg: any){
    const toast = await this.toast.create({
      message: msg,
      duration: 3000
    })

    toast.present();
  }

  async usuarioNoExiste(){
    const alerta = await this.alertcontroller.create({
      header: 'No existe...',
      message: 'Debe registrarse...',
      buttons: ['OK']
    })

    alerta.present();
  }

  async errorUsuario(){
    const alerta = await this.alertcontroller.create({
      header: 'Error  ...',
      message: 'Verifique sus credenciales...',
      buttons: ['OK']
    })

    alerta.present();
  }

  registrarsesion() {
    this.router.navigate(['registro']);
  }

  async Advertencia() {
    const alerta = await this.alertcontroller.create({
      header: 'Inicio de sesión anulado',
      message: 'Ya has iniciado sesión.',
      buttons: ['Aceptar']
    });
    alerta.present();
  }

  olvidarcontrasena() {
    this.router.navigate(['password']);
  }
}
