# Data and Processing — Interactive Teaching Media

สื่อการสอนแบบ Interactive สำหรับรายวิชา **วิทยาการคำนวณ ม.1** หน่วยที่ 5 **ข้อมูลและการประมวลผล (Data and Processing)**

## Project structure

```text
data-and-processing-teaching-media/
├── index.html
├── .nojekyll
├── README.md
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── images/
│       ├── 01-data-types-thinking.png
│       ├── 02-primary-data-collection.png
│       ├── 03-sum-formula.png
│       ├── 04-chart-comparison.png
│       ├── 05-filter-data.png
│       └── 06-ai-good-bad-data.png
└── docs/
    └── unit-5-data-and-processing-source.pdf
```

## Learning flow

1. เริ่มต้นและแบบทดสอบก่อนเรียน
2. เป้าหมายการเรียนรู้
3. คำถามนำเข้าสู่บทเรียน
4. ประเภทของข้อมูล
5. แหล่งที่มาของข้อมูล
6. วงจรการจัดการข้อมูล
7. Spreadsheet และสูตรพื้นฐาน
8. Sort / Filter
9. การเลือกแผนภูมิ
10. Data Storytelling
11. Data → AI และ Garbage In, Garbage Out (GIGO)
12. กิจกรรมรวบยอด: ข้อมูลจริง → ตาราง → กราฟ → AI → ตรวจสอบ
13. แบบทดสอบหลังเรียน
14. สรุป / Exit Ticket

## Main features

- Responsive desktop / tablet / mobile
- Keyboard navigation: Arrow keys / Page Up / Page Down
- Swipe navigation on mobile
- Fullscreen mode
- Table of contents
- Presenter notes
- Interactive pre-test and post-test
- Sort / Filter interactive example
- Illustrated learning examples
- AI + GIGO connection and student verification task
- Print-friendly CSS

## Run locally

เปิด `index.html` ได้โดยตรง หรือใช้ VS Code Live Server

## Deploy to GitHub Pages

1. สร้าง repository ใหม่ เช่น `data-and-processing-teaching-media`
2. อัปโหลดไฟล์และโฟลเดอร์ทั้งหมด **จากภายในโฟลเดอร์โปรเจกต์** ไปที่ root ของ repository
3. ไปที่ **Settings → Pages**
4. Source เลือก **Deploy from a branch**
5. Branch เลือก `main` และ folder `/ (root)`
6. Save และรอ GitHub Pages deploy

ไฟล์ `index.html` ต้องอยู่ที่ root ของ repository เพื่อให้ GitHub Pages เปิดหน้าเว็บได้ทันที

## Visual layout v2

- ภาพประกอบถูกจัดเป็น visual panel ภายในสไลด์บน Desktop/Projector แทนการวางต่อท้ายเนื้อหา
- รองรับจอ 1366×768 ด้วย compact layout อัตโนมัติ
- Tablet/Mobile จะ stack เนื้อหาและภาพ พร้อมอนุญาตให้เลื่อนเมื่อพื้นที่แนวตั้งไม่พอ
- ภาพใช้ `object-fit` และ `max-height` เพื่อไม่ดัน navigation ด้านล่างออกจากหน้าจอ
