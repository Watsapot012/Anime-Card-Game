# Simple Anime Card Game (Web3 + Solidity)

เว็บเกมการ์ดอนิเมะ Web3 ขนาดเล็ก ขับเคลื่อนด้วย Smart Contract ภาษา Solidity (`SimpleCardGame.sol`) เชื่อมต่อกับ MetaMask โดยตรง และออกแบบมาให้นำไป Compile & Deploy ด้วย **Remix IDE** ได้ทันที

---

## 🌟 ฟีเจอร์หลัก (Core Features)

1. **Connect MetaMask**: เชื่อมต่อกระเป๋าเงิน Web3 แสดงยอดเงิน ETH และ Address แบบย่อ (`0x1234...ABCD`)
2. **Gacha (สุ่มการ์ด)**: เรียก Smart Contract `drawCard()` สุ่มการ์ดอนิเมะและบันทึกลงกระเป๋า On-Chain ทันที
3. **My Collection (คลังการ์ด)**: อ่านข้อมูลการ์ดของผู้เล่นจาก `getMyCards()` / `getCardsOf(account)` และ `getCard(cardId)`
4. **Simple Battle (ต่อสู้แบบง่าย)**: เลือกลงการ์ดประลองกับศัตรู Turn-based HP/ATK (คำนวณที่ Frontend เพื่อประหยัด Gas)
5. **Admin Panel**: ตรวจสอบสิทธิ์ `owner()` เพื่อเพิ่มการ์ดใหม่ผ่านฟังก์ชัน `addCard(...)`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
simple-anime-card-game/
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation bar และ Header
│   │   ├── Card.tsx              # คอมโพเนนต์แสดงผลการ์ดอนิเมะและ Rarity (Common, Rare, SR, SSR)
│   │   ├── WalletButton.tsx      # ปุ่ม Connect MetaMask, สถานะ Address และยอดเงิน ETH
│   │   └── ContractModal.tsx     # ป็อปอัปตั้งค่า Contract Address, ABI และคู่มือ Remix
│   │
│   ├── pages/
│   │   ├── Home.tsx              # หน้าแรก (Dark Anime Card Theme)
│   │   ├── Gacha.tsx             # หน้าระบบสุ่มการ์ด (Mystery Card Animation)
│   │   ├── Collection.tsx        # หน้าแสดงการ์ดทั้งหมดที่ผู้เล่นถือครอง (Anti-flicker)
│   │   ├── Battle.tsx            # หน้า Turn-based Arena (Player VS Enemy)
│   │   └── Admin.tsx             # หน้า Admin เพิ่มการ์ดสำหรับ Contract Owner
│   │
│   ├── contract/
│   │   ├── abi.json              # Contract Application Binary Interface
│   │   └── config.ts             # การตั้งค่า Address, ABI และ Demo Cards
│   │
│   ├── context/
│   │   └── Web3Context.tsx       # React Context จัดการ MetaMask, Provider, Signer & Tx
│   │
│   ├── App.tsx                   # หน้าหลัก Routing ระหว่างเพจ
│   ├── main.tsx
│   └── index.css                 # Tailwind CSS & Gaming Effects
│
├── SimpleCardGame.sol             # ไฟล์ Smart Contract (Solidity ^0.8.20)
├── package.json
└── README.md
```

---

## 🚀 คู่มือการนำ SimpleCardGame.sol ไป Deploy บน Remix IDE (Remix Deployment Guide)

### ขั้นตอนที่ 1: เปิด Remix IDE
เข้าเว็บ [https://remix.ethereum.org](https://remix.ethereum.org)

### ขั้นตอนที่ 2: สร้างไฟล์ Contract
1. ที่เมนูด้านซ้าย เลือกไอคอน **File Explorer**
2. กดปุ่มสร้างไฟล์ใหม่ (New File) ตั้งชื่อว่า:
   ```text
   SimpleCardGame.sol
   ```
3. คัดลอกโค้ดทั้งหมดจากไฟล์ `SimpleCardGame.sol` ในโปรเจกต์นี้ไปวาง

### ขั้นตอนที่ 3: Compile Smart Contract
1. คลิกแท็บ **Solidity Compiler** ที่แถบเมนูด้านซ้าย (ไอคอนรูปตัว S)
2. เลือก Compiler Version เป็น `0.8.20` หรือใหม่กว่า
3. กดปุ่ม **Compile SimpleCardGame.sol**
4. จะมีเครื่องหมายถูกสีเขียวปรากฏขึ้น แสดงว่าคอมไพล์ผ่านเรียบร้อย

### ขั้นตอนที่ 4: เชื่อม MetaMask และ Deploy
1. คลิกแท็บ **Deploy & Run Transactions** (ไอคอน Ethereum พร้อมลูกศร)
2. ในช่อง **ENVIRONMENT** ให้เลือกเป็น:
   ```text
   Injected Provider - MetaMask
   ```
   *(หมายเหตุ: หากไม่มีตัวเลือกนี้ ให้ตรวจสอบว่าติดตั้งส่วนขยาย MetaMask ในบราวเซอร์แล้วหรือยัง และปลดล็อกกระเป๋าเรียบร้อยหรือไม่ หากเพิ่งติดตั้งให้กด F5 รีเฟรช Remix หรือเลือก `Remix VM (Cancun)` เพื่อทดสอบภายใน Remix ก่อนได้)*
3. MetaMask จะเด้งขึ้นมาให้กดยืนยันการเชื่อมต่อ (แนะนำให้เลือกเครือข่าย Testnet เช่น **Sepolia**)
4. ในช่อง **CONTRACT** ตรวจสอบว่าเป็น `SimpleCardGame - SimpleCardGame.sol`
5. กดปุ่มสีส้ม **Deploy**
6. กดยืนยัน Transaction บน MetaMask แล้วรอสักครู่จนขึ้นบล็อกเสร็จสมบูรณ์

### ขั้นตอนที่ 5: นำ Contract Address มาเชื่อมกับ Frontend
1. ใน Remix ด้านล่างตรงหัวข้อ **Deployed Contracts** จะพบ `SimpleCardGame` ที่เพิ่ง Deploy
2. คลิกปุ่มไอคอน **Copy** เพื่อคัดลอก **Contract Address** (เช่น `0xABC123...`)
3. กลับมาที่หน้าเว็บเกม คลิกไอคอน **ตั้งค่า (Settings)** ที่มุมขวาบน
4. วาง Address ลงในช่อง **Contract Address** แล้วกด **บันทึก (Save)**
5. พร้อมเล่นเกม สุ่มการ์ด และจัดทัพสู้ได้ทันที!
