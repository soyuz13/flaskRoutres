const combobox1 = document.getElementById('combo1');
const combobox2 = document.getElementById('combo2');
const combobox3 = document.getElementById('combo3');
const listbox_combo_search = document.getElementById('list1');
const add_button = document.querySelector('smart-button');
const grid = document.getElementById('combo_grid');

combobox1.filterMode = 'containsIgnoreCase';
combobox2.filterMode = 'containsIgnoreCase';
combobox2.filterMode = 'containsIgnoreCase';
listbox_combo_search.filterMode = 'containsIgnoreCase';

window.addEventListener('load', function () {
    // flat_input.focus();
    console.log(combobox1.offsetHeight);
    console.log(window.outerHeight);
    fetch(
        './get_project',
        {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            grid.dataSource = data
        });
});

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
        listbox_combo_search.dataSource = data;
    });
});

Smart('#combo_grid', class {
    get properties() {
        return {
            // onRowRemoved: del_row,
            // onRowInserted: add_row,
            selection: {enabled: true, action: 'click'},
            appearance: {showRowHeaderNumber: true},
            behavior: {columnResizeMode: 'split'},
            dataSource: new Smart.DataAdapter(
                {
                    dataFields:
                        [
                            'id: number',
                            'name: string',
                            'price: number',
                            'hc-code: string',
                            'supplier: string',
                        ]
                }),
            summaryRow: {
                visible: true
            },
            columns: [
                {label: 'Название', dataField: 'name', width: grid.clientWidth - 117},
                {label: 'Цена', dataField: 'price', summary: ['sum'], width: 67},
                {label: 'id', dataField: 'id', visible: true},
                {label: 'hc-code', dataField: 'hc-code', visible: false},
                {label: 'supplier', dataField: 'supplier', visible: false}
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

function enter_handler(event) {
    // alert(44);
    const sel_value = Number(listbox_combo_search.selectedValues[0]);
    fetch(
        './search',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"id": sel_value, 'for_specification': true})
        })
        .then(response => response.json())
        .then(data => {
            grid.addRow(
                {
                    "name": data['name'],
                    "price": data['price'],
                    "hc-code": data['hc-code'],
                    "id": data['id']
                })
        });
}

listbox_combo_search.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        enter_handler(event)
    }
    ;
    if (event.key === 'Escape') {
        combo_input.focus()
    }
    ;
});

listbox_combo_search.addEventListener('dblclick', enter_handler);

grid.addEventListener('rowDoubleClick', function (event) {
    grid.deleteRow(event.detail.id, function (row) {
        fetch(
            './delete_row',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({"id": row['data']['id']})
            });
    });
});
