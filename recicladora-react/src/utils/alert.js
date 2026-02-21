import Swal from "sweetalert2";

export class alert {
    static success (message, title= 'Éxito') {
        Swal.fire({
            icon: 'success',
            title,
            text: message,
            confirmButtonColor: '#3085d6',
        });
    }



    static error(message, title = 'Error') {
        Swal.fire({
            icon: 'error',
            title,
            text: message,
            confirmButtonColor: '#d33',
        });
    }

    static info(message, title = 'Información') {
        Swal.fire({
            icon: 'info',
            title,
            text: message,
            confirmButtonColor: '#3085d6',
        });
    }

    static warning(message, title = 'Advertencia') {
        Swal.fire({
            icon: 'warning',
            title,
            text: message,
            confirmButtonColor: '#f59e0b',
        });
    }

    static confirm(message, title  = '¿Estás seguro?') {
        return Swal.fire({
            title,
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
        });
    }


    static loading(title= 'Cargando...', text= 'Por favor espera') {
        Swal.fire({
            title,
            html: text,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
    }

    static closeLoading() {
        Swal.close();
    }
}