 // ========================= Budjet module ==============================
 var budjetController = (function () {

   var Expense = function (id, description, value) {
     this.id = id;
     this.description = description;
     this.value = value;
   };

   var Income = function (id, description, value) {
     this.id = id;
     this.description = description;
     this.value = value;
   };

   var calculeTotal = function (type) {
     var sum = 0;
     data.allItems[type].forEach(function (current) {
       sum = sum + current.value;
     });
     data.totals[type] = sum;
   };

   var data = {
     allItems: {
       exp: [],
       inc: []
     },

     totals: {
       exp: 0,
       inc: 0
     },

     budjet: 0,
     percantage: -1
   };

   return {
     addItem: function (type, des, val) {
       var newItem, ID;

       // Create new ID
       if (data.allItems[type].length > 0) {
         ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // we expect type to be exp or inc (as coded in html)
       } else {
         ID = 0;
       }
       // Create new item based on exp or inc type
       if (type === 'exp') {
         newItem = new Expense(ID, des, val);
       } else if (type === "inc") {
         newItem = new Income(ID, des, val);
       }

       // Push to our data structure
       data.allItems[type].push(newItem);

       // Return the new element
       return newItem
     },

     calculateBudjet: function () {

       // Calculate total income and expenses
       calculeTotal('exp');
       calculeTotal('inc');

       // Calculate the budjet(expenses - income)
       data.budjet = data.totals.inc - data.totals.exp;

       // Calculate percantage of income
       if (data.totals.inc > 0) {
         data.percantage = Math.round((data.totals.exp / data.totals.inc) * 100);
       } else {
         data.percantage = -1;
       }
     },

     getBudjet: function () {
       return {
         budjet: data.budjet,
         totalInc: data.totals.inc,
         totalExp: data.totals.exp,
         percantage: data.percantage
       }
     },

     testing: function () {
       console.log(data);
     }
   }


 })();

 // ============================ UI module ============================
 var UIControler = (function () {

   var DOMstring = {
     inputType: '.add__type',
     inputDescription: '.add__description',
     inputValue: '.add__value',
     inputButton: '.add__btn',
     incomeContainer: '.income__list',
     expensesContainer: '.expenses__list',
     budgetLabel: '.budget__value',
     incomeLabel: '.budget__income--value',
     expenseLabel: '.budget__expenses--value',
     percantageLabel: '.budget__expenses--percentage',
     container: '.container'
   }

   return {

     getInput: function () {
       return {
         type: document.querySelector(DOMstring.inputType).value,
         description: document.querySelector(DOMstring.inputDescription).value,
         value: parseFloat(document.querySelector(DOMstring.inputValue).value)
       };

     },

     addListItem: function (obj, type) {
       var html, newHTML, element;
       // Create html string with placeholder text
       if (type === 'inc') {
         element = DOMstring.incomeContainer;

         html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

       } else if (type === "exp") {
         element = DOMstring.expensesContainer;

         html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
       }

       // Replace the placeholder text with actual data
       newHTML = html.replace('%id%', obj.id);
       newHTML = newHTML.replace('%description%', obj.description);
       newHTML = newHTML.replace('%value%', obj.value);

       // Insert HTML into the DOM
       document.querySelector(element).insertAdjacentHTML('beforeend', newHTML)
     },

     clearFields: function () {
       var fields, fieldsArray;

       fields = document.querySelectorAll(DOMstring.inputDescription + ',' + DOMstring.inputValue);
       fieldsArray = Array.from(fields);
       fieldsArray.forEach(function (current, index, array) {
         current.value = "";
       });

       fieldsArray[0].focus();
     },

     getDOMString: function () {
       return DOMstring;
     },

     displayBudjet: function (obj) {
       document.querySelector(DOMstring.budgetLabel).textContent = obj.budjet;
       document.querySelector(DOMstring.incomeLabel).textContent = obj.totalInc;
       document.querySelector(DOMstring.expenseLabel).textContent = obj.totalExp;

       if(obj.percantage > 0) {
          document.querySelector(DOMstring.percantageLabel).textContent = obj.percantage + '%';
       } else {
          document.querySelector(DOMstring.percantageLabel).textContent = "---";
       }
     }
   };
 })();


 // ================ Controller =====================
 var controller = (function (budjetCont, UICntrl) {

   function setupEventListeners() {
     var DOM = UICntrl.getDOMString();

     document.querySelector(DOM.inputButton).addEventListener('click', cntrlAddItem);

     document.addEventListener('keypress', function (event) {
       if (event.charCode == 13 || event.which == 13) {
         cntrlAddItem();
       }
     });

     document.querySelector(DOM.container).addEventListener('click', cntrlDeleteItem);
   }


   var updateBudget = function () {

     // Calculate budjet
     budjetCont.calculateBudjet();

     // Return the budjet
     var budjet = budjetCont.getBudjet();

     // Display the budjet on the UI
     UICntrl.displayBudjet(budjet)
   }


   var cntrlAddItem = function () {

     var input, newItem;

     // 1. get input data
     input = UICntrl.getInput();

     if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
       // 2. Add item to budjet module
       newItem = budjetCont.addItem(input.type, input.description, input.value);

       // 3. Add new item to UI
       UICntrl.addListItem(newItem, input.type);

       // 4. Clear input fields
       UICntrl.clearFields();

       // 5. Calculate budjet
       updateBudget();


       // 6. Display budjet
     }
   };

   var cntrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = splitID[1];
    }
   }

   return {
     init: function () {
       console.log('App has started');
       UICntrl.displayBudjet({
        budjet: 0,
        totalInc: 0,
        totalExp: 0,
        percantage: 0
       });
       setupEventListeners();
     }
   }

 })(budjetController, UIControler);

 controller.init();