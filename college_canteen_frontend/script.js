const snacks = [
  {id:'samosa',name:'Crispy Samosa',category:'Snacks',price:20,emoji:'🥟',desc:'Golden, crunchy potato-filled snack',tag:'POPULAR'},
  {id:'sandwich',name:'Veg Sandwich',category:'Snacks',price:45,emoji:'🥪',desc:'Fresh vegetables and toasted bread',tag:'FRESH'},
  {id:'noodles',name:'Masala Noodles',category:'Snacks',price:50,emoji:'🍜',desc:'Warm noodles with a spicy twist',tag:'QUICK BITE'},
  {id:'puff',name:'Veg Puff',category:'Snacks',price:25,emoji:'🥐',desc:'Flaky pastry with a savoury filling',tag:'CLASSIC'}
];
const meals = [
  {id:'idli',name:'Idli & Sambar',category:'Breakfast',price:40,emoji:'🥘',desc:'Soft idlis with warm sambar',tag:'BREAKFAST'},
  {id:'dosa',name:'Masala Dosa',category:'Breakfast',price:55,emoji:'🥞',desc:'Crispy dosa with potato masala',tag:'STUDENT FAV'},
  {id:'meals',name:'South Indian Meals',category:'Lunch',price:100,emoji:'🍛',desc:'Rice, vegetables and daily sides',tag:'FULL MEAL'},
  {id:'biryani',name:'Veg Biryani',category:'Lunch',price:90,emoji:'🍚',desc:'Fragrant rice with vegetables',tag:'POPULAR'},
  {id:'chapati',name:'Chapati & Kurma',category:'Dinner',price:70,emoji:'🫓',desc:'Soft chapatis with vegetable kurma',tag:'DINNER'},
  {id:'friedrice',name:'Veg Fried Rice',category:'Dinner',price:85,emoji:'🥡',desc:'Wok-tossed rice and vegetables',tag:'HOT'},
  {id:'juice',name:'Fresh Orange Juice',category:'Juices',price:35,emoji:'🍊',desc:'A refreshing citrus drink',tag:'REFRESH'},
  {id:'lassi',name:'Sweet Lassi',category:'Juices',price:40,emoji:'🥛',desc:'Cool, creamy and lightly sweet',tag:'COOL DOWN'}
];
const allItems = [...snacks,...meals];
let cart = {};
let student = null;
let billNumber = null;
const money = n => '₹' + Number(n).toFixed(2);
const byId = id => document.getElementById(id);

