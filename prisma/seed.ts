import 'dotenv/config'
import { PrismaClient } from "@prisma/client";
import { hash } from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
  // Ganti password ini dengan yang kuat nanti!
  const passwordAdmin = await hash('admin123', 10) 

  // Buat/Update akun Admin Kelurahan
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gudang.com' },
    update: {}, // Jika sudah ada, jangan diapa-apakan
    create: {
      email: 'admin@gudang.com',
      name: 'Kepala Gudang',
      password: passwordAdmin,
      role: 'admin', // Role tertinggi
    },
  })
  
  console.log('✅ Akun Admin berhasil dibuat:', admin.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })