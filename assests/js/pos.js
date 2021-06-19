const { ipcRenderer } = require("electron");
const fetch = require("node-fetch");
const FormData = require("form-data");

const categoryUl = document.getElementById("category_item");
const foodList = document.getElementById("foods");
const foodByAllCategory = document.getElementById("allCategory");
const cartData = document.getElementById("items_cart");
const cartTable = document.getElementById("itemsOnCart");
const cartImage = document.getElementById("myImg");
const itemsCart = document.querySelector("#items_cart");

//different tabs
function pos(evt, posSytem) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(posSytem).style.display = "block";
  evt.currentTarget.className += " active";
}
const form = new FormData();
form.append("android", 123);
fetch("https://soft14.bdtask.com/bhojonapp/app/categorylist", {
  method: "POST",
  body: form,
})
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function removeCartItem(id) {
  let fID = id;
  let trs = [...document.querySelectorAll("#items_cart tr")];
  console.log("trs type ", typeof trs);
  trs.map((tr) => {
    if (tr.id == fID) {
      tr.remove();
    }
  });
}

function updatePriceOnCart(e) {
  var quantity = e.target.value;
  var price = e.target.parentElement.previousElementSibling.textContent;
  var subTotal = quantity * price;
  var total = e.target.parentElement.nextElementSibling;
  total.textContent = subTotal;
}

//Foods  on cart
ipcRenderer.on("ItemsOnBasketSent", (e, items) => {
  cartImage.style.display = "none";
  cartTable.style.display = "block";
  let data = items;
  data.map((x) => {
    var addOnItems = x.addonItems;
    var tr = document.createElement("tr");
    tr.id = x.foodVarients[0].foodId;
    var itemName = document.createElement("td");
    itemName.textContent = x.foodVarients[0].itemName;

    var varient = document.createElement("td");
    varient.textContent = x.foodVarients[0].varient;

    var price = document.createElement("td");
    price.textContent = x.foodVarients[0].foodPrice;

    var qty = document.createElement("td");
    var inpt = document.createElement("input");
    inpt.id = "quantity_input";
    inpt.classList.add("cart-quantity-input");
    inpt.type = "number";
    inpt.value = x.foodVarients[0].quantity;
    inpt.onchange = () => calculatePriceQty();
    inpt.style.width = "5em";
    inpt.style.border = "1px solid black";
    qty.appendChild(inpt);

    var total = document.createElement("td");
    total.textContent = x.foodVarients[0].foodTotal;

    var remove = document.createElement("td");
    var input = document.createElement("input");
    input.id = "remove_cart_item";
    input.classList.add("cart-quantity");
    input.type = "button";
    input.value = "X";
    input.onclick = () => removeCartItem(x.foodVarients[0].foodId);

    remove.appendChild(input);

    tr.append(itemName, varient, price, qty, total, remove);
    cartData.appendChild(tr);
    var trV;
    addOnItems.map((addOnItem) => {
      trV = document.createElement("tr");
      trV.id = addOnItem.foodId;

      var addOnName = document.createElement("td");
      addOnName.textContent = addOnItem.addOnName;

      var emp = document.createElement("td");
      emp.textContent = "";

      var priceVarient = document.createElement("td");
      priceVarient.textContent = addOnItem.price;

      var qtyV = document.createElement("td");
      qtyV.textContent = addOnItem.addsOnquantity;

      var totalV = document.createElement("td");
      totalV.textContent = addOnItem.addOntotal;

      var removeV = document.createElement("td");
      removeV.textContent = "";

      trV.append(addOnName, emp, priceVarient, qtyV, totalV, removeV);
      cartData.append(trV);
    });
  });
  const allTrFromCart = [...itemsCart.querySelectorAll("tr")];

  allTrFromCart.map((item) => {
    let rowID = item.id;
    console.log(rowID);
  });
});

function getFoodId(id) {
  ipcRenderer.send("foodIdSent", id);
}

//sending category id to fetch foods by specific category
function getCategoryId(id) {
  ipcRenderer.send("categoryId", id);
}

//creating dynamic category on pos page
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("categoryNamesLoaded");
});

ipcRenderer.on("categoryNamesReplySent", function (event, results) {
  results.forEach(function (result) {
    let li = document.createElement("li");
    let a = document.createElement("a");
    a.textContent = result.name;
    li.appendChild(a);
    li.onclick = () => getCategoryId(result.id);
    categoryUl.appendChild(li);
  });
});
//end of dynamic category on pos page

// displaying food by category
ipcRenderer.on("foodsByCategoryReplySent", (evt, foods) => {
  foodList.innerHTML = "";
  var div = "";

  foods.forEach((food) => {
    div += `
    <div class=" col-lg-3 col-sm-4 col-6">
    <div class="card">
    <img src="${food.product_image}" height="100" width="206" class="card-img-top">
      <div class="food_items" style="text-align: center;"><p><a href="#"  style="text-decoration:none; color:black;" id=${food.id} onclick = {getFoodId(${food.id})}>
      ${food.product_name}
        </a></p>
      </div>
      </div>
    </div>`;
  });

  foodList.innerHTML += div;
});

// displaying food by all  category
foodByAllCategory.addEventListener("click", () => {
  ipcRenderer.send("foodByALlCategory");
});
ipcRenderer.on("foodsByAllCategoryReplySent", (evt, foods) => {
  foodList.innerHTML = "";
  var div = "";
  foods.forEach((food) => {
    div += `
    <div class="col-lg-3 col-sm-4 col-6">
    <div class="card">
    <img src="${food.product_image}" height="100" width="206" class="card-img-top">
      <div class="food_items" style="text-align: center;"><p><a href="#"  style="text-decoration:none; color:black;" id=${food.id} onclick = {getFoodId(${food.id})}>
      ${food.product_name}
        </a></p>
      </div>
      </div>
    </div>`;
  });
  foodList.innerHTML += div;
});
// end of displaying food by all category

// displaying the foods when the page loaded
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("foodOnPageLoaded");
});
ipcRenderer.on("foodOnPageLoadedReplySent", (evt, foods) => {
  foodList.innerHTML = "";
  var div = "";
  foods.forEach((food) => {
    div += `
    <div class=" col-lg-3 col-sm-4 col-6" >
    <div class="card">
    <img src="${food.product_image}" height="100" width="206" class="card-img-top">
      <div class="food_items" style="text-align: center;"><p><a href="#"  style="text-decoration:none; color:black;" id=${food.id} onclick = {getFoodId(${food.id})}>
      ${food.product_name}
        </a></p>
      </div>
      </div>
    </div>`;
  });
  foodList.innerHTML += div;
});
