const tree = document.getElementById('tree');

window.addEventListener('load', function () {
    // const newItemsGroup = document.createElement('smart-tree-items-group');
    // newItemsGroup.innerHTML = 'Оборудование комплект №1';
    // newItemsGroup.expanded = true;
    //
    // tree.addAfter(newItemsGroup, 'first');

    fetch(
        './kit_list',
        {
            method: 'POST',
        })
        .then(response => response.json())
        .then(data => {
            const dat = Object.keys(data);
            for (const [index, element] of dat.entries()) {
                const newItemsGroup = document.createElement('smart-tree-items-group');
                newItemsGroup.id = 'group-' + String(index+1);
                newItemsGroup.innerHTML = element;
                newItemsGroup.expanded = false;
                tree.addAfter(newItemsGroup, 'group-' + String(index));

                for (const [index2, element2] of Object.keys(data[element]).entries()) {
                    // console.log(index2, element2);
                    const newItemsGroup2 = document.createElement('smart-tree-items-group');
                    newItemsGroup2.id = 'subgroup-' + String(index+1) + "-" + String(index2+1);
                    newItemsGroup2.innerHTML = element2;
                    newItemsGroup2.expanded = false;
                    tree.addTo(newItemsGroup2, 'group-' + String(index+1));

                    for (const element3 in data[element][element2]) {
                        // console.log(newItemsGroup2.id, data[element][element2][element3]['name'], data[element][element2][element3]['quantity']);
                        const newItem = document.createElement('smart-tree-item');
                        newItem.innerHTML = data[element][element2][element3]['name'] + ' - ' + data[element][element2][element3]['quantity'];
                        tree.addTo(newItem, newItemsGroup2.id);
                    }
                }
            }

            // console.log(data)
        });
});


