import { NextFunction, Request, Response } from "express"
import { z } from "zod"

const ValidateRequest = (schema : z.ZodType) => async (req : Request, res : Response, next : NextFunction
) => {
    try {
        const parsed = await schema.parseAsync({
            body : req.body,
            query : req.query,
            params : req.params
        }) as unknown as { body?: unknown; params?: unknown; query?: unknown }
        req.body = parsed.body
        req.params = parsed.params as Record<string, string>
        Object.assign(req.query, parsed.query)

        next()
    } catch (error) {
        next(error)
    }
}

export default ValidateRequest