import { ToastT } from "sonner"

const basicConfigToast: ToastT = {
    id          : "notification",
    position    : "bottom-right",
    duration    : 5000
}

export const errorToast: ToastT = {
    ...basicConfigToast,
    type: "error",
    description: 'Intente de nuevo o contacte al administrador.',
    style: {
        color       : '#ef4444',
        fontSize    : '16px',
        fontWeight  : '500'
    }
}

export const successToast: ToastT = {
    ...basicConfigToast,
    type: "success",
    style: {
        color       : '#22c55e',
        fontSize    : '16px',
        fontWeight  : '500'
    }
}
