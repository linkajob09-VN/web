/* ════════════════════════════════════════════════════════════
   LinkaJob — Widget "Đăng ký tư vấn" dùng chung cho mọi trang
   Cách dùng: thêm vào mỗi trang HTML
     1) Trong <head>:  <link rel="stylesheet" href="widget.css">
     2) Cuối <body>, TRƯỚC thẻ đóng </body>:
                        <div id="lj-widget-root"></div>
                        <script src="widget.js"></script>
                        <script>initConsultWidget();</script>
   Nút "Đăng ký tư vấn" ở nav (đã dùng chung qua nav.html) gọi sẵn
   openConsultWidget() — chỉ cần đảm bảo widget.js được load trên mọi trang
   có dùng nav dùng chung, nếu không nút bấm sẽ không có phản ứng gì.
   ════════════════════════════════════════════════════════════ */

var CW_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbx7Bd9VvoyzfiiezQV9huoY2BKHH_Br1RAFIz00mjdyKeis-Zv-38a0gf_b-fMlul2C/exec';
var cwLeadCaptured = false;
var cwWidgetLoaded = false;
var CW_TEMPLATE = `<div class="cw-overlay" id="cwOverlay" onclick="if(event.target===this)closeConsultWidget()">
  <div class="cw-box" id="cwBox">
    <div class="cw-head">
      <div>
        <div class="cw-title">Đăng ký tư vấn</div>
        <div class="cw-sub" id="cwSub">Điền thông tin để được tư vấn miễn phí</div>
      </div>
      <button class="cw-close" onclick="closeConsultWidget()"><i class="ti ti-x" aria-hidden="true"></i></button>
    </div>

    <div class="cw-step" id="cwStep1">
      <div class="cw-field">
        <label>Họ và tên <span>*</span></label>
        <input type="text" id="cwName" placeholder="Nguyễn Văn A" oninput="cwCheckStep1()">
      </div>
      <div class="cw-field">
        <label>Số điện thoại (Zalo/WhatsApp) <span>*</span></label>
        <input type="tel" id="cwPhone" placeholder="(+84) 9xx xxx xxx" oninput="cwCheckStep1()">
      </div>
      <div class="cw-field">
        <label>Email <span>*</span></label>
        <input type="email" id="cwEmail" placeholder="email@example.com" oninput="cwCheckStep1()">
      </div>
      <div class="cw-field">
        <label>Quan tâm dịch vụ</label>
        <select id="cwService">
          <option value="Cố vấn 1-1" selected>Cố vấn 1-1</option>
          <option value="Khoá học">Khoá học</option>
          <option value="Chưa rõ — cần tư vấn thêm">Chưa rõ — cần tư vấn thêm</option>
        </select>
      </div>
      <div class="cw-field">
        <label>Bạn hiện là</label>
        <select id="cwCustomerType">
          <option value="">-- Chọn --</option>
          <option value="Sinh viên">Sinh viên</option>
          <option value="Mới tốt nghiệp">Mới tốt nghiệp</option>
          <option value="Đã đi làm">Đã đi làm</option>
        </select>
      </div>
      <div class="cw-field">
        <label>Phòng ban / vị trí quan tâm</label>
        <select id="cwInterestedDept">
          <option value="">-- Chọn --</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales/Kinh doanh">Sales/Kinh doanh</option>
          <option value="Tài chính/Kế toán">Tài chính/Kế toán</option>
          <option value="Chuỗi cung ứng/Logistics">Chuỗi cung ứng/Logistics</option>
          <option value="Nhân sự">Nhân sự</option>
          <option value="Data/Công nghệ">Data/Công nghệ</option>
          <option value="Vận hành">Vận hành</option>
          <option value="Tư vấn/Consulting">Tư vấn/Consulting</option>
          <option value="Khác">Khác</option>
        </select>
      </div>
      <div class="cw-field">
        <label>Khu vực sinh sống / làm việc</label>
        <select id="cwRegion">
          <option value="">-- Chọn --</option>
          <option value="Miền Bắc">Miền Bắc</option>
          <option value="Miền Trung">Miền Trung</option>
          <option value="Miền Nam">Miền Nam</option>
        </select>
      </div>
      <div class="cw-field">
        <label>Biết đến LinkaJob qua đâu</label>
        <select id="cwSource">
          <option value="">-- Chọn --</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
          <option value="Threads">Threads</option>
          <option value="TikTok">TikTok</option>
          <option value="Được giới thiệu">Được giới thiệu</option>
          <option value="Khác">Khác</option>
        </select>
      </div>
      <div class="cw-field">
        <label>Câu hỏi muốn tư vấn<span>*</span></label>
        <textarea id="cwQuestion" rows="3" placeholder="VD: Mình muốn hỏi thêm về cố vấn 1-1 sẽ diễn ra như nào..." oninput="cwCheckStep1()"></textarea>
      </div>
      <div class="cw-field">
        <label>Link CV gần nhất của bạn<span>*</span></label>
        <input type="url" id="cwCv" placeholder="https://drive.google.com/..." oninput="cwCheckStep1()">
        <div class="cw-field-hint" id="cwCvHint">Dán link Google Drive / Dropbox / LinkedIn... — nhớ bật quyền "Ai có link đều xem được"</div>
      </div>
      <div class="cw-note"><i class="ti ti-video" aria-hidden="true"></i> LinkaJob sẽ liên hệ với bạn qua Zalo, bạn để ý tin nhắn người lạ nhé.</div>
      <button class="cw-next" id="cwBtn1" onclick="cwSubmitLead()" disabled>Gửi đăng ký </button>
    </div>

    <div class="cw-step" id="cwStep2" style="display:none">
      <div class="cw-note" style="text-align:center;padding:20px 4px;font-size:14px;line-height:1.6">
        <i class="ti ti-circle-check" aria-hidden="true" style="font-size:32px;color:var(--orange);display:block;margin-bottom:10px"></i>
        <div id="cwSuccessDetail"></div>
      </div>
    </div>
  </div>
</div>
`;
var cwPendingOpen = false; // nếu người dùng bấm "Đăng ký tư vấn" trước khi fetch widget.html xong

