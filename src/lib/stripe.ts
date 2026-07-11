import Stripe from "stripe"
import config from "../config/index.js"
import type { Stripe as StripeType } from "stripe"


export const stripe: StripeType = new Stripe(config.stripe_secret_key as string)


