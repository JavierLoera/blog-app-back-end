export const validateIsAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(401).json({
            errors: [
                {
                    "error": "unauthorized",
                    "message": "No tienes permisos para crear,actualizar o borrar categorias",
                }
            ]
        })
    }
    next()
}