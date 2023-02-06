const listbox_flat_search = document.getElementById('listbox_flat_search');
const flat_input = document.getElementById('flat_input');
const add_button = document.getElementById('add_button');
const clear_button = document.getElementById('clear_button');
const grid = document.getElementById('flat_grid');
grid.selection.mode = 'one';

window.addEventListener('load', function () {
    flat_input.focus();
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

flat_input.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        fetch('./flat_search', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"keyword": flat_input.value})
        })
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                listbox_flat_search.dataSource = data;
            });
    }

    if (event.key === 'Escape') {
        flat_input.value = "";
        listbox_flat_search.clearItems();
        flat_input.focus();
    }

});

// function add_row(index, row) {
//     // console.log(row);
//     // alert(33);
//     // fetch(
//     //     './add_row',
//     //     {
//     //         method: 'POST',
//     //         headers: {'Content-Type': 'application/json'},
//     //         body: JSON.stringify({"data": row[0]['data']})
//     //     })
//     //     .then(response => response.json())
//     //     .then(data => {
//     //         grid.updateRow(index, {"id": data['id']});
//     //     });
// };

// function del_row(index, row) {
//     // console.log(index);
//     // console.log(row);
//     // alert(index);
//     // alert(row);
//     // fetch(
//     //     './delete_row',
//     //     {
//     //         method: 'POST',
//     //         headers: {'Content-Type': 'application/json'},
//     //         body: JSON.stringify({"id": row.data['id']})
//     //     });
// };

Smart('#flat_grid', class {
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

add_button.addEventListener('click', enter_handler);

clear_button.addEventListener('click', function (event) {
    flat_input.value = "";
    listbox_flat_search.clearItems();
    flat_input.focus();
});

function enter_handler(event) {
    // alert(44);
    const sel_value = Number(listbox_flat_search.selectedValues[0]);
    fetch(
        './search',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"id": sel_value})
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

listbox_flat_search.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        enter_handler(event)
    }
    ;
    if (event.key === 'Escape') {
        flat_input.focus()
    }
    ;
});

listbox_flat_search.addEventListener('dblclick', enter_handler);

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
