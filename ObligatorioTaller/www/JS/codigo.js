//let hayUsuarioLogueado = false;
let token;
console.log(localStorage.getItem("hayUsuarioLogueado"));
if(localStorage.getItem("hayUsuarioLogueado")){
    Inicio(true);
    OcultarBotones(false);
}else{
    inicializar();
}

function inicializar() {
    Inicio(true);
}
function OcultarDivs() {
    document.querySelector("#login").style.display = "none";
    document.querySelector("#registro").style.display = "none";
}
function OcultarBotones(showButtons) {
    if (showButtons) {
        document.querySelector("#btnIngreso").style.display = "inline";
        document.querySelector("#btnRegistro").style.display = "inline";
        document.querySelector("#btnCerrarSesion").style.display = "none";
    }
    else {
        document.querySelector("#btnCerrarSesion").style.display = "inline";
        document.querySelector("#btnIngreso").style.display = "none";
        document.querySelector("#btnRegistro").style.display = "none";
    }

}
function AgregarEventos() {
    document.querySelector("#btnInicio").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnIngreso").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnRegistro").addEventListener("click", MostrarOcultarDivs);
    document.querySelector("#btnCerrarSesion").addEventListener("click", CerrarSesion);
    document.querySelector("#btnLogin").addEventListener("click", IniciarSesion);
    document.querySelector("#btnRegistroUsuario").addEventListener("click", Registro);


}

function Inicio(showButtons) {
    OcultarDivs();
    OcultarBotones(showButtons);
    AgregarEventos();
    document.querySelector("#inicio").style.display = "block";
    if (!localStorage.getItem("hayUsuarioLogueado")) {
        document.querySelector("#divInicioUsuarioDesconocido").style.display = "block";
        document.querySelector("#divInicioUsuarioLogueado").style.display = "none";
    }
    else {
        document.querySelector("#divInicioUsuarioDesconocido").style.display = "none";
        document.querySelector("#divInicioUsuarioLogueado").style.display = "block";
        document.querySelector("#login").style.display = "none";

    }
}
/*
Este switch se puede refactorizar resolviendo en una linea , siempre y cuando el id del boton 
y el id del div solo se diferencien por el prefijo.
Ejemplo el boton es btnInicio y el div es Inicio*/
function MostrarOcultarDivs() {
    OcultarDivs();
    switch (this.id) {
        case "btnInicio": document.querySelector("#inicio").style.display = "block";
            break;

        case "btnRegistro": document.querySelector("#registro").style.display = "block";
            break;

        case "btnIngreso": document.querySelector("#login").style.display = "block";
            break;

        case "btnCerrarSesion": OcultarBotones(false);
            break;
    }
}
function IniciarSesion() {
    let nombreUsuario = document.querySelector("#nombreUsuario").value;
    let password = document.querySelector("#password").value;
    document.querySelector("#errorMessage").innerHTML = "";

 

    try {
        if (nombreUsuario.trim().length === 0 || password.trim().length === 0) {
            throw new Error("Los datos no son correctos");
        }

        fetch("https://censo.develotion.com/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "usuario": nombreUsuario,
                "password": password
            })
        })
        .then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        })
        .then(function (data) {
            // Si llegamos aquí, no hubo errores en el servidor y se obtuvo la respuesta correctamente
            //hayUsuarioLogueado = true;
            localStorage.setItem("token", data.apiKey);
            localStorage.setItem("hayUsuarioLogueado", true);
            Inicio(true);
            OcultarBotones(false);
        })
        .catch(function (error) {
            // Imprimir el error en la consola para obtener más detalles
            console.error("Error en fetch:", error);
            // Devolver el error para que la siguiente cadena de promesas lo maneje
            return error.json();
        })
        .then(function (data) {
            // Si llegamos aquí, estamos manejando un error del servidor
            if (data !== undefined) {
                // Mostrar el mensaje de error en el HTML
                document.querySelector("#errorMessage").innerHTML = data.error;
            }
        });
    } catch (error) {
        // Si hay errores en el bloque try-catch, mostrarlos en la consola para depuración
        console.error("Error en try-catch:", error);
        document.querySelector("#errorMessage").innerHTML = error.message;
    }
}



function CerrarSesion() {
    localStorage.setItem("hayUsuarioLogueado",false);
    document.querySelector("#btnCerrarSesion").style.display = "none";
    Inicio(true);
    console.log(localStorage.getItem("token"));
    localStorage.removeItem("token");
    console.log(localStorage.getItem("token"));
    LimpiarCampos();
}


function Registro() {
    let nombreUsuario = document.querySelector("#usuario").value;
    let password = document.querySelector("#passRegistro").value;
    document.querySelector("#errorMessageRegistro").innerHTML = "";
    try {
        if (nombreUsuario.trim().length === 0) {
            throw new Error("El nombre de usuario es requerido");
        }
        if (password.trim().length === 0) {
            throw new Error("La passwrod es requerida");
        }

        fetch("https://censo.develotion.com/usuarios.php",
            {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    "usuario": nombreUsuario,
                    "password": password
                })
            })
            .then(function (response) {
                if (response.ok) {
                    // return response.json();
                    document.querySelector("#errorMessageRegistro").innerHTML = "Registro exitoso";
                    LimpiarCampos();
                }
                else if(response.status === 409){
                    document.querySelector("#errorMessageRegistro").innerHTML = "El usuario ya esta registrado";
                    LimpiarCampos();
                    return Promise.reject(response);
                }
                else {
                    return Promise.reject(response);
                }
            })
            .then(function (data) {
                // Si llegamos aquí, no hubo errores en el servidor y se obtuvo la respuesta correctamente
                localStorage.setItem("hayUsuarioLogueado",true);
                //hayUsuarioLogueado = true;
                console.log(data.apiKey);
                localStorage.setItem("token", data.apiKey);
                Inicio(true);
                OcultarBotones(false);
            })
            .catch(function (error) {
                // Imprimir el error en la consola para obtener más detalles
                console.error("Error en fetch:", error);
                // Devolver el error para que la siguiente cadena de promesas lo maneje
                return error.json();
            })
            .then(function (data) {

                if (data !== undefined) {
                    document.querySelector("#errorMessage").innerHTML = data.error;
                }
            })

        } catch (Error) {
            document.querySelector("#errorMessage").innerHTML = Error.message;
    
        }
    }

    function LimpiarCampos() {
        document.querySelector("#usuario").value = "";
        document.querySelector("#passRegistro").value = "";
    }