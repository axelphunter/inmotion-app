var storage = {
	
	init: function() {
	},

	checkAndSet: function(data, table) {
		if (!localStorage.getItem(table))
		{
			storage.setData(table, data);
		}
		return JSON.parse(localStorage.getItem(table));
	},

	setData: function(table, data) {
		localStorage.setItem(table, JSON.stringify(data));
		window.dispatchEvent(storage.event);
	}

};