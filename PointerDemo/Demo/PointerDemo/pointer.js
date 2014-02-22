// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
	// For todays date;
	Date.prototype.today = function () { 
		return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
	};

	// For the time now
	Date.prototype.timeNow = function () {
		return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
	};
$(function(){

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `done` attributes.
	var Todo = Backbone.Model.extend({
	
		// Default attributes for the todo item.
		defaults: function() {
			return {
				done: false,
				userId: "",
				browser: "",
				positionX: 0,
				positionY: 0,
				time: "",
				elementId: ""
			};
		},
		
		// Toggle the `done` state of this todo item.
		toggle: function() {
			this.save({done: !this.get("done")});
		}

	});

	// Todo Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	var TodoList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: Todo,
		
		// Save all of the todo items under the `"todos-backbone"` namespace.
		localStorage: new Backbone.LocalStorage("pointer-backbone"),

		 // Filter down the list of all todo items that are finished.
		done: function() {
			return this.where({done: true});
		}

	});

	// Create our global collection of **Todos**.
	var Todos = new TodoList;

	// Todo Item View
	// --------------

	// The DOM element for a todo item...
	var TodoView = Backbone.View.extend({

		//... is a list tag.
		tagName:  "li",

		// Cache the template function for a single item.
		template: _.template($('#item-template').html()),

		// The DOM events specific to an item.
		events: {
			"click .toggle"   : "toggleDone",
			"click a.destroy" : "clear"       // a yra iksiukas
		},

		// The TodoView listens for changes to its model, re-rendering. Since there's
		// a one-to-one correspondence between a **Todo** and a **TodoView** in this
		// app, we set a direct reference on the model for convenience.
		initialize: function() {
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		// Re-render the titles of the todo item.
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			//this.$el.toggleClass('done', this.model.get('done'));
			return this;
		},

		// Toggle the `"done"` state of the model.
		toggleDone: function() {
			this.model.toggle();
		},

		// Remove the item, destroy the model.
		clear: function() {
			this.model.destroy();
		}

	});

	// The Application
	// ---------------

	// Our overall **AppView** is the top-level piece of UI.
	var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#app"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
		"click #clear-completed": "clearCompleted",
		"click #toggle-all": "toggleAllComplete"
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

		this.allCheckbox = this.$("#toggle-all")[0];

		this.listenTo(Todos, 'add', this.addOne);
		this.listenTo(Todos, 'reset', this.addAll);
		this.listenTo(Todos, 'all', this.render);
	  
		var that = this;

		var lastTime = 0;
	
		//var timeNow = d.getTime();
		

		document.onmousemove = function(e){
			var d = new Date();
	  		var timeNow = d.getTime();
	  		var dif = timeNow - lastTime;
	  		if(dif > 500){
	  			recorderis();
	  			
	  			lastTime = timeNow;
	  			
	  		}
	  		
		}

		function recorderis(){

			var clickX=0, clickY=0;
			if ((event.clientX || event.clientY) && document.body && document.body.scrollLeft!=null) {
				clickX = event.clientX + document.body.scrollLeft;
				clickY = event.clientY + document.body.scrollTop;
			}
			if ((event.clientX || event.clientY) && document.compatMode=='CSS1Compat' && document.documentElement && document.documentElement.scrollLeft!=null) {
				clickX = event.clientX + document.documentElement.scrollLeft;
				clickY = event.clientY + document.documentElement.scrollTop;
			}
			if (event.pageX || event.pageY) {
				clickX = event.pageX;
				clickY = event.pageY;
			}
			
			// clickX, clickY 				coordinates in page with scroll
			// event.clientX, event.clientY 	coordinates in page without scroll
			// event.screenX, event.screenY		coordinates in page from monitor top left courner
			
			var target = event.target || event.srcElement;
			// taisyti tagName
			var elementInfo = target.previousSibling.tagName +
            " | " + target.tagName + " | " + (target.nextSibling ? target.nextSibling.tagName : "X");
			
			that.createOnEnter({ posX: clickX, posY: clickY, instanceThis: this, instanceThat: that, element: elementInfo});

		}


		

		document.onclick = function(e){
				recorderis();
				//setTimeout();
		}
		
		this.footer = this.$('footer');
		this.main = $('#main');

		Todos.fetch();
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
		var numberOfLogs = localStorage.length - 1;
		var numberToDelete = Todos.done().length;
		if (Todos.length) {
			this.main.show();
			this.footer.show();
			this.footer.html(this.statsTemplate({numberoflogs: numberOfLogs, numbertodelete: numberToDelete}));
		} else {
			this.main.hide();
			this.footer.hide();
		}
	  
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(todo) {
		var view = new TodoView({model: todo});
		this.$("#pointer-list").append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    addAll: function() {
		Todos.each(this.addOne, this);
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
		var datetime = new Date().today() + " " + new Date().timeNow();
		Todos.create({browser: browser, positionX: e.posX, positionY: e.posY, time: datetime, elementId: e.element});
    },
	
	    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
		_.invoke(Todos.done(), 'destroy');
		// fix this
		document.getElementById("toggle-all").checked = false;
		return false;
    },

    toggleAllComplete: function () {
		var done = this.allCheckbox.checked;
		Todos.each(function (todo) { todo.save({'done': done}); });
    }
	
  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});
