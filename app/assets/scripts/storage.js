const storage = {
  init() {

  },

  checkAndSet(data, table) {
    if (!localStorage.getItem(table)) {
      storage.setData(table, data);
    }
    return JSON.parse(localStorage.getItem(table));
  },

  setData(table, data) {
    localStorage.setItem(table, JSON.stringify(data));
    window.dispatchEvent(storage.event);
  }

};
