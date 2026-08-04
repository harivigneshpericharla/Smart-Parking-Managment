/* ==========================================================
   ParkGrid — Smart Parking Management System — script.js
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- LOADER ---------- */
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hide'), 900);

  /* ---------- LIVE CLOCK ---------- */
  function tickClock(){
    const now = new Date();
    const opts = { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true };
    const dateStr = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    document.getElementById('clockText').textContent = `${dateStr} · ${now.toLocaleTimeString('en-IN', opts)}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- SIDEBAR NAV / SPA ROUTING ---------- */
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');
  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const target = item.dataset.page;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      pages.forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + target).classList.add('active');
      document.getElementById('sidebar').classList.remove('mobile-open');
      document.getElementById('content').scrollTop = 0;
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });

  /* ---------- SIDEBAR COLLAPSE / MOBILE ---------- */
  document.getElementById('sidebarCollapse').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });
  document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  });

  /* ---------- THEME TOGGLE ---------- */
  document.getElementById('themeToggle').addEventListener('click', function(){
    document.body.classList.toggle('light');
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
  });

  /* ---------- NOTIFICATIONS ---------- */
  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  notifBtn.addEventListener('click', e => { e.stopPropagation(); notifPanel.classList.toggle('show'); });
  document.addEventListener('click', () => notifPanel.classList.remove('show'));

  /* ---------- COUNTER ANIMATION ---------- */
  function animateCounters(){
    document.querySelectorAll('.counter').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      let cur = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const iv = setInterval(() => {
        cur += step;
        if (cur >= target){ cur = target; clearInterval(iv); }
        el.textContent = cur.toLocaleString('en-IN');
      }, 20);
    });
  }
  animateCounters();

  /* ==========================================================
     DUMMY DATA
     ========================================================== */
  const OWNERS = ['Rahul Sharma','Priya Nair','Arjun Reddy','Sneha Iyer','Vikram Rao','Ananya Das','Karthik Menon','Divya Patel','Suresh Kumar','Meera Pillai','Rohan Gupta','Kavya Shetty'];
  const TYPES = ['Car','Bike','Truck','EV'];
  const PLATES = ['TS-09-EA','KA-05-MX','MH-12-AB','DL-08-CJ','AP-16-BZ','TN-22-FQ','KA-03-XY','TS-07-CD'];

  function randPlate(){
    return `${PLATES[Math.floor(Math.random()*PLATES.length)]}-${Math.floor(1000+Math.random()*9000)}`;
  }
  function randTime(hoursAgoMax){
    const d = new Date(Date.now() - Math.random()*hoursAgoMax*3600*1000);
    return d.toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit', hour12:true});
  }

  const historyData = [];
  for (let i=0;i<64;i++){
    const type = TYPES[Math.floor(Math.random()*TYPES.length)];
    const exited = Math.random() > 0.3;
    const durationMin = Math.floor(20 + Math.random()*220);
    historyData.push({
      vehicle: randPlate(),
      owner: OWNERS[Math.floor(Math.random()*OWNERS.length)],
      type,
      slot: `${['A','B','C','D'][Math.floor(Math.random()*4)]}-${Math.floor(1+Math.random()*30)}`,
      entry: randTime(30),
      exit: exited ? randTime(6) : '—',
      duration: exited ? `${Math.floor(durationMin/60)}h ${durationMin%60}m` : '—',
      durationMin: exited ? durationMin : 0,
      fee: exited ? (type==='Truck'?40:type==='Bike'?10:20) + Math.floor(durationMin/60)*(type==='Truck'?25:type==='Bike'?8:15) : 0,
      status: exited ? 'Exited' : 'Parked'
    });
  }

  /* ==========================================================
     CHART.JS GLOBAL DEFAULTS
     ========================================================== */
  if (window.Chart){
    Chart.defaults.font.family = "'Poppins',sans-serif";
    Chart.defaults.color = '#94A3B8';
    Chart.defaults.borderColor = 'rgba(148,163,184,0.1)';
  }

  const gridOpt = { color:'rgba(148,163,184,0.08)', drawBorder:false };

  /* ---- Occupancy Donut ---- */
  if (document.getElementById('occupancyChart')){
    new Chart(document.getElementById('occupancyChart'), {
      type:'doughnut',
      data:{
        labels:['Available','Occupied','Reserved'],
        datasets:[{ data:[53,127,15], backgroundColor:['#10B981','#EF4444','#F59E0B'], borderWidth:0, hoverOffset:8 }]
      },
      options:{ cutout:'72%', plugins:{legend:{display:false}}, animation:{animateScale:true} }
    });
  }

  /* ---- Revenue Line ---- */
  let revenueChart;
  const revenueDataSets = {
    daily:  { labels:['6am','9am','12pm','3pm','6pm','9pm'], data:[1200,3400,4600,3900,6200,4100] },
    weekly: { labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], data:[14200,15800,13900,16700,19200,24100,18640] },
    monthly:{ labels:['Wk1','Wk2','Wk3','Wk4'], data:[98000,112400,105600,124200] }
  };
  if (document.getElementById('revenueChart')){
    revenueChart = new Chart(document.getElementById('revenueChart'), {
      type:'line',
      data:{
        labels:revenueDataSets.daily.labels,
        datasets:[{
          data:revenueDataSets.daily.data,
          borderColor:'#2563EB',
          backgroundColor:ctx => {
            const g = ctx.chart.ctx.createLinearGradient(0,0,0,240);
            g.addColorStop(0,'rgba(37,99,235,0.35)'); g.addColorStop(1,'rgba(37,99,235,0)');
            return g;
          },
          fill:true, tension:.4, pointRadius:0, pointHoverRadius:5, borderWidth:2.5
        }]
      },
      options:{
        plugins:{legend:{display:false}},
        scales:{ x:{grid:{display:false}}, y:{grid:gridOpt, ticks:{callback:v=>'₹'+v/1000+'k'}} }
      }
    });
  }
  document.querySelectorAll('.seg-toggle button').forEach(btn => {
    btn.addEventListener('click', function(){
      this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
      this.classList.add('active');
      const range = this.dataset.range;
      revenueChart.data.labels = revenueDataSets[range].labels;
      revenueChart.data.datasets[0].data = revenueDataSets[range].data;
      revenueChart.update();
    });
  });

  /* ---- Vehicle Types Pie ---- */
  if (document.getElementById('vehicleTypeChart')){
    new Chart(document.getElementById('vehicleTypeChart'), {
      type:'pie',
      data:{ labels:['Car','Bike','Truck','EV'], datasets:[{ data:[46,32,9,13], backgroundColor:['#2563EB','#0EA5E9','#F59E0B','#10B981'], borderWidth:0 }] },
      options:{ plugins:{legend:{display:false}} }
    });
  }

  /* ---- Parking Trend Area ---- */
  if (document.getElementById('trendChart')){
    new Chart(document.getElementById('trendChart'), {
      type:'line',
      data:{
        labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets:[{
          data:[210,244,198,267,290,342,310],
          borderColor:'#0EA5E9',
          backgroundColor:ctx=>{ const g=ctx.chart.ctx.createLinearGradient(0,0,0,240); g.addColorStop(0,'rgba(14,165,233,.35)'); g.addColorStop(1,'rgba(14,165,233,0)'); return g;},
          fill:true, tension:.45, pointRadius:0, borderWidth:2.5
        }]
      },
      options:{ plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false}}, y:{grid:gridOpt} } }
    });
  }

  /* ---- Revenue Analytics page charts ---- */
  if (document.getElementById('revTrendChart')){
    new Chart(document.getElementById('revTrendChart'), {
      type:'bar',
      data:{ labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
        datasets:[{ data:[320,365,290,410,455,398,470,486], backgroundColor:'#2563EB', borderRadius:6, maxBarThickness:28 }] },
      options:{ plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false}}, y:{grid:gridOpt, ticks:{callback:v=>v+'k'}} } }
    });
  }
  if (document.getElementById('revTypeChart')){
    new Chart(document.getElementById('revTypeChart'), {
      type:'doughnut',
      data:{ labels:['Car','Bike','Truck','EV'], datasets:[{ data:[52,21,15,12], backgroundColor:['#2563EB','#0EA5E9','#F59E0B','#10B981'], borderWidth:0 }] },
      options:{ cutout:'68%', plugins:{legend:{position:'bottom', labels:{boxWidth:10, padding:16, font:{size:11}}}} }
    });
  }

  /* ==========================================================
     VEHICLE ENTRY
     ========================================================== */
  const entryTimeField = document.getElementById('entryTime');
  if (entryTimeField) entryTimeField.value = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});

  const entryForm = document.getElementById('entryForm');
  if (entryForm){
    entryForm.addEventListener('submit', e => {
      e.preventDefault();
      const vNo = document.getElementById('entryVehicleNo').value || 'TS-09-EA-1234';
      const owner = document.getElementById('entryOwner').value || 'Guest User';
      const type = document.getElementById('entryType').value;
      const slot = `${['A','B','C','D'][Math.floor(Math.random()*4)]}-${Math.floor(1+Math.random()*30)}`;
      const time = new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true});

      document.getElementById('tSlot').textContent = slot;
      document.getElementById('tVehicle').textContent = vNo;
      document.getElementById('tOwner').textContent = owner;
      document.getElementById('tType').textContent = type;
      document.getElementById('tTime').textContent = time;

      const ticket = document.getElementById('ticketPreview');
      ticket.style.animation = 'none';
      void ticket.offsetWidth;
      ticket.style.animation = 'ticketIn .5s ease';
    });
  }

  /* ==========================================================
     VEHICLE EXIT
     ========================================================== */
  const exitBtn = document.getElementById('exitSearchBtn');
  if (exitBtn){
    exitBtn.addEventListener('click', () => {
      const val = document.getElementById('exitSearchInput').value.trim();
      if (val){
        document.getElementById('eVehicle').textContent = val.toUpperCase();
        document.getElementById('eOwner').textContent = OWNERS[Math.floor(Math.random()*OWNERS.length)];
        document.getElementById('eSlot').textContent = `${['A','B','C'][Math.floor(Math.random()*3)]}-${Math.floor(1+Math.random()*30)}`;
        const mins = Math.floor(30+Math.random()*180);
        document.getElementById('eDuration').textContent = `${Math.floor(mins/60)}h ${mins%60}m`;
        document.getElementById('eFee').textContent = '₹' + (20 + Math.floor(mins/60)*15);
      }
      document.getElementById('exitDetails').style.display = 'block';
      document.getElementById('exitDetails').style.animation = 'fadeUp .3s ease';
    });
  }
  const genReceiptBtn = document.getElementById('genReceiptBtn');
  if (genReceiptBtn){
    genReceiptBtn.addEventListener('click', () => {
      document.querySelector('#exitDetails .status').textContent = 'Paid';
      document.querySelector('#exitDetails .status').style.background = 'rgba(16,185,129,.15)';
      document.querySelector('#exitDetails .status').style.color = '#6ee7b7';
      genReceiptBtn.innerHTML = '<i class="fa-solid fa-check"></i> Receipt Generated';
    });
  }
  const removeBtn = document.getElementById('removeVehicleBtn');
  if (removeBtn){
    removeBtn.addEventListener('click', () => {
      document.getElementById('exitDetails').style.opacity = '0.4';
      removeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Slot Freed';
    });
  }

  /* ==========================================================
     PARKING SLOT MAP
     ========================================================== */
  const slotGrid = document.getElementById('slotGrid');
  const statusPool = ['available','available','available','occupied','occupied','occupied','occupied','reserved'];
  function buildSlots(zone, evZone){
    slotGrid.innerHTML = '';
    for (let i=1;i<=40;i++){
      const status = evZone ? (Math.random()>0.4?'occupied':'available') : statusPool[Math.floor(Math.random()*statusPool.length)];
      const div = document.createElement('div');
      div.className = `slot ${status}`;
      div.textContent = `${zone}${i}`;
      div.dataset.status = status;
      div.dataset.vehicle = status === 'available' ? '—' : randPlate();
      div.dataset.time = status === 'available' ? '—' : randTime(4);
      div.addEventListener('click', () => showSlotDetail(div, zone, i));
      slotGrid.appendChild(div);
    }
  }
  function showSlotDetail(div, zone, i){
    document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
    div.classList.add('selected');
    document.getElementById('slotDetailCard').style.display = 'block';
    document.getElementById('sdNumber').textContent = `${zone}-${i}`;
    document.getElementById('sdVehicle').textContent = div.dataset.vehicle;
    document.getElementById('sdTime').textContent = div.dataset.time;
    document.getElementById('sdStatus').textContent = div.dataset.status.charAt(0).toUpperCase()+div.dataset.status.slice(1);
  }
  if (slotGrid){
    buildSlots('A', false);
    document.querySelectorAll('.zone-tabs button').forEach(btn => {
      btn.addEventListener('click', function(){
        document.querySelectorAll('.zone-tabs button').forEach(b=>b.classList.remove('active'));
        this.classList.add('active');
        buildSlots(this.dataset.zone, this.dataset.zone === 'D');
        document.getElementById('slotDetailCard').style.display = 'none';
      });
    });
  }

  /* ==========================================================
     SEARCH VEHICLE (HashMap simulation)
     ========================================================== */
  const vSearchInput = document.getElementById('vSearchInput');
  const vSearchResults = document.getElementById('vSearchResults');
  function renderSearch(query){
    vSearchResults.innerHTML = '';
    if (!query){ return; }
    const matches = historyData.filter(v => v.vehicle.toLowerCase().includes(query.toLowerCase()) || v.owner.toLowerCase().includes(query.toLowerCase())).slice(0,8);
    if (!matches.length){ vSearchResults.innerHTML = '<div class="no-results"><i class="fa-solid fa-ghost"></i> No vehicles matched your search.</div>'; return; }
    matches.forEach(v => {
      const row = document.createElement('div');
      row.className = 'result-row';
      row.innerHTML = `
        <div class="r-icon"><i class="fa-solid fa-${v.type==='Bike'?'motorcycle':v.type==='Truck'?'truck':'car'}"></i></div>
        <div class="r-main"><b>${v.vehicle}</b><small>${v.owner} · Slot ${v.slot} · Entry ${v.entry}</small></div>
        <div class="r-status status-badge ${v.status}">${v.status}</div>
      `;
      vSearchResults.appendChild(row);
    });
  }
  if (vSearchInput) vSearchInput.addEventListener('input', e => renderSearch(e.target.value));

  const globalSearch = document.getElementById('globalSearch');
  if (globalSearch){
    globalSearch.addEventListener('focus', () => {
      document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
      document.querySelector('[data-page="search"]').classList.add('active');
      pages.forEach(p=>p.classList.remove('active'));
      document.getElementById('page-search').classList.add('active');
    });
    globalSearch.addEventListener('input', e => { if(vSearchInput){ vSearchInput.value = e.target.value; renderSearch(e.target.value);} });
  }

  /* ==========================================================
     PARKING HISTORY TABLE
     ========================================================== */
  const historyBody = document.getElementById('historyBody');
  let sortKey = null, sortAsc = true;
  let currentPage = 1;
  const rowsPerPage = 10;

  function getFiltered(){
    const filterText = (document.getElementById('historyFilter')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('historyStatusFilter')?.value || '';
    let data = historyData.filter(r =>
      (r.vehicle.toLowerCase().includes(filterText) || r.owner.toLowerCase().includes(filterText) || r.slot.toLowerCase().includes(filterText)) &&
      (statusFilter === '' || r.status === statusFilter)
    );
    if (sortKey){
      data.sort((a,b) => {
        let x = a[sortKey], y = b[sortKey];
        if (sortKey === 'fee') { x=a.fee; y=b.fee; }
        if (sortKey === 'duration') { x=a.durationMin; y=b.durationMin; }
        if (typeof x === 'string') return sortAsc ? x.localeCompare(y) : y.localeCompare(x);
        return sortAsc ? x-y : y-x;
      });
    }
    return data;
  }

  function renderHistory(){
    const data = getFiltered();
    const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage-1)*rowsPerPage;
    const pageData = data.slice(start, start+rowsPerPage);

    historyBody.innerHTML = pageData.map(r => `
      <tr>
        <td><b>${r.vehicle}</b></td>
        <td>${r.owner}</td>
        <td>${r.type}</td>
        <td>${r.slot}</td>
        <td>${r.entry}</td>
        <td>${r.exit}</td>
        <td>${r.duration}</td>
        <td>${r.fee ? '₹'+r.fee : '—'}</td>
        <td><span class="status-badge ${r.status}">${r.status}</span></td>
      </tr>
    `).join('') || '<tr><td colspan="9" style="text-align:center;color:var(--text-faint);padding:30px">No records found</td></tr>';

    const pag = document.getElementById('historyPagination');
    pag.innerHTML = '';
    for (let i=1;i<=totalPages;i++){
      const b = document.createElement('button');
      b.textContent = i;
      if (i === currentPage) b.classList.add('active');
      b.addEventListener('click', () => { currentPage = i; renderHistory(); });
      pag.appendChild(b);
    }
  }

  if (historyBody){
    renderHistory();
    document.getElementById('historyFilter').addEventListener('input', () => { currentPage=1; renderHistory(); });
    document.getElementById('historyStatusFilter').addEventListener('change', () => { currentPage=1; renderHistory(); });
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sort;
        sortAsc = (sortKey === key) ? !sortAsc : true;
        sortKey = key;
        renderHistory();
      });
    });
  }

  /* ==========================================================
     DSA ENGINE ROOM
     ========================================================== */

  /* ---- Queue Visualization ---- */
  const queueViz = document.getElementById('queueViz');
  let queueData = ['A-14','A-15','B-02','B-07','C-11'];
  function renderQueue(){
    queueViz.innerHTML = queueData.map((s,i) => `<div class="q-item">${s}</div>`).join('');
  }
  if (queueViz){
    renderQueue();
    document.getElementById('queueDemoBtn').addEventListener('click', () => {
      if (!queueData.length){ queueData = ['A-14','A-15','B-02','B-07','C-11']; renderQueue(); return; }
      const first = queueViz.firstElementChild;
      if (first){ first.classList.add('leaving'); }
      setTimeout(() => { queueData.shift(); renderQueue(); }, 350);
    });
  }

  /* ---- HashMap Visualization ---- */
  const hashmapViz = document.getElementById('hashmapViz');
  if (hashmapViz){
    const sample = historyData.slice(0,8);
    hashmapViz.innerHTML = sample.map((v,i) => `
      <div class="hm-bucket"><div class="hm-idx">bucket[${i}]</div><div class="hm-val">${v.vehicle}</div></div>
    `).join('');
  }

  /* ---- Linked List Visualization ---- */
  const llViz = document.getElementById('linkedListViz');
  if (llViz){
    const sample = historyData.slice(0,6);
    llViz.innerHTML = sample.map((v,i) => `
      <div class="ll-node"><b>${v.vehicle}</b><small>${v.entry}</small></div>
      ${i < sample.length-1 ? '<i class="fa-solid fa-arrow-right ll-arrow"></i>' : ''}
    `).join('') + ' <i class="fa-solid fa-arrow-right ll-arrow"></i> <div class="ll-node" style="opacity:.5"><b>NULL</b></div>';
  }

  /* ---- Stack Visualization ---- */
  const stackViz = document.getElementById('stackViz');
  let stackData = ['Exit: MH-12-AB-7789','Entry: TS-07-CD-2201','Entry: KA-03-XY-9087'];
  function renderStack(){
    stackViz.innerHTML = stackData.map((s,i) => `<div class="stack-item ${i===stackData.length-1?'top':''}">${s}</div>`).join('');
  }
  if (stackViz){
    renderStack();
    document.getElementById('stackDemoBtn').addEventListener('click', () => {
      if (!stackData.length) return;
      const topEl = stackViz.querySelector('.stack-item.top');
      if (topEl) topEl.classList.add('popping');
      setTimeout(() => { stackData.pop(); renderStack(); }, 350);
    });
  }

  /* ---- Sorting Visualization ---- */
  const sortBarsEl = document.getElementById('sortBars');
  let sortArray = [];
  function randomizeSortArray(){
    sortArray = Array.from({length:24}, () => Math.floor(10 + Math.random()*100));
    drawBars();
  }
  function drawBars(activeIdx = [], sortedIdx = []){
    sortBarsEl.innerHTML = sortArray.map((v,i) => {
      let cls = 'sort-bar';
      if (sortedIdx.includes(i)) cls += ' sorted';
      else if (activeIdx.includes(i)) cls += ' compared';
      return `<div class="${cls}" style="height:${v}%"></div>`;
    }).join('');
  }
  const sleep = ms => new Promise(res => setTimeout(res, ms));
  async function bubbleSort(){
    const arr = sortArray.slice();
    for (let i=0;i<arr.length;i++){
      for (let j=0;j<arr.length-i-1;j++){
        drawBars([j,j+1]);
        await sleep(35);
        if (arr[j] > arr[j+1]){ [arr[j],arr[j+1]] = [arr[j+1],arr[j]]; }
        sortArray = arr.slice();
      }
    }
    drawBars([], arr.map((_,i)=>i));
  }
  async function insertionSort(){
    const arr = sortArray.slice();
    for (let i=1;i<arr.length;i++){
      let j = i;
      while (j>0 && arr[j-1] > arr[j]){
        drawBars([j-1,j]);
        await sleep(35);
        [arr[j-1],arr[j]] = [arr[j],arr[j-1]];
        j--;
        sortArray = arr.slice();
      }
    }
    drawBars([], arr.map((_,i)=>i));
  }
  async function mergeSortAnim(){
    const arr = sortArray.slice();
    async function merge(lo, mid, hi){
      const left = arr.slice(lo, mid+1), right = arr.slice(mid+1, hi+1);
      let i=0,j=0,k=lo;
      while (i<left.length && j<right.length){
        drawBars([k]);
        await sleep(30);
        arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];
      }
      while (i<left.length) arr[k++] = left[i++];
      while (j<right.length) arr[k++] = right[j++];
      sortArray = arr.slice();
    }
    async function msort(lo, hi){
      if (lo>=hi) return;
      const mid = Math.floor((lo+hi)/2);
      await msort(lo, mid);
      await msort(mid+1, hi);
      await merge(lo, mid, hi);
    }
    await msort(0, arr.length-1);
    drawBars([], arr.map((_,i)=>i));
  }
  if (sortBarsEl){
    randomizeSortArray();
    document.querySelectorAll('[data-sort-algo]').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('[data-sort-algo]').forEach(b=>b.disabled=true);
        const algo = btn.dataset.sortAlgo;
        if (algo === 'bubble') await bubbleSort();
        else if (algo === 'insertion') await insertionSort();
        else await mergeSortAnim();
        await sleep(500);
        randomizeSortArray();
        document.querySelectorAll('[data-sort-algo]').forEach(b=>b.disabled=false);
      });
    });
  }

  /* ---- Searching Visualization ---- */
  const searchBarsEl = document.getElementById('searchBars');
  const searchStatus = document.getElementById('searchStatus');
  let sortedSlotArray = Array.from({length:30}, (_,i) => i).sort((a,b)=>a-b);
  function drawSearchBars(activeIdx = [], foundIdx = -1){
    searchBarsEl.innerHTML = sortedSlotArray.map((v,i) => {
      let cls = 'search-bar-item';
      if (i === foundIdx) cls += ' found';
      else if (activeIdx.includes(i)) cls += ' checked';
      return `<div class="${cls}" style="height:${20 + v*2.5}%"></div>`;
    }).join('');
  }
  if (searchBarsEl){
    drawSearchBars();
    document.getElementById('linearSearchBtn').addEventListener('click', async () => {
      const target = parseInt(document.getElementById('searchTarget').value, 10);
      if (isNaN(target)){ searchStatus.textContent = 'Enter a valid index (0–29) first.'; return; }
      searchStatus.textContent = `Linear Search: scanning from index 0…`;
      for (let i=0;i<sortedSlotArray.length;i++){
        drawSearchBars([i]);
        await sleep(60);
        if (sortedSlotArray[i] === target){
          drawSearchBars([], i);
          searchStatus.textContent = `Found at index ${i} after ${i+1} comparisons (O(n)).`;
          return;
        }
      }
      searchStatus.textContent = 'Not found.';
    });
    document.getElementById('binarySearchBtn').addEventListener('click', async () => {
      const target = parseInt(document.getElementById('searchTarget').value, 10);
      if (isNaN(target)){ searchStatus.textContent = 'Enter a valid index (0–29) first.'; return; }
      let lo=0, hi=sortedSlotArray.length-1, steps=0;
      searchStatus.textContent = 'Binary Search: dividing the array…';
      while (lo<=hi){
        steps++;
        const mid = Math.floor((lo+hi)/2);
        drawSearchBars([mid]);
        await sleep(300);
        if (sortedSlotArray[mid] === target){
          drawSearchBars([], mid);
          searchStatus.textContent = `Found at index ${mid} in ${steps} comparisons (O(log n)).`;
          return;
        } else if (sortedSlotArray[mid] < target) lo = mid+1;
        else hi = mid-1;
      }
      searchStatus.textContent = 'Not found.';
    });
  }

});
