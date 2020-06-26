// BUDGET CONTROLLER
var budgetController = (function() {

	// we create a constructor 
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	// this method in the prototype of expense calculates %
	Expense.prototype.calcPercentage = function(totalIncome) {

		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);	
		} else {
			this.percentage = -1
		}
	};

	// this method in the prototype of expense returns the %
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	// we store the incomes' description in all items array and the price in the totals
	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	// we store all public methods in here
	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			
			// create an ID for a NEW ITEM!
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			// create a new item based on 'inc' or 'exp'
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// push the item to the data structure
			data.allItems[type].push(newItem);

			// return the new item
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			// id = 3
			// data.allItems[type][id];
			// ids = [1 2 4 6 8]
			// index = 3

			// map returns a brand new array
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1); //splice deletes items from index and 1 is the number of deleted items
			}
		},

		calculateBudget: function() {

			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// calculate the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);	
			} else {
				data.percentage = -1;
			}

			// Expense = 100 and income 200, spent 50% of income = 100/200 = 0.5
		},

		calculatePercentages: function() {

			/*
			a = 20
			b = 10
			c = 40
			income = 100
			a = 20/100 = 20%
			b = 10/100 = 10%
			c = 40/100 = 40%
			*/

			// calculating the % for each object, forEach does NOT STORE IN A VARIABLE
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});

		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) { //map is used to store in a variable and return an array
				return cur.getPercentage();
			});
			return allPerc;
		},

		// we use a function that only RETURNS the values and all of them get storted in the var 'budget'
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testing: function() {
			console.log(data);
		}
	};

})();


// UI CONTROLLER
var UIController = (function() {

	// we store all the class names in here	
	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
		var numSplit, int, dec, type;
		
		/*
		+ or - before number
		exactly 2 decimal points 
		comma separating the thousands

		2310.4567 => + 2,310.46
		2000 -> + 2,000.00
		*/

		num = Math.abs(num);
		num = num.toFixed(2); // always puts exactly 2 decimal numbers

		numSplit = num.split('.');
		int = numSplit[0];

		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2310, output 2,310
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	};

	// WE CAN USE THIS NODE LIST FOR EACH FUNCTION TO REPLACE FOREACH METHOD
	var nodeListForEach = function(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getInput: function() {
			return { 
				type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value) // parseFloat changes the value from a string to a number
			};
		},

		addListItem: function(obj, type) {
			var html, newHTML, element;
			// Create HTML string with placeholder text

			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value% лв.</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value% лв.</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}

			// Replace placeholder text

			newHTML = html.replace('%id%', obj.id);
			newHTML = newHTML.replace('%description%', obj.description);
			newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));


			// Instert the HTML into the DOM

			document.querySelector(element).insertAdjacentHTML('beforeend', newHTML);

		},

		deleteListItem: function(selectorID) {

			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el); // this is how we remove an element

		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			// we trick the slice method so it thinks fields is an array by using Array.prototype
			fieldsArr = Array.prototype.slice.call(fields); // HOW TO MAKE A LIST INTO AN ARRAY

			// forEach loops through all of the elements in the fields array
			fieldsArr.forEach(function(current, index, array) {
				current.value = ''; // set the value to an empty string
			});

			// puts the focus back on the first element in the array (the description)
			fieldsArr[0].focus();

		},

		displayBudget: function(obj) {
			var type;

			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type) + ' лв.';
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc') + ' лв.';
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp') + ' лв.';
			
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';	
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}

		},

		displayPercentages: function(percentages) {

			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			nodeListForEach(fields, function(current, index) {

				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});

		},

		displayMonth: function() {
			var now, months, year, month;

			now = new Date();
			// var christmas = new Date(2016, 11, 25);

			months = ['January', 'Fabruary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

		},

		changedType: function() {

			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue);

			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
				cur.classList.toggle('redBG');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

		},

		getDOMstrings: function() {
			return DOMstrings;
		}
	}

})();


// GLOBAL APP CONTROLER
var controller = (function(budgetCtrl, UICtrl) {

	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {

				ctrlAddItem();

			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function() {

		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return Budget
		var budget = budgetCtrl.getBudget(); // the getBudget method only returns the budget,inc,exp and %

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		// 1. Calculate the percentages
		budgetCtrl.calculatePercentages();

		// 2. Read percentages from budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3. Display the percentages on the UI
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = () => {
		var input, newItem;

		// 1. Get the field input data
		input = UIController.getInput();

		// we check if there is an input description or value so the code runs
		if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controler
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			
			// 3. Add the new item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fields
			UICtrl.clearFields();

			// 5. Calculate and update Budget
			updateBudget();

			// 6. Calculate and update percentages
			updatePercentages();
		}
	};

	var ctrDeleteItem = function(event) {
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; // parentNode gets the parent of the target of the event
		
		if (itemID) {

			// inc-1
			splitID = itemID.split('-'); // split returns an array with the other items except the '-'
			type = splitID[0];
			ID = parseInt(splitID[1]);

			// 1. Delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);

			// 2. Delete the item from the UI
			UICtrl.deleteListItem(itemID);

			// 3. Update and show the new budget
			updateBudget();

			// 4. Calculate and update percentages
			updatePercentages();
		}

	};

	return {
		init: function() {
			console.log('Application has started.');
			UICtrl.displayMonth();
			// 3. Display the budget on the UI
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	}


})(budgetController, UIController);;

// we initialize the functions which need to run immediantly
controller.init();