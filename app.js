(()=>{
  "use strict";

  const STORE_KEY="playupp-static-state-v2";
  const page=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  const isAdmin=location.pathname.replace(/\\/g,"/").includes("/admin/");
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

  const users={
    minsu:{id:"minsu",name:"민수",initial:"민",region:"인천광역시 연수구",rate:96,participation:9,together:4,sports:["배드민턴 초급 · 활동 7회","탁구 입문 · 활동 2회"]},
    jiyeon:{id:"jiyeon",name:"지연",initial:"지",region:"인천광역시 미추홀구",rate:100,participation:14,together:2,sports:["배드민턴 중급 · 활동 10회","러닝 초급 · 활동 4회"]},
    youngho:{id:"youngho",name:"영호",initial:"영",region:"인천광역시 남동구",rate:92,participation:12,together:1,sports:["탁구 초급 · 활동 7회","배드민턴 초급 · 활동 5회"]},
    subin:{id:"subin",name:"수빈",initial:"수",region:"인천광역시 연수구",rate:100,participation:18,together:0,sports:["배드민턴 중급 · 활동 18회"]}
  };
  Object.assign(users,{
    dahyun:{id:"dahyun",name:"다현",initial:"다",region:"인천광역시 연수구",rate:94,participation:8,together:0,sports:["배드민턴 초급 · 활동 8회"]},
    eunah:{id:"eunah",name:"은아",initial:"은",region:"인천광역시 연수구",rate:100,participation:11,together:3,sports:["배드민턴 초급 · 활동 11회"]},
    gyudong:{id:"gyudong",name:"규동",initial:"규",region:"인천광역시 남동구",rate:91,participation:12,together:2,sports:["배드민턴 중급 · 활동 12회"]}
  });

  const meetings={
    badminton:{id:"badminton",sport:"배드민턴",title:"주말 아침 배드민턴 같이 쳐요!",short:"배",date:"2026-08-10",dateText:"2026년 08월 10일 (월)",time:"10:00 ~ 12:00",region:"인천광역시 연수구",place:"선학체육관 배드민턴장",address:"인천광역시 연수구 경원대로 526",distance:0.3,level:"초급 ~ 중급",members:4,max:6,cost:"1인 2,000원",costNumber:2000,host:"minsu",approval:"host",status:"모집 중",intro:"배드민턴 초급~중급 분들 편하게 오세요. 복식 위주로 진행하며 라켓은 개인 지참 부탁드려요. 셔틀콕은 준비합니다.",participants:["minsu","jiyeon","youngho"]},
    futsal:{id:"futsal",sport:"풋살",title:"저녁 풋살 번개 ⚡",short:"풋",date:"2026-08-10",dateText:"2026년 08월 10일 (월)",time:"19:00 ~ 21:00",region:"인천광역시 남동구",place:"남동 풋살장 A코트",address:"인천광역시 남동구 구월동",distance:1.2,level:"초급 ~ 중급",members:7,max:10,cost:"1인 5,000원",costNumber:5000,host:"youngho",approval:"host",status:"마감 임박",intro:"퇴근 후 가볍게 풋살하실 분을 모집합니다. 팀은 현장에서 균형 있게 나눠요.",participants:["youngho","minsu","jiyeon"]},
    "table-tennis":{id:"table-tennis",sport:"탁구",title:"평일 저녁 탁구 모임",short:"탁",date:"2026-08-12",dateText:"2026년 08월 12일 (수)",time:"20:00 ~ 22:00",region:"인천광역시 미추홀구",place:"미추홀 탁구장",address:"인천광역시 미추홀구 주안동",distance:2.4,level:"입문 ~ 중급",members:6,max:8,cost:"각자 결제",costNumber:0,host:"jiyeon",approval:"host",status:"모집 중",intro:"입문자도 부담 없이 참여할 수 있는 평일 탁구 모임입니다. 기본 자세도 함께 알려드려요.",participants:["jiyeon","youngho","minsu"]},
    billiards:{id:"billiards",sport:"당구",title:"주말 4구 한 게임 하실 분",short:"당",date:"2026-08-13",dateText:"2026년 08월 13일 (목)",time:"14:00 ~ 16:00",region:"인천광역시 부평구",place:"부평 한큐 당구장",address:"인천광역시 부평구 부평동",distance:4.1,level:"중급",members:3,max:4,cost:"비용 없음",costNumber:0,host:"minsu",approval:"instant",status:"1자리 남음",intro:"주말 오후 편하게 4구 한 게임 하실 중급자 한 분을 기다립니다.",participants:["minsu","youngho"]}
  };

  const defaults={
    profile:{name:"제니",region:"인천광역시 연수구",sports:[{name:"배드민턴",level:"중급",count:15},{name:"탁구",level:"초급",count:7}]},
    session:{loggedIn:true,id:"jenny01"},favorites:[],blockedUsers:[],friends:["jiyeon"],sentFriendRequests:[],incomingFriendRequests:["subin"],
    applications:{"table-tennis":"confirmed",futsal:"pending"},createdMeetings:[],cancelledApplications:[],messages:{},attendance:{},reviews:{},communityPosts:[],reports:[],readNotifications:false,
    roomManagement:{applicants:["dahyun"],members:["eunah","gyudong"],kicked:[]}
  };

  function loadState(){
    try{const loaded=merge(defaults,JSON.parse(localStorage.getItem(STORE_KEY)||"{}"));const legacy=JSON.parse(localStorage.getItem("playupp-blocked-users")||"[]");loaded.blockedUsers=[...new Set([...loaded.blockedUsers,...legacy])];return loaded}catch(_){return structuredClone(defaults)}
  }
  function merge(base,extra){
    const out=Array.isArray(base)?[...base]:{...base};
    Object.entries(extra||{}).forEach(([key,value])=>{
      out[key]=value&&typeof value==="object"&&!Array.isArray(value)&&base[key]&&typeof base[key]==="object"&&!Array.isArray(base[key])?merge(base[key],value):value;
    });
    return out;
  }
  let state=loadState();
  function save(){localStorage.setItem(STORE_KEY,JSON.stringify(state))}
  function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]))}
  function toast(message){
    let node=$("#toast");
    if(!node){node=document.createElement("div");node.id="toast";node.className="toast";document.body.append(node)}
    node.textContent=message;node.classList.add("show");clearTimeout(window.__playuppToast);window.__playuppToast=setTimeout(()=>node.classList.remove("show"),2200);
  }
  function closeModal(modal){if(modal)modal.hidden=true}
  function showModal({title,description="",body="",confirm="확인",danger=false,onConfirm=null}){
    const backdrop=document.createElement("div");backdrop.className="modal-backdrop dynamic-modal";
    backdrop.innerHTML=`<div class="modal"><h2>${escapeHtml(title)}</h2>${description?`<p>${escapeHtml(description)}</p>`:""}${body}<div class="modal-actions"><button class="btn" data-dynamic-cancel>취소</button><button class="btn ${danger?"danger":"blue"}" data-dynamic-confirm>${escapeHtml(confirm)}</button></div></div>`;
    document.body.append(backdrop);
    $("[data-dynamic-cancel]",backdrop).onclick=()=>backdrop.remove();
    backdrop.onclick=e=>{if(e.target===backdrop)backdrop.remove()};
    $("[data-dynamic-confirm]",backdrop).onclick=()=>{if(!onConfirm||onConfirm(backdrop)!==false)backdrop.remove()};
    const focusable=$("input,textarea,select",backdrop);if(focusable)setTimeout(()=>focusable.focus(),0);
    return backdrop;
  }
  function query(name){return new URLSearchParams(location.search).get(name)}
  function userUrl(id){return `user-profile.html?user=${encodeURIComponent(id)}`}
  function meetingUrl(id){return `detail.html?meeting=${encodeURIComponent(id)}`}
  function getMeeting(id){
    if(id==="hosted-badminton")return {id,sport:"배드민턴",title:"주말 아침 배드민턴 같이 쳐요!",short:"배",date:"2026-08-10",dateText:"2026년 08월 10일 (월)",time:"10:00 ~ 12:00",region:"인천광역시 연수구",place:"선학체육관 배드민턴장",address:"인천광역시 연수구 경원대로 526",distance:.3,level:"초급 ~ 중급",members:1+(state.roomManagement?.members?.length||0),max:6,cost:"1인 2,000원",costNumber:2000,host:"self",approval:"host",status:"모집 중",intro:"배드민턴 초급~중급 분들과 편하게 운동해요.",participants:state.roomManagement?.members||[]};
    return meetings[id]||state.createdMeetings.find(item=>item.id===id)||meetings.badminton;
  }
  function fieldByLabel(text,root=document){return $$(".field",root).find(field=>$("label",field)?.textContent.trim().includes(text))}

  function initMobileNav(){
    const topbar=$(".topbar-inner"),nav=$(".main-nav");if(!topbar||!nav)return;
    const button=document.createElement("button");button.className="mobile-nav-toggle";button.type="button";button.setAttribute("aria-label","메뉴 열기");button.innerHTML="☰";
    const actions=$(".top-actions",topbar);topbar.insertBefore(button,actions||null);
    button.onclick=()=>{nav.classList.toggle("mobile-open");button.textContent=nav.classList.contains("mobile-open")?"×":"☰"};
  }

  function initHeader(){
    $$(".notice-inner").forEach(notice=>{if(notice.tagName!=="A"){notice.tabIndex=0;notice.setAttribute("role","link");notice.onclick=()=>location.href=(isAdmin?"../":"")+"community.html";notice.onkeydown=e=>{if(e.key==="Enter")notice.click()}}});
    const search=$(".search-box input"),button=$(".search-box button");
    const run=()=>{const value=search?.value.trim()||"";if(page==="index.html")filterHome(value);else location.href=(isAdmin?"../":"")+`index.html?q=${encodeURIComponent(value)}`};
    if(button)button.onclick=run;if(search)search.onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();run()}};
    const dot=$(".notification .dot");if(dot&&state.readNotifications)dot.hidden=true;
    initMobileNav();
  }

  function meetingCardHtml(meeting){
    const badge=meeting.sport==="풋살"?"green":meeting.sport==="탁구"?"purple":meeting.sport==="당구"?"orange":"";
    return `<article class="meeting-card clickable" data-meeting-id="${escapeHtml(meeting.id)}"><div class="thumb">${escapeHtml(meeting.short||meeting.sport[0])}</div><div><span class="badge ${badge}">${escapeHtml(meeting.sport)}</span><h3>${escapeHtml(meeting.title)}</h3><div class="meta"><span>◷ ${escapeHtml(meeting.date.slice(5).replace("-","/"))} · ${escapeHtml(meeting.time.replace(" ~ ","~"))}</span><span>⌖ ${escapeHtml(meeting.region)} · ${escapeHtml(meeting.distance?meeting.distance+"km":"신규")}</span></div><div class="meta"><span>⚡ ${escapeHtml(meeting.level)}</span><span>♙ ${meeting.members||1}/${meeting.max}명</span><span>₩ ${escapeHtml(meeting.cost)}</span></div></div><div class="meeting-side"><button class="heart" aria-label="찜">${state.favorites.includes(meeting.id)?"♥":"♡"}</button><span class="badge">${escapeHtml(meeting.status||"모집 중")}</span></div></article>`;
  }

  function initHome(){
    const cards=$$(".meeting-list .meeting-card");const ids=["badminton","futsal","table-tennis","billiards"];
    cards.forEach((card,index)=>{card.removeAttribute("onclick");card.dataset.meetingId=ids[index];card.dataset.host=getMeeting(ids[index]).host});
    const list=$(".meeting-list");state.createdMeetings.forEach(meeting=>{if(!list.querySelector(`[data-meeting-id="${meeting.id}"]`))list.insertAdjacentHTML("beforeend",meetingCardHtml(meeting))});
    list?.addEventListener("click",e=>{
      const card=e.target.closest(".meeting-card");if(!card)return;
      const id=card.dataset.meetingId;
      if(e.target.closest(".heart")){e.stopPropagation();toggleFavorite(id,e.target.closest(".heart"));return}
      location.href=meetingUrl(id);
    });
    $$(".chip").forEach(chip=>chip.onclick=()=>{chip.classList.toggle("active");filterHome()});
    const optionSets={"종목":["전체","배드민턴","풋살","탁구","당구"],"지역":["전체","연수구","남동구","미추홀구","부평구"],"날짜":["전체","08/10","08/12","08/13"],"시간대":["전체","오전","오후","저녁"],"실력 수준":["전체","입문","초급","중급","고급"],"모집 상태":["전체","모집 중","마감 임박","1자리 남음"],"참가비":["전체","무료","유료"]};
    $$(".select-like").forEach(button=>button.onclick=()=>{
      const label=button.dataset.label||button.firstElementChild.textContent.trim();button.dataset.label=label;
      const choices=optionSets[label]||["전체"];
      showModal({title:`${label} 선택`,body:`<div class="modal-choice-list">${choices.map(value=>`<button class="choice" type="button" data-filter-value="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("")}</div>`,confirm:"적용",onConfirm:modal=>{const selected=$(".choice.active",modal)?.dataset.filterValue||"전체";button.dataset.value=selected;button.firstElementChild.textContent=selected==="전체"?label:`${label}: ${selected}`;filterHome()}});
    });
    $(".btn.primary.block")?.addEventListener("click",()=>filterHome());
    $(".ad-card .btn")?.addEventListener("click",()=>list?.scrollIntoView({behavior:"smooth"}));
    const q=query("q");if(q){const input=$(".search-box input");if(input)input.value=q;filterHome(q)}
    applyBlockedMeetingFilter();
  }
  function toggleFavorite(id,button){
    const exists=state.favorites.includes(id);state.favorites=exists?state.favorites.filter(x=>x!==id):[...state.favorites,id];save();button.textContent=exists?"♡":"♥";button.style.color=exists?"#94a3b8":"#ef4444";toast(exists?"찜에서 삭제했습니다.":"찜한 모임에 추가했습니다.");
  }
  function filterHome(searchValue){
    const search=(searchValue??$(".search-box input")?.value??"").toLowerCase();
    const activeChips=$$(".chip.active").map(x=>x.textContent.trim());
    const filters=Object.fromEntries($$(".select-like").map(button=>[button.dataset.label,button.dataset.value]).filter(([,value])=>value&&value!=="전체"));
    let shown=0;
    $$(".meeting-list .meeting-card").forEach(card=>{
      const meeting=getMeeting(card.dataset.meetingId),text=card.textContent.toLowerCase();let visible=!search||text.includes(search);
      if(activeChips.includes("한 자리 남음"))visible&&=(meeting.max-meeting.members===1);
      if(activeChips.includes("내 지역"))visible&&=meeting.region.includes("연수구");
      if(activeChips.includes("초보자 가능"))visible&&=/입문|초급/.test(meeting.level);
      if(activeChips.includes("비용 없음"))visible&&=meeting.costNumber===0;
      if(activeChips.includes("오늘"))visible&&=meeting.date==="2026-08-09";
      if(activeChips.includes("내일"))visible&&=meeting.date==="2026-08-10";
      if(filters["종목"])visible&&=meeting.sport===filters["종목"];
      if(filters["지역"])visible&&=meeting.region.includes(filters["지역"]);
      if(filters["날짜"])visible&&=meeting.date.includes(filters["날짜"].replace("/","-"));
      if(filters["시간대"]){const hour=Number(meeting.time.slice(0,2));visible&&=filters["시간대"]==="오전"?hour<12:filters["시간대"]==="오후"?hour<18:hour>=18}
      if(filters["실력 수준"])visible&&=meeting.level.includes(filters["실력 수준"]);
      if(filters["모집 상태"])visible&&=meeting.status===filters["모집 상태"];
      if(filters["참가비"])visible&&=(filters["참가비"]==="무료"?meeting.costNumber===0:meeting.costNumber>0);
      if(state.blockedUsers.includes(meeting.host))visible=false;
      card.hidden=!visible;if(visible)shown++;
    });
    const count=$(".toolbar h2 small");if(count)count.textContent=`(검색 결과 ${shown}건)`;
    let empty=$(".meeting-list + .search-empty");if(!shown&&!empty){empty=document.createElement("div");empty.className="empty search-empty";empty.textContent="조건에 맞는 모임이 없습니다.";$(".meeting-list")?.after(empty)}if(empty)empty.hidden=shown>0;
  }
  function applyBlockedMeetingFilter(){$$("[data-host]").forEach(card=>{if(state.blockedUsers.includes(card.dataset.host))card.hidden=true})}

  function initSortAndLocation(){
    document.addEventListener("click",e=>{
      const sortButton=e.target.closest("[data-sort-button]");if(sortButton){const menu=$("[data-sort-menu]");if(menu)menu.hidden=!menu.hidden;return}
      const option=e.target.closest("[data-sort-option]");if(option){const label=$("[data-sort-label]"),list=$(".meeting-list");if(label)label.textContent=option.dataset.sortOption;if(list){const cards=$$(".meeting-card",list);cards.sort((a,b)=>{const ma=getMeeting(a.dataset.meetingId),mb=getMeeting(b.dataset.meetingId);if(option.dataset.sortOption.includes("거리"))return ma.distance-mb.distance;if(option.dataset.sortOption.includes("자리"))return (ma.max-ma.members)-(mb.max-mb.members);return mb.date.localeCompare(ma.date)}).forEach(card=>list.append(card))}option.closest("[data-sort-menu]").hidden=true;toast(`${option.dataset.sortOption}으로 정렬했습니다.`);return}
    });
    $$('[data-location]').forEach(button=>button.onclick=()=>{if(!navigator.geolocation){toast("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");return}const old=button.innerHTML;button.textContent="위치 확인 중...";navigator.geolocation.getCurrentPosition(()=>{button.textContent="현재 위치 사용 중";button.classList.add("soft");toast("현재 위치를 기준으로 거리를 정렬했습니다.")},()=>{button.innerHTML=old;toast("위치 권한이 허용되지 않았습니다.")},{timeout:4000})});
  }

  function initDetail(){
    const id=query("meeting")||"badminton",meeting=getMeeting(id),host=meeting.host==="self"?{id:"self",name:state.profile.name,initial:state.profile.name[0],region:state.profile.region,participation:22}:users[meeting.host]||users.minsu;
    document.title=`${meeting.title} | PLAYUPP`;
    const title=$(".detail-title h1");if(title)title.textContent=meeting.title;
    const sport=$(".detail-title .badge");if(sport)sport.textContent=meeting.sport;
    const subtitle=$(".detail-title .subtle");if(subtitle)subtitle.textContent=meeting.intro;
    const hostRow=$(".host-row");if(hostRow){$(".avatar",hostRow).textContent=host.initial;$("strong",hostRow).textContent=host.name;$(".subtle",hostRow).textContent=`호스트 8회 · ${meeting.sport} 참여 ${host.participation}회`;const profileButton=$("button",hostRow);profileButton.onclick=()=>location.href=host.id==="self"?"profile.html":userUrl(host.id)}
    const info={날짜:meeting.dateText,시간:meeting.time,지역:meeting.region,"상세 장소":meeting.place,"모집 인원":`${meeting.members} / ${meeting.max}명 · ${meeting.max-meeting.members}자리 남음`,"실력 범위":meeting.level,참가비:meeting.cost,"참여 가능 성별":"제한 없음"};
    $$(".detail-grid .detail-card .info-item").forEach(item=>{const label=$("small",item)?.textContent.trim();if(info[label])$("strong",item).textContent=info[label]});
    const intro=$$(".detail-card").find(card=>$("h2",card)?.textContent.includes("모임 소개"))?.querySelector("p");if(intro)intro.textContent=meeting.intro;
    const mapText=$$(".detail-card").find(card=>$("h2",card)?.textContent==="장소")?.querySelector("p");if(mapText)mapText.textContent=`${meeting.place} · ${meeting.address}`;
    const mapButton=$$(".detail-card button").find(button=>button.textContent.includes("지도 크게"));if(mapButton)mapButton.onclick=()=>showModal({title:meeting.place,description:meeting.address,body:'<div class="map-box large-map"></div>',confirm:"닫기"});
    const participantGrid=$(".participant-grid");if(participantGrid)participantGrid.innerHTML=[meeting.host,...meeting.participants.filter(x=>x!==meeting.host)].map((uid,index)=>{const user=uid==="self"?host:users[uid]||users.minsu;return `<a class="person" href="${uid==="self"?"profile.html":userUrl(uid)}"><span class="avatar">${user.initial}</span><strong>${user.name}</strong><small>${index===0?"호스트 · ":""}${meeting.sport} · ${user.participation}회</small></a>`}).join("");
    const side=$(".side-card"),sideItems=$$(".info-item",side);const sideValues=[meeting.date.slice(5).replace("-","/"),meeting.time.split(" ~ ")[0],meeting.place,meeting.cost];sideItems.forEach((item,index)=>{if($("strong",item))$("strong",item).textContent=sideValues[index]});
    if(side){const remaining=$("div>strong[style]",side);if(remaining)remaining.textContent=`${meeting.max-meeting.members}자리 남음`;const number=$$(".subtle",side).find(x=>x.textContent.includes("현재 참여 인원"))?.nextElementSibling;if(number)number.textContent=`${meeting.members} / ${meeting.max}명`;const progress=$(".progress span",side);if(progress)progress.style.width=`${meeting.members/meeting.max*100}%`;const approval=side.querySelector(":scope > .panel strong"),hint=side.querySelector(":scope > .panel .hint");if(approval)approval.textContent=meeting.approval==="instant"?"신청 즉시 참여 확정":"모임장 승인 후 참여 확정";if(hint)hint.textContent=meeting.approval==="instant"?"신청하면 모임톡에 바로 입장합니다.":"승인되면 모임톡에 자동으로 입장합니다."}
    const heart=$(".detail-title .heart");if(heart){heart.dataset.favorite=id;heart.textContent=state.favorites.includes(id)?"♥":"♡";heart.onclick=e=>toggleFavorite(id,e.currentTarget)}
    const apply=$("[data-modal-open='applyModal']");if(apply){if(meeting.host==="self"){apply.textContent="신청자 관리";apply.removeAttribute("data-modal-open");apply.onclick=()=>location.href="host-manage.html"}else if(state.blockedUsers.includes(meeting.host)){apply.textContent="차단한 사용자의 모임";apply.disabled=true;const warning=document.createElement("p");warning.className="hint blocked-warning";warning.textContent="차단한 사용자가 개설한 모임에는 참여할 수 없습니다.";apply.before(warning)}else{const status=state.applications[id];if(status){apply.textContent=status==="confirmed"?"참여 확정됨":"승인 대기 중";apply.disabled=true}else apply.onclick=()=>{$("#applyModal").hidden=false}}}
    const modal=$("#applyModal");if(modal){const description=$(".modal>p",modal);if(description)description.textContent=meeting.approval==="instant"?"신청 즉시 참여가 확정되고 모임톡에 입장합니다.":"호스트가 신청 내용을 확인한 뒤 승인합니다.";const submit=$$("button",modal).find(x=>x.textContent.includes("신청하기"));if(submit){submit.removeAttribute("data-toast");submit.onclick=()=>{state.applications[id]=meeting.approval==="instant"?"confirmed":"pending";save();closeModal(modal);apply.textContent=meeting.approval==="instant"?"참여 확정됨":"승인 대기 중";apply.disabled=true;toast(meeting.approval==="instant"?"참여가 확정되어 모임톡에 입장했습니다.":"참여 신청을 보냈습니다.")}}}
    const inquiry=$$(".side-card .btn").find(button=>button.textContent.includes("문의"));if(inquiry){inquiry.removeAttribute("data-toast");if(meeting.host==="self"){inquiry.textContent="모임톡 열기";inquiry.onclick=()=>location.href=`chat.html?room=meeting-${meeting.id}`}else inquiry.onclick=()=>location.href=`chat.html?room=dm-${host.id}`}
    if(meeting.host!=="self"){const report=document.createElement("button");report.className="btn danger block";report.style.marginTop="8px";report.textContent="모임 신고";report.onclick=()=>openReport("모임",id,meeting.title);side?.append(report)}
  }

  function openReport(type,target,label){
    showModal({title:`${type} 신고`,description:`${label}에 대한 신고 사유를 선택해주세요.`,body:`<div class="field"><label>신고 사유</label><select data-report-reason><option>부적절한 내용</option><option>허위 정보</option><option>반복적인 노쇼</option><option>불쾌한 언행</option><option>기타</option></select></div><div class="field" style="margin-top:12px"><label>상세 내용</label><textarea data-report-detail placeholder="관리자가 확인할 수 있도록 내용을 적어주세요."></textarea></div>`,confirm:"신고 접수",danger:true,onConfirm:modal=>{const reason=$("[data-report-reason]",modal).value,detail=$("[data-report-detail]",modal).value.trim();state.reports.unshift({id:`R${Date.now().toString().slice(-6)}`,type,target,label,reason,detail,status:"접수",createdAt:new Date().toLocaleString("ko-KR")});save();toast("신고가 접수되었습니다. 관리자가 확인할 예정입니다.")}});
  }

  function initAuth(){
    if(page==="login.html"){
      const login=$$("a.btn").find(a=>a.textContent.trim()==="로그인");if(login)login.onclick=e=>{e.preventDefault();const inputs=$$(".auth-fields input");if(!inputs[0].value.trim()||!inputs[1].value){toast("아이디와 비밀번호를 입력해주세요.");return}state.session={loggedIn:true,id:inputs[0].value.trim()};save();location.href="index.html"};
      $$(".social").forEach(button=>button.onclick=()=>{state.session={loggedIn:true,id:button.textContent.toLowerCase()+"-demo"};save();toast(`${button.textContent} 데모 계정으로 로그인합니다.`);setTimeout(()=>location.href="index.html",500)});
      const password=$$("a").find(a=>a.textContent.includes("비밀번호 찾기"));if(password)password.onclick=e=>{e.preventDefault();showModal({title:"비밀번호 찾기",description:"가입한 이메일로 재설정 안내를 보내는 화면입니다.",body:'<div class="field"><label>이메일</label><input type="email" placeholder="example@email.com"></div>',confirm:"안내 보내기",onConfirm:()=>toast("비밀번호 재설정 안내를 보냈습니다.")})};
    }
    if(page==="signup.html"){
      const signup=$$("a.btn").find(a=>a.textContent.includes("가입하고"));if(signup)signup.onclick=e=>{e.preventDefault();const required=$$(".form-grid input");const checks=$$(".form-section input[type='checkbox']").slice(0,3);if(required.some(input=>!input.value.trim())){toast("필수 정보를 모두 입력해주세요.");return}if(required[2].value!==required[3].value){toast("비밀번호가 일치하지 않습니다.");return}if(checks.some(input=>!input.checked)){toast("필수 약관에 동의해주세요.");return}state.profile.name=required[1].value.trim();state.profile.region=required.at(-1).value.trim();state.session={loggedIn:true,id:required[0].value.trim()};save();location.href="onboarding.html"};
    }
  }

  function initOnboarding(){
    const sections=$$(".form-section"),interest=sections.find(section=>$("h2",section)?.textContent.includes("관심 종목"));
    if(interest){$$(".choice",interest).forEach(button=>{button.onclick=()=>{if(button.textContent.includes("직접")){showModal({title:"관심 종목 추가",body:'<div class="field"><label>종목명</label><input data-custom-sport placeholder="예: 스쿼시"></div>',confirm:"추가",onConfirm:modal=>{const value=$("[data-custom-sport]",modal).value.trim();if(!value){toast("종목명을 입력해주세요.");return false}const custom=Object.assign(document.createElement("button"),{className:"choice active",textContent:value,type:"button"});custom.onclick=()=>custom.classList.toggle("active");button.before(custom)}});return}button.classList.toggle("active")}})}
    const levelSection=sections.find(section=>$("h2",section)?.textContent.includes("실력"));if(levelSection){$$(".choice",levelSection).forEach(button=>button.onclick=()=>{$$(".choice",levelSection).forEach(x=>x.classList.remove("active"));button.classList.add("active");$("[data-level-help]",levelSection).textContent=button.dataset.levelDescription})}
    const saveButton=$$(".form-actions a").find(a=>a.textContent.includes("저장하고"));if(saveButton)saveButton.onclick=e=>{e.preventDefault();const sports=$$(".choice.active",interest).map(x=>x.textContent.trim());const level=$(".choice.active",levelSection)?.textContent.trim()||"입문";const region=$(".form-section input")?.value.trim();state.profile.sports=sports.map(name=>({name,level,count:0}));if(region)state.profile.region=region;save();toast("운동 프로필을 저장했습니다.");setTimeout(()=>location.href="index.html",400)};
  }

  function initCreate(){
    const createButton=$$(".form-actions button").find(button=>button.textContent.includes("모임 만들기"));if(!createButton)return;
    createButton.removeAttribute("data-toast");createButton.onclick=()=>{
      const title=fieldByLabel("모임 제목")?.querySelector("input").value.trim(),intro=fieldByLabel("한 줄 소개")?.querySelector("input").value.trim(),sport=fieldByLabel("운동 종목")?.querySelector("select").value,date=fieldByLabel("운동 날짜")?.querySelector("input").value,start=fieldByLabel("시작 시간")?.querySelector("input").value,end=fieldByLabel("예상 종료")?.querySelector("input").value,place=fieldByLabel("상세 장소")?.querySelector("input").value.trim(),max=Number(fieldByLabel("모집 인원")?.querySelector("input").value),cost=Number(fieldByLabel("참가비")?.querySelector("input").value||0),approval=$("input[name='approval']:checked")?.value||"host";
      const minLevel=fieldByLabel("최소 실력")?.querySelector("select").value,maxLevel=fieldByLabel("최대 실력")?.querySelector("select").value,levels=["입문","초급","중급","고급"];
      if(!title||!intro||!date||!place){toast("기본 정보와 일정, 장소를 모두 입력해주세요.");return}if(start>=end){toast("종료 시간은 시작 시간보다 늦어야 합니다.");return}if(max<2){toast("모집 인원은 2명 이상이어야 합니다.");return}if(levels.indexOf(minLevel)>levels.indexOf(maxLevel)){toast("최소 실력은 최대 실력보다 높을 수 없습니다.");return}
      const id=`custom-${Date.now()}`,meeting={id,sport,title,short:sport[0],date,dateText:date,time:`${start} ~ ${end}`,region:fieldByLabel("지역")?.querySelector("select").value||state.profile.region,place,address:place,distance:0,level:`${minLevel} ~ ${maxLevel}`,members:1,max,cost:cost?`1인 ${cost.toLocaleString()}원`:"비용 없음",costNumber:cost,host:"self",approval,status:"모집 중",intro,participants:[]};
      state.createdMeetings.unshift(meeting);save();toast("모임을 만들었습니다. 내 모임으로 이동합니다.");setTimeout(()=>location.href="my-meetings.html",500);
    };
  }

  function initMyMeetings(){
    const hostedMembers=1+(state.roomManagement?.members?.length||0),hostedRequests=state.roomManagement?.applicants?.length||0;
    if($("[data-hosted-member-summary]"))$("[data-hosted-member-summary]").textContent=`참여자 ${hostedMembers}명`;
    if($("[data-hosted-request-summary]"))$("[data-hosted-request-summary]").textContent=hostedRequests?`새 참가 신청 ${hostedRequests}건`:"새 참가 신청 없음";
    if($("[data-hosted-request-badge]")){$("[data-hosted-request-badge]").textContent=hostedRequests?`신청 ${hostedRequests}`:"신청 없음";$("[data-hosted-request-badge]").className=`badge ${hostedRequests?"orange":"gray"}`;}
    const currentCards=$$(".joined-meeting-section .meeting-card"),ids=["table-tennis","futsal"];
    currentCards.forEach((card,index)=>{card.removeAttribute("onclick");card.dataset.meetingId=ids[index];card.onclick=e=>{if(!e.target.closest("button,a"))location.href=meetingUrl(ids[index])}});
    const cancel=$$("button").find(button=>button.textContent.includes("신청 취소"));
    if(cancel){
      cancel.removeAttribute("data-toast");
      cancel.onclick=e=>{
        e.stopPropagation();const card=cancel.closest(".meeting-card"),id=card.dataset.meetingId;
        showModal({title:"참여 신청 취소",description:"이 모임의 참여 신청을 취소할까요?",confirm:"신청 취소",danger:true,onConfirm:()=>{state.cancelledApplications.push(id);delete state.applications[id];save();card.remove();updateMeetingCounts();toast("참여 신청을 취소했습니다.")}});
      };
    }
    state.cancelledApplications.forEach(id=>document.querySelector(`[data-meeting-id="${id}"]`)?.remove());
    const list=$(".joined-meeting-section .meeting-list"),ownedList=$(".owned-meeting-section .meeting-list");state.createdMeetings.forEach(meeting=>{if(!ownedList)return;const wrapper=document.createElement("div");wrapper.innerHTML=meetingCardHtml(meeting);const card=wrapper.firstElementChild;const side=$(".meeting-side",card);side.innerHTML='<span class="badge green">내가 만든 모임</span><a class="btn sm soft" href="host-manage.html">신청자 관리</a>';card.onclick=e=>{if(!e.target.closest("a,button"))location.href=meetingUrl(meeting.id)};ownedList.append(card)});
    Object.entries(state.applications).forEach(([id,status])=>{if(!list||ids.includes(id)||state.cancelledApplications.includes(id)||!meetings[id])return;const meeting=getMeeting(id),wrapper=document.createElement("div");wrapper.innerHTML=meetingCardHtml(meeting);const card=wrapper.firstElementChild,side=$(".meeting-side",card);side.innerHTML=status==="confirmed"?`<span class="badge green">참여 확정</span><a class="btn sm" href="chat.html?room=meeting-${id}">모임톡</a>`:`<span class="badge orange">승인 대기</span><button class="btn sm danger">신청 취소</button>`;card.onclick=e=>{if(!e.target.closest("a,button"))location.href=meetingUrl(id)};const cancelButton=$("button",side);if(cancelButton)cancelButton.onclick=()=>{state.cancelledApplications.push(id);delete state.applications[id];save();card.remove();updateMeetingCounts();toast("참여 신청을 취소했습니다.")};list.append(card)});updateMeetingCounts();
    const complete=$$("#skillReviewModal button").find(button=>button.textContent.includes("평가 완료"));if(complete){complete.removeAttribute("data-toast");complete.onclick=()=>{state.reviews.completedBadminton=$$("#skillReviewModal .peer-review").map(row=>({user:$("strong",row).textContent,value:$(".choice.active",row)?.textContent||"미평가"}));save();closeModal($("#skillReviewModal"));complete.textContent="평가 저장됨";complete.disabled=true;toast("실력 평가를 저장했습니다.")};if(state.reviews.completedBadminton){complete.textContent="평가 저장됨";complete.disabled=true}}
  }
  function updateMeetingCounts(){$$(".meeting-section").forEach(section=>{const badge=$(".section-heading>.badge",section);if(badge)badge.textContent=`${$$(".meeting-card",section).length}개`})}

  function initRoomManage(){
    const room=state.roomManagement;
    const requestList=$("[data-room-requests]"),memberList=$("[data-room-members]");
    const memberCardHtml=id=>{const user=users[id];return user?`<button class="room-member-card" data-room-member="${id}"><span class="avatar">${escapeHtml(user.initial)}</span><span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.sports[0].split(" · ")[0])} · 참여율 ${user.rate}%</small></span><span>›</span></button>`:""};
    const updateCounts=()=>{
      const memberCount=1+room.members.length,requestCount=room.applicants.length;
      $("[data-room-member-count]").textContent=`${memberCount}명`;
      $("[data-room-request-count]").textContent=`${requestCount}건`;
      $("[data-room-member-badge]").textContent=`${memberCount}명`;
      $("[data-room-request-badge]").textContent=requestCount;
      if(!requestCount&&requestList)requestList.innerHTML='<div class="empty room-empty">대기 중인 참가 신청이 없습니다.</div>';
    };
    const openMember=id=>{const user=users[id];if(!user)return;showModal({title:`${user.name} 프로필`,description:`${user.sports[0]} · 참여율 ${user.rate}%`,body:`<div class="admin-detail-copy">함께한 모임 ${user.together}회<br>${escapeHtml(user.region)}<br><a class="text-link" href="${userUrl(id)}">프로필 전체 보기 →</a></div>`,confirm:"모임에서 강퇴",danger:true,onConfirm:()=>{room.members=room.members.filter(member=>member!==id);room.kicked=[...new Set([...room.kicked,id])];save();document.querySelector(`[data-room-member="${id}"]`)?.remove();updateCounts();toast(`${user.name}님을 모임에서 강퇴했습니다.`)}})};
    if(requestList&&!room.applicants.includes("dahyun"))requestList.innerHTML='<div class="empty room-empty">대기 중인 참가 신청이 없습니다.</div>';
    if(memberList){$$('[data-room-member]',memberList).forEach(node=>node.remove());room.members.forEach(id=>memberList.insertAdjacentHTML("beforeend",memberCardHtml(id)));}
    $$('[data-room-member]').forEach(button=>button.onclick=()=>openMember(button.dataset.roomMember));
    $$('[data-room-approve]').forEach(button=>button.onclick=()=>{const id=button.dataset.roomApprove,user=users[id];room.applicants=room.applicants.filter(item=>item!==id);if(!room.members.includes(id))room.members.push(id);save();button.closest("[data-room-applicant]")?.remove();memberList?.insertAdjacentHTML("beforeend",memberCardHtml(id));const added=document.querySelector(`[data-room-member="${id}"]`);if(added)added.onclick=()=>openMember(id);updateCounts();toast(`${user.name}님의 참가 신청을 승인했습니다.`)});
    $$('[data-room-reject]').forEach(button=>button.onclick=()=>{const id=button.dataset.roomReject,user=users[id];showModal({title:"참가 신청 거절",description:`${user.name}님의 참가 신청을 거절할까요?`,confirm:"거절",danger:true,onConfirm:()=>{room.applicants=room.applicants.filter(item=>item!==id);save();button.closest("[data-room-applicant]")?.remove();updateCounts();toast(`${user.name}님의 참가 신청을 거절했습니다.`)}})});
    updateCounts();
  }

  function initChat(){
    const room=query("room")||"active-badminton";let panels=$$("[data-chat-panel]"),rooms=$$("[data-chat-room]");
    const sidebar=$(".chat-sidebar");
    state.friends.filter(uid=>!state.blockedUsers.includes(uid)).forEach(uid=>{const user=users[uid];if(user&&!$(`[data-chat-room="dm-${uid}"]`)){sidebar?.insertAdjacentHTML("beforeend",`<a class="chat-room" data-chat-room="dm-${uid}" data-chat-type="personal" href="chat.html?room=dm-${uid}"><span class="avatar">${user.initial}</span><div class="grow"><strong>${user.name}</strong><p>개인 대화를 이어가세요.</p></div></a>`)}});
    if(room.startsWith("meeting-")){const id=room.slice(8),meeting=getMeeting(id),layout=$(".chat-layout");if(sidebar&&!$(`[data-chat-room="${room}"]`))sidebar.insertAdjacentHTML("beforeend",`<a class="chat-room" data-chat-room="${room}" data-chat-type="meeting" href="chat.html?room=${room}"><span class="avatar">${escapeHtml(meeting.short)}</span><div class="grow"><strong>${escapeHtml(meeting.title)}</strong><p>모임 대화를 시작해보세요.</p></div></a>`);if(layout&&!$(`[data-chat-panel="${room}"]`))layout.insertAdjacentHTML("beforeend",`<div class="chat-main" data-chat-panel="${room}"><div class="chat-main-head"><div><strong>${escapeHtml(meeting.title)}</strong><div class="subtle">참여자 ${meeting.members}명 · ${escapeHtml(meeting.time)}</div></div><a class="btn sm" href="${meetingUrl(id)}">모임 정보</a></div><div class="messages"><div class="chat-archive-note">모임 참여자만 이용할 수 있는 모임톡입니다.</div></div><div class="chat-input"><input placeholder="메시지를 입력하세요"><button class="btn blue">전송</button></div></div>`)}
    if(room.startsWith("dm-")){const uid=room.slice(3),user=users[uid]||users.minsu;const sidebar=$(".chat-sidebar");if(sidebar&&!$(`[data-chat-room="${room}"]`)){sidebar.insertAdjacentHTML("beforeend",`<a class="chat-room" data-chat-room="${room}" data-chat-type="personal" href="chat.html?room=${room}"><span class="avatar">${user.initial}</span><div class="grow"><strong>${user.name}</strong><p>개인 대화를 시작해보세요.</p></div></a>`)}const layout=$(".chat-layout");if(layout&&!$(`[data-chat-panel="${room}"]`)){layout.insertAdjacentHTML("beforeend",`<div class="chat-main" data-chat-panel="${room}"><div class="chat-main-head"><div><strong>${user.name}</strong><div class="subtle">개인톡</div></div><a class="btn sm" href="${userUrl(uid)}">프로필</a></div><div class="messages"></div><div class="chat-input"><input placeholder="메시지를 입력하세요"><button class="btn blue">전송</button></div></div>`)}}
    rooms=$$("[data-chat-room]");panels=$$("[data-chat-panel]");rooms.forEach(node=>{node.dataset.chatType=node.dataset.chatType||"meeting";node.classList.toggle("active",node.dataset.chatRoom===room)});let active=panels.find(panel=>panel.dataset.chatPanel===room);if(!active)active=panels[0];panels.forEach(panel=>panel.hidden=panel!==active);
    const saved=state.messages[room]||[];const messageBox=$(".messages",active);saved.forEach(message=>messageBox?.insertAdjacentHTML("beforeend",`<div class="message mine persisted"><div class="bubble">${escapeHtml(message)}</div></div>`));
    const send=$(".chat-input button",active),input=$(".chat-input input",active);if(send&&input){send.removeAttribute("data-toast");const submit=()=>{const value=input.value.trim();if(!value)return;if(room.startsWith("dm-")&&state.blockedUsers.includes(room.slice(3))){toast("차단한 사용자에게는 메시지를 보낼 수 없습니다.");return}state.messages[room]=[...(state.messages[room]||[]),value];save();messageBox.insertAdjacentHTML("beforeend",`<div class="message mine persisted"><div class="bubble">${escapeHtml(value)}</div></div>`);input.value="";messageBox.scrollTop=messageBox.scrollHeight};send.onclick=submit;input.onkeydown=e=>{if(e.key==="Enter")submit()}}
    const tabs=$$(".chat-sidebar-head .tabs button");
    tabs.forEach((tab,index)=>{
      tab.onclick=()=>{
        tabs.forEach(x=>x.classList.remove("active"));tab.classList.add("active");
        rooms.forEach(node=>{node.hidden=index===0?node.dataset.chatType!=="meeting":node.dataset.chatType!=="personal"});
      };
    });
    $$('a[href="user-profile.html"]').forEach(link=>{const name=link.textContent.trim();const id=name.includes("지")?"jiyeon":name.includes("영")?"youngho":"minsu";link.href=userUrl(id)});
    $$('a.friend-card[href="user-profile.html"]').forEach((link,index)=>link.href=userUrl(index?"jiyeon":"minsu"));
    $$('[data-chat-panel]').forEach(panel=>{const info=$(".chat-main-head a.btn",panel);if(!info)return;if(panel.dataset.chatPanel==="table-tennis")info.href=meetingUrl("table-tennis");else if(panel.dataset.chatPanel==="active-badminton")info.href=meetingUrl("badminton")});
    const head=$(".page-head");if(head){const mobile=document.createElement("button");mobile.className="btn mobile-chat-toggle";mobile.textContent="채팅방 목록";mobile.onclick=()=>$(".chat-sidebar")?.classList.toggle("mobile-chat-open");head.append(mobile)}
  }

  function initFriends(){
    const ids=["minsu","jiyeon"];$$('#friendList .friend-card').forEach((card,index)=>{const id=ids[index];const link=$("a.btn",card);if(link)link.href=`chat.html?room=dm-${id}`;const avatar=$(".avatar",card),name=$("strong",card);[avatar,name].forEach(node=>{if(node){node.style.cursor="pointer";node.onclick=()=>location.href=userUrl(id)}})});
    state.blockedUsers.forEach(id=>{const index=ids.indexOf(id);if(index>=0)$$('#friendList .friend-card')[index]?.remove();if(id==="youngho")$("#pastUsers .friend-card")?.remove();if(id==="subin")$("#requests .friend-card")?.remove()});
    const past=$("#pastUsers .friend-card"),pastButton=$("button",past);if(pastButton){pastButton.removeAttribute("data-toast");pastButton.onclick=()=>sendFriendRequest("youngho",pastButton)}
    const request=$("#requests .friend-card");if(request){const buttons=$$("button",request);buttons[0].onclick=()=>{state.friends.push("subin");state.incomingFriendRequests=state.incomingFriendRequests.filter(x=>x!=="subin");save();request.remove();toast("친구 요청을 수락했습니다.")};buttons[1].onclick=()=>{state.incomingFriendRequests=state.incomingFriendRequests.filter(x=>x!=="subin");save();request.remove();toast("친구 요청을 거절했습니다.")};if(!state.incomingFriendRequests.includes("subin"))request.remove()}
    const find=$$("button").find(button=>button.textContent.includes("친구 찾기"));if(find)find.onclick=()=>showModal({title:"친구 찾기",description:"닉네임으로 사용자를 찾아 친구 요청을 보낼 수 있어요.",body:'<div class="field"><label>닉네임</label><input data-friend-search placeholder="예: 민수"></div>',confirm:"검색",onConfirm:modal=>{const value=$("[data-friend-search]",modal).value.trim();const user=Object.values(users).find(item=>item.name.includes(value)&&!state.blockedUsers.includes(item.id));if(!user){toast("일치하는 사용자가 없거나 차단한 사용자입니다.");return false}setTimeout(()=>showModal({title:`${user.name}님`,description:`${user.region} · 참여율 ${user.rate}%`,body:`<a class="btn block" href="${userUrl(user.id)}">프로필 보기</a>`,confirm:"친구 요청",onConfirm:()=>sendFriendRequest(user.id)}),0)}});
    initTabs();
  }
  function sendFriendRequest(id,button){if(!state.sentFriendRequests.includes(id))state.sentFriendRequests.push(id);save();if(button){button.textContent="요청 보냄";button.disabled=true}toast("친구 요청을 보냈습니다.")}

  function initOwnProfile(){
    const summary=$(".profile-summary");if(summary){$("h2",summary).textContent=state.profile.name;$(".subtle",summary).textContent=state.profile.region}
    const sportsPanel=$$(".profile-grid section .panel").find(panel=>$("h2",panel)?.textContent.includes("운동 프로필"));
    if(sportsPanel){$$(".sport-profile",sportsPanel).forEach(row=>row.remove());state.profile.sports.forEach(sport=>sportsPanel.insertAdjacentHTML("beforeend",`<div class="sport-profile"><div><strong>${escapeHtml(sport.name)}</strong><div class="subtle">활동 ${sport.count||0}회</div></div><span class="badge">${escapeHtml(sport.level)}</span></div>`))}
    const edit=$$("button").find(button=>button.textContent.includes("프로필 수정"));if(edit)edit.onclick=()=>showModal({title:"프로필 수정",body:`<div class="field"><label>닉네임</label><input data-profile-name value="${escapeHtml(state.profile.name)}"></div><div class="field" style="margin-top:12px"><label>활동 지역</label><input data-profile-region value="${escapeHtml(state.profile.region)}"></div>`,confirm:"저장",onConfirm:modal=>{state.profile.name=$("[data-profile-name]",modal).value.trim()||state.profile.name;state.profile.region=$("[data-profile-region]",modal).value.trim()||state.profile.region;save();location.reload()}});
    const add=$$("button").find(button=>button.textContent.includes("종목 추가"));if(add)add.onclick=()=>showModal({title:"운동 종목 추가",body:'<div class="field"><label>종목</label><input data-sport-name placeholder="예: 클라이밍"></div><div class="field" style="margin-top:12px"><label>실력</label><select data-sport-level><option>입문</option><option>초급</option><option>중급</option><option>고급</option></select></div>',confirm:"추가",onConfirm:modal=>{const name=$("[data-sport-name]",modal).value.trim();if(!name){toast("종목명을 입력해주세요.");return false}state.profile.sports.push({name,level:$("[data-sport-level]",modal).value,count:0});save();const panel=add.closest(".panel");panel.insertAdjacentHTML("beforeend",`<div class="sport-profile"><div><strong>${escapeHtml(name)}</strong><div class="subtle">활동 0회</div></div><span class="badge">${escapeHtml($("[data-sport-level]",modal).value)}</span></div>`)}});
  }

  function initUserProfile(){
    const id=query("user")||"minsu",user=users[id]||users.minsu,summary=$(".profile-summary");document.title=`${user.name} 프로필 | PLAYUPP`;
    if(summary){$(".avatar",summary).textContent=user.initial;$("h1",summary).textContent=user.name;$(".subtle",summary).textContent=user.region;const metrics=$$(".metric strong",summary);if(metrics[0])metrics[0].textContent=user.participation;if(metrics[1])metrics[1].textContent=`${user.rate}%`;if(metrics[2])metrics[2].textContent=user.together}
    const sportPanel=$(".user-profile-layout>section");if(sportPanel){$$(".sport-profile",sportPanel).forEach((row,index)=>{const sport=user.sports[index];if(!sport){row.remove();return}$("strong",row).textContent=sport.split(" ")[0];$(".subtle",row).textContent=sport;$(".badge",row).textContent=sport.split(" ")[1]})}
    const add=$("[data-friend-add]");if(add){add.dataset.friendAdd=id;if(state.friends.includes(id)){add.textContent="친구";add.disabled=true}else if(state.sentFriendRequests.includes(id)){add.textContent="친구 요청 보냄";add.disabled=true}else add.onclick=()=>sendFriendRequest(id,add)}
    const dm=$$("a.btn",summary).find(a=>a.textContent.includes("개인톡"));if(dm)dm.href=`chat.html?room=dm-${id}`;
    const blockModal=$("#blockModal");if(blockModal){$("h2",blockModal).textContent=`${user.name}님을 차단할까요?`}
    const note=$(".profile-note p");if(note)note.textContent=`${user.name}님과 ${user.together}개의 모임에서 함께 운동했습니다.`;
    const block=$("[data-block-user]");if(block){block.dataset.blockUser=id;if(state.blockedUsers.includes(id)){block.textContent="차단 해제";block.disabled=false;block.removeAttribute("data-modal-open");block.onclick=()=>{state.blockedUsers=state.blockedUsers.filter(x=>x!==id);save();toast("차단을 해제했습니다.");setTimeout(()=>location.reload(),300)}}else block.onclick=()=>{$("#blockModal").hidden=false}}
    const confirm=$("[data-block-confirm]");if(confirm){confirm.dataset.blockConfirm=id;confirm.onclick=()=>{if(!state.blockedUsers.includes(id))state.blockedUsers.push(id);state.friends=state.friends.filter(x=>x!==id);state.sentFriendRequests=state.sentFriendRequests.filter(x=>x!==id);save();closeModal($("#blockModal"));toast("사용자를 차단했습니다. 모임 검색과 친구 목록에서 제외됩니다.");setTimeout(()=>location.reload(),400)}}
    const report=document.createElement("button");report.className="btn danger block";report.textContent="사용자 신고";report.onclick=()=>openReport("사용자",id,user.name);$(".profile-actions")?.append(report);
  }

  function initCommunity(){
    const board=$(".community-board"),staticPost=$(".community-post",board);
    state.communityPosts.forEach(post=>{if($(`[data-community-id="${post.id}"]`))return;staticPost?.insertAdjacentHTML("afterend",`<details class="community-post card" data-community-id="${post.id}"><summary class="community-post-summary"><span class="badge">${escapeHtml(post.category)}</span><h3>${escapeHtml(post.title)}</h3><span class="community-post-info">${escapeHtml(state.profile.name)} · ${escapeHtml(post.date)}</span><span class="community-post-arrow">›</span></summary><div class="community-post-body"><p>${escapeHtml(post.body).replace(/\n/g,"<br>")}</p></div></details>`)});
    const write=$$("button").find(button=>button.textContent.trim()==="글쓰기");if(write){write.removeAttribute("data-toast");write.onclick=()=>showModal({title:"커뮤니티 글쓰기",body:'<div class="field"><label>게시판</label><select data-post-category><option>자유게시판</option><option>운동 꿀팁</option></select></div><div class="field" style="margin-top:10px"><label>제목</label><input data-post-title placeholder="제목을 입력하세요"></div><div class="field" style="margin-top:10px"><label>내용</label><textarea data-post-body placeholder="내용을 입력하세요"></textarea></div>',confirm:"등록",onConfirm:modal=>{const title=$("[data-post-title]",modal).value.trim(),body=$("[data-post-body]",modal).value.trim();if(!title||!body){toast("제목과 내용을 입력해주세요.");return false}state.communityPosts.unshift({id:Date.now(),category:$("[data-post-category]",modal).value,title,body,date:new Date().toLocaleDateString("ko-KR")});save();location.reload()}})}
    const search=$(".community-search input");if(search)search.oninput=()=>{const q=search.value.toLowerCase();$$(".community-post").forEach(post=>post.hidden=!post.textContent.toLowerCase().includes(q))};
    $$(".community-menu a").forEach(link=>link.onclick=e=>{e.preventDefault();$$(".community-menu a").forEach(x=>x.classList.remove("active"));link.classList.add("active");const category=link.textContent.replace(/\d/g,"").trim();$("#community-title").textContent=category;$$(".community-post").forEach(post=>{const badge=$(".badge",post)?.textContent.trim();post.hidden=category!=="전체 글"&&!(category==="공지사항"&&badge==="공지")&&badge!==category})});
  }

  function initNotifications(){
    const read=$$("button").find(button=>button.textContent.includes("모두 읽음"));if(read)read.onclick=()=>{state.readNotifications=true;save();$$(".notice-item").forEach(item=>item.classList.add("read"));toast("모든 알림을 읽음 처리했습니다.")};if(state.readNotifications)$$(".notice-item").forEach(item=>item.classList.add("read"));
    const targets=["my-meetings.html","host-manage.html",meetingUrl("badminton"),"review.html"];$$(".notice-item").forEach((item,index)=>{item.tabIndex=0;item.style.cursor="pointer";item.onclick=()=>location.href=targets[index]||"my-meetings.html"});
  }

  function initHostManage(){
    $$("tbody tr").forEach(row=>{const name=$("strong",row)?.textContent.trim();const id=Object.values(users).find(user=>user.name===name)?.id||"minsu";$("td",row).style.cursor="pointer";$("td",row).onclick=()=>location.href=userUrl(id);$$("button",row).forEach(button=>button.onclick=e=>{e.stopPropagation();const action=button.textContent.trim();if(action==="승인"||action==="거절"){state.applications[id]=action==="승인"?"confirmed":"rejected";save();row.classList.add("processed-row");row.querySelector("td:last-child").innerHTML=`<span class="badge ${action==="승인"?"green":"red"}">${action} 완료</span>`;toast(`${name}님의 참여를 ${action}했습니다.`)}else{button.textContent="대기 중";button.disabled=true;toast(`${name}님을 대기자로 이동했습니다.`)}})});
    $$(".tabs a").forEach(tab=>tab.onclick=()=>{$$(".tabs a").forEach(x=>x.classList.remove("active"));tab.classList.add("active");toast(`${tab.textContent.trim()} 목록을 선택했습니다.`)});
  }

  function initAttendance(){
    $$('tbody tr').forEach(row=>{const name=$("strong",row).textContent.trim();const saved=state.attendance[name];if(saved){const status=$$(".choice",row).find(choice=>choice.textContent.trim()===saved);if(status){$$(".choice",row).forEach(x=>x.classList.remove("active"));status.classList.add("active");$("td:nth-child(3) .badge",row).textContent=saved;$("td:nth-child(3) .badge",row).className="badge green"}}});
    const saveLink=$$(".form-actions a").find(a=>a.textContent.includes("출석 저장"));if(saveLink)saveLink.onclick=e=>{e.preventDefault();$$('tbody tr').forEach(row=>{const name=$("strong",row).textContent.trim(),value=$(".choice.active",row)?.textContent.trim()||"미처리";state.attendance[name]=value});save();toast("출석 상태를 저장했습니다.");setTimeout(()=>location.href="review.html",400)};
  }

  function initReview(){
    const complete=$$(".form-actions a").find(a=>a.textContent.includes("평가 완료"));if(complete)complete.onclick=e=>{e.preventDefault();state.reviews.full=$$(".peer-review").map(row=>({user:$("strong",row).textContent,value:$(".choice.active",row)?.textContent||"미평가"}));save();toast("실력 평가를 저장했습니다.");setTimeout(()=>location.href="my-meetings.html",400)};
  }

  function initProfileActions(){initOwnProfile()}
  function initTabs(){$$("[data-tab-target]").forEach(button=>button.onclick=()=>{const group=button.closest("[data-tabs]");$$("[data-tab-target]",group).forEach(x=>x.classList.remove("active"));button.classList.add("active");const panel=$(button.dataset.tabTarget);if(!panel)return;$$('[data-tab-panel]',panel.parentElement).forEach(x=>x.hidden=x!==panel)})}

  function initChoicesAndModals(){
    document.addEventListener("click",e=>{
      const choice=e.target.closest(".choice");const interestChoice=choice?.closest(".form-section")?.querySelector("h2")?.textContent.includes("관심 종목");if(choice&&!interestChoice&&!choice.closest(".modal-choice-list")&&choice.parentElement?.classList.contains("choice-row")){choice.parentElement.querySelectorAll(".choice").forEach(x=>x.classList.remove("active"));choice.classList.add("active");const help=choice.closest(".form-section,.modal,.level-select")?.querySelector("[data-level-help]");if(help&&choice.dataset.levelDescription)help.textContent=choice.dataset.levelDescription;const attendanceRow=choice.closest("tbody tr");if(attendanceRow){const badge=$("td:nth-child(3) .badge",attendanceRow);if(badge){badge.textContent=choice.textContent.trim();badge.className="badge green"}}}
      if(choice&&choice.closest(".modal-choice-list")){choice.closest(".modal-choice-list").querySelectorAll(".choice").forEach(x=>x.classList.remove("active"));choice.classList.add("active")}
      const open=e.target.closest("[data-modal-open]");if(open){const modal=document.getElementById(open.dataset.modalOpen);if(modal)modal.hidden=false}
      const close=e.target.closest("[data-modal-close]");if(close)closeModal(close.closest(".modal-backdrop"));
      const toastButton=e.target.closest("[data-toast]");if(toastButton&&!toastButton.disabled)toast(toastButton.dataset.toast);
    });
    $$(".modal-backdrop").forEach(modal=>modal.onclick=e=>{if(e.target===modal)modal.hidden=true});
    document.addEventListener("keydown",e=>{if(e.key==="Escape")$$(".modal-backdrop:not([hidden])").forEach(modal=>{if(modal.classList.contains("dynamic-modal"))modal.remove();else modal.hidden=true})});
  }

  function initAdmin(){
    const table=$(".admin-content table");const search=$(".admin-search"),select=$(".status-select");const filter=()=>{$$("tbody tr",table).forEach(row=>{const matchesText=!search?.value||row.textContent.toLowerCase().includes(search.value.toLowerCase());const value=select?.value||"전체";const matchesStatus=value.startsWith("전체")||row.textContent.includes(value);row.hidden=!(matchesText&&matchesStatus)})};if(search)search.oninput=filter;if(select)select.onchange=filter;
    const exportButton=$$("button").find(button=>button.textContent.includes("CSV 내보내기"));if(exportButton)exportButton.onclick=()=>{const rows=$$("tr",table).map(row=>$$('th,td',row).map(cell=>`"${cell.textContent.trim().replace(/"/g,'""')}"`).join(",")).join("\n");const link=document.createElement("a");link.href=URL.createObjectURL(new Blob(["\ufeff"+rows],{type:"text/csv"}));link.download="playupp-users.csv";link.click();URL.revokeObjectURL(link.href);toast("CSV 파일을 만들었습니다.")};
    if(page==="reports.html")renderStoredReports();
    $$(".admin-content tbody button").forEach(button=>button.onclick=()=>handleAdminAction(button));
    $$(".pagination button").forEach(button=>button.onclick=()=>{$$(".pagination button").forEach(x=>x.classList.remove("active"));button.classList.add("active");toast(`${button.textContent.trim()} 페이지를 선택했습니다.`)});
    $$(".admin-side-bottom a[href='#']").forEach(link=>link.onclick=e=>{e.preventDefault();state.session.loggedIn=false;save();location.href="../login.html"});
    $(".admin-top .notification")?.addEventListener("click",()=>location.href="reports.html");
  }
  function renderStoredReports(){
    const tbody=$(".admin-content tbody");if(!tbody)return;state.reports.forEach(report=>{if($(`[data-report-id="${report.id}"]`))return;tbody.insertAdjacentHTML("afterbegin",`<tr data-report-id="${report.id}"><td>#${escapeHtml(report.id)}</td><td>${escapeHtml(report.type)}</td><td>${escapeHtml(report.label)}</td><td>${escapeHtml(report.reason)}</td><td>사용자</td><td>${escapeHtml(report.createdAt)}</td><td><span class="badge red">${escapeHtml(report.status)}</span></td><td><button class="btn sm">상세</button> <button class="btn sm danger">처리</button></td></tr>`)});
  }
  function handleAdminAction(button){
    const row=button.closest("tr"),action=button.textContent.trim();
    if(action==="상세"){showModal({title:"상세 정보",body:`<div class="admin-detail-copy">${escapeHtml(row.innerText).replace(/\n/g,"<br>")}</div>`,confirm:"닫기"});return}
    if(["삭제","거절","숨김"].includes(action)){showModal({title:`${action} 확인`,description:"이 작업은 정적 프로토타입 상태에 반영됩니다.",confirm:action,danger:true,onConfirm:()=>{row.remove();toast(`${action} 처리했습니다.`)}});return}
    if(["정지","제재","처리","승인","병합"].includes(action)){button.textContent=`${action} 완료`;button.disabled=true;const status=$(".badge",row);if(status){status.textContent=`${action} 완료`;status.className="badge green"}const reportId=row.dataset.reportId;if(reportId){const report=state.reports.find(item=>item.id===reportId);if(report)report.status="처리 완료";save()}toast(`${action} 처리했습니다.`)}
  }

  function initPage(){
    initHeader();initChoicesAndModals();initSortAndLocation();initTabs();initAuth();
    if(page==="index.html")initHome();
    if(page==="detail.html")initDetail();
    if(page==="onboarding.html")initOnboarding();
    if(page==="create.html")initCreate();
    if(page==="my-meetings.html")initMyMeetings();
    if(page==="room-manage.html")initRoomManage();
    if(page==="chat.html")initChat();
    if(page==="friends.html")initFriends();
    if(page==="profile.html")initProfileActions();
    if(page==="user-profile.html")initUserProfile();
    if(page==="community.html")initCommunity();
    if(page==="notifications.html")initNotifications();
    if(page==="host-manage.html")initHostManage();
    if(page==="attendance.html")initAttendance();
    if(page==="review.html")initReview();
    if(isAdmin)initAdmin();
  }

  initPage();
})();
