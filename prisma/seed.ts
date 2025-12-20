import 'dotenv/config'
import { PrismaClient } from "@prisma/client";
import { hash } from 'bcrypt-ts'

const prisma = new PrismaClient()

async function main() {
  const passwordAdmin = await hash('admin123', 10) 

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gudang.com' },
    update: {}, 
    create: {
      email: 'admin@gudang.com',
      name: 'Kepala Gudang',
      password: passwordAdmin,
      role: 'admin', 
    },
  })
  
  console.log('✅ Akun Admin berhasil dibuat:', admin.email)
  const satuanAwal = ["Pcs", "Box", "Unit", "Lusin", "Rim", "Kodi", "Kg", "Liter"];

  for (const nama of satuanAwal) {
    await prisma.satuan.upsert({
      where: { nama },
      update: {},
      create: { nama },
    });
  }
  
  console.log('✅ Data Satuan berhasil di-seed');
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