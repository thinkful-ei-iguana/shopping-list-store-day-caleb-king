'use strict';

const store = {
  items: [
    { id: cuid(), name: 'apples', checked: false, editing: false },
    { id: cuid(), name: 'oranges', checked: false, editing: false },
    { id: cuid(), name: 'milk', checked: true, editing: false },
    { id: cuid(), name: 'bread', checked: false, editing: false }
  ],
  hideCheckedItems: false
};

const generateItemElement = function (item) {
  
  if (!item.editing) {
    let itemTitle = `<span class='shopping-item shopping-item__checked'>${item.name}</span>`;
    
    if (!item.checked) {
      itemTitle = `
      <span class='shopping-item'>${item.name}</span>
      `;
    }

    return `
      <li class='js-item-element' data-item-id='${item.id}'>
        ${itemTitle}
        <div class='shopping-item-controls'>
          <button class='shopping-item-toggle js-item-toggle'>
            <span class='button-label'>check</span>
          </button>
          <button class='shopping-item-edit js-item-edit'>
            <span class='button-label'>edit</span>
          </button>
          <button class='shopping-item-delete js-item-delete'>
            <span class='button-label'>delete</span>
          </button>
        </div>
      </li>`;
  } else {
    return `
      <li class='js-item-element' data-item-id='${item.id}'>
        <form id="js-shopping-item-edit-form">
          <label for="shopping-item-edit"></label>
          <input type="text" name="shopping-item-edit" class="js-shopping-item-edit-entry" value='${item.name}'>
          <button type="submit" class='js-shopping-item-edit-entry-button'>Save edit</button>
        </form>
      </li>`;
  }
};

const generateShoppingItemsString = function (shoppingList) {
  const items = shoppingList.map((item) => generateItemElement(item));
  return items.join('');
};

/**
 * Render the shopping list in the DOM
 */
const render = function () {
  // Set up a copy of the store's items in a local 
  // variable 'items' that we will reassign to a new
  // version if any filtering of the list occurs.
  let items = [...store.items];
  // If the `hideCheckedItems` property is true, 
  // then we want to reassign filteredItems to a 
  // version where ONLY items with a "checked" 
  // property of false are included.
  if (store.hideCheckedItems) {
    items = items.filter(item => !item.checked);
  }

  /**
   * At this point, all filtering work has been 
   * done (or not done, if that's the current settings), 
   * so we send our 'items' into our HTML generation function
   */
  const shoppingListItemsString = generateShoppingItemsString(items);

  // insert that HTML into the DOM
  $('.js-shopping-list').html(shoppingListItemsString);
};

const addItemToShoppingList = function (itemName) {
  store.items.push({ id: cuid(), name: itemName, checked: false, editing: false });
};

const handleNewItemSubmit = function () {
  $('#js-shopping-list-form').submit(function (event) {
    event.preventDefault();
    const newItemName = $('.js-shopping-list-entry').val();
    $('.js-shopping-list-entry').val('');
    addItemToShoppingList(newItemName);
    render();
  });
};

const toggleCheckedForListItem = function (id) {
  const foundItem = store.items.find(item => item.id === id);
  foundItem.checked = !foundItem.checked;
};

const handleItemCheckClicked = function () {
  $('.js-shopping-list').on('click', '.js-item-toggle', event => {
    const id = getItemIdFromElement(event.currentTarget);
    toggleCheckedForListItem(id);
    render();
  });
};

const getItemIdFromElement = function (item) {
  return $(item)
    .closest('.js-item-element')
    .data('item-id');
};

/**
 * Responsible for deleting a list item.
 * @param {string} id 
 */
const deleteListItem = function (id) {
  // As with 'addItemToShoppingLIst', this 
  // function also has the side effect of
  // mutating the global store value.
  //
  // First we find the index of the item with 
  // the specified id using the native
  // Array.prototype.findIndex() method. 
  const index = store.items.findIndex(item => item.id === id);
  // Then we call `.splice` at the index of 
  // the list item we want to remove, with 
  // a removeCount of 1.
  store.items.splice(index, 1);
};

const handleDeleteItemClicked = function () {
  // Like in `handleItemCheckClicked`, 
  // we use event delegation.
  $('.js-shopping-list').on('click', '.js-item-delete', event => {
    // Get the index of the item in store.items.
    const id = getItemIdFromElement(event.currentTarget);
    // Delete the item.
    deleteListItem(id);
    // Render the updated shopping list.
    render();
  });
};

/**
 * Toggles the store.hideCheckedItems property
 */
const toggleCheckedItemsFilter = function () {
  store.hideCheckedItems = !store.hideCheckedItems;
};

/**
 * Places an event listener on the checkbox 
 * for hiding completed items.
 */
const handleToggleFilterClick = function () {
  $('.js-filter-checked').click(() => {
    toggleCheckedItemsFilter();
    render();
  });
};

const toggleEditingListItem = function (id) {
  const foundItem = store.items.find(item => item.id === id);
  foundItem.editing = !foundItem.editing;
}; 

const disableButtonsWhileEditing = function() {
  $('button').attr('disabled', true);
  $('.js-filter-checked').attr('disabled', true);
  $('.js-shopping-item-edit-entry-button').attr('disabled', false);
}

const enableButtonsAfterEditing = function() {
  $('button').attr('disabled', false);
  $('.js-filter-checked').attr('disabled', false);
}

const handleEditItemClicked = function() {
  $('.js-shopping-list').on('click', '.js-item-edit', event => {
    const id = getItemIdFromElement(event.currentTarget);
    toggleEditingListItem(id);
    render();
    
    //disable buttons for all other actions until change is saved
    disableButtonsWhileEditing();
    
    //place focus onto the input field
    $('.js-shopping-item-edit-entry').focus();
  });
};

const editItemNameInStore = function(newName) {
  const foundItem = store.items.find(item => item.editing === true);
  foundItem.name = newName;
}

const handleEditSubmit = function() {
  //set up event handler
  $('.js-shopping-list').on('submit', '#js-shopping-item-edit-form', event => {
    event.preventDefault();
    const editedItemName = $('.js-shopping-item-edit-entry').val();
    const id = getItemIdFromElement(event.currentTarget);
    
    //update STORE'S item.name with new value
    editItemNameInStore(editedItemName);
    
    //Set List Item's Editing property to false
    toggleEditingListItem(id);

    //reenable adding items and hiding/unhiding items
    enableButtonsAfterEditing();
    render();
  });
};

/**
 * This function will be our callback when the
 * page loads. It is responsible for initially 
 * rendering the shopping list, then calling 
 * our individual functions that handle new 
 * item submission and user clicks on the 
 * "check" and "delete" buttons for individual 
 * shopping list items.
 */
const handleShoppingList = function () {
  render();
  handleNewItemSubmit();
  handleItemCheckClicked();
  handleDeleteItemClicked();
  handleToggleFilterClick();
  handleEditItemClicked();
  handleEditSubmit();
};

// when the page loads, call `handleShoppingList`
$(handleShoppingList);


//TEMP

//<input type="text" name="shopping-list-entry" class="js-shopping-list-entry" value="PREVIOUS VALUE">

//<div class="shopping-item-controls">
// <button class="shopping-item-toggle js-item-toggle">
// <span class="button-label">check</span>
// </button>
// <button class="shopping-item-delete js-item-edit">
// <span class="button-label">edit</span>
// </button>

// <button class="shopping-item-delete js-item-delete">
// <span class="button-label">delete</span>
// </button>
// </div>