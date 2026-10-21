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
var cwWidgetFailed = false; // fetch dang-ky-tu-van.html lỗi (404 / mở bằng file:// / mất mạng)
var cwPendingOpen = false; // nếu người dùng bấm "Đăng ký tư vấn" trước khi fetch widget.html xong

function initConsultWidget(){
  var root = document.getElementById('lj-widget-root');
  if (!root) { console.warn('[widget.js] Không tìm thấy #lj-widget-root trên trang này.'); return; }

  fetch('dang-ky-tu-van.html')
    .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(function(html){
      root.innerHTML = html;
      if (!document.getElementById('cwOverlay')) throw new Error('dang-ky-tu-van.html không có phần tử #cwOverlay');
      cwWidgetLoaded = true;
      if (cwPendingOpen) { cwPendingOpen = false; openConsultWidget(); }
    })
    .catch(function(err){
      cwWidgetFailed = true;
      console.error('[dang-ky-tu-van.js] Không tải được form đăng ký:', err);
      if (cwPendingOpen) { cwPendingOpen = false; cwFallback(); }
    });
}

function cwFallback(){
  alert('Không mở được form đăng ký lúc này. Bạn vui lòng nhắn Zalo 0903 374 648 để được tư vấn nhé.');
}
function openConsultWidget(){
  if (cwWidgetFailed) { cwFallback(); return; }
  if (!cwWidgetLoaded) { cwPendingOpen = true; return; } // đợi fetch xong rồi tự mở
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
  var cvOk = cvEl ? cwCvLinkOk(cvLink) : true; // form không có ô CV thì không chặn nút Gửi
  if (cvHint) {
    if (cvLink && !cvOk) { cvHint.textContent = 'Link chưa đúng — cần bắt đầu bằng http:// hoặc https://'; cvHint.style.color = '#e0453c'; }
    else { cvHint.textContent = CW_CV_HINT; cvHint.style.color = ''; }
  }
  var btn = document.getElementById('cwBtn1');
  if (btn) btn.disabled = !(name && phone && validEmail && question && cvOk);
}

function cwVal(id){ var el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; }
function cwSubmitLead(){
  var btn = document.getElementById('cwBtn1');
  if (!btn || btn.dataset.sending) return;

  var name     = cwVal('cwName');
  var phone    = cwVal('cwPhone');
  var email    = cwVal('cwEmail');
  var service  = cwVal('cwService');
  var question = cwVal('cwQuestion');
  var customerType   = cwVal('cwCustomerType');
  var interestedDept = cwVal('cwInterestedDept');
  var region          = cwVal('cwRegion');
  var source          = cwVal('cwSource');
  var cvLink = cwVal('cwCv');
  var hasCvField = !!document.getElementById('cwCv');

  if (!name || !phone || !question) { alert('Vui lòng điền đầy đủ thông tin bắt buộc.'); return; }
  if (hasCvField && !cvLink) { alert('Vui lòng dán link CV gần nhất của bạn.'); return; }
  if (cvLink && !cwCvLinkOk(cvLink)) { alert('Link CV chưa đúng — cần bắt đầu bằng http:// hoặc https://'); return; }

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
    var okEl = document.getElementById('cwSuccessDetail'); if (okEl) okEl.innerHTML =
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
