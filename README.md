[README.md](https://github.com/user-attachments/files/29468472/README.md)
# LinkaJob — Hệ thống tự động hoá Booking & Scheduling

## Tổng quan

Hệ thống tự động hoá toàn bộ quy trình từ khi advisee chọn gói → chọn advisor → thanh toán → đặt lịch → nhận xác nhận.

---

## Kiến trúc hệ thống

```
Advisee                    Advisor                    LinkaJob Admin
   │                          │                             │
   ▼                          ▼                             │
Booking page            Advisor Portal              Apps Script (trigger)
linkajob.vn/book        linkajob.vn/portal                  │
   │                          │                             │
   │    đọc slot trống        │    lưu booking              │
   └──────────────────────────┤────────────────────────────►│
                              │                             ▼
                              │                      Google Sheet
                              │                    (database trung tâm)
                              │                             │
                              │                    onChange trigger
                              │                             │
                              │                    Google Apps Script
                              │                             │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
               Zalo OA    Gmail API  Google Calendar
              (notify)   (backup)    + Google Meet
```

---

## Cấu trúc thư mục

```
linkajob-system/
├── README.md                   ← file này
├── google-sheet/
│   └── SHEET_STRUCTURE.md      ← cấu trúc các tab trong Google Sheet
├── apps-script/
│   ├── Code.gs                 ← script chính (trigger, booking flow)
│   ├── Zalo.gs                 ← gửi Zalo OA notification
│   ├── Calendar.gs             ← tạo Google Calendar event + Meet link
│   ├── Email.gs                ← gửi email xác nhận (Gmail API)
│   └── Weekly.gs               ← reminder hàng tuần (Friday trigger)
└── frontend/
    ├── linkajob_v5.html         ← trang chủ
    ├── linkajob_pricing.html    ← trang gói meeting
    ├── linkajob_advisor_v3.html ← trang profile advisor
    └── linkajob_scheduling_screens.html ← UI booking + advisor portal
```

---

## Flow chi tiết

### Flow 1 — Self-serve (advisee tự chọn)
1. Advisee vào `linkajob.vn` → xem gói tại trang **Pricing**
2. Chọn gói → chọn Advisor → điền thông tin → xem QR thanh toán
3. Chuyển khoản → gửi bill
4. Admin xác nhận → cập nhật Google Sheet (tab `Bookings`) → **onChange trigger** kích hoạt
5. Apps Script tự động:
   - Tạo Google Calendar event + Google Meet link
   - Gửi invite cả advisee lẫn advisor qua Calendar
   - Gửi Zalo OA notification cho cả 2
   - Gửi backup email qua Gmail

### Flow 2 — Sales-led (sale giới thiệu advisor trước)
1. Sale gửi link trang **Profile Advisor** cho advisee
2. Advisee xem advisor cụ thể → click "Đặt lịch với [Tên]" → modal chọn gói
3. Tiếp tục từ bước 2 của Flow 1

### Weekly Reminder (Thứ 6 hàng tuần)
- Apps Script trigger lúc **22:00 thứ 6**
- Gửi Zalo OA nhắc advisor: *"Gửi lịch trống tuần sau trước CN 10pm"*
- Advisor cập nhật slot trống trên **Advisor Portal**
- Slot được ghi vào Google Sheet (tab `AvailableSlots`)
- Booking page đọc slot trống từ đây để hiển thị cho advisee

---

## Setup nhanh

### 1. Google Sheet
- Tạo Google Sheet mới → đặt tên: `LinkaJob Database`
- Tạo các tab theo `SHEET_STRUCTURE.md`
- Copy Sheet ID từ URL

### 2. Apps Script
- Mở Sheet → Extensions → Apps Script
- Copy từng file `.gs` vào editor
- Điền các biến trong `Code.gs` (Sheet ID, Zalo OA token, email)
- Thiết lập triggers (xem hướng dẫn trong `Code.gs`)

### 3. Frontend
- Upload 4 file HTML lên hosting/WordPress
- Cập nhật `SHEET_API_URL` trong file booking page

---

## Biến môi trường cần điền

```javascript
// Trong Code.gs — PropertiesService
SHEET_ID          = "your-google-sheet-id"
ZALO_OA_TOKEN     = "your-zalo-oa-access-token"
ADMIN_EMAIL       = "contact@linkajob.vn"
CALENDAR_ID       = "primary"  // hoặc calendar riêng của advisor
MEET_LINK_PREFIX  = "https://meet.google.com/"
```
