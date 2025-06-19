export const getActivityStatusMap = (description: string) => {
    switch (description) {
        case "member_added":
            return "Membro adicionado"
        case "invitation_accepted":
            return "Convite Aceito"
        case "member_removed":
            return "Membro removido"
        case "role_changed":
            return "Alteração de permissão"
        case "invitation_sent":
            return "Convite Enviado"
        default:
            return description
    }
}