function initConsultWidget(){
  var root = document.getElementById('lj-widget-root');
  if (!root) { console.warn('[widget.js] Không tìm thấy #lj-widget-root trên trang này.'); return; }

  // Nhúng sẵn HTML widget => không phụ thuộc fetch (fetch bị chặn khi mở file bằng file://)
  root.innerHTML = CW_TEMPLATE;
  cwWidgetLoaded = true;
  if (cwPendingOpen) { cwPendingOpen = false; openConsultWidget(); }
}

function openConsultWidget(){
  if (!cwWidgetLoaded) { cwPendingOpen = true; initConsultWidget(); if (!cwWidgetLoaded) return; }
  document.getElementById('cwOverlay').classList.add('show');
  cwLeadCaptured = false;
  ['cwName','cwPhone','cwEmail','cwQuestion'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
  var cvEl = document.getElementById('cwCv'); if (cvEl) cvEl.value = '';
  var cvHint = document.getElementById('cwCvHint'); if (cvHint) { cvHint.textContent = CW_CV_HINT; cvHint.style.color = ''; }
  ['cwService','cwCustomerType','cwInterestedDept','cwRegion','cwSource'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.selectedIndex = 0;
  });
  var b = document.getElementById('cwBtn1'); if(b) { b.disabled = true; b.textContent = 'Gửi đăng ký '; b.dataset.sending = ''; }
  cwGoStep(1);
}
function closeConsultWidget(){
  var el = document.getElementById('cwOverlay');
  if (el) el.classList.remove('show');
}
function cwGoStep(n){
  // Widget này chỉ có đúng 2 bước thật: cwStep1 (form) và cwStep2 (cảm ơn) —
  // không có bước chọn lịch (khách để lại thông tin, LinkaJob chủ động liên
  // hệ qua Zalo như ghi chú trong form).
  [1,2].forEach(function(i){
    var el = document.getElementById('cwStep'+i);
    if (el) el.style.display = (i===n?'block':'none');
  });
  var subs = {1:'Điền thông tin để được tư vấn miễn phí', 2:'Cảm ơn bạn đã đăng ký'};
  var sub = document.getElementById('cwSub');
  if (sub) sub.textContent = subs[n] || '';
}
var CW_CV_HINT = 'Dán link Google Drive / Dropbox / LinkedIn... — nhớ bật quyền "Ai có link đều xem được"';