function renderCards(items, target) {
  byId(target).innerHTML = items.map(item => `
    <article class="menu-card">
      <div class="menu-art"><small>${item.tag}</small><span role="img" aria-label="${item.name}">${item.emoji}</span></div>
      <div class="menu-card-body"><h3>${item.name}</h3><p>${item.desc}</p>
        <div class="menu-card-bottom"><span class="price">${money(item.price)}</span>
          <button class="add-button" data-add="${item.id}" aria-label="Add ${item.name}">+</button>
        </div>
      </div>
    </article>`).join('');
}
function renderFood(category='All') {
  renderCards(category==='All'?meals:meals.filter(item=>item.category===category),'foodGrid');
}
function totals() {
  const subtotal = Object.values(cart).reduce((sum,entry)=>sum+entry.item.price*entry.qty,0);
  const discount = subtotal > 300 ? subtotal*0.05 : 0;
  const tax = (subtotal-discount)*0.05;
  return {subtotal,discount,tax,total:subtotal-discount+tax};
}
function renderCart() {
  const entries = Object.values(cart);
  const count = entries.reduce((n,e)=>n+e.qty,0);
  byId('cartCount').textContent = count;
  if (!entries.length) {
    byId('cartItems').innerHTML='<p class="empty-state">Your order is empty. Add something delicious from the menu.</p>';
  } else {
    byId('cartItems').innerHTML=entries.map(({item,qty})=>`
      <div class="cart-row">
        <div><div class="cart-name">${item.emoji} ${item.name}</div><div class="cart-price">${money(item.price)} each</div></div>
        <div class="quantity-control"><button data-qty="${item.id}" data-delta="-1" aria-label="Decrease ${item.name}">−</button><span>${qty}</span><button data-qty="${item.id}" data-delta="1" aria-label="Increase ${item.name}">+</button></div>
        <div class="line-total">${money(item.price*qty)}</div>
      </div>`).join('');
  }
  const t=totals();
  byId('subtotal').textContent=money(t.subtotal);
  byId('discount').textContent='− '+money(t.discount);
  byId('tax').textContent=money(t.tax);
  byId('total').textContent=money(t.total);
}
function toast(message) {
  const el=byId('toast'); el.textContent=message; el.classList.add('show');
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),2500);
}
function addItem(id) {
  const item=allItems.find(x=>x.id===id); if(!item)return;
  if(!cart[id])cart[id]={item,qty:0};
  cart[id].qty++; renderCart(); toast(`${item.name} added to your order`);
}
document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');
  if(add){addItem(add.dataset.add);return;}
  const qty=e.target.closest('[data-qty]');
  if(qty){const id=qty.dataset.qty;cart[id].qty+=Number(qty.dataset.delta);if(cart[id].qty<=0)delete cart[id];renderCart();}
});
byId('categoryTabs').addEventListener('click',e=>{
  const btn=e.target.closest('button[data-category]');if(!btn)return;
  byId('categoryTabs').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b===btn));
  renderFood(btn.dataset.category);
});
byId('studentForm').addEventListener('submit',e=>{
  e.preventDefault();
  student={name:byId('studentName').value.trim(),year:byId('studentYear').value,phone:byId('studentPhone').value.trim()};
  byId('studentStatus').textContent=`Details saved. Welcome, ${student.name}!`;
  toast('Student details saved');
});
byId('clearCart').addEventListener('click',()=>{cart={};renderCart();toast('Order cleared');});
byId('generateBill').addEventListener('click',()=>{
  if(!student){toast('Please save your student details first');location.hash='#login';return;}
  if(!Object.keys(cart).length){toast('Please add at least one item');location.hash='#food';return;}
  billNumber='CB'+Date.now().toString().slice(-7);
  const t=totals(), payment=byId('paymentType').value;
  const rows=Object.values(cart).map(({item,qty})=>`<tr><td>${item.name}</td><td>${qty}</td><td>${money(item.price)}</td><td>${money(item.price*qty)}</td></tr>`).join('');
  byId('billPaper').innerHTML=`
    <div class="bill-head"><div><h3>Campus<span style="color:#7d9f23">Bites</span></h3><p>COLLEGE CANTEEN<br>Student order receipt</p></div><div class="bill-meta"><b>Receipt: ${billNumber}</b><br>Date: ${new Date().toLocaleDateString()}<br>Payment: ${payment}</div></div>
    <div class="bill-student"><div><span>STUDENT NAME</span><strong>${escapeHTML(student.name)}</strong></div><div><span>YEAR</span><strong>${escapeHTML(student.year)}</strong></div><div><span>PHONE</span><strong>${escapeHTML(student.phone)}</strong></div></div>
    <table class="bill-table"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="bill-totals"><div><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div><div><span>Discount</span><strong>− ${money(t.discount)}</strong></div><div><span>Tax (5%)</span><strong>${money(t.tax)}</strong></div><div class="grand-total"><span>Total</span><strong>${money(t.total)}</strong></div></div>
    <div class="bill-footer">Thank you, ${escapeHTML(student.name)}!<br><span style="font-weight:400;color:#69746d">Have a delicious day 💛</span></div>`;
  byId('billSection').classList.remove('hidden');
  location.hash='#billSection'; toast('Your bill is ready');
});
function escapeHTML(value){return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
byId('printBill').addEventListener('click',()=>window.print());
byId('newOrder').addEventListener('click',()=>{
  cart={};billNumber=null;byId('billSection').classList.add('hidden');renderCart();location.hash='#food';toast('Ready for your next order');
});
byId('menuToggle').addEventListener('click',()=>byId('mainNav').classList.toggle('open'));
byId('mainNav').addEventListener('click',e=>{if(e.target.closest('a'))byId('mainNav').classList.remove('open');});
byId('year').textContent=new Date().getFullYear();
renderCards(snacks,'snackGrid');renderFood();renderCart();
