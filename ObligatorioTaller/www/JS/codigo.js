// Constantes para las URL de la API
const API_BASE_URL = "https://censo.develotion.com/";
const API_LOGIN_ENDPOINT = API_BASE_URL + "login.php";
const API_USUARIOS_ENDPOINT = API_BASE_URL + "usuarios.php";

// Variable para almacenar el token del usuario
let token;
if(localStorage.getItem("hayUsuarioLogueado") === null) {
localStorage.setItem("hayUsuarioLogueado", "false")
}
let hayUsuarioLogueado = localStorage.getItem("hayUsuarioLogueado");
//localStorage.clear();
autoLogin();
function autoLogin(){
    //validamos que el token no sea nulo
    if(localStorage.getItem("token") != null){
        //si existe token y el usuario esta logueado mostramos su interfaz sino inicializamos 
    if(localStorage.getItem("token") != "" && hayUsuarioLogueado === "true" ){
        Inicio(false);
    }else{
    inicializar();
    }
    }else{
        inicializar();
        document.querySelector("#errorMessage").innerHTML = "El tiempo a expirado debe volver a iniciar sesion";
    }
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
    if (localStorage.getItem("hayUsuarioLogueado") === "false") {
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
// Función para iniciar sesión
function IniciarSesion() {
    let nombreUsuario = document.querySelector("#nombreUsuario").value;
    let password = document.querySelector("#password").value;
    document.querySelector("#errorMessage").innerHTML = "";

    try {
        if (nombreUsuario.trim().length === 0 || password.trim().length === 0) {
            throw new Error("Los datos no son correctos");
        }

        // Hacer la llamada a la API para el login
        fetch(API_LOGIN_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "usuario": nombreUsuario,
                "password": password
            })
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 409) {
                    return response.json().then((data) => {
                        // Mostrar mensaje de usuario ya registrado
                        document.querySelector("#errorMessage").innerHTML = data.mensaje;
                        LimpiarCampos();
                        return Promise.reject(data);
                    });
                } else {
                    return Promise.reject(response);
                }
            })

            .then((data) => {
                // Si el login fue exitoso, se obtiene el token del usuario
                token = data.apiKey;
                // Se guarda el token y el estado de sesión en el localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("hayUsuarioLogueado", "true");
                // Mostrar la sección de usuario logueado
                Inicio(false);
                // Ocultar los botones de inicio de sesión y registro
                OcultarBotones(false);
            })
            .catch(handleApiError) // Utilizar la función para manejar errores de la API
            .then((data) => {
                // Si hay error en la respuesta de la API, mostrar el mensaje de error
                if (data !== undefined) {
                    document.querySelector("#errorMessage").innerHTML = data.error;
                }
            });
    } catch (error) {
        // Si hay errores en el bloque try-catch, mostrarlos en la consola para depuración
        console.error("Error en try-catch:", error);
        document.querySelector("#errorMessage").innerHTML = error.message;
    }
}

// Función para cerrar sesión
function CerrarSesion() {
    // Limpiar el token y el estado de sesión del localStorage
    localStorage.setItem("token", "");
    localStorage.setItem("hayUsuarioLogueado", "false");
    // Mostrar la sección de inicio de sesión
    Inicio(true);
    // Limpiar los campos de usuario y contraseña
    LimpiarCampos();
}

// Función para registrar un nuevo usuario
function Registro() {
    let nombreUsuario = document.querySelector("#usuario").value;
    let password = document.querySelector("#passRegistro").value;
    document.querySelector("#errorMessageRegistro").innerHTML = "";
    try {
        if (nombreUsuario.trim().length === 0) {
            throw new Error("El nombre de usuario es requerido");
        }
        if (password.trim().length === 0) {
            throw new Error("La password es requerida");
        }

        // Hacer la llamada a la API para el registro
        fetch(API_USUARIOS_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                "usuario": nombreUsuario,
                "password": password
            })
        })
            .then((response) => {
                if (response.ok) {
                    // si la respuesta es exitosa covertimos la misma a json
                    return response.json();
                } else if (response.status === 409) {
                    return response.json().then((data) => {
                        document.querySelector("#errorMessageRegistro").innerHTML = data.mensaje;
                        LimpiarCampos();
                        return Promise.reject(data);
                    });
                } else {
                    return Promise.reject(response);
                }
            })
            .then((data) => {
                // Si llegamos aquí, no hubo errores en el servidor y se obtuvo la respuesta correctamente
                document.querySelector("#errorMessageRegistro").innerHTML = "Registro exitoso";
                // Si el registro fue exitoso, obtener el token del usuario
                token = data.apiKey;
                // Guardar el token y el estado de sesión en el localStorage
                localStorage.setItem("token", token);
                localStorage.setItem("hayUsuarioLogueado", "true");
                // Mostrar la sección de usuario logueado
                Inicio(false);
                // Ocultar los botones de inicio de sesión y registro
                OcultarBotones(false);
            })
            .catch(handleApiError) // Utilizar la función para manejar errores de la API
            .then((data) => {
                // Si hay error en la respuesta de la API, mostrar el mensaje de error
                if (data !== undefined) {
                    document.querySelector("##errorMessageRegistro").innerHTML = data.error;
                }
            });
    } catch (error) {
        // Si hay errores en el bloque try-catch, mostrarlos en la consola para depuración
        console.error("Error en try-catch:", error);
        document.querySelector("##errorMessageRegistro").innerHTML = error.message;
    }
}
    function LimpiarCampos() {
        document.querySelector("#usuario").value = "";
        document.querySelector("#passRegistro").value = "";
    }
    
// Función para manejar los errores de la API
function handleApiError(error) {
    console.error("Error en fetch:", error);
    return error.json().then((data) => {
        if (data !== undefined) {
            document.querySelector("#errorMessage").innerHTML = data.error;
        }
    });
}