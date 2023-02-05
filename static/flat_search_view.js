window.onload = function () {
    alert(21);
    flat_input.focus();

    const listbox_flat_search = document.getElementById('listbox_flat_search');
    const flat_input = document.getElementById('flat_input');
    const add_button = document.getElementById('add_button');
    const clear_button = document.getElementById('clear_button');
    const grid = document.getElementById('flat_grid');
    grid.selection.mode = 'one';
    let listbox_flat_search_selected = [];
    let rowId = null;


    // fetch(
    //     './get_project',
    //     {
    //         method: 'POST',
    //     })
    //     .then(response => response.json())
    //     .then(data => {
    //         grid.dataset = data
    //     });


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

    })

    Smart('#flat_grid', class {
        get properties() {
            return {
                selection: {enabled: true, action: 'click'},
                appearance: {showRowHeaderNumber: true},
                behavior: {columnResizeMode: 'split'},
                dataSource: new Smart.DataAdapter(
                    {
                        dataFields:
                            [
                                'ID: number',
                                // 'Autoincrement: number',
                                'Name: string',
                                // 'Quantity: number',
                                'Price: number',
                                // 'Amount: number',
                            ]
                    }),
                summaryRow: {
                    visible: true
                },
                columns: [
                    // {label: '№', dataField: 'Autoincrement', width: 3},
                    {label: 'Название', dataField: 'Name', width: grid.clientWidth - 117},
                    // {label: 'Кол-во', dataField: 'Quantity', width: 60},
                    {label: 'Цена', dataField: 'Price', summary: ['sum'], width: 67},
                    // {label: 'Сумма', dataField: 'Amount', summary: ['sum'], width: 96}
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
            }
            ;
            if (event.key === 'Escape') {
                flat_input.focus()
            }
            ;
        }
    );

    listbox_flat_search.addEventListener('dblclick', enter_handler);

    grid.addEventListener('rowDoubleClick', function (event) {
            const detail = event.detail,
                row = detail.row,
                originalEvent = detail.originalEvent,
                id = detail.id;
            // console.log(id);
            grid.deleteRow(id);
            // alert(id);
        }
    );

}