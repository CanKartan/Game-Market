const Basket__Icon = document.getElementById("basket_Icon");
const Basket__remove__Icon = document.getElementById("bi-x");
const Basket__Clck = document.getElementById("basket");
let gameList = [] , basketlist = [];

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};


Basket__remove__Icon.addEventListener("click", () =>{
  Basket__Clck.classList.toggle("remove");
  console.log(Basket__Icon);
})
Basket__Icon.addEventListener("click", () =>{
  Basket__Clck.classList.toggle("remove");
})

const getGames = () => {
  return fetch("./products.json")
    .then(res => res.json())
    .then((games) => {
      gameList = games;
      return games; 
    });
};

const createGameStars = (starRate) => {
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i) starRateHtml += '<i class="bi bi-star-fill active"></i>';
    else starRateHtml += '<i class="bi bi-star-fill"></i>';
  }
  return starRateHtml;
};

const createGameItemsHtml = (games) => {
  const gameListEl = document.querySelector(".game___list");
  let gameListHtml = "";

  games.forEach((game, index) => {
    gameListHtml += `
      <div class="col-5 ${index % 2 == 0 && "offset-2"} my-5">
        <div class="row game-card">
          <div class="col-6">
            <img class="img-fluid shadow" width="250px" height="300px" src="${game.imgSource}" alt="cyberpunk">
          </div>
          <div class="col-6 d-flex justify-content-between flex-column ">
            <div class="game-description">
              <span class="gray fs-5">${game.author}</span> <br>
              <span class="fw-bold fs-4">${game.name}</span><br>
              <span class="game-stars">
              ${createGameStars(game.starRate)}
              </span>
              <span class="gray">${game.reviewCount} reviews</span>
            </div>
            <p class="gray game-description">${game.description}</p>
            <div>
              <span class="fw-bold fs-4">${game.price}₺</span>
              ${game.oldPrice ? `<span class="gray old-price fs-5">${game.oldPrice}₺</span>` : ''}
            </div>
            <button class="btn-color" onclick="addGameToBasket(${game.id})">SEPETE EKLE</button>
          </div>
        </div>
      </div>
    `;
  });

  gameListEl.innerHTML = gameListHtml;
};

const GAME__TYPES = {
  ALL: "Tümü",
  Adventure: "Macera",
  Action: "Aksiyon",
  RPG: "RPG",
  FPS: "FPS",
};

const createGameTypeHtml = () => {
  const filterEl = document.querySelector(".filter");
  let filterHtml = "";
  let filterType = ["ALL"];
  gameList.forEach((game) => {
    if (filterType.findIndex((filter) => filter == game.type) == -1) filterType.push(game.type);
  });
  filterType.forEach((type, index) => {
    filterHtml += `<li class="${index == 0 ? 'active' : ''}" data-type="${type}">${GAME__TYPES[type]}</li>`;
  });
  filterEl.innerHTML = filterHtml;


  const filterItems = filterEl.querySelectorAll("li");
  filterItems.forEach((item) => {
    item.addEventListener("click", function () {
      filterGames(this);
    });
  });
};

const filterGames = (filterEl) => {
  const activeElement = document.querySelector(".filter .active");
  if (activeElement) {
    activeElement.classList.remove("active");
  }

  filterEl.classList.add("active");

  let gameType = filterEl.dataset.type;

  let filteredGames = gameList;
  if (gameType !== "ALL") {
    filteredGames = gameList.filter((game) => game.type === gameType);
  }
  createGameItemsHtml(filteredGames);
};

const listBasketItems = () => {
  document.querySelector(".basket-count").innerHTML =
  basketlist.length > 0 ? basketlist.length :null; 
  const basket__EL = document.querySelector('.basket-list');
  const totalPriceElement = document.querySelector(".basket__total");
  let basketlisthtml = "";
  let totalPrice = 0;


  basketlist.forEach((game) => {
    totalPrice += game.product.price * game.quantity;
    basketlisthtml += `
      <li class="basket__li">
        <img class="basket__item__img" src="${game.product.imgSource}" width="100px" height="150px" alt="${game.product.name}">
        <div class="basket-items-info">
          <h2 class="basket__item__title">${game.product.name}</h2>
          <span class="basket__price">${game.product.price}$</span> <br>
          <span class="basket__remove" onclick="removeFromBasket(${game.product.id})">Kaldır</span>
        </div>
        <div class="basket__count">
          <span class="decrease" onclick="decreaseQuantity(${game.product.id})">-</span>
          <span class="basket__item__numb">${game.quantity}</span>
          <span class="increase" onclick="increaseQuantity(${game.product.id})">+</span>
        </div>
      </li>`;
  });
  basket__EL.innerHTML = basketlisthtml;
  totalPriceElement.innerHTML = totalPrice >0 ? "Toplam: "+ totalPrice.toFixed(2) + "₺ ":null;
};

const addGameToBasket = (gameId) => {
  
  let findGame = gameList.find((game) => game.id == gameId);

  if (findGame) {
    const basketAlreadyIndex = basketlist.findIndex((basket) => basket.product.id == gameId);

    if (basketAlreadyIndex === -1) {
      let addedItem = { quantity: 1, product: findGame };
      basketlist.push(addedItem);
    } else {
      basketlist[basketAlreadyIndex].quantity += 1;
    }

    console.log('Game added to basket:', findGame);
  } else {
    console.error('Game not found with id:', gameId);
  }

  listBasketItems();
  toastr.success("Ürün sepete eklendi");
};

const removeFromBasket = (gameId) =>{
   const findedindex =basketlist.findIndex(basket => basket.product.id === gameId);
if(findedindex != -1) {
  basketlist.splice(findedindex,1);
}
listBasketItems();
};

const decreaseQuantity = (gameId) => {
  const findedindex = basketlist.findIndex(basket => basket.product.id === gameId);
  if (findedindex != -1) {
    if (basketlist[findedindex].quantity > 1) {
      basketlist[findedindex].quantity -= 1;
    } else {
      toastr.error("Ürün miktarı en az 1 olmalıdır.");
    }
    listBasketItems();
  }
};

const increaseQuantity = (gameId) => {
  const findedindex = basketlist.findIndex(basket => basket.product.id === gameId);
  if (findedindex != -1) {
    if (basketlist[findedindex].quantity < basketlist[findedindex].product.stock) {
      basketlist[findedindex].quantity += 1;
    } else {
      toastr.error("Stok Yetersiz Lütfen Daha Sonra tekrar deneyin.");
    }
    listBasketItems();
  }
};



 
setTimeout(() => {
  getGames().then((games) => {
    createGameItemsHtml(games);
    createGameTypeHtml();
  });
}, 100);
