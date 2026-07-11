import { NextFunction, Request, Response } from "express"
import { ZodTypeAny } from "zod/v3"

const ValidateRequest = (schema : ZodTypeAny) => async (req : Request, res : Response, next : NextFunction
) => {
    try {
        const parsed = await schema.parseAsync({
            body : req.body,
            query : req.query,
            params : req.params
        })
        req.body = parsed.body
        req.params = parsed.params
        Object.assign(req.query, parsed.query)

        next()
    } catch (error) {
        next(error)
    }
}

export default ValidateRequest