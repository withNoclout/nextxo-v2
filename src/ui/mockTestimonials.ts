export type Platform = 'x' | 'discord'

export interface Testimonial {
  id: string
  platform: Platform
  username: string // e.g., "@mock.user1"
  name?: string // optional display name
  text: string // compliment
  color?: string // optional accent for avatar
}

export const mockTestimonials: Testimonial[] = [
  { id: 't01', platform: 'x',       username: '@mock.user1',
    text: 'เราเปลี่ยนมาใช้ NetXO แล้วสปีดการทำงานดีขึ้นชัดเจน ทีมปล่อยฟีเจอร์ใหม่ได้เร็วกว่าเดิมหนึ่งสัปดาห์เต็ม ๆ\nชอบดีไซน์โหมดมืดมาก ใช้งานนาน ๆ แล้วสบายตาสุด ๆ ✨' },
  { id: 't02', platform: 'discord', username: '@mock.user2',
    text: 'ตั้งค่า Realtime ได้แบบแทบไม่ต้องอ่านเอกสารเยอะ ระบบซิงก์ข้อมูลลื่นมาก\nแดชบอร์ดใช้ง่าย ทีมใหม่เข้าใจได้ภายในวันเดียว.' },
  { id: 't03', platform: 'x',       username: '@mock.user3',
    text: 'เทมเพลตเริ่มต้นช่วยลดงานจุกจิกไปได้เยอะ รู้สึกเหมือนมีโครงสร้างที่ดีรอไว้ให้แล้ว\nโค้ดสะอาด ต่อกับบริการอื่นก็ตรงไปตรงมา.' },
  { id: 't04', platform: 'discord', username: '@mock.user4',
    text: 'Auth + Storage ใช้เวลาแค่ไม่กี่ชั่วโมงก็พร้อมใช้งานจริง สิทธิ์เข้าถึงแบบ RLS ทำให้มั่นใจเรื่องความปลอดภัยมากขึ้นอย่างเห็นได้ชัด.' },
  { id: 't05', platform: 'x',       username: '@mock.user5',
    text: 'เราย้ายแบ็กเอนด์มาอยู่ที่นี่ในวันเดียว แล้วประสิทธิภาพก็ยังดีเหมือนเดิม\nที่ชอบคือ log ชัดเจน แก้ปัญหาได้เร็วขึ้นเยอะ.' },
  { id: 't06', platform: 'discord', username: '@mock.user6',
    text: 'ทดลอง Vector search ครั้งแรก ใช้เวลาไม่ถึงสิบ นาที! API ชัดเจนมาก\nทีมสามารถสาธิตฟีเจอร์ให้ลูกค้าได้ทันทีโดยไม่ต้องเตรียมอะไรเยอะ.' },
  { id: 't07', platform: 'x',       username: '@mock.user7',
    text: 'ฟีเจอร์ Branching + Preview ทำให้รีวิวโค้ดเป็นระบบกว่าเดิม\nทุกคนเห็นผลลัพธ์จริงก่อนเมิร์จ ลดงานแก้ไขรอบหลังได้เยอะ ✅' },
  { id: 't08', platform: 'discord', username: '@mock.user8',
    text: 'RLS ช่วยจัดการ multi-tenant แบบสบายใจ ไม่ต้องเขียนเงื่อนไขซับซ้อนเอง\nรู้สึกว่าระบบเติบโตได้โดยไม่ต้องแบกหนี้เทคนิค.' },
  { id: 't09', platform: 'x',       username: '@mock.user9',
    text: 'Edge Functions ตอบสนองไวมาก ตั้งค่า CI/CD ได้ง่าย\nเวลาเกิดปัญหาก็มีเมตริกชัด ๆ ให้ไล่ได้ทันที.' },
  { id: 't10', platform: 'discord', username: '@mock.user10',
    text: 'ดีไซน์ทั้งแอปและคอมโพเนนต์ดูพรีเมียมมาก ทีมดีไซน์ชอบมาก\nลูกค้าก็รู้สึกถึงความใส่ใจรายละเอียดตั้งแต่หน้าแรก.' },
  { id: 't11', platform: 'x',       username: '@mock.user11',
    text: 'แดชบอร์ด Carbon Monitor ปรับแต่งได้ง่าย แสดงผลบนมือถือสวยเหมือนเดสก์ท็อป\nผู้บริหารเห็นข้อมูลแบบเรียลไทม์และตัดสินใจได้เร็ว.' },
  { id: 't12', platform: 'discord', username: '@mock.user12',
    text: 'Webhooks และคิวส์ช่วยให้ระบบหลังบ้านเสถียรขึ้นมาก เหตุการณ์ไม่ตกหล่น\nเราขยายระบบได้โดยไม่ต้องเขียนโค้ดซ้ำ ๆ.' },
  { id: 't13', platform: 'x',       username: '@mock.user13',
    text: 'คู่มือใช้งานอ่านง่ายเหมือนมีคนพาเดินเที่ยว ฟีเจอร์ต่าง ๆ เชื่อมต่อกันเป็นลำดับดี\nมือใหม่ก็เริ่มได้ มือเก๋าก็ทำงานไวขึ้น.' },
  { id: 't14', platform: 'discord', username: '@mock.user14',
    text: 'Type-safe API ช่วยจับบั๊กตั้งแต่ตอนพัฒนา ไม่ต้องรอเจอในโปรดักชัน\nลดเคสงานด่วนสุดสัปดาห์ไปได้หลายรอบเลย.' },
  { id: 't15', platform: 'x',       username: '@mock.user15',
    text: 'ดีployสู่ production แทบจะคลิกเดียว ไม่มีไฟล์คอนฟิกซับซ้อนให้ปวดหัว\nทีมโฟกัสที่ฟีเจอร์ ไม่ต้องเสียเวลากับโครงสร้าง.' },
  { id: 't16', platform: 'discord', username: '@mock.user16',
    text: 'ซัพพอร์ตตอบไวและตรงจุดมาก ๆ ปัญหาถูกแก้แบบมีเหตุผลประกอบ\nรู้สึกเหมือนคุยกับทีมที่ใช้ผลิตภัณฑ์ของตัวเองจริง ๆ 10/10.' },
]
