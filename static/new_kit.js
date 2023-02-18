const listbox_kit_search = document.getElementById('listbox_kit_search');
const kit_input = document.getElementById('kit_input');
const kit_name_input = document.getElementById('kit_name_input');
const add_button = document.getElementById('add_button');
const add_kit_button = document.getElementById('add_kit_button');
const clear_button = document.getElementById('clear_button');
const grid = document.getElementById('kit_grid');
// grid.selection.mode = 'one';

window.addEventListener('load', function () {
    kit_input.focus();
    // fetch(
    //     './get_project',
    //     {
    //         method: 'POST',
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         grid.dataSource = data
    //     });
});

kit_input.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        fetch('./flat_search', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"keyword": kit_input.value})
        })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                listbox_kit_search.dataSource = data;
            });
    }

    if (event.key === 'Escape') {
        kit_input.value = "";
        listbox_kit_search.clearItems();
        kit_input.focus();
    }

});

Smart('#kit_grid', class {
    get properties() {
        return {
            selection: {
                enabled: true, mode: 'one', action: 'none', checkBoxes: {
                    enabled: true, selectAllMode: 'none',
                }
            },
            appearance: {showRowHeaderNumber: true},
            behavior: {columnResizeMode: 'split'},

            dataSource: new Smart.DataAdapter(
                {
                    dataFields:
                        [
                            'id: number',
                            'name: string',
                            'quantity: number',
                            // 'parent: bool',
                            'hc-code: string',
                            'supplier: string',
                        ]
                }),
            summaryRow: {
                visible: true
            },
            editing: {
                enabled: true,
                mode: 'cell'
            },
            columns: [
                {label: 'Название', dataField: 'name', allowEdit: false, width: grid.clientWidth - 117},
                {label: 'Кол-во', dataField: 'quantity', editor: 'numberInput', width: 55},
                // {label: 'Основной', dataField: 'parent', width: 10},
                {label: 'id', dataField: 'id', visible: false},
                {label: 'hc-code', dataField: 'hc-code', visible: false},
                {label: 'supplier', dataField: 'supplier', visible: false}
            ]
        }
    }
});

add_button.addEventListener('click', enter_handler);

add_kit_button.addEventListener('click', function (event) {
    let data = [];
    let parent_id = 0;
    for (let i = 0; i < grid.dataSource.length; i++) {

        if (grid.rows[i].selected === true) {
            parent_id = grid.dataSource[i]['id']
        } else {
            data.push(
                {'id': grid.dataSource[i]['id'], 'quantity': grid.dataSource[i]['quantity']}
            );
        }
        // console.log(grid.dataSource[i]['id'], grid.dataSource[i]['hc-code'], grid.rows[i].selected);
    }

    fetch(
        './new_kit',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"name": kit_name_input.value, 'data': data, 'parent_id': parent_id})
        })
        .then(response => response.json())
        .then(data => {
            alert('ура')
        });

});

clear_button.addEventListener('click', function (event) {
    kit_input.value = "";
    listbox_kit_search.clearItems();
    kit_input.focus();
});

function enter_handler(event) {
    // alert(44);
    const sel_value = Number(listbox_kit_search.selectedValues[0]);
    console.log(listbox_kit_search.selectedValues);
    fetch(
        './search',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"id": sel_value, 'for_specification': false})
        })
        .then(response => response.json())
        .then(data => {
            grid.addRow(
                {
                    "name": data['name'],
                    "quantity": 1,
                    "hc-code": data['hc-code'],
                    "id": sel_value
                })
        });
}

listbox_kit_search.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        enter_handler(event)
    }
    ;
    if (event.key === 'Escape') {
        kit_input.focus()
    }
    ;
});

listbox_kit_search.addEventListener('dblclick', enter_handler);

grid.addEventListener('rowDoubleClick', function (event) {
    grid.deleteRow(event.detail.id, function (row) {
    });
});
