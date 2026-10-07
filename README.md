# Data and Processing — Interactive Teaching Media v3

สื่อการสอนวิทยาการคำนวณ ม.1 หน่วยที่ 5 “ข้อมูลและการประมวลผล” เวอร์ชันสาธิตการสอน

## แนวคิดของเวอร์ชันนี้
- ใช้สถานการณ์ “มีเงิน 10,000 บาท จะเลือกมือถือรุ่นไหน?” เป็นเรื่องเดียวต่อเนื่อง
- ตัด Presenter Note และข้อความสำหรับครูออกจากหน้าจอ
- ออกแบบให้เนื้อหาหลักอยู่ใน viewport เดียวบนจอ Desktop/Projector โดยไม่ต้อง scroll
- มี Quick Check จำแนกข้อมูลเชิงปริมาณ/เชิงคุณภาพแบบกดตอบทีละตัวอย่าง
- มี Filter แบบ Interactive
- เชื่อม Data → AI และแนวคิด Garbage In → Garbage Out
- ปิดด้วยการตัดสินใจจากหลักฐานและ Exit Ticket

## Project structure
```text
data-and-processing-teaching-media-v3/
├── index.html
├── .nojekyll
├── README.md
├── assets/
│   ├── css/style.css
│   ├── js/app.js
│   └── images/
│       ├── slides/Data_Detective_page-0001.jpg ... 0007.jpg
│       ├── 01-data-types-thinking.png
│       ├── 02-primary-data-collection.png
│       ├── 03-sum-formula.png
│       ├── 04-chart-comparison.png
│       ├── 05-filter-data.png
│       └── 06-ai-good-bad-data.png
└── docs/unit-5-data-and-processing-source.pdf
```

เปิด `index.html` ได้โดยตรง หรือใช้ VS Code Live Server


## v3.1 Demo flow update

- เพิ่ม Pre-test 5 ข้อแบบแสดงทีละข้อ
- เปลี่ยนท้ายบทเป็นชิ้นงานปลายหน่วย “นักสืบข้อมูล” พร้อมไฟล์ Excel สำหรับดาวน์โหลดและส่งงาน
- คงรูปแบบ 1 สไลด์ต่อ 1 หน้าจอ ลดการเลื่อนแนวตั้งบนจอ Desktop/Projector
- คง Data → AI / Garbage In → Garbage Out

## Presentation whiteboard

ระหว่างนำเสนอสามารถเขียนทับบนสไลด์ได้จากแถบเครื่องมือด้านล่าง:

- เมาส์: กลับไปกดปุ่ม Interactive ในสไลด์
- ปากกา: เขียนด้วยเมาส์ ปากกา Stylus หรือ Touch
- ยางลบ: ลบรอยเขียนบางส่วน
- Undo / ล้าง: ย้อนเส้นล่าสุดหรือล้างรอยในหน้าปัจจุบัน
- เลือกสีและปรับความหนาปากกาได้
- เมื่อเปลี่ยนสไลด์ด้วย ก่อนหน้า / ถัดไป รอยเขียนจะถูกล้างอัตโนมัติ
- Canvas ครอบเฉพาะพื้นที่สไลด์ จึงกดปุ่มนำทางด้านล่างได้แม้อยู่ในโหมดปากกา
