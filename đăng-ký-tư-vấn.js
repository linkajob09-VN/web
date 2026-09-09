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
var cwPendingOpen = false; // nếu người dùng bấm "Đăng ký tư vấn" trước khi fetch widget.html xong

function initConsultWidget(){
  var root = document.getElementById('lj-widget-root');
  if (!root) { console.warn('[widget.js] Không tìm thấy #lj-widget-root trên trang này.'); return; }

  fetch('đăng-ký-tư-vấn.html')
    .then(function(r){ return r.text(); })
    .then(function(html){
      root.innerHTML = html;
      cwWidgetLoaded = true;
      if (cwPendingOpen) { cwPendingOpen = false; openConsultWidget(); }
    })
    .catch(function(err){
      console.error('[widget.js] Không tải được widget.html:', err);
    });
}

function openConsultWidget(){
  if (!cwWidgetLoaded) { cwPendingOpen = true; return; } // đợi fetch xong rồi tự mở
  document.getElementById('cwOverlay').classList.add('show');
  cwLeadCaptured = false;
  ['cwName','cwPhone','cwEmail','cwQuestion'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = '';
  });
  var cvEl = document.getElementById('cwCv'); if (cvEl) cvEl.value = '';
  var cvHint = document.getElementById('cwCvHint'); if (cvHint) { cvHint.textContent = 'Định dạng PDF/DOC/DOCX, tối đa 5MB'; cvHint.style.color = ''; }
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
var CW_CV_MAX_BYTES = 5 * 1024 * 1024; // 5MB

function cwCheckStep1(){
  var name  = document.getElementById('cwName').value.trim();
  var phone = document.getElementById('cwPhone').value.trim();
  var email = document.getElementById('cwEmail').value.trim();
  var question = document.getElementById('cwQuestion').value.trim();
  var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  var cvEl = document.getElementById('cwCv');
  var cvFile = cvEl && cvEl.files && cvEl.files[0];
  var cvHint = document.getElementById('cwCvHint');
  var cvOk = false;
  if (cvFile) {
    if (cvFile.size > CW_CV_MAX_BYTES) {
      if (cvHint) { cvHint.textContent = 'File quá lớn (tối đa 5MB) — vui lòng chọn file khác.'; cvHint.style.color = '#e0453c'; }
      cvOk = false;
    } else {
      if (cvHint) { cvHint.textContent = 'Đã chọn: ' + cvFile.name; cvHint.style.color = ''; }
      cvOk = true;
    }
  } else if (cvHint) {
    cvHint.textContent = 'Định dạng PDF/DOC/DOCX, tối đa 5MB';
    cvHint.style.color = '';
  }
  var btn = document.getElementById('cwBtn1');
  if (btn) btn.disabled = !(name && phone && validEmail && question && cvOk);
}

function cwFileToBase64(file){
  return new Promise(function(resolve, reject){
    var reader = new FileReader();
    reader.onload = function(){ resolve(String(reader.result).split(',')[1] || ''); }; // bỏ phần "data:...;base64,"
    reader.onerror = function(){ reject(new Error('Không đọc được file CV')); };
    reader.readAsDataURL(file);
  });
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
  var cvFile = document.getElementById('cwCv').files[0];

  if (!name || !phone || !question) { alert('Vui lòng điền đầy đủ thông tin bắt buộc.'); return; }
  if (!cvFile) { alert('Vui lòng đính kèm CV gần nhất của bạn.'); return; }
  if (cvFile.size > CW_CV_MAX_BYTES) { alert('File CV quá lớn (tối đa 5MB) — vui lòng chọn file khác.'); return; }

  btn.dataset.sending = '1';
  btn.disabled = true;
  btn.textContent = 'Đang tải CV lên...';

  cwFileToBase64(cvFile).then(function(base64){
    btn.textContent = 'Đang gửi...';
    return fetch(CW_WEBAPP_URL, {
      method : 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body   : JSON.stringify({
        action: 'captureLead',
        name: name, phone: phone, email: email, service: service, question: question,
        customer_type: customerType, interested_dept: interestedDept, region: region, source_channel: source,
        cv_base64: base64, cv_filename: cvFile.name, cv_mimetype: cvFile.type || 'application/octet-stream'
      })
    });
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