function cwCvLinkOk(v){
  return /^https?:\/\/[^\s]+\.[^\s]+$/i.test(v);
}

function cwCheckStep1(){
  var name  = document.getElementById('cwName').value.trim();
  var phone = document.getElementById('cwPhone').value.trim();
  var email = document.getElementById('cwEmail').value.trim();
  var question = document.getElementById('cwQuestion').value.trim();
  var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  var cvEl = document.getElementById('cwCv');
  var cvLink = cvEl ? cvEl.value.trim() : '';
  var cvHint = document.getElementById('cwCvHint');
  var cvOk = cwCvLinkOk(cvLink);
  if (cvHint) {
    if (cvLink && !cvOk) { cvHint.textContent = 'Link chưa đúng — cần bắt đầu bằng http:// hoặc https://'; cvHint.style.color = '#e0453c'; }
    else { cvHint.textContent = CW_CV_HINT; cvHint.style.color = ''; }
  }
  var btn = document.getElementById('cwBtn1');
  if (btn) btn.disabled = !(name && phone && validEmail && question && cvOk);
}

function cwSubmitLead(){
  var btn = document.getElementById('cwBtn1');
  if (btn.dataset.sending) return;

  var name     = document.getElementById('cwName').value.trim();
  var phone    = document.getElementById('cwPhone').value.trim();
  var email    = document.getElementById('cwEmail').value.trim();
  var service  = document.getElementById('cwService').value;
  var question = document.getElementById('cwQuestion').value.trim();
  var customerType   = document.getElementById('cwCustomerType').value;
  var interestedDept = document.getElementById('cwInterestedDept').value;
  var region          = document.getElementById('cwRegion').value;
  var source          = document.getElementById('cwSource').value;
  var cvLink = document.getElementById('cwCv').value.trim();

  if (!name || !phone || !question) { alert('Vui lòng điền đầy đủ thông tin bắt buộc.'); return; }
  if (!cvLink) { alert('Vui lòng dán link CV gần nhất của bạn.'); return; }
  if (!cwCvLinkOk(cvLink)) { alert('Link CV chưa đúng — cần bắt đầu bằng http:// hoặc https://'); return; }

  btn.dataset.sending = '1';
  btn.disabled = true;
  btn.textContent = 'Đang gửi...';

  fetch(CW_WEBAPP_URL, {
    method : 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body   : JSON.stringify({
      action: 'captureLead',
      name: name, phone: phone, email: email, service: service, question: question,
      customer_type: customerType, interested_dept: interestedDept, region: region, source_channel: source,
      cv_link: cvLink
    })
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    if (!data.success) throw new Error(data.error || 'Lỗi không xác định');
    cwLeadCaptured = true;
    document.getElementById('cwSuccessDetail').innerHTML =
      'Cảm ơn <strong>' + name + '</strong> đã đăng ký!<br><br>' +
      'Đội ngũ LinkaJob sẽ liên hệ với bạn trong thời gian sớm nhất.';
    cwGoStep(2);
  })
  .catch(function(err){
    alert('Gửi đăng ký thất bại: ' + err.message + '. Vui lòng thử lại.');
    btn.dataset.sending = '';
    btn.disabled = false;
    btn.textContent = 'Gửi đăng ký';
  });
}
