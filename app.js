
document.addEventListener("click", e=>{
  const notice=e.target.closest(".notice-inner");
  if(notice && notice.tagName!=="A"){location.href="community.html";return}
  const sortBtn=e.target.closest("[data-sort-button]");
  if(sortBtn){const menu=document.querySelector("[data-sort-menu]"); if(menu) menu.hidden=!menu.hidden; return}
  const sortOpt=e.target.closest("[data-sort-option]");
  if(sortOpt){const label=document.querySelector("[data-sort-label]"); if(label) label.textContent=sortOpt.dataset.sortOption; const menu=document.querySelector("[data-sort-menu]"); if(menu) menu.hidden=true; toast(sortOpt.dataset.sortOption+"으로 정렬했습니다."); return}
  const choice=e.target.closest(".choice");
  if(choice && choice.parentElement?.classList.contains("choice-row")){
    choice.parentElement.querySelectorAll(".choice").forEach(x=>x.classList.remove("active"));choice.classList.add("active");
    const help=choice.closest(".form-section,.modal,.level-select")?.querySelector("[data-level-help]");
    if(help && choice.dataset.levelDescription)help.textContent=choice.dataset.levelDescription;
  }
  const heart=e.target.closest(".heart"); if(heart){e.stopPropagation(); heart.textContent=heart.textContent.trim()==="♥"?"♡":"♥";heart.style.color=heart.textContent==="♥"?"#ef4444":"#94a3b8"}
  const toastBtn=e.target.closest("[data-toast]"); if(toastBtn){toast(toastBtn.dataset.toast)}
  const modalOpen=e.target.closest("[data-modal-open]"); if(modalOpen){const m=document.getElementById(modalOpen.dataset.modalOpen);if(m)m.hidden=false}
  const modalClose=e.target.closest("[data-modal-close]"); if(modalClose){const m=modalClose.closest(".modal-backdrop");if(m)m.hidden=true}
  const friendAdd=e.target.closest("[data-friend-add]");
  if(friendAdd){friendAdd.textContent="친구 요청 보냄";friendAdd.disabled=true;toast("친구 요청을 보냈습니다.");return}
  const blockConfirm=e.target.closest("[data-block-confirm]");
  if(blockConfirm){
    const user=blockConfirm.dataset.blockConfirm;
    const blocked=JSON.parse(localStorage.getItem("playupp-blocked-users")||"[]");
    if(!blocked.includes(user))blocked.push(user);
    localStorage.setItem("playupp-blocked-users",JSON.stringify(blocked));
    const button=document.querySelector(`[data-block-user="${user}"]`);
    if(button){button.textContent="차단됨";button.disabled=true}
    const modal=blockConfirm.closest(".modal-backdrop");if(modal)modal.hidden=true;
    toast("사용자를 차단했습니다. 앞으로 서로 매칭되지 않습니다.");return
  }
});
document.querySelectorAll(".modal-backdrop").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.hidden=true}));
document.querySelectorAll("[data-location]").forEach(btn=>btn.addEventListener("click",()=>{
  if(!navigator.geolocation){toast("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");return}
  const old=btn.textContent; btn.textContent="위치 확인 중...";
  navigator.geolocation.getCurrentPosition(()=>{btn.textContent="현재 위치 사용 중";btn.classList.add("soft");toast("현재 위치를 기준으로 표시합니다.")},()=>{btn.textContent=old;toast("위치 권한이 허용되지 않았습니다.")},{timeout:4000})
}));
document.querySelectorAll("[data-tab-target]").forEach(btn=>btn.addEventListener("click",()=>{
  const group=btn.closest("[data-tabs]"); if(!group)return;
  group.querySelectorAll("[data-tab-target]").forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  const wrap=document.querySelector(btn.dataset.tabTarget); if(!wrap)return;
  const parent=wrap.parentElement; parent.querySelectorAll("[data-tab-panel]").forEach(x=>x.hidden=true); wrap.hidden=false;
}));
document.querySelectorAll("[data-block-user]").forEach(button=>{
  const blocked=JSON.parse(localStorage.getItem("playupp-blocked-users")||"[]");
  if(blocked.includes(button.dataset.blockUser)){button.textContent="차단됨";button.disabled=true}
});
const requestedRoom=new URLSearchParams(location.search).get("room");
if(requestedRoom){
  document.querySelectorAll("[data-chat-room]").forEach(room=>room.classList.toggle("active",room.dataset.chatRoom===requestedRoom));
  document.querySelectorAll("[data-chat-panel]").forEach(panel=>panel.hidden=panel.dataset.chatPanel!==requestedRoom);
}
function toast(msg){const t=document.getElementById("toast");if(!t)return;t.textContent=msg;t.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2200)}
