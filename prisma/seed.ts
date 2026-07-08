
import { prisma } from "../src/lib/prisma"

async function main() {
    const categories = ["Apartment", "House", "Studio", "Room", "Commercial"]

    for (const name of categories) {
        await prisma.category.upsert({
            where: { name }, // only works if `name` is @unique in your schema
            update: {},
            create: { name }
        })
    }

    console.log("Categories seeded successfully")

    const amenities = ["WiFi", "Parking", "Air Conditioning", "Furnished", "Balcony", "Elevator", "Security"]
    for (const name of amenities) {
        await prisma.amenity.upsert({
            where: { name }, // only if `name` is @unique on Amenity model
            update: {},
            create: { name }
        })
    }

    console.log("Categories and amenities seeded successfully")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })