
const ValidateRequest = (schema : any) => async (req : any, res : any, next : any) => {
    try {
        await schema.parseAsync({
            body : req.body,
            query : req.query,
            params : req.params
        })
        next()
    } catch (error) {
        next(error)
    }
}

export default ValidateRequest