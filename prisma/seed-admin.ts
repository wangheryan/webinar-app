import prisma from '../src/lib/prisma';
// Gunakan bcrypt jika NextAuth.js menggunakannya untuk menghash password.
// Biasanya NextAuth menggunakan bcryptjs.
// Jika tidak ada, kita bisa menggunakan hashing sederhana atau plain text tergantung konfigurasi, 
// tapi di production selalu gunakan bcrypt. 
// Untuk seed ini, kita akan coba load bcryptjs jika ada.
let hashSync = (pw: string) => pw; // fallback
try {
  const bcrypt = require('bcryptjs');
  hashSync = (pw: string) => bcrypt.hashSync(pw, 10);
} catch (e) {
  console.log("bcryptjs not found, using raw password (if using credentials provider)");
}

// const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@enterprise.com";
  
  console.log("Seeding Administrator User...");

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMINISTRATOR',
      isActive: true,
    },
    create: {
      name: "Super Administrator",
      email: adminEmail,
      username: "superadmin",
      // Pastikan untuk mengganti password ini setelah login!
      password: hashSync("AdminEnterprise2026!"), 
      role: 'ADMINISTRATOR',
      isActive: true,
      emailVerified: new Date(),
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      profile: {
        create: {
          whatsapp: "+6281234567890",
          birth: new Date("1990-01-01"),
          employmentStatus: "PROFESSIONAL",
          infoSource: "LINKEDIN",
          linkedinUrl: "https://linkedin.com/in/superadmin",
          institution: "Enterprise Tech Inc.",
          major: "Computer Science",
          entryYear: 2008,
          graduationYear: 2012,
        }
      }
    }
  });

  console.log(`✅ Administrator User Created/Updated!`);
  console.log(`Email: ${admin.email}`);
  console.log(`Password: AdminEnterprise2026!`);
  console.log(`Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
