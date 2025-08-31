// Lightweight mock dispatcher for CommunityFeedbackRow
export type FeedbackMockDetail = {
  id:string; bold:string; text:string; user:string; dept:string; ts:number; severity?:'normal'|'warning'|'critical'
}

const users = [
  { user: 'anonymous-user1', dept: 'Analytics' },
  { user: 'anonymous-user2', dept: 'Compliance' },
  { user: 'anonymous-user3', dept: 'Operations' },
  { user: 'anonymous-user4', dept: 'Supply Chain' },
  { user: 'anonymous-user5', dept: 'Finance' },
  { user: 'anonymous-user6', dept: 'Security' },
]

// Longer multi‑sentence samples to better fill 340×320 cards
const samples = [
  {
    bold: 'การปล่อย CO₂',
    text: 'ฝั่ง Supply Chain เพิ่มขึ้นต่อเนื่องตลอด 3 ชั่วโมงที่ผ่านมา ส่งผลให้การขนส่งชะลอตัวและเกิดคอขวด ตรวจสอบด่วนก่อนจะกระทบต่อคำสั่งซื้อรอบถัดไป'
  },
  {
    bold: 'ควันดำจากเครื่องสำรองพลังงาน',
    text: 'ตรวจพบการปล่อยมลพิษสูงผิดปกติในช่วงเช้า ส่งผลกระทบต่อพนักงานที่ทำงานในพื้นที่ใกล้เคียง ควรทำการบำรุงรักษาทันที'
  },
  {
    bold: 'คิวฝ่าย Compliance',
    text: 'พุ่งสูงขึ้นผิดปกติเมื่อเทียบกับสัปดาห์ที่ผ่านมา ทำให้ขั้นตอนอนุมัติล่าช้าและส่งผลต่อการเปิดตัวโครงการใหม่'
  },
  {
    bold: 'การจราจรติดขัด',
    text: 'ฝั่ง Operations มีรถบรรทุกจอดขวางทางหลายคันติดต่อกันมากกว่า 20 นาที ส่งผลให้พนักงานไม่สามารถเข้าประตูหลักได้'
  },
  {
    bold: 'โหลดงานฝ่าย Analytics',
    text: 'สูงขึ้น 45% หลังจากระบบวิเคราะห์เรียกใช้งานพร้อมกันหลายโปรไฟล์ มีความเสี่ยงที่จะเกิดคอขวดในการประมวลผล หากไม่ปรับสเกล'
  },
  {
    bold: 'การซ่อมบำรุงเครือข่าย',
    text: 'เกิดการรบกวนสัญญาณช่วงเวลาเร่งด่วน ทำให้การซิงก์ข้อมูลล่าช้า ผู้ใช้ปลายทางรายงานผลลัพธ์ไม่ครบถ้วนในแดชบอร์ด'
  },
  {
    bold: 'การปล่อย NOx ภายในคลัสเตอร์ R&D',
    text: 'พุ่งขึ้นเฉียบพลันระหว่างรอบทดสอบเครื่องยนต์ต้นแบบ ควรตรวจสอบระบบกรองไอเสียก่อนดำเนินการทดสอบรอบถัดไป'
  }
]

const severities: FeedbackMockDetail['severity'][] = ['normal','warning','critical']

function rand<T>(arr:T[]):T { return arr[Math.floor(Math.random()*arr.length)] }

function dispatchOnce(){
  const who = rand(users); const msg = rand(samples); const sev = rand(severities)
  const detail:FeedbackMockDetail = {
    id: `fb-${Date.now()}-${Math.floor(Math.random()*9999)}`,
    bold: msg.bold,
    text: msg.text,
    user: who.user,
    dept: who.dept,
    ts: Date.now(),
    severity: sev
  }
  window.dispatchEvent(new CustomEvent('feedback:new', { detail }))
}

export function startFeedbackMock(){
  let alive = true
  function loop(){ if(!alive) return; dispatchOnce(); const next = 1200 + Math.random()*1800; setTimeout(loop, next) }
  loop()
  return ()=>{ alive=false }
}
