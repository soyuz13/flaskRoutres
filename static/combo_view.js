const combobox1 = document.getElementById('combo1');
const combobox2 = document.getElementById('combo2');
const combobox3 = document.getElementById('combo3');
const listbox1 = document.getElementById('list1');
const add_button = document.querySelector('smart-button');
const grid = document.querySelector('smart-grid');
const rows = grid.rows;
let listbox1_selected = [];

combobox1.filterMode = 'containsIgnoreCase';
combobox2.filterMode = 'containsIgnoreCase';
combobox2.filterMode = 'containsIgnoreCase';
listbox1.filterMode = 'containsIgnoreCase';

combobox1.addEventListener('close', function (event) {
	let selectedValues = combobox1.selectedValues;
    fetch(
        './level2',
        {
            method : 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "level":selectedValues[0]
            })
      })
    .then(response => response.json())
    .then(data => {
        combobox2.dataSource = data;
    });
})

combobox2.addEventListener('close', function (event) {
	let selectedValues = combobox2.selectedValues;
    fetch(
        './level3',
        {
            method : 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "level":selectedValues[0]
            })
      })
    .then(response => response.json())
    .then(data => {
        combobox3.dataSource = data;
    });
})

combobox3.addEventListener('close', function (event) {
	let selectedValues = combobox3.selectedValues;
    fetch(
        './goods',
        {
            method : 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "id":selectedValues[0]
            })
      })
    .then(response => response.json())
    .then(data => {
        listbox1.dataSource = data;
    });
});

listbox1.addEventListener('itemClick', function (event) {
    const detail = event.detail, value = detail.value;

    fetch(
        './search',
        {
            method : 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"id":value})
      })
    .then(response => response.json())
    .then(data => {
        listbox1_selected = data;
    });
});


Smart('#grid', class {
	get properties() {
		return {
			dataSource: new Smart.DataAdapter(
			{
				dataFields:
				[
					'ID: number',
					'Name: string',
					'Quantity: number',
					'Price: number',
					'Amount: number',
				]
			}),
			columns: [
                { label: 'Название', dataField: 'Name', width: 'auto'},
                { label: 'Количество', dataField: 'Quantity'},
                { label: 'Цена', dataField: 'Price'},
                { label: 'Стоимость', dataField: 'Amount'}
			]
		}
	}
});

add_button.addEventListener('click', function(event) {

    grid.addRow(
        {
            "ID":"1",
            "Name": listbox1_selected['name'],
            "Quantity": 1,
            "Price": listbox1_selected['price'],
            "Amount": listbox1_selected['price']
        }
    );
});