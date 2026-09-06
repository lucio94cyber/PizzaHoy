const PRODUCTS = [
  {id:1,name:"Muzzarella",desc:"Salsa de tomate, muzza y mucho sabor.",price:5500,cat:"pizza",img:"./Assets/img/pizza_portada1.jpg"},
  {id:2,name:"Especial",desc:"Muzzarella, jamón, morrón y aceitunas.",price:6500,cat:"pizza",img:"./Assets/img/Jamon y Morron.png"},
  {id:3,name:"Fugazzeta rellena",desc:"Queso, cebolla y una masa bien cargada.",price:7000,cat:"pizza",img:"./Assets/img/Fugazzeta rellena.png"},
  {id:4,name:"Provolone",desc:"Provolone, queso y ese toque especial.",price:6800,cat:"pizza",img:"./Assets/img/Provolone.png"},
  {id:5,name:"Champiñones",desc:"Champiñones y queso sobre base artesanal.",price:6900,cat:"pizza",img:"./Assets/img/Champignones_producto3.jpg"},
  {id:6,name:"Cebolla y queso",desc:"Una combinación simple y deliciosa.",price:6200,cat:"pizza",img:"./Assets/img/cebolla y queso_producto2.jpg"},
  {id:7,name:"Combo PizzaHoy",desc:"Pizza + acompañamiento para compartir.",price:10500,cat:"combo",img:"./Assets/img/pizza_portada2.jpg"},
  {id:8,name:"Promo familiar",desc:"Una opción completa para la mesa.",price:12500,cat:"promo",img:"./Assets/img/pizza_portada3.jpg"}
];

const state = {cart: JSON.parse(localStorage.getItem("pizzahoy-cart") || "[]"), filter:"all"};

const $ = (s) => document.querySelector(s);
const money = (n) => "$ " + n.toLocaleString("es-AR");

function save(){ localStorage.setItem("pizzahoy-cart", JSON.stringify(state.cart)); }

function renderProducts(){
  const grid = $("#productGrid");
  const list = state.filter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === state.filter);
  grid.innerHTML = list.map(p => `
    <article class="product-card reveal visible">
      <div class="product-image"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
      <div class="product-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="product-meta">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn" data-add="${p.id}" aria-label="Agregar ${p.name}">+</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart(){
  const items = $("#cartItems"), empty = $("#cartEmpty");
  if(!state.cart.length){
    items.innerHTML = "";
    empty.style.display = "block";
  } else {
    empty.style.display = "none";
    items.innerHTML = state.cart.map(item => {
      const p = PRODUCTS.find(x => x.id === item.id);
      return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div>
          <h4>${p.name}</h4>
          <p>${money(p.price)} c/u</p>
          <div class="qty">
            <button data-dec="${p.id}">−</button><span>${item.qty}</span><button data-inc="${p.id}">+</button>
          </div>
        </div>
        <button class="remove" data-remove="${p.id}" aria-label="Eliminar">×</button>
      </div>`;
    }).join("");
  }
  const total = state.cart.reduce((sum,i)=>sum + PRODUCTS.find(p=>p.id===i.id).price*i.qty,0);
  const count = state.cart.reduce((sum,i)=>sum+i.qty,0);
  $("#cartCount").textContent = count;
  $("#cartSubtotal").textContent = money(total);
  $("#cartTotal").textContent = money(total);
}

function add(id){
  const found = state.cart.find(i=>i.id===id);
  if(found) found.qty++;
  else state.cart.push({id,qty:1});
  save(); renderCart(); toast("Agregado al carrito ✓");
}

function updateQty(id, delta){
  const item = state.cart.find(i=>i.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) state.cart = state.cart.filter(i=>i.id!==id);
  save(); renderCart();
}

function openCart(){
  $("#cartDrawer").classList.add("open");
  $("#drawerOverlay").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden","false");
}
function closeCart(){
  $("#cartDrawer").classList.remove("open");
  $("#drawerOverlay").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden","true");
}
let toastTimer;
function toast(text){
  const t=$("#toast"); t.textContent=text; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),1600);
}

document.addEventListener("click",(e)=>{
  const addBtn=e.target.closest("[data-add]");
  if(addBtn) add(Number(addBtn.dataset.add));
  const inc=e.target.closest("[data-inc]"); if(inc) updateQty(Number(inc.dataset.inc),1);
  const dec=e.target.closest("[data-dec]"); if(dec) updateQty(Number(dec.dataset.dec),-1);
  const rem=e.target.closest("[data-remove]");
  if(rem){ state.cart=state.cart.filter(i=>i.id!==Number(rem.dataset.remove)); save(); renderCart(); }
  const filter=e.target.closest("[data-filter]");
  if(filter){
    document.querySelectorAll(".category").forEach(b=>b.classList.remove("active"));
    filter.classList.add("active"); state.filter=filter.dataset.filter; renderProducts();
  }
});

$("#cartButton").addEventListener("click",openCart);
$("#closeCart").addEventListener("click",closeCart);
$("#drawerOverlay").addEventListener("click",closeCart);
$("#clearCart").addEventListener("click",()=>{state.cart=[];save();renderCart();toast("Carrito vacío");});

$("#checkoutBtn").addEventListener("click",()=>{
  if(!state.cart.length){toast("Agregá al menos un producto");return;}
  const lines=state.cart.map(i=>{const p=PRODUCTS.find(x=>x.id===i.id);return `${i.qty}x ${p.name} — ${money(p.price*i.qty)}`;});
  const total=state.cart.reduce((s,i)=>s+PRODUCTS.find(p=>p.id===i.id).price*i.qty,0);
  const message=`Hola PizzaHoy! Quiero hacer este pedido:\\n\\n${lines.join("\\n")}\\n\\nTotal: ${money(total)}`;
  navigator.clipboard?.writeText(message);
  toast("Pedido copiado ✓ Pegalo en WhatsApp");
});

$("#menuToggle").addEventListener("click",()=>{
  const nav=$("#mainNav"), open=nav.classList.toggle("open");
  $("#menuToggle").setAttribute("aria-expanded",String(open));
});
document.querySelectorAll("#mainNav a").forEach(a=>a.addEventListener("click",()=>$("#mainNav").classList.remove("open")));

const observer = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{ if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);} });
},{threshold:.12});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

renderProducts();
renderCart();
