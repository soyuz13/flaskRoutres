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
            columns: [
                {label: 'Название', dataField: 'Name', width: grid.clientWidth - 220},
                {label: 'Кол-во', dataField: 'Quantity', width: 60},
                {label: 'Цена', dataField: 'Price', summary: ['sum'], width: 80},
                {label: 'Сумма', dataField: 'Amount', summary: ['sum'], width: 80}
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

listbox_flat_search.addEventListener('change', function (event) {
    const detail = event.detail, value = detail.value;
    // alert(value);
    fetch(
        './search',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"id": value})
        })
        .then(response => response.json())
        .then(data => {
            listbox_flat_search_selected = data;
        });
});

listbox_flat_search.addEventListener('keypress', function (event) {
    const detail = event.detail, value = detail.value;
    if (event.key === 'Enter') {
        grid.addRow(
            {
                "ID": "1",
                "Name": listbox_flat_search_selected['name'],
                "Quantity": 1,
                "Price": listbox_flat_search_selected['price'],
                "Amount": listbox_flat_search_selected['price']
            })
    }
});

listbox_flat_search.addEventListener('dblclick', function (event) {
    const detail = event.detail, value = detail.value;
    fetch(
        './search',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"id": value})
        })
        .then(response => response.json())
        .then(data => {
            listbox_flat_search_selected = data;
        })
        .then(
                grid.addRow(
        {
            "ID": "1",
            "Name": listbox_flat_search_selected['name'],
            "Quantity": 1,
            "Price": listbox_flat_search_selected['price'],
            "Amount": listbox_flat_search_selected['price']
        })

        );


});
