/* ════════════════════════════════════════════════════════════
   LinkaJob — Nav dùng chung cho mọi trang
   Cách dùng: thêm 2 dòng vào mỗi trang HTML
     1) Trong <head>:  <link rel="stylesheet" href="nav.css">
     2) Đầu <body>:    <div id="lj-nav-root"></div>
     3) Cuối <body> (sau khi có <script src="nav.js"></script>):
                        <script>initSharedNav();</script>
   Không cần copy/paste code nav vào từng trang nữa — sửa nav chỉ cần sửa
   đúng 3 file: nav.html / nav.css / nav.js.
   ════════════════════════════════════════════════════════════ */

function toggleNavDropdown(btn) {
  var item = btn.closest('.lj-nav-item');
  var wasOpen = item.classList.contains('open');
  document.querySelectorAll('.lj-nav-item.open').forEach(function(el){ el.classList.remove('open'); });
  if (!wasOpen) item.classList.add('open');
}

function toggleMobileNav(){
  var links = document.querySelector('.lj-nav-links');
  var backdrop = document.getElementById('ljNavBackdrop');
  var btn = document.querySelector('.lj-nav-toggle');
  if(!links) return;
  var isOpen = links.classList.toggle('open');
  if(backdrop) backdrop.classList.toggle('open', isOpen);
  if(btn) btn.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileNav(){
  var links = document.querySelector('.lj-nav-links');
  var backdrop = document.getElementById('ljNavBackdrop');
  var btn = document.querySelector('.lj-nav-toggle');
  if(!links) return;
  links.classList.remove('open');
  if(backdrop) backdrop.classList.remove('open');
  if(btn) btn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Tự nhận diện trang hiện tại theo URL, gắn badge "Đang xem" + đổi màu link
// tương ứng trong dropdown — thay cho việc gắn cứng "Đang xem" vào từng trang
// như trước (không còn khả thi khi dùng chung 1 file nav.html cho mọi trang).
function markCurrentNavPage(){
  var path = window.location.pathname;
  var currentFile = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1)) || 'index.html';
  document.querySelectorAll('#lj-nav-root [data-page]').forEach(function(a){
    if (a.getAttribute('data-page') === currentFile) {
      a.classList.add('lj-di-current');
      var title = a.querySelector('.lj-di-title');
      if (title && !title.querySelector('.lj-dropdown-badge')) {
        var badge = document.createElement('span');
        badge.className = 'lj-dropdown-badge';
        badge.textContent = 'Đang xem';
        title.appendChild(badge);
      }
      // Mở sẵn nhóm dropdown chứa trang hiện tại (tiện cho mobile)
      var parentItem = a.closest('.lj-nav-item');
      if (parentItem) parentItem.classList.add('lj-current-group');
    }
  });
}

// Hàm chính — gọi 1 lần trên mỗi trang sau khi include nav.js
function initSharedNav(){
  var root = document.getElementById('lj-nav-root');
  if (!root) { console.warn('[nav.js] Không tìm thấy #lj-nav-root trên trang này.'); return; }

  fetch('nav.html')
    .then(function(r){ return r.text(); })
    .then(function(html){
      root.innerHTML = html;
      markCurrentNavPage();

      // Đóng nav mobile khi click backdrop (không đóng nếu click vào trong panel)
      var backdrop = document.getElementById('ljNavBackdrop');
      if (backdrop) {
        backdrop.addEventListener('click', function(e){
          if (e.target.closest('.lj-nav-links')) return;
          closeMobileNav();
        });
      }

      // Hiệu ứng đổ bóng nav khi cuộn trang
      var nav = document.querySelector('.lj-nav');
      if (nav) {
        var onScroll = function(){
          if (window.scrollY > 8) nav.classList.add('scrolled');
          else nav.classList.remove('scrolled');
        };
        window.addEventListener('scroll', onScroll, { passive:true });
        onScroll();
      }
    })
    .catch(function(err){
      console.error('[nav.js] Không tải được nav.html:', err);
      root.innerHTML = '<nav class="lj-nav"><a href="index.html" class="lj-logo">LinkaJob</a></nav>';
    });
}

// Đóng dropdown khi click ra ngoài / bấm Escape — gắn 1 lần, không phụ thuộc
// việc nav đã load xong hay chưa (closest() tự trả về null an toàn nếu chưa có).
document.addEventListener('click', function(e){
  if (e.target.closest('.lj-dropdown a')) return; // click vào link trong dropdown → để nó điều hướng, không đóng
  if (!e.target.closest('.lj-nav-item')) {
    document.querySelectorAll('.lj-nav-item.open').forEach(function(el){ el.classList.remove('open'); });
  }
});
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') {
    document.querySelectorAll('.lj-nav-item.open').forEach(function(el){ el.classList.remove('open'); });
  }
});
