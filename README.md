# 🧮 Numerical Method Project

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black)

> A modern web application for calculating and visualizing Numerical Method algorithms, built with a Microservices-ready architecture.

## 📖 Overview
โปรเจกต์นี้พัฒนาขึ้นเพื่อศึกษาและรวบรวมอัลกอริทึมทาง **Numerical Methods (ระเบียบวิธีเชิงตัวเลข)** โดยนำเสนอในรูปแบบ Web Application ที่ใช้งานง่าย
ผู้ใช้สามารถกรอกสมการ ดูผลลัพธ์การคำนวณทีละขั้นตอน (Iteration) และดูกราฟประกอบได้

## ✨ Key Features
* **Algorithm Visualization:** แสดงกราฟและตารางการคำนวณของแต่ละ Iteration
* **Responsive Design:** ตกแต่งสวยงามด้วย TailwindCSS ใช้งานได้ทุกอุปกรณ์
* **API Documentation:** มีเอกสาร API ครบถ้วนด้วย Swagger UI
* **Containerization:** ติดตั้งและรันง่ายด้วย Docker

## 🛠 Tech Stack

| Type | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | User Interface และการแสดงผลกราฟ (plotly.js) |
| **Styling** | TailwindCSS 
| **Backend** | Node.js (Express) 
| **Docs** | Swagger (OpenAPI) 
| **DevOps** | Docker 

## 🚀 Getting Started

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop) (แนะนำวิธีนี้ ง่ายที่สุด)
* หรือ Node.js v18+ (สำหรับการรันแบบ Manual)

### Option 1: Run with Docker (Recommended)
วิธีนี้จะรันทั้ง Frontend, Backend และ Database (ถ้ามี) พร้อมกันในคำสั่งเดียว

1. **Clone the repository**
   ```bash
   git clone [https://github.com/tunggyvert/numerical_method-project.git](https://github.com/tunggyvert/numerical_method-project.git)
   cd numerical_method-project
2. **Start the application**
   docker-compose up --build
3.**Start the application**
   Access the app
   Frontend: http://localhost:3000 (หรือ Port ที่ตั้งไว้)
   Backend API: http://localhost:8080
   Swagger Docs: http://localhost:8080/api-docs
📚 API Documentation
เราใช้ Swagger ในการทำเอกสาร API เมื่อรัน Backend แล้วสามารถเข้าไปดูได้ที่:

http://localhost:8080/api-docs

ตัวอย่าง Endpoints หลัก:

POST /api/root/bisection - คำนวณด้วยวิธี Bisection

POST /api/linear/cramer - คำนวณสมการเชิงเส้นด้วย Cramer's Rule

GET /api/health - ตรวจสอบสถานะ Server

   
