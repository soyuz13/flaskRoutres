const listbox_flat_search = document.getElementById('listbox_flat_search');
const flat_input = document.getElementById('flat_input');
const add_button = document.getElementById('add_button');
const clear_button = document.getElementById('clear_button');
const grid = document.getElementById('flat_grid');
let listbox_flat_search_selected = [];

window.onload = function () {
    flat_input.focus()
}

flat_input.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        fetch('./flat_search', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"keyword": flat_input.value})
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                listbox_flat_search.dataSource = data;
            });
    }

    if (event.key === 'Escape') {
        flat_input.value = "";
        listbox_flat_search.clearItems();
        flat_input.focus();
    }

})

Smart('#flat_grid', class {
    get properties() {
        return {
            behavior: {columnResizeMode: 'split'},
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
            summaryRow: {
                visible: true
            },
            columns: [
                {label: 'Название', dataField: 'Name', width: grid.clientWidth - 235},
                {label: 'Кол-во', dataField: 'Quantity', width: 60},
                {label: 'Цена', dataField: 'Price', width: 60},
                {label: 'Сумма', dataField: 'Amount', summary: ['sum'], width: 96}
            ]
        }
    }
});

add_button.addEventListener('click', function (event) {

    grid.addRow(
        {
            "ID": "1",
            "Name": listbox_flat_search_selected['name'],
            "Quantity": 1,
            "Price": listbox_flat_search_selected['price'],
            "Amount": listbox_flat_search_selected['price']
        }
    );
});

clear_button.addEventListener('click', function (event) {
    flat_input.value = "";
    listbox_flat_search.clearItems();
    flat_input.focus();
});

// listbox_flat_search.addEventListener('change', function (event) {
//     const detail = event.detail, selected = detail.selected, value = detail.value;
//
//     if (selected === true) {
//
//     }
//
//     // alert(value);
//     fetch(
//         './search',
//         {
//             method: 'POST',
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify({"id": value})
//         })
//         .then(response => response.json())
//         .then(data => {
//             listbox_flat_search_selected = data;
//         });
// });

function enter_handler(event) {
    // alert(event);
    const sel_value = Number(listbox_flat_search.selectedValues[0]);
    // alert(listbox_flat_search.selectedValues);
    fetch(
        './search',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"id": sel_value})
        })
        .then(response => response.json())
        // .then(data => {
        //     listbox_flat_search_selected = data;
        //     alert(
        //         listbox_flat_search_selected['name']
        //     );
        // })
        .then(data => {
            grid.addRow(
                {
                    "ID": "1",
                    "Name": data['name'],
                    "Quantity": 1,
                    "Price": data['price'],
                    "Amount": data['price']
                })
        });
}


listbox_flat_search.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        enter_handler(event)
    };
    }
);

listbox_flat_search.addEventListener('dblclick', enter_handler);



