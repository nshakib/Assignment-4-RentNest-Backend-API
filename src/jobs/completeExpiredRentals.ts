import cron from "node-cron"
import { prisma } from "../lib/prisma.js"
import { RentalRequestStatus } from "../../generated/prisma/enums.js"

export const startExpiredRentalJob = () => {
    cron.schedule("0 0 * * *", async () => {
        const result = await prisma.rentalRequest.updateMany({
            where: {
                status: RentalRequestStatus.ACTIVE,
                endDate: { lt: new Date() }
            },
            data: { status: RentalRequestStatus.COMPLETED }
        })

        if (result.count > 0) {
            console.log(`Marked ${result.count} rental request(s) as COMPLETED`)
        }
    })
